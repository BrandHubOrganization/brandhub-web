import {
  Eye,
  Send,
  Save,
  CheckCircle2,
  Clock,
  LayoutTemplate,
} from "lucide-react";
import { useTranslation } from "react-i18next";

interface Props {
  isSaving: boolean;
  isDirty: boolean;
  lastSavedTime: string;
  isSubmitting: boolean;
  onOpenTemplatePicker: () => void;
  onOpenPreview: () => void;
  onSubmitForReview: () => void;
}

export function EditorHeaderActions({
  isSaving,
  isDirty,
  lastSavedTime,
  isSubmitting,
  onOpenTemplatePicker,
  onOpenPreview,
  onSubmitForReview,
}: Props) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-3">
      <div className="border-border bg-card text-muted-foreground flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs">
        {isSaving ? (
          <>
            <Clock className="size-3.5 animate-spin text-amber-500" />
            <span>{t("editor.header.autoSaving")}</span>
          </>
        ) : isDirty ? (
          <>
            <Save className="size-3.5 text-amber-500" />
            <span className="font-medium text-amber-600 dark:text-amber-400">
              {t("editor.header.unsavedDraft")}
            </span>
          </>
        ) : (
          <>
            <CheckCircle2 className="size-3.5 text-emerald-500" />
            <span>{t("editor.header.savedAt", { time: lastSavedTime })}</span>
          </>
        )}
      </div>

      <button
        type="button"
        onClick={onOpenTemplatePicker}
        className="border-border bg-card text-foreground hover:bg-muted flex cursor-pointer items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-xs font-medium shadow-2xs transition-colors"
      >
        <LayoutTemplate className="text-brand-orange size-4" />
        <span>{t("editor.header.templatePickerButton")}</span>
      </button>

      <button
        type="button"
        onClick={onOpenPreview}
        className="border-border bg-card text-foreground hover:bg-muted flex cursor-pointer items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-xs font-medium shadow-2xs transition-colors"
      >
        <Eye className="text-brand-orange size-4" />
        <span>{t("editor.header.previewButton")}</span>
      </button>

      <button
        type="button"
        onClick={onSubmitForReview}
        disabled={isSubmitting}
        className="bg-brand-orange hover:bg-brand-orange/90 flex cursor-pointer items-center gap-1.5 rounded-xl px-4 py-1.5 text-xs font-medium text-white shadow-xs transition-colors disabled:opacity-50"
      >
        <Send className="size-3.5" />
        <span>
          {isSubmitting
            ? t("editor.header.submitting")
            : t("editor.header.submitForApproval")}
        </span>
      </button>
    </div>
  );
}
