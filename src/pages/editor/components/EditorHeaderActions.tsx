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
      <div className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
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
        className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3.5 py-1.5 text-xs font-medium text-zinc-700 shadow-2xs transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
      >
        <LayoutTemplate className="text-brand-orange size-4" />
        <span>{t("editor.header.templatePickerButton")}</span>
      </button>

      <button
        type="button"
        onClick={onOpenPreview}
        className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3.5 py-1.5 text-xs font-medium text-zinc-700 shadow-2xs transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
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
