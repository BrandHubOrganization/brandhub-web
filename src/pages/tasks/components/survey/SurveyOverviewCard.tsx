import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  PenTool,
  ExternalLink,
  FileSpreadsheet,
  Copy,
  Check,
  QrCode,
  HelpCircle,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { surveyService } from "@/services/surveyService";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { SurveyShareDialog } from "./SurveyShareDialog";
import type { SurveyModel, SurveyAnalysis } from "@/pages/tasks/types/survey";
import { cn } from "@/lib/utils";

interface SurveyOverviewCardProps {
  workspaceId: string;
  taskId: string;
  taskTitle: string;
}

export function SurveyOverviewCard({
  workspaceId,
  taskId,
  taskTitle,
}: SurveyOverviewCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const canEdit = useWorkspaceStore((s) => {
    const role = s.currentMemberRole || s.currentWorkspace?.myRole;
    return role === "MANAGER" || role === "CREATOR";
  });

  const [loading, setLoading] = useState(true);
  const [survey, setSurvey] = useState<SurveyModel | null>(null);
  const [analysis, setAnalysis] = useState<SurveyAnalysis | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        const [surveyRes, analysisRes] = await Promise.allSettled([
          surveyService.getSurvey(workspaceId, taskId),
          surveyService.getSurveyAnalysis(workspaceId, taskId),
        ]);
        if (!mounted) return;
        if (surveyRes.status === "fulfilled") {
          setSurvey(surveyRes.value);
        }
        if (analysisRes.status === "fulfilled") {
          setAnalysis(analysisRes.value);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void fetchData();
    return () => {
      mounted = false;
    };
  }, [workspaceId, taskId]);

  const isPublished = Boolean(survey?.publicLink || survey?.publicToken);
  const publicUrl = survey?.publicLink
    ? survey.publicLink
    : survey?.publicToken
      ? `${window.location.origin}/public/surveys/${survey.publicToken}`
      : "";

  const handleCopyLink = async () => {
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      toast.success(t("tasks.survey.publishCard.linkCopied"));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t("tasks.survey.publishCard.copyFailed"));
    }
  };

  const handleOpenEditor = () => {
    navigate(
      `/workspaces/${encodeURIComponent(workspaceId)}/tasks/${encodeURIComponent(taskId)}/survey`,
    );
  };

  if (loading) {
    return (
      <div className="text-muted-foreground border-border/80 bg-card flex items-center justify-center rounded-xl border p-8 text-sm">
        <Spinner className="mr-2 size-4" />
        <span>{t("tasks.loading")}</span>
      </div>
    );
  }

  const questionCount = survey?.questions?.length ?? survey?.questionCount ?? 0;
  const totalResponses = analysis?.totalResponses ?? 0;

  return (
    <div className="border-border/80 bg-card space-y-4 rounded-xl border p-5 shadow-2xs">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="bg-brand-orange-soft text-brand-orange flex size-10 shrink-0 items-center justify-center rounded-xl">
            <PenTool className="size-5" />
          </div>
          <div className="min-w-0 space-y-0.5">
            <h3 className="text-foreground truncate text-sm font-semibold">
              {survey?.formName ||
                taskTitle ||
                survey?.title ||
                t("tasks.survey.overview.title")}
            </h3>
            <p className="text-muted-foreground text-xs">
              {t("tasks.survey.overview.description")}
            </p>
          </div>
        </div>
        <span
          className={cn(
            "text-2xs shrink-0 rounded-md px-2.5 py-0.5 font-semibold",
            isPublished
              ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "bg-muted text-muted-foreground",
          )}
        >
          {isPublished
            ? t("tasks.survey.publishCard.statusPublished")
            : t("tasks.survey.publishCard.statusDraft")}
        </span>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="border-border/60 bg-muted/30 space-y-1 rounded-lg border p-3">
          <div className="text-2xs text-muted-foreground flex items-center gap-1.5 font-medium">
            <HelpCircle className="text-brand-orange size-3.5" />
            <span>{t("tasks.survey.editor.questionsTab")}</span>
          </div>
          <div className="text-foreground text-lg font-bold">
            {questionCount}
          </div>
        </div>

        <div className="border-border/60 bg-muted/30 space-y-1 rounded-lg border p-3">
          <div className="text-2xs text-muted-foreground flex items-center gap-1.5 font-medium">
            <Users className="text-brand-orange size-3.5" />
            <span>{t("tasks.survey.analysis.totalResponses")}</span>
          </div>
          <div className="text-foreground text-lg font-bold">
            {totalResponses}
          </div>
        </div>

        <div className="border-border/60 bg-muted/30 col-span-2 space-y-1 rounded-lg border p-3 sm:col-span-1">
          <div className="text-2xs text-muted-foreground flex items-center gap-1.5 font-medium">
            <FileSpreadsheet
              className={cn(
                "size-3.5",
                survey?.spreadsheetUrl
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-muted-foreground",
              )}
            />
            <span>Google Sheets</span>
          </div>
          <div className="text-foreground truncate text-xs font-medium">
            {survey?.spreadsheetUrl
              ? t("tasks.survey.overview.connectedSheets")
              : t("tasks.survey.overview.notConnected")}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="border-border/60 flex flex-wrap items-center justify-end gap-2 border-t pt-2">
        {(canEdit || survey) && (
          <Button
            type="button"
            variant="orange"
            onClick={handleOpenEditor}
            className="gap-2 shadow-xs"
          >
            <ExternalLink className="size-4" />
            <span>
              {canEdit
                ? t("tasks.survey.overview.openEditor")
                : t("tasks.survey.overview.viewResponses")}
            </span>
          </Button>
        )}

        {isPublished && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void handleCopyLink()}
              className="gap-1.5"
            >
              {copied ? (
                <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Copy className="size-3.5" />
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShareOpen(true)}
              className="gap-1.5"
            >
              <QrCode className="size-3.5" />
            </Button>

            {survey?.spreadsheetUrl && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                asChild
                className="border-border/80 hover:border-brand-orange/60 hover:text-brand-orange gap-1.5"
              >
                <a
                  href={survey.spreadsheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FileSpreadsheet className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                </a>
              </Button>
            )}
          </div>
        )}
      </div>

      {/* QR & Share Dialog */}
      {isPublished && (
        <SurveyShareDialog
          open={shareOpen}
          onOpenChange={setShareOpen}
          surveyTitle={survey?.formName || taskTitle || survey?.title || ""}
          publicUrl={publicUrl}
          spreadsheetUrl={survey?.spreadsheetUrl}
        />
      )}
    </div>
  );
}
