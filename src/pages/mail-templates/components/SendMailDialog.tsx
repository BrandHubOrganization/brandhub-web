import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { errorCode } from "@/services/adminRevenueService";
import { mailTemplateService } from "../services/mailTemplateService";
import type { MailQuota, MailTemplate, MailTemplateSummary, Recipient, SendResult } from "../types";
import { MAX_RECIPIENTS, parseRecipients, userVariables } from "../utils";

interface Props {
  workspaceId: string;
  open: boolean;
  onClose: () => void;
  /** Pre-selected template; when omitted the user picks one. */
  template?: MailTemplateSummary | null;
  /** Rows pre-filled as an "email,name" list (for example from the Client page). */
  initialRecipients?: Recipient[];
  /** Shared variables pre-filled (for example clientName). */
  initialVariables?: Record<string, string>;
  onSent?: (result: SendResult) => void;
}

const MIN_LEAD_MS = 5 * 60 * 1000;

function toCsv(rows: Recipient[]): string {
  if (rows.length === 0) return "";
  const q = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  return ["email,name", ...rows.map((r) => `${q(r.email)},${q(r.name ?? "")}`)].join("\n");
}

export function SendMailDialog({ workspaceId, open, onClose, template, initialRecipients, initialVariables, onSent }: Props) {
  const { t } = useTranslation();
  const [options, setOptions] = useState<MailTemplateSummary[]>([]);
  const [templateId, setTemplateId] = useState(template?.id ?? "");
  const [detail, setDetail] = useState<MailTemplate | null>(null);
  const [text, setText] = useState(toCsv(initialRecipients ?? []));
  const [shared, setShared] = useState<Record<string, string>>(initialVariables ?? {});
  const [useAttachments, setUseAttachments] = useState<Record<string, boolean>>({});
  const [scheduleAt, setScheduleAt] = useState("");
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [quota, setQuota] = useState<MailQuota | null>(null);
  const [preview, setPreview] = useState<{ subject: string; bodyHtml: string; missing: string[] } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SendResult | null>(null);

  useEffect(() => {
    if (!open) return;
    void mailTemplateService.quota(workspaceId).then(setQuota).catch(() => setQuota(null));
    if (!template) {
      void mailTemplateService
        .list(workspaceId, { includeSystem: true, size: 100 })
        .then((p) => setOptions(p.content))
        .catch(() => setOptions([]));
    }
  }, [open, workspaceId, template]);

  useEffect(() => {
    if (!templateId) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    void mailTemplateService.get(workspaceId, templateId).then((d) => {
      if (cancelled) return;
      setDetail(d);
      setUseAttachments(Object.fromEntries(d.attachments.map((a) => [a.attachmentId, true])));
      setPreview(null);
    });
    return () => { cancelled = true; };
  }, [templateId, workspaceId]);

  const parsed = useMemo(() => parseRecipients(text), [text]);
  const needed = useMemo(
    () => (detail ? userVariables(detail.subject, detail.bodyHtml) : []),
    [detail],
  );
  // A variable is covered when every row supplies it (name column, or a CSV column of that name).
  const sharedNames = useMemo(
    () =>
      needed.filter((name) =>
        parsed.recipients.length === 0 ||
        !parsed.recipients.every((r) => (name === "name" ? !!r.name : !!r.variables?.[name])),
      ),
    [needed, parsed.recipients],
  );

  const remaining = quota?.remainingToday ?? null;
  const tooMany = parsed.recipients.length > MAX_RECIPIENTS;
  const overQuota = remaining !== null && parsed.recipients.length > remaining;

  const fail = (e: unknown) => {
    const code = errorCode(e);
    setError(t(`mailTemplate.errors.${code}`, { defaultValue: t("mailTemplate.errors.generic") }));
  };

  const attachmentIds = detail
    ? detail.attachments.filter((a) => useAttachments[a.attachmentId]).map((a) => a.attachmentId)
    : [];

  const firstRowVariables = (): Record<string, string> => {
    const row = parsed.recipients[0];
    return { ...shared, ...(row?.variables ?? {}), ...(row?.name ? { name: row.name } : {}) };
  };

  const runPreview = async () => {
    if (!detail) return;
    setBusy(true);
    setError(null);
    try {
      const p = await mailTemplateService.preview(workspaceId, detail.id, firstRowVariables());
      setPreview({ subject: p.subject, bodyHtml: p.bodyHtml, missing: p.missingVariables });
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  };

  const runTest = async () => {
    if (!detail) return;
    setBusy(true);
    setError(null);
    try {
      await mailTemplateService.sendTest(workspaceId, detail.id, firstRowVariables());
      toast.success(t("mailTemplate.send.testSent"));
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  };

  /** Impure clock reads stay out of render: validated when the value changes and again on submit. */
  const checkSchedule = (value: string): string | null => {
    if (!value) return null;
    const at = new Date(value).getTime();
    const now = Date.now();
    if (Number.isNaN(at) || at < now + MIN_LEAD_MS || at > now + 30 * 24 * 3600 * 1000) {
      return t("mailTemplate.errors.MAIL_SCHEDULE_OUT_OF_RANGE");
    }
    return null;
  };

  const submit = async () => {
    if (!detail || busy) return;
    const invalidSchedule = checkSchedule(scheduleAt);
    if (invalidSchedule) {
      setScheduleError(invalidSchedule);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await mailTemplateService.send(workspaceId, detail.id, {
        recipients: parsed.recipients,
        variables: shared,
        attachmentIds,
        ...(scheduleAt ? { scheduledAt: new Date(scheduleAt).toISOString() } : {}),
      });
      setResult(res);
      onSent?.(res);
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  };

  const canSend =
    !!detail && parsed.recipients.length > 0 && !tooMany && !scheduleError && !busy &&
    sharedNames.every((n) => (shared[n] ?? "").trim() !== "") &&
    (scheduleAt ? true : !overQuota);

  const readFile = async (file: File | undefined) => {
    if (!file) return;
    const content = await file.text();
    setText((current) => (current.trim() ? `${current.trim()}\n${content}` : content));
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && !busy && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("mailTemplate.send.title")}</DialogTitle>
          <DialogDescription>{t("mailTemplate.send.description")}</DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="space-y-3" data-testid="send-result">
            <p className="text-sm font-medium">
              {t(result.status === "SCHEDULED" ? "mailTemplate.send.scheduledOk" : "mailTemplate.send.queuedOk", {
                accepted: result.accepted, total: result.total,
              })}
            </p>
            {result.rejected.length > 0 && (
              <div>
                <p className="text-sm font-medium">{t("mailTemplate.send.rejected", { count: result.rejected.length })}</p>
                <ul className="text-muted-foreground max-h-40 overflow-y-auto text-xs">
                  {result.rejected.map((r, i) => <li key={`${r.email}-${i}`}>{r.email || "—"}: {r.reason}</li>)}
                </ul>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>{t("mailTemplate.close")}</Button>
              <Button asChild className="bg-brand-orange hover:bg-brand-orange/90 text-white">
                <Link to={`/workspaces/${workspaceId}/mail-templates/batches`}>{t("mailTemplate.send.viewBatches")}</Link>
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); void submit(); }}>
            {!template && (
              <label className="block space-y-1.5 text-sm font-medium">
                <span>{t("mailTemplate.send.template")}</span>
                <Select value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
                  <option value="">{t("mailTemplate.send.chooseTemplate")}</option>
                  {options.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
                </Select>
              </label>
            )}
            {detail && <p className="text-muted-foreground text-xs">{detail.subject}</p>}

            <div className="space-y-1.5 text-sm font-medium">
              <label htmlFor="mail-recipients">{t("mailTemplate.send.recipients")}</label>
              <Textarea id="mail-recipients" rows={5} value={text} onChange={(e) => setText(e.target.value)}
                placeholder={t("mailTemplate.send.recipientsPlaceholder")} />
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-normal">
                <span className="text-muted-foreground">{t("mailTemplate.send.recipientsHelp", { max: MAX_RECIPIENTS })}</span>
                <label className="text-brand-orange cursor-pointer font-medium">
                  {t("mailTemplate.send.uploadCsv")}
                  <input type="file" accept=".csv,.txt,text/csv,text/plain" className="hidden" data-testid="mail-csv-input"
                    onChange={(e) => { void readFile(e.target.files?.[0]); e.target.value = ""; }} />
                </label>
              </div>
              <p className="text-xs font-normal" data-testid="recipient-summary">
                {t("mailTemplate.send.parsed", { count: parsed.recipients.length })}
                {parsed.invalid.length > 0 && (
                  <span className="text-destructive"> · {t("mailTemplate.send.invalid", { count: parsed.invalid.length })}</span>
                )}
                {tooMany && <span className="text-destructive"> · {t("mailTemplate.errors.tooMany", { max: MAX_RECIPIENTS })}</span>}
              </p>
            </div>

            {sharedNames.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">{t("mailTemplate.send.variables")}</p>
                {sharedNames.map((name) => (
                  <label key={name} className="block space-y-1 text-xs font-medium">
                    <span className="font-mono">{`{{${name}}}`}</span>
                    <Input value={shared[name] ?? ""} onChange={(e) => setShared((c) => ({ ...c, [name]: e.target.value }))} />
                  </label>
                ))}
              </div>
            )}

            {detail && detail.attachments.length > 0 && (
              <fieldset className="space-y-1">
                <legend className="text-sm font-medium">{t("mailTemplate.send.attachments")}</legend>
                {detail.attachments.map((a) => (
                  <label key={a.attachmentId} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={!!useAttachments[a.attachmentId]}
                      onChange={(e) => setUseAttachments((c) => ({ ...c, [a.attachmentId]: e.target.checked }))} />
                    {a.name}
                  </label>
                ))}
              </fieldset>
            )}

            <label className="block space-y-1.5 text-sm font-medium">
              <span>{t("mailTemplate.send.schedule")}</span>
              <Input type="datetime-local" value={scheduleAt}
                onChange={(e) => { setScheduleAt(e.target.value); setScheduleError(checkSchedule(e.target.value)); }} />
              <span className={scheduleError ? "text-destructive text-xs font-normal" : "text-muted-foreground text-xs font-normal"}>
                {scheduleError ?? t("mailTemplate.send.scheduleHelp")}
              </span>
            </label>

            {quota && (
              <p className="text-xs" data-testid="quota-line">
                {t("mailTemplate.send.quota", { used: quota.workspaceUsed, limit: quota.workspaceLimit, remaining: quota.remainingToday })}
                {overQuota && !scheduleAt && <span className="text-destructive"> · {t("mailTemplate.send.quotaExceeded")}</span>}
              </p>
            )}

            {preview && (
              <div className="space-y-2 rounded border p-3" data-testid="mail-preview">
                <p className="text-sm font-medium">{preview.subject}</p>
                <div className="rounded bg-white p-3 text-black" dangerouslySetInnerHTML={{ __html: preview.bodyHtml }} />
                {preview.missing.length > 0 && (
                  <p className="text-destructive text-xs">{t("mailTemplate.send.missing", { names: preview.missing.join(", ") })}</p>
                )}
              </div>
            )}

            {error && <p role="alert" className="text-destructive text-sm">{error}</p>}

            <DialogFooter className="flex-wrap gap-2">
              <Button type="button" variant="outline" disabled={!detail || busy} onClick={() => void runPreview()}>
                {t("mailTemplate.send.preview")}
              </Button>
              <Button type="button" variant="outline" disabled={!detail || busy} onClick={() => void runTest()}>
                {t("mailTemplate.send.sendTest")}
              </Button>
              <Button type="submit" disabled={!canSend} className="bg-brand-orange hover:bg-brand-orange/90 text-white">
                {busy ? t("mailTemplate.send.sending") : t(scheduleAt ? "mailTemplate.send.scheduleSend" : "mailTemplate.send.sendNow")}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
