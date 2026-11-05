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
import { SurveyShareDialog } from "@/pages/tasks/components/survey/SurveyShareDialog";
import { stripHtmlTags } from "@/pages/tasks/components/survey/SurveyFormatText";
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
      <div className="border-border/80 bg-card text-muted-foreground flex items-center justify-center rounded-2xl border p-8 text-sm">
        <Spinner className="mr-2 size-4" />
        <span>{t("tasks.loading")}</span>
      </div>
    );
  }

  const questionCount = survey?.questions
    ? survey.questions.filter((q) => q.type !== "SECTION_HEADER").length
    : (survey?.questionCount ?? 0);
  const totalResponses = analysis?.totalResponses ?? 0;
  const cleanSurveyTitle = stripHtmlTags(
    survey?.formName || taskTitle || survey?.title || "",
  );

  return (
    <div className="border-border/80 bg-card space-y-4 rounded-2xl border p-5 shadow-xs">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="bg-brand-orange-soft text-brand-orange ring-brand-orange/20 flex size-10 shrink-0 items-center justify-center rounded-xl ring-1">
            <PenTool className="size-5" />
          </div>
          <div className="min-w-0 space-y-0.5">
            <h3 className="text-foreground truncate text-sm font-semibold tracking-tight">
              {cleanSurveyTitle || t("tasks.survey.overview.title")}
            </h3>
            <p className="text-muted-foreground truncate text-xs">
              {t("tasks.survey.overview.description")}
            </p>
          </div>
        </div>
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
            isPublished
              ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "border-border/60 bg-muted text-muted-foreground border",
          )}
        >
          <span
            className={cn(
              "size-1.5 rounded-full",
              isPublished ? "bg-emerald-500" : "bg-muted-foreground/60",
            )}
          />
          <span>
            {isPublished
              ? t("tasks.survey.publishCard.statusPublished")
              : t("tasks.survey.publishCard.statusDraft")}
          </span>
        </span>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* Questions Count */}
        <div className="border-border/60 bg-muted/20 space-y-1 rounded-xl border p-3">
          <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
            <HelpCircle className="text-brand-orange size-3.5" />
            <span>{t("tasks.survey.editor.questionsTab")}</span>
          </div>
          <div className="text-foreground text-xl font-bold tracking-tight">
            {questionCount}
          </div>
        </div>

        {/* Responses Count */}
        <div className="border-border/60 bg-muted/20 space-y-1 rounded-xl border p-3">
          <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
            <Users className="text-brand-orange size-3.5" />
            <span>{t("tasks.survey.analysis.totalResponses")}</span>
          </div>
          <div className="text-foreground text-xl font-bold tracking-tight">
            {totalResponses}
          </div>
        </div>

        {/* Google Sheets Status */}
        <div className="border-border/60 bg-muted/20 space-y-1 rounded-xl border p-3">
          <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
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
          {survey?.spreadsheetUrl ? (
            <a
              href={survey.spreadsheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 truncate text-xs font-medium text-emerald-600 hover:underline dark:text-emerald-400"
            >
              <span className="truncate">
                {t("tasks.survey.overview.connectedSheets")}
              </span>
              <ExternalLink className="size-3 shrink-0" />
            </a>
          ) : (
            <div className="text-muted-foreground truncate text-xs font-medium">
              {t("tasks.survey.overview.notConnected")}
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="border-border/60 flex flex-wrap items-center justify-between gap-2.5 border-t pt-3">
        {/* Left Actions: Quick Sharing when published */}
        {isPublished ? (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void handleCopyLink()}
              className="h-9 gap-1.5 px-3 text-xs font-medium"
              title={t("tasks.survey.publishCard.copyLink")}
            >
              {copied ? (
                <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Copy className="size-3.5" />
              )}
              <span>
                {copied
                  ? t("tasks.survey.publishCard.linkCopied")
                  : t("tasks.survey.publishCard.copyLink")}
              </span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShareOpen(true)}
              className="h-9 gap-1.5 px-3 text-xs font-medium"
              title={t("tasks.survey.publishCard.qrCode")}
            >
              <QrCode className="size-3.5" />
              <span>{t("tasks.survey.publishCard.qrCode")}</span>
            </Button>
          </div>
        ) : (
          <div />
        )}

        {/* Right Action: Open Editor / View Responses */}
        {(canEdit || survey) && (
          <Button
            type="button"
            variant="orange"
            size="sm"
            onClick={handleOpenEditor}
            className="ml-auto h-9 gap-2 px-4 font-medium shadow-xs"
          >
            <PenTool className="size-3.5" />
            <span>
              {canEdit
                ? t("tasks.survey.overview.openEditor")
                : t("tasks.survey.overview.viewResponses")}
            </span>
            <ExternalLink className="size-3.5 opacity-70" />
          </Button>
        )}
      </div>

      {/* QR & Share Dialog */}
      {isPublished && (
        <SurveyShareDialog
          open={shareOpen}
          onOpenChange={setShareOpen}
          surveyTitle={cleanSurveyTitle}
          publicUrl={publicUrl}
          spreadsheetUrl={survey?.spreadsheetUrl}
        />
      )}
    </div>
  );
}
