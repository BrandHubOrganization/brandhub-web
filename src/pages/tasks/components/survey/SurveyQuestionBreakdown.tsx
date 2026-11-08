import { useTranslation } from "react-i18next";
import {
  Star,
  Clock,
  MessageSquare,
  Quote,
  Layers,
  ExternalLink,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  FormattedText,
  stripHtmlTags,
} from "@/pages/tasks/components/survey/SurveyFormatText";
import {
  SurveyPieChart,
  SurveyHorizontalBarChart,
  SurveyVerticalColumnChart,
} from "@/pages/tasks/components/survey/SurveyAnalysisCharts";
import type {
  QuestionAnalysis,
  RatingBreakdown,
} from "@/pages/tasks/types/survey";
import { cn } from "@/lib/utils";

interface SurveyQuestionBreakdownProps {
  question: QuestionAnalysis;
  index: number;
}

function extractFirstUrl(text: string): string | null {
  const match = text.match(/https?:\/\/[^\s)]+/);
  return match ? match[0] : null;
}

function resolveScaleItems(question: QuestionAnalysis): RatingBreakdown[] {
  if (question.ratingBreakdown && question.ratingBreakdown.length > 0) {
    return [...question.ratingBreakdown].sort((a, b) => a.rating - b.rating);
  }
  return [1, 2, 3, 4, 5].map((rating) => ({ rating, count: 0, percentage: 0 }));
}

function formatChartSummary(question: QuestionAnalysis): string {
  const header = `${stripHtmlTags(question.label)} (${question.totalAnswers})`;
  if (question.optionsBreakdown && question.optionsBreakdown.length > 0) {
    const lines = question.optionsBreakdown.map(
      (o) => `- ${o.option}: ${o.count} (${o.percentage}%)`,
    );
    return [header, ...lines].join("\n");
  }
  const lines = resolveScaleItems(question).map(
    (r) => `- ${r.rating}: ${r.count} (${r.percentage}%)`,
  );
  return [header, ...lines].join("\n");
}

function RatingOrScaleSection({ question }: { question: QuestionAnalysis }) {
  const { t } = useTranslation();
  const isRating = question.type === "RATING";
  const items = resolveScaleItems(question);
  const maxScore = Math.max(5, ...items.map((r) => r.rating));

  return (
    <div className="space-y-4 pt-1">
      {question.averageRating !== undefined && (
        <div className="border-border/60 bg-muted/20 flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3.5">
          <div className="flex items-center gap-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-foreground text-2xl font-bold tracking-tight">
                {question.averageRating.toFixed(1)}
              </span>
              <span className="text-muted-foreground text-xs font-medium">
                / {maxScore}.0
              </span>
            </div>
            {isRating && (
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((starVal) => (
                  <Star
                    key={starVal}
                    className={cn(
                      "size-4",
                      starVal <= Math.round(question.averageRating ?? 0)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-muted text-muted-foreground/30",
                    )}
                  />
                ))}
              </div>
            )}
          </div>
          <div className="text-muted-foreground text-xs font-medium">
            {question.totalAnswers} {t("tasks.survey.analysis.responsesUnit")}
          </div>
        </div>
      )}
      <SurveyVerticalColumnChart items={items} />
    </div>
  );
}

function TextOrFileAnswersSection({ question }: { question: QuestionAnalysis }) {
  const { t } = useTranslation();
  const answers = question.textAnswers ?? [];

  return (
    <div className="space-y-3 pt-1">
      <div className="text-muted-foreground flex items-center justify-between text-xs font-medium">
        <div className="flex items-center gap-1.5">
          <MessageSquare className="text-brand-orange size-3.5" />
          <span>{t("tasks.survey.analysis.textAnswersList")}</span>
        </div>
        <span>
          {answers.length} {t("tasks.survey.analysis.responsesUnit")}
        </span>
      </div>
      {answers.length > 0 ? (
        <div className="grid max-h-72 grid-cols-1 gap-2.5 overflow-y-auto pr-1">
          {answers.map((answer, aIdx) => {
            const url = extractFirstUrl(answer);
            return (
              <div
                key={aIdx}
                className="group border-border/70 bg-card/70 text-foreground hover:border-brand-orange/40 hover:bg-card relative flex items-start justify-between gap-3 rounded-xl border p-3.5 text-xs leading-relaxed shadow-2xs transition-all"
              >
                <div className="flex min-w-0 flex-1 gap-3">
                  <Quote className="text-brand-orange/60 mt-0.5 size-3.5 shrink-0" />
                  <span className="flex-1 break-words whitespace-pre-wrap">{answer}</span>
                </div>
                {url && (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border-brand-orange/30 bg-brand-orange/10 text-brand-orange hover:bg-brand-orange/20 inline-flex shrink-0 items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-medium transition-colors"
                  >
                    <ExternalLink className="size-3" />
                    <span>Link</span>
                  </a>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="border-border/80 bg-muted/20 text-muted-foreground rounded-xl border border-dashed p-6 text-center text-xs italic">
          {t("tasks.survey.analysis.noTextAnswers")}
        </div>
      )}
    </div>
  );
}

export function SurveyQuestionBreakdown({
  question,
  index,
}: SurveyQuestionBreakdownProps) {
  const { t } = useTranslation();
  const isPieType =
    question.type === "MULTIPLE_CHOICE" || question.type === "DROPDOWN";
  const isHorizontalBarType = question.type === "CHECKBOX";
  const isScaleType =
    question.type === "RATING" || question.type === "LINEAR_SCALE";
  const isChartQuestion = isPieType || isHorizontalBarType || isScaleType;
  const isTextOrFileType =
    question.type === "SHORT_TEXT" ||
    question.type === "LONG_TEXT" ||
    question.type === "FILE_UPLOAD";

  const handleCopyChart = async () => {
    await navigator.clipboard.writeText(formatChartSummary(question));
    toast.success(t("tasks.survey.analysis.chartCopied"));
  };

  return (
    <div className="border-border/80 bg-card space-y-4 rounded-2xl border p-5 shadow-xs transition-all">
      <div className="border-border/60 flex flex-col justify-between gap-2.5 border-b pb-3.5 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-brand-orange-soft text-brand-orange inline-flex items-center justify-center rounded-lg px-2 py-0.5 text-xs font-bold">
              #{index + 1}
            </span>
            <h4 className="text-foreground text-sm font-semibold tracking-tight">
              <FormattedText text={question.label} />
            </h4>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="border-border/60 bg-muted/40 text-muted-foreground rounded-md border px-2 py-0.5 font-mono text-xs font-medium tracking-wider uppercase">
              {t(`tasks.survey.types.${question.type}` as const)}
            </span>
            {question.sectionTitle && (
              <span className="border-brand-orange/20 bg-brand-orange/10 text-brand-orange inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium">
                <Layers className="size-3 shrink-0" />
                <span className="max-w-48 truncate">
                  <FormattedText text={question.sectionTitle} />
                </span>
              </span>
            )}
            <span className="text-muted-foreground text-xs">
              {question.totalAnswers} {t("tasks.survey.analysis.responsesUnit")}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
          {question.timeSlot && (
            <div className="border-border/70 bg-muted/30 text-muted-foreground flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-mono text-xs">
              <Clock className="text-brand-orange size-3.5" />
              <span>{question.timeSlot}</span>
            </div>
          )}
          {isChartQuestion && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCopyChart}
              className="text-brand-orange hover:bg-brand-orange/10 hover:text-brand-orange h-8 gap-1.5 rounded-lg px-2.5 text-xs font-medium"
            >
              <Copy className="size-3.5" />
              <span>{t("tasks.survey.analysis.copyChart")}</span>
            </Button>
          )}
        </div>
      </div>

      {isPieType && <SurveyPieChart options={question.optionsBreakdown ?? []} />}
      {isHorizontalBarType && (
        <SurveyHorizontalBarChart options={question.optionsBreakdown ?? []} />
      )}
      {isScaleType && <RatingOrScaleSection question={question} />}
      {isTextOrFileType && <TextOrFileAnswersSection question={question} />}
    </div>
  );
}
