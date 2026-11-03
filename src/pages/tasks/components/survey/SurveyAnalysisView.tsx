import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  FileSpreadsheet,
  ExternalLink,
  Users,
  Star,
  RefreshCw,
  Clock,
  Inbox,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { surveyService } from "@/services/surveyService";
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

  return (
    <div className="space-y-6">
      {/* Top Overview Bento & Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Responses */}
        <div className="rounded-xl border border-border/80 bg-card p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>{t("tasks.survey.analysis.totalResponses")}</span>
            <Users className="size-4 text-brand-orange" />
          </div>
          <div className="text-2xl font-bold text-foreground">
            {analysis?.totalResponses ?? 0}
          </div>
          <div className="text-2xs text-muted-foreground">
            {analysis?.totalResponses ?? 0} {t("tasks.survey.analysis.responsesUnit")}
          </div>
        </div>

        {/* Average Rating / Satisfaction if present */}
        <div className="rounded-xl border border-border/80 bg-card p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>{t("tasks.survey.analysis.averageRating")}</span>
            <Star className="size-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="text-2xl font-bold text-foreground">
            {analysis?.overallSatisfaction !== undefined &&
            analysis.overallSatisfaction > 0
              ? `${analysis.overallSatisfaction.toFixed(1)} / 5.0`
              : "—"}
          </div>
          <div className="text-2xs text-muted-foreground">
            {hasResponses
              ? t("tasks.survey.analysis.ratingSubtitle")
              : t("tasks.survey.analysis.emptyTitle")}
          </div>
        </div>

        {/* Google Sheet & Refresh Actions */}
        <div className="rounded-xl border border-border/80 bg-card p-4 shadow-2xs flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              {t("tasks.survey.publishCard.openSheet")}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 text-muted-foreground hover:text-foreground"
              onClick={() => void loadData(true)}
              title={t("tasks.survey.analysis.refresh")}
              disabled={refreshing}
            >
              <RefreshCw
                className={cn("size-3.5", refreshing && "animate-spin text-brand-orange")}
              />
            </Button>
          </div>
          {analysis?.spreadsheetUrl ? (
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-border/80 hover:border-brand-orange/60 hover:text-brand-orange w-full"
              asChild
            >
              <a
                href={analysis.spreadsheetUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FileSpreadsheet className="size-4 text-emerald-600 dark:text-emerald-400" />
                <span className="truncate">{t("tasks.survey.analysis.openGoogleSheet")}</span>
                <ExternalLink className="size-3 text-muted-foreground ml-auto shrink-0" />
              </a>
            </Button>
          ) : (
            <div className="text-2xs text-muted-foreground italic flex items-center gap-1.5 py-1">
              <FileSpreadsheet className="size-3.5 opacity-60" />
              <span>{t("tasks.survey.publishCard.noSheet")}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Analysis Body */}
      {!hasResponses ? (
        <div className="rounded-xl border border-dashed border-border/80 bg-card/50 p-10 text-center space-y-3">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Inbox className="size-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-foreground">
              {t("tasks.survey.analysis.emptyTitle")}
            </h4>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              {t("tasks.survey.analysis.emptyDesc")}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground">
            {t("tasks.survey.analysis.questionList")}
          </h3>

          {analysis?.questionBreakdown?.map((q, index) => (
            <div
              key={q.questionId || index}
              className="rounded-xl border border-border bg-card p-5 shadow-2xs space-y-4"
            >
              {/* Question title & timeSlot */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-brand-orange">
                      #{index + 1}
                    </span>
                    <h4 className="text-sm font-medium text-foreground">
                      {q.label}
                    </h4>
                  </div>
                  <span className="text-2xs text-muted-foreground uppercase font-mono">
                    {t(`tasks.survey.types.${q.type}` as const)}
                  </span>
                </div>
                {q.timeSlot && (
                  <div className="flex items-center gap-1 self-start sm:self-center bg-muted/50 border border-border/70 rounded-md px-2 py-0.5 text-2xs text-muted-foreground font-mono">
                    <Clock className="size-3" />
                    <span>{q.timeSlot}</span>
                  </div>
                )}
              </div>

              {/* Multiple Choice & Checkbox Breakdown */}
              {(q.type === "MULTIPLE_CHOICE" || q.type === "CHECKBOX") && (
                <div className="space-y-3 pt-1">
                  {q.optionsBreakdown?.map((opt, optIdx) => (
                    <div key={optIdx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-foreground">
                        <span className="font-medium">{opt.option}</span>
                        <span className="text-muted-foreground font-mono">
                          {opt.count} ({opt.percentage}%)
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-brand-orange rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, opt.percentage)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Rating Breakdown */}
              {q.type === "RATING" && (
                <div className="space-y-3 pt-1">
                  {q.averageRating !== undefined && (
                    <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                      <span>{t("tasks.survey.analysis.averageScore")}</span>
                      <span className="text-brand-orange text-sm font-bold">
                        {q.averageRating.toFixed(1)} / 5.0
                      </span>
                    </div>
                  )}
                  <div className="space-y-2">
                    {q.ratingBreakdown?.map((rate) => (
                      <div key={rate.rating} className="space-y-1">
                        <div className="flex items-center justify-between text-xs text-foreground">
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium">{rate.rating}</span>
                            <Star className="size-3 text-amber-500 fill-amber-500" />
                          </div>
                          <span className="text-muted-foreground font-mono">
                            {rate.count} ({rate.percentage}%)
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-brand-orange rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min(100, rate.percentage)}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Text Answers List */}
              {(q.type === "SHORT_TEXT" || q.type === "LONG_TEXT") && (
                <div className="space-y-2 pt-1">
                  <div className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <MessageSquare className="size-3.5" />
                    <span>{t("tasks.survey.analysis.textAnswersList")}</span>
                  </div>
                  {q.textAnswers && q.textAnswers.length > 0 ? (
                    <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                      {q.textAnswers.map((ans, aIdx) => (
                        <div
                          key={aIdx}
                          className="rounded-lg bg-muted/40 border border-border/60 p-2.5 text-xs text-foreground leading-relaxed"
                        >
                          {ans}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground italic">
                      {t("tasks.survey.analysis.noTextAnswers")}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
