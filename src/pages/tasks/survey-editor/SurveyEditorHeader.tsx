import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  FileSpreadsheet,
  Eye,
  Share2,
  Sparkles,
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

  return (
    <header className="bg-card/95 border-border sticky top-0 z-30 border-b shadow-2xs backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Top Control Bar */}
        <div className="flex h-14 items-center justify-between gap-3">
          {/* Left: Back & Title */}
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
                  <>
                    <span className="text-muted-foreground text-xs">
                      {t("tasks.survey.editor.saving", "Đang lưu...")}
                    </span>
                  </>
                )}
                {saveStatus === "saved" && (
                  <>
                    <span className="text-muted-foreground text-xs">
                      {t("tasks.survey.editor.saved", "Đã lưu")}
                    </span>
                  </>
                )}
                {saveStatus === "error" && (
                  <>
                    <span className="text-destructive text-xs">
                      {t("tasks.survey.editor.saveFailed", "Lỗi khi lưu")}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Right Action Buttons */}
          <div className="flex shrink-0 items-center gap-2">
            <span
              className={cn(
                "text-2xs hidden shrink-0 rounded-md px-2 py-0.5 font-semibold sm:inline-flex",
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

            {isPublished && publicUrl && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                asChild
              >
                <a href={publicUrl} target="_blank" rel="noopener noreferrer">
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
                ) : (
                  <Sparkles className="size-3.5" />
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

        {/* Center Google Forms Navigation Tabs */}
        <div className="border-border/50 flex items-center justify-center gap-8 border-t">
          {canEdit && (
            <button
              type="button"
              onClick={() => onTabChange("questions")}
              className={cn(
                "cursor-pointer border-b-2 px-4 py-2.5 text-xs font-medium transition-all",
                activeTab === "questions"
                  ? "border-brand-orange text-brand-orange font-semibold"
                  : "text-muted-foreground hover:text-foreground border-transparent",
              )}
            >
              {t("tasks.survey.editor.questionsTab")}
            </button>
          )}
          <button
            type="button"
            onClick={() => onTabChange("responses")}
            className={cn(
              "flex cursor-pointer items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-medium transition-all",
              activeTab === "responses" || !canEdit
                ? "border-brand-orange text-brand-orange font-semibold"
                : "text-muted-foreground hover:text-foreground border-transparent",
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
    </header>
  );
}
