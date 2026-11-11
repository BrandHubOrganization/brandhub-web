import { useEffect, useMemo, useState } from "react";
import { Paperclip, RotateCcw, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
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
import { SelectMenu } from "@/components/ui/select-menu";
import {
  emptyLayout,
  MAIL_LOCALES,
  parseLayout,
  renderLayoutPreview,
  serializeLayout,
  validateBlocks,
} from "@/pages/mail-templates/blocks";
import { BlockBuilder } from "@/pages/mail-templates/components/BlockBuilder";
import { MailPreview } from "@/pages/mail-templates/components/MailPreview";
import { VariableHints } from "@/pages/mail-templates/components/VariableHints";
import {
  clearDraft,
  loadDraft,
  saveDraft,
} from "@/pages/mail-templates/drafts";
import { analyzeVariables } from "@/pages/mail-templates/utils";
import { errorCode } from "@/services/adminRevenueService";
import type { MailBlock, MailLocale } from "@/pages/mail-templates/blocks";
import type {
  MailAttachment,
  MailTemplate,
  MailTemplateScope,
  TemplatePayload,
} from "@/pages/mail-templates/types";

export interface FormAdapter {
  save: (
    payload: TemplatePayload,
    existing: MailTemplate | null,
  ) => Promise<MailTemplate>;
  uploadAttachment?: (file: File) => Promise<MailAttachment>;
  /** Scopes a new template may be created in; the first is the default. */
  scopes: MailTemplateScope[];
  /** Set for Agency-level scopes (AGENCY_INTERNAL/AGENCY_CLIENT). */
  agencyId?: string;
}

interface Props {
  open?: boolean;
  /** Template being edited, or the system/own template used as the starting point for a new one. */
  template: MailTemplate | null;
  mode: "create" | "edit";
  adapter: FormAdapter;
  onClose: () => void;
  onSaved: (template: MailTemplate) => void;
  /** When set, a new template keeps an autosaved draft under this localStorage key. */
  draftKey?: string;
  inline?: boolean;
}

interface Draft {
  name: string;
  subject: string;
  layoutJson: string;
  scope?: MailTemplateScope;
}

const MAX_ATTACHMENTS = 3;

function DiscardConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("common.confirmDialog.title")}</DialogTitle>
          <DialogDescription>
            {t("mailTemplate.form.discardConfirm")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {t("common.confirmDialog.cancel")}
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm}>
            {t("common.confirmDialog.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function TemplateFormDialog({
  open,
  template,
  mode,
  adapter,
  onClose,
  onSaved,
  draftKey,
  inline,
}: Props) {
  const { t } = useTranslation();
  // Only a brand-new, blank template resumes a draft; cloning or editing starts from the template.
  const resumable = mode === "create" && !template && !!draftKey;
  const [restored] = useState<Draft | null>(() =>
    resumable ? loadDraft<Draft>(draftKey!) : null,
  );
  const [name, setName] = useState(restored?.name ?? template?.name ?? "");
  const [subject, setSubject] = useState(
    restored?.subject ?? template?.subject ?? "",
  );
  const [initialLayout] = useState(() =>
    parseLayout(restored?.layoutJson ?? template?.layoutJson),
  );
  const [blocks, setBlocks] = useState<MailBlock[]>(initialLayout.blocks);
  const [locale, setLocale] = useState<MailLocale>(
    initialLayout.locale ?? "vi",
  );
  const [scope, setScope] = useState<MailTemplateScope>(
    restored?.scope && adapter.scopes.includes(restored.scope)
      ? restored.scope
      : (template?.scope ?? adapter.scopes[0]),
  );
  const [showRestored, setShowRestored] = useState(!!restored);
  const isLegacy =
    mode === "edit" &&
    !!template &&
    !template.layoutJson &&
    !!template.bodyHtml;
  const [attachments, setAttachments] = useState<MailAttachment[]>(
    template?.attachments ?? [],
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [discardConfirmOpen, setDiscardConfirmOpen] = useState(false);

  const layoutJson = useMemo(
    () => serializeLayout({ version: 1, locale, blocks }),
    [locale, blocks],
  );
  const previewHtml = useMemo(
    () => renderLayoutPreview(blocks, locale),
    [blocks, locale],
  );
  const blockErrors = useMemo(() => validateBlocks(blocks), [blocks]);
  const analysis = useMemo(
    () => analyzeVariables(subject, previewHtml),
    [subject, previewHtml],
  );
  const dirty =
    mode === "edit"
      ? name !== (template?.name ?? "") ||
        subject !== (template?.subject ?? "") ||
        layoutJson !== serializeLayout(parseLayout(template?.layoutJson))
      : !!(name || subject || blocks.length);

  // Autosave the draft of a new template (debounced); cleared on save or when discarded.
  useEffect(() => {
    if (!resumable || !dirty) return;
    const timer = window.setTimeout(
      () => saveDraft<Draft>(draftKey!, { name, subject, layoutJson, scope }),
      600,
    );
    return () => window.clearTimeout(timer);
  }, [resumable, dirty, draftKey, name, subject, layoutJson, scope]);

  const discardDraft = () => {
    if (draftKey) clearDraft(draftKey);
    setName("");
    setSubject("");
    setBlocks(emptyLayout().blocks);
    setShowRestored(false);
  };

  /** New templates keep their draft; unsaved edits of an existing template ask first. */
  const requestClose = () => {
    if (busy) return;
    if (dirty) {
      if (!inline && resumable) {
        toast.message(t("mailTemplate.draft.kept"));
        onClose();
        return;
      }
      setDiscardConfirmOpen(true);
      return;
    }
    onClose();
  };

  const fail = (e: unknown) => {
    const code = errorCode(e);
    const message = t(`mailTemplate.errors.${code}`, {
      defaultValue: t("mailTemplate.errors.generic"),
    });
    setError(message);
    toast.error(message);
  };

  const submit = async () => {
    if (
      !name.trim() ||
      !subject.trim() ||
      blocks.length === 0 ||
      Object.keys(blockErrors).length > 0
    ) {
      setError(t("mailTemplate.errors.VALIDATION_ERROR"));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const payload: TemplatePayload = {
        name: name.trim(),
        subject: subject.trim(),
        layoutJson,
        ...(mode === "create"
          ? {
              scope,
              ...(adapter.agencyId ? { agencyId: adapter.agencyId } : {}),
            }
          : {}),
        ...(adapter.uploadAttachment
          ? { attachmentIds: attachments.map((a) => a.attachmentId) }
          : {}),
      };
      if (mode === "create" && template) payload.cloneFromId = template.id;
      const saved = await adapter.save(
        payload,
        mode === "edit" ? template : null,
      );
      if (draftKey) clearDraft(draftKey);
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

  const discardDialog = (
    <DiscardConfirmDialog
      open={discardConfirmOpen}
      onOpenChange={setDiscardConfirmOpen}
      onConfirm={() => {
        setDiscardConfirmOpen(false);
        if (mode === "create") {
          discardDraft();
        }
        onClose();
      }}
    />
  );

  const restoredNotice = showRestored && (
    <div
      role="status"
      className="bg-muted/50 flex flex-wrap items-center justify-between gap-2 rounded border px-3 py-2 text-xs"
    >
      <span>{t("mailTemplate.draft.restored")}</span>
      <Button
        type="button"
        variant="ghost"
        size="default"
        className="text-brand-orange font-medium"
        onClick={discardDraft}
      >
        {t("mailTemplate.draft.discard")}
      </Button>
    </div>
  );

  const formContent = (
    <form
      className="grid gap-6 lg:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      <div className="space-y-4">
        <label className="block space-y-1.5 text-sm font-medium">
          <span>{t("mailTemplate.form.name")} *</span>
          <Input
            value={name}
            maxLength={120}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className="block space-y-1.5 text-sm font-medium">
          <span>{t("mailTemplate.form.subject")} *</span>
          <Input
            value={subject}
            maxLength={200}
            onChange={(e) => setSubject(e.target.value)}
          />
        </label>
        {mode === "create" && adapter.scopes.length > 1 && (
          <div className="space-y-1.5 text-sm font-medium">
            <span>{t("mailTemplate.form.scope")}</span>
            <SelectMenu
              className="w-full"
              ariaLabel={t("mailTemplate.form.scope")}
              value={scope}
              onChange={(next) => setScope(next as MailTemplateScope)}
              options={adapter.scopes.map((s) => ({
                value: s,
                label: t(`mailTemplate.scopes.${s}`),
              }))}
            />
          </div>
        )}
        <div className="space-y-1.5 text-sm font-medium">
          <span>{t("mailTemplate.form.locale")}</span>
          <SelectMenu
            className="w-full"
            ariaLabel={t("mailTemplate.form.locale")}
            value={locale}
            onChange={(next) => setLocale(next as MailLocale)}
            options={MAIL_LOCALES.map((l) => ({
              value: l,
              label: t(`mailTemplate.locales.${l}`),
            }))}
          />
          <span className="text-muted-foreground block text-xs font-normal">
            {t("mailTemplate.form.localeHint")}
          </span>
        </div>
        {isLegacy && (
          <p
            role="status"
            className="bg-muted/50 rounded border px-3 py-2 text-xs"
          >
            {t("mailTemplate.builder.legacy")}
          </p>
        )}
        <div className="space-y-1.5 text-sm">
          <span className="font-medium">
            {t("mailTemplate.form.body")} *
          </span>
          <BlockBuilder
            blocks={blocks}
            onChange={setBlocks}
            errors={blockErrors}
            disabled={busy}
          />
        </div>
        <VariableHints analysis={analysis} />
        {adapter.uploadAttachment && (
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-medium">
                {t("mailTemplate.form.attachments")}
              </span>
              <label className="text-brand-orange cursor-pointer text-xs font-medium">
                <Paperclip className="mr-1 inline size-3.5" />
                {t("mailTemplate.form.addAttachment")}
                <input
                  type="file"
                  className="hidden"
                  data-testid="mail-attachment-input"
                  accept=".pdf,.png,.jpg,.jpeg,.gif,.docx,.xlsx,.pptx"
                  onChange={(e) => {
                    void addAttachment(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
            <p className="text-muted-foreground text-xs">
              {t("mailTemplate.form.attachmentRules")}
            </p>
            <ul className="space-y-1">
              {attachments.map((a) => (
                <li
                  key={a.attachmentId}
                  className="bg-muted/50 flex items-center justify-between rounded px-2 py-1"
                >
                  <span className="truncate">
                    {a.name}{" "}
                    <span className="text-muted-foreground text-xs">
                      ({Math.ceil(a.size / 1024)} KB)
                    </span>
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="default"
                    aria-label={t("mailTemplate.form.removeAttachment", {
                      name: a.name,
                    })}
                    onClick={() =>
                      setAttachments((current) =>
                        current.filter(
                          (x) => x.attachmentId !== a.attachmentId,
                        ),
                      )
                    }
                  >
                    <X className="size-3.5" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
        {error && (
          <p role="alert" className="text-destructive text-sm">
            {error}
          </p>
        )}
      </div>
      <div className={`flex h-full flex-col ${inline ? "lg:sticky lg:top-6 lg:self-start" : ""}`}>
        <MailPreview subject={subject} bodyHtml={previewHtml} fullHeight />
      </div>
      {inline ? (
        <div className="border-border border-t pt-4 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 lg:col-span-2">
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={requestClose}
          >
            {mode === "edit"
              ? t("mailTemplate.form.cancelEdit", { defaultValue: "Hủy sửa" })
              : t("mailTemplate.form.reset", { defaultValue: "Hủy / Đặt lại" })}
          </Button>
          <Button type="submit" variant="orange" disabled={busy}>
            {busy
              ? t("mailTemplate.form.saving")
              : t("mailTemplate.form.saveTemplate", { defaultValue: "Lưu mẫu" })}
          </Button>
        </div>
      ) : (
        <DialogFooter className="border-border border-t pt-4 lg:col-span-2">
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={requestClose}
          >
            {t("mailTemplate.cancel")}
          </Button>
          <Button type="submit" variant="orange" disabled={busy}>
            {busy
              ? t("mailTemplate.form.saving")
              : t("mailTemplate.form.save")}
          </Button>
        </DialogFooter>
      )}
    </form>
  );

  if (inline) {
    return (
      <div
        id="mail-template-editor-section"
        className="bg-card border-border rounded-xl border p-5 sm:p-6 shadow-sm space-y-6 scroll-mt-6"
      >
        <div className="border-border border-b pb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-foreground text-lg sm:text-xl font-bold tracking-tight">
                {mode === "edit"
                  ? t("mailTemplate.form.editTitleWithName", {
                      name: template?.name || name,
                      defaultValue: `Chỉnh sửa mẫu: ${template?.name || name}`,
                    })
                  : t("mailTemplate.form.createTitleInline", {
                      defaultValue: "Tạo mẫu email mới",
                    })}
              </h2>
              {mode === "edit" ? (
                <Badge
                  variant="outline"
                  className="border-brand-orange/40 bg-brand-orange/10 text-brand-orange text-xs font-medium"
                >
                  {t("mailTemplate.form.editingBadge", { defaultValue: "Đang chỉnh sửa" })}
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs font-normal">
                  {t("mailTemplate.form.creatingBadge", { defaultValue: "Mẫu mới" })}
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground text-xs sm:text-sm">
              {t("mailTemplate.form.variablesHint")}
            </p>
          </div>
          {mode === "edit" && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={requestClose}
              className="shrink-0 gap-1.5"
            >
              <RotateCcw className="size-3.5" />
              {t("mailTemplate.form.cancelEdit", { defaultValue: "Hủy sửa / Tạo mẫu mới" })}
            </Button>
          )}
        </div>
        {restoredNotice}
        {formContent}
        {discardDialog}
      </div>
    );
  }

  return (
    <Dialog open={open ?? true} onOpenChange={(next) => !next && requestClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>
            {t(
              mode === "edit"
                ? "mailTemplate.form.editTitle"
                : "mailTemplate.form.createTitle",
            )}
          </DialogTitle>
          <DialogDescription>
            {t("mailTemplate.form.variablesHint")}
          </DialogDescription>
        </DialogHeader>
        {restoredNotice}
        {formContent}
        {discardDialog}
      </DialogContent>
    </Dialog>
  );
}
