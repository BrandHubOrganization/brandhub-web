/**
 * Backward compatibility wrapper around MailTemplateEditor.
 * Note: Modal Dialog has been deprecated in favor of clean non-modal UI.
 */
export {
  MailTemplateEditor as TemplateFormDialog,
  MailTemplateEditor,
  type FormAdapter,
  type MailTemplateEditorProps,
} from "./MailTemplateEditor";
export type { DiscardConfirmDialogProps } from "./DiscardConfirmDialog";
export type { MailAttachmentSectionProps } from "./MailAttachmentSection";
export type { MailTemplateHeaderProps } from "./MailTemplateHeader";
export type { MailTemplateMetaFieldsProps } from "./MailTemplateMetaFields";
