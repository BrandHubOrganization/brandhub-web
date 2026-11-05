import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  FileSpreadsheet,
  ExternalLink,
  Users,
  Star,
  RefreshCw,
  Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { surveyService } from "@/services/surveyService";
import { SurveyQuestionBreakdown } from "@/pages/tasks/components/survey/SurveyQuestionBreakdown";
import type { SurveyAnalysis } from "@/pages/tasks/types/survey";
import { cn } from "@/lib/utils";

interface SurveyAnalysisViewProps {
  workspaceId: string;
  taskId: string;
}

export function SurveyAnalysisView({
  workspaceId,
  taskId,
}: SurveyAnalysisViewProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analysis, setAnalysis] = useState<SurveyAnalysis | null>(null);

  const loadData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      const data = await surveyService.getSurveyAnalysis(workspaceId, taskId);
      setAnalysis(data);
    } catch {
      // If error or not found, fallback to 0 responses
      setAnalysis({
        taskId,
        totalResponses: 0,
        questionBreakdown: [],
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [workspaceId, taskId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-muted-foreground text-sm">
        <Spinner className="size-5 mr-2" />
        <span>{t("tasks.loading")}</span>
      </div>
    );
  }

  const hasResponses = (analysis?.totalResponses ?? 0) > 0;
  const overallScore = analysis?.overallSatisfaction ?? 0;

  return (
    <div className="space-y-6">
      {/* Top Bento Metrics Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1: Total Responses */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("tasks.survey.analysis.totalResponses")}
            </span>
            <div className="flex size-10 items-center justify-center rounded-xl bg-brand-orange-soft text-brand-orange">
              <Users className="size-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-extrabold tracking-tight text-foreground">
              {analysis?.totalResponses ?? 0}
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-1.5">
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  hasResponses ? "bg-emerald-500" : "bg-muted-foreground/60",
                )}
              />
              <span>
                {analysis?.totalResponses ?? 0}{" "}
                {t("tasks.survey.analysis.responsesUnit")}
              </span>
            </div>
          </div>
        </div>

        {/* Metric 2: Average Rating / Satisfaction Gauge */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("tasks.survey.analysis.averageRating")}
            </span>
            <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 dark:text-amber-400">
              <Star className="size-5 fill-amber-500" />
            </div>
          </div>
          <div className="space-y-1.5">
            {overallScore > 0 ? (
              <>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold tracking-tight text-foreground">
                    {overallScore.toFixed(1)}
                  </span>
                  <span className="text-sm font-semibold text-muted-foreground">
                    / 5.0
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={cn(
                        "size-3.5",
                        s <= Math.round(overallScore)
                          ? "fill-amber-400 text-amber-400"
                          : "fill-muted text-muted-foreground/30",
                      )}
                    />
                  ))}
                  <span className="ml-1 text-xs text-muted-foreground">
                    {t("tasks.survey.analysis.ratingSubtitle")}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="text-3xl font-extrabold tracking-tight text-foreground">
                  —
                </div>
                <div className="text-xs text-muted-foreground">
                  {t("tasks.survey.analysis.emptyTitle")}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Metric 3: Google Sheets & Live Sync Status */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Google Sheets
              </span>
              {analysis?.spreadsheetUrl && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  Live
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground hover:text-foreground"
              onClick={() => void loadData(true)}
              title={t("tasks.survey.analysis.refresh")}
              disabled={refreshing}
            >
              <RefreshCw
                className={cn(
                  "size-4",
                  refreshing && "animate-spin text-brand-orange",
                )}
              />
            </Button>
          </div>

          <div>
            {analysis?.spreadsheetUrl ? (
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 border-border/80 hover:border-brand-orange/60 hover:text-brand-orange font-medium h-9"
                asChild
              >
                <a
                  href={analysis.spreadsheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FileSpreadsheet className="size-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="truncate">
                    {t("tasks.survey.analysis.openGoogleSheet")}
                  </span>
                  <ExternalLink className="size-3.5 ml-auto text-muted-foreground shrink-0" />
                </a>
              </Button>
            ) : (
              <div className="flex items-center gap-2 text-xs text-muted-foreground italic rounded-lg bg-muted/30 p-2.5 border border-border/60">
                <FileSpreadsheet className="size-4 opacity-50 shrink-0" />
                <span className="truncate">
                  {t("tasks.survey.publishCard.noSheet")}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Analysis Body */}
      {!hasResponses ? (
        <div className="rounded-2xl border border-dashed border-border/80 bg-card/40 p-12 text-center space-y-3">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-brand-orange-soft text-brand-orange">
            <Inbox className="size-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-foreground">
              {t("tasks.survey.analysis.emptyTitle")}
            </h4>
            <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
              {t("tasks.survey.analysis.emptyDesc")}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground tracking-tight">
              {t("tasks.survey.analysis.questionList")}
            </h3>
            <span className="text-xs text-muted-foreground font-medium">
              {analysis?.questionBreakdown?.length ?? 0}{" "}
              {t("tasks.survey.editor.questionsTab")}
            </span>
          </div>

          <div className="space-y-4">
            {analysis?.questionBreakdown?.map((q, index) => (
              <SurveyQuestionBreakdown
                key={q.questionId || index}
                question={q}
                index={index}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
