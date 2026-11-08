import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  FileSpreadsheet,
  Eye,
  Share2,
  Save,
  Send,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

interface SurveyEditorHeaderProps {
  formName: string;
  onFormNameChange: (val: string) => void;
  isPublished: boolean;
  spreadsheetUrl?: string;
  publicUrl: string;
  totalResponses: number;
  activeTab: "questions" | "responses";
  onTabChange: (tab: "questions" | "responses") => void;
  onBack: () => void;
  onShare: () => void;
  onSave: () => void;
  saving: boolean;
  saveStatus: "idle" | "saving" | "saved" | "error";
  canEdit: boolean;
}

export function SurveyEditorHeader({
  formName,
  onFormNameChange,
  isPublished,
  spreadsheetUrl,
  publicUrl,
  totalResponses,
  activeTab,
  onTabChange,
  onBack,
  onShare,
  onSave,
  saving,
  saveStatus,
  canEdit,
}: SurveyEditorHeaderProps) {
  const { t } = useTranslation();

  const previewUrl = publicUrl
    ? `${publicUrl}${publicUrl.includes("?") ? "&" : "?"}preview=true`
    : "";

  return (
    <header className="border-border/80 bg-card/95 sticky top-0 z-30 border-b shadow-2xs backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground size-8 shrink-0 rounded-full"
              onClick={onBack}
              title={t("tasks.survey.editor.backToTask")}
            >
              <ArrowLeft className="size-4" />
            </Button>

            <div className="max-w-xs min-w-0 sm:max-w-md">
              <Input
                value={formName}
                onChange={(e) => onFormNameChange(e.target.value)}
                readOnly={!canEdit}
                placeholder={t(
                  "tasks.survey.editor.formNamePlaceholder",
                  "Tên biểu mẫu",
                )}
                className="hover:border-border focus:border-border h-8 border-transparent bg-transparent px-2 text-sm font-semibold shadow-none"
              />
            </div>

            {saveStatus !== "idle" && (
              <div className="flex shrink-0 items-center gap-1.5 text-xs select-none">
                {saveStatus === "saving" && (
                  <span className="text-muted-foreground text-xs">
                    {t("tasks.survey.editor.saving", "Đang lưu...")}
                  </span>
                )}
                {saveStatus === "saved" && (
                  <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
                    <Check className="size-3 text-emerald-500" />
                    {t("tasks.survey.editor.saved", "Đã lưu")}
                  </span>
                )}
                {saveStatus === "error" && (
                  <span className="text-destructive text-xs">
                    {t("tasks.survey.editor.saveFailed", "Lỗi khi lưu")}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <span
              className={cn(
                "hidden shrink-0 rounded-md px-2.5 py-0.5 text-xs font-medium sm:inline-flex",
                isPublished
                  ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {isPublished
                ? t("tasks.survey.publishCard.statusPublished")
                : t("tasks.survey.publishCard.statusDraft")}
            </span>
            {spreadsheetUrl && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-border/80 hover:border-brand-orange/60 hover:text-brand-orange gap-1.5"
                asChild
              >
                <a
                  href={spreadsheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FileSpreadsheet className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                </a>
              </Button>
            )}

            {publicUrl && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                asChild
              >
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={t("tasks.survey.editor.preview", "Xem trước")}
                >
                  <Eye className="size-3.5" />
                </a>
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={onShare}
              disabled={!isPublished}
            >
              <Share2 className="size-3.5" />
            </Button>

            {canEdit && (
              <Button
                type="button"
                variant="orange"
                size="sm"
                className="gap-1.5 shadow-xs"
                onClick={onSave}
                disabled={saving}
              >
                {saving ? (
                  <Spinner className="size-3.5" />
                ) : isPublished ? (
                  <Save className="size-3.5" />
                ) : (
                  <Send className="size-3.5" />
                )}
                <span>
                  {saving
                    ? t("tasks.survey.saving")
                    : isPublished
                      ? t("tasks.survey.saveButton")
                      : t("tasks.survey.publishButton")}
                </span>
              </Button>
            )}
          </div>
        </div>

        <div className="border-border/40 flex items-center justify-center border-t py-2">
          <div className="bg-muted/60 inline-flex items-center gap-1 rounded-lg p-1">
            {canEdit && (
              <button
                type="button"
                onClick={() => onTabChange("questions")}
                className={cn(
                  "cursor-pointer rounded-md px-4 py-1.5 text-xs font-medium transition-all",
                  activeTab === "questions"
                    ? "bg-card text-foreground font-semibold shadow-2xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t("tasks.survey.editor.questionsTab")}
              </button>
            )}
            <button
              type="button"
              onClick={() => onTabChange("responses")}
              className={cn(
                "inline-flex cursor-pointer items-center gap-1.5 rounded-md px-4 py-1.5 text-xs font-medium transition-all",
                activeTab === "responses" || !canEdit
                  ? "bg-card text-foreground font-semibold shadow-2xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span>
                {t("tasks.survey.editor.responsesTab", {
                  count: totalResponses,
                })}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
