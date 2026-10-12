import { useState } from "react";
import { Paperclip, X } from "lucide-react";
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
import { errorCode } from "@/services/adminRevenueService";
import type { MailAttachment, MailTemplate, TemplatePayload } from "../types";
import { MailBodyEditor } from "./MailBodyEditor";

export interface FormAdapter {
  save: (payload: TemplatePayload, existing: MailTemplate | null) => Promise<MailTemplate>;
  uploadImage?: (file: File) => Promise<string>;
  uploadAttachment?: (file: File) => Promise<MailAttachment>;
}

interface Props {
  open: boolean;
  /** Template being edited, or the system/own template used as the starting point for a new one. */
  template: MailTemplate | null;
  mode: "create" | "edit";
  adapter: FormAdapter;
  onClose: () => void;
  onSaved: (template: MailTemplate) => void;
}

const MAX_ATTACHMENTS = 3;

export function TemplateFormDialog({ open, template, mode, adapter, onClose, onSaved }: Props) {
  const { t } = useTranslation();
  const [name, setName] = useState(template?.name ?? "");
  const [subject, setSubject] = useState(template?.subject ?? "");
  const [bodyHtml, setBodyHtml] = useState(template?.bodyHtml ?? "");
  const [attachments, setAttachments] = useState<MailAttachment[]>(template?.attachments ?? []);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fail = (e: unknown) => {
    const code = errorCode(e);
    const message = t(`mailTemplate.errors.${code}`, { defaultValue: t("mailTemplate.errors.generic") });
    setError(message);
    toast.error(message);
  };

  const submit = async () => {
    if (!name.trim() || !subject.trim() || !bodyHtml.replace(/<[^>]+>/g, "").trim()) {
      setError(t("mailTemplate.errors.VALIDATION_ERROR"));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const payload: TemplatePayload = {
        name: name.trim(),
        subject: subject.trim(),
        bodyHtml,
        ...(adapter.uploadAttachment ? { attachmentIds: attachments.map((a) => a.attachmentId) } : {}),
      };
      if (mode === "create" && template) payload.cloneFromId = template.id;
      const saved = await adapter.save(payload, mode === "edit" ? template : null);
      toast.success(t("mailTemplate.form.saved"));
      onSaved(saved);
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  };

  const addAttachment = async (file: File | undefined) => {
    if (!file || !adapter.uploadAttachment) return;
    if (attachments.length >= MAX_ATTACHMENTS) {
      setError(t("mailTemplate.form.maxFiles", { count: MAX_ATTACHMENTS }));
      return;
    }
    try {
      const uploaded = await adapter.uploadAttachment(file);
      setAttachments((current) => [...current, uploaded]);
    } catch (e) {
      fail(e);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && !busy && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {t(mode === "edit" ? "mailTemplate.form.editTitle" : "mailTemplate.form.createTitle")}
          </DialogTitle>
          <DialogDescription>{t("mailTemplate.form.variablesHint")}</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); void submit(); }}>
          <label className="block space-y-1.5 text-sm font-medium">
            <span>{t("mailTemplate.form.name")} *</span>
            <Input value={name} maxLength={120} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="block space-y-1.5 text-sm font-medium">
            <span>{t("mailTemplate.form.subject")} *</span>
            <Input value={subject} maxLength={200} onChange={(e) => setSubject(e.target.value)} />
          </label>
          <div className="space-y-1.5 text-sm font-medium">
            <span>{t("mailTemplate.form.body")} *</span>
            <MailBodyEditor value={bodyHtml} onChange={setBodyHtml} onUploadImage={adapter.uploadImage} disabled={busy} />
          </div>
          {adapter.uploadAttachment && (
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium">{t("mailTemplate.form.attachments")}</span>
                <label className="text-brand-orange cursor-pointer text-xs font-medium">
                  <Paperclip className="mr-1 inline size-3.5" />
                  {t("mailTemplate.form.addAttachment")}
                  <input type="file" className="hidden" data-testid="mail-attachment-input"
                    accept=".pdf,.png,.jpg,.jpeg,.gif,.docx,.xlsx,.pptx"
                    onChange={(e) => { void addAttachment(e.target.files?.[0]); e.target.value = ""; }} />
                </label>
              </div>
              <p className="text-muted-foreground text-xs">{t("mailTemplate.form.attachmentRules")}</p>
              <ul className="space-y-1">
                {attachments.map((a) => (
                  <li key={a.attachmentId} className="bg-muted/50 flex items-center justify-between rounded px-2 py-1">
                    <span className="truncate">{a.name} <span className="text-muted-foreground text-xs">({Math.ceil(a.size / 1024)} KB)</span></span>
                    <button type="button" aria-label={t("mailTemplate.form.removeAttachment", { name: a.name })}
                      onClick={() => setAttachments((current) => current.filter((x) => x.attachmentId !== a.attachmentId))}>
                      <X className="size-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {error && <p role="alert" className="text-destructive text-sm">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" disabled={busy} onClick={onClose}>{t("mailTemplate.cancel")}</Button>
            <Button type="submit" disabled={busy} className="bg-brand-orange hover:bg-brand-orange/90 text-white">
              {busy ? t("mailTemplate.form.saving") : t("mailTemplate.form.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
