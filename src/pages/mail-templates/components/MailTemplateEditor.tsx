import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { BlockBuilder } from "@/pages/mail-templates/components/BlockBuilder";
import { DiscardConfirmDialog } from "@/pages/mail-templates/components/DiscardConfirmDialog";
import { MailAttachmentSection } from "@/pages/mail-templates/components/MailAttachmentSection";
import { MailPreview } from "@/pages/mail-templates/components/MailPreview";
import { MailTemplateHeader } from "@/pages/mail-templates/components/MailTemplateHeader";
import { MailTemplateMetaFields } from "@/pages/mail-templates/components/MailTemplateMetaFields";
import { VariableHints } from "@/pages/mail-templates/components/VariableHints";
import {
  useMailTemplateForm,
  type FormAdapter,
} from "@/pages/mail-templates/components/useMailTemplateForm";
import type { MailTemplate } from "@/pages/mail-templates/types";

export type { FormAdapter };

export interface MailTemplateEditorProps {
  /** If false, returns null. Supported for backward compatibility */
  open?: boolean;
  /** Template being edited, or starting point for a clone/new template. */
  template: MailTemplate | null;
  mode: "create" | "edit";
  adapter: FormAdapter;
  onClose: () => void;
  onSaved: (template: MailTemplate) => void;
  /** When set, a new template keeps an autosaved draft under this localStorage key. */
  draftKey?: string;
  /** Kept for backward compatibility */
  inline?: boolean;
  /** Optional className for the root container */
  className?: string;
}

export function MailTemplateEditor({
  open,
  template,
  mode,
  adapter,
  onClose,
  onSaved,
  draftKey,
  className = "",
}: MailTemplateEditorProps) {
  if (open === false) return null;

  const { t } = useTranslation();
  const {
    name,
    setName,
    subject,
    setSubject,
    blocks,
    setBlocks,
    locale,
    setLocale,
    scope,
    setScope,
    attachments,
    addAttachment,
    removeAttachment,
    showRestored,
    discardDraft,
    busy,
    error,
    isLegacy,
    previewHtml,
    blockErrors,
    analysis,
    discardConfirmOpen,
    setDiscardConfirmOpen,
    requestClose,
    submit,
  } = useMailTemplateForm({
    template,
    mode,
    adapter,
    onClose,
    onSaved,
    draftKey,
  });

  return (
    <div
      id="mail-template-editor-section"
      className={`bg-card border-border rounded-xl border p-5 sm:p-6 shadow-sm space-y-6 scroll-mt-6 ${className}`}
    >
      <MailTemplateHeader
        mode={mode}
        templateName={template?.name || name}
        showRestored={showRestored}
        onRequestClose={requestClose}
        onDiscardDraft={discardDraft}
      />

      <form
        className="grid gap-6 lg:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <div className="space-y-4">
          <MailTemplateMetaFields
            name={name}
            setName={setName}
            subject={subject}
            setSubject={setSubject}
            scope={scope}
            setScope={setScope}
            scopes={adapter.scopes}
            locale={locale}
            setLocale={setLocale}
            mode={mode}
            isLegacy={isLegacy}
          />

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
            <MailAttachmentSection
              attachments={attachments}
              onAddAttachment={addAttachment}
              onRemoveAttachment={removeAttachment}
              disabled={busy}
            />
          )}

          {error && (
            <p role="alert" className="text-destructive text-sm">
              {error}
            </p>
          )}
        </div>

        <div className="flex h-full flex-col lg:sticky lg:top-6 lg:self-start">
          <MailPreview subject={subject} bodyHtml={previewHtml} fullHeight />
        </div>

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
      </form>

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
    </div>
  );
}
