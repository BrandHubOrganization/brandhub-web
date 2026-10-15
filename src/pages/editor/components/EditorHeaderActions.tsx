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
  publishStatus?: "IDLE" | "PUBLISHING" | "PUBLISHED" | "FAILED";
  onOpenTemplatePicker: () => void;
  onOpenPreview: () => void;
  onSubmitForReview: () => void;
  onPublishNow?: () => void;
}

export function EditorHeaderActions({
  isSaving,
  isDirty,
  lastSavedTime,
  isSubmitting,
  publishStatus = "IDLE",
  onOpenTemplatePicker,
  onOpenPreview,
  onSubmitForReview,
  onPublishNow,
}: Props) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {publishStatus === "PUBLISHING" && (
        <div className="border-primary/30 bg-primary/10 text-primary flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium">
          <Clock className="text-primary size-3.5 animate-spin" />
          <span>Đang xuất bản lên Facebook...</span>
        </div>
      )}

      {publishStatus === "PUBLISHED" && (
        <div className="border-success/30 bg-success/10 text-success flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium">
          <CheckCircle2 className="text-success size-3.5" />
          <span>Đã đăng lên Facebook thành công!</span>
        </div>
      )}

      {publishStatus === "FAILED" && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium">
          <span>Đăng thất bại</span>
        </div>
      )}

      <div className="border-border bg-card text-muted-foreground flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs">
        {isSaving ? (
          <>
            <Clock className="text-warning size-3.5 animate-spin" />
            <span>{t("editor.header.autoSaving")}</span>
          </>
        ) : isDirty ? (
          <>
            <Save className="text-warning size-3.5" />
            <span className="text-warning font-medium">
              {t("editor.header.unsavedDraft")}
            </span>
          </>
        ) : (
          <>
            <CheckCircle2 className="text-success size-3.5" />
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

      {onPublishNow && (
        <button
          type="button"
          onClick={onPublishNow}
          disabled={isSubmitting}
          className="bg-success text-success-foreground hover:bg-success/90 active:bg-success/80 flex cursor-pointer items-center gap-1.5 rounded-xl px-4 py-1.5 text-xs font-medium shadow-xs transition-colors disabled:opacity-50"
        >
          <Send className="size-3.5" />
          <span>{isSubmitting ? "Đang xử lý..." : "Đăng ngay"}</span>
        </button>
      )}

      <button
        type="button"
        onClick={onSubmitForReview}
        disabled={isSubmitting}
        className="bg-brand-orange hover:bg-brand-orange/90 active:bg-brand-orange/80 flex cursor-pointer items-center gap-1.5 rounded-xl px-4 py-1.5 text-xs font-medium text-white shadow-xs transition-colors disabled:opacity-50"
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
