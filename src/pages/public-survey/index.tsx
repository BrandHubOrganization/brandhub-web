import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  CheckCircle2,
  AlertCircle,
  Star,
  Circle,
  Square,
  Send,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { surveyService } from "@/services/surveyService";
import type {
  SurveyModel,
  SurveyAnswerSubmission,
} from "@/pages/tasks/types/survey";
import { cn } from "@/lib/utils";

export default function PublicSurveyPage() {
  const { token } = useParams<{ token: string }>();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [survey, setSurvey] = useState<SurveyModel | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form answer state: questionId -> value (string or string[])
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let isMounted = true;
    async function fetchSurvey() {
      if (!token) {
        setError(t("tasks.survey.public.notFound"));
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await surveyService.getPublicSurvey(token);
        if (!isMounted) return;
        setSurvey(data);
      } catch {
        if (!isMounted) return;
        setError(t("tasks.survey.public.notFound"));
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    void fetchSurvey();
    return () => {
      isMounted = false;
    };
  }, [token, t]);

  const handleTextAnswer = (questionId: string, val: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: val }));
    if (validationErrors[questionId]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[questionId];
        return next;
      });
    }
  };

  const handleSingleChoice = (questionId: string, val: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: val }));
    if (validationErrors[questionId]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[questionId];
        return next;
      });
    }
  };

  const handleMultipleChoiceToggle = (questionId: string, val: string) => {
    const current = (answers[questionId] as string[]) || [];
    const exists = current.includes(val);
    const updated = exists
      ? current.filter((item) => item !== val)
      : [...current, val];
    setAnswers((prev) => ({ ...prev, [questionId]: updated }));
    if (validationErrors[questionId] && updated.length > 0) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[questionId];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!survey || !token) return;

    // Validate required questions
    const errors: Record<string, string> = {};
    for (const q of survey.questions) {
      if (q.required) {
        const val = answers[q.id];
        if (!val || (Array.isArray(val) && val.length === 0) || (typeof val === "string" && !val.trim())) {
          errors[q.id] = t("tasks.survey.public.requiredError");
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast.error(t("tasks.survey.public.requiredError"));
      return;
    }

    try {
      setSubmitting(true);
      const submissionAnswers: SurveyAnswerSubmission[] = Object.entries(answers).map(
        ([questionId, val]) => {
          if (Array.isArray(val)) {
            return {
              questionId,
              value: val.join(", "),
              selectedOptions: val,
            };
          }
          const strVal = val !== undefined && val !== null ? String(val) : "";
          return {
            questionId,
            value: strVal,
            selectedOptions: strVal ? [strVal] : [],
          };
        },
      );

      await surveyService.submitPublicSurvey(token, {
        answers: submissionAnswers,
      });

      setSubmitted(true);
      toast.success(t("tasks.survey.public.submitSuccess"));
    } catch {
      toast.error(t("tasks.survey.public.submitError"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setAnswers({});
    setValidationErrors({});
    setSubmitted(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Spinner className="size-8 text-brand-orange mb-3" />
        <p className="text-sm text-muted-foreground">{t("tasks.loading")}</p>
      </div>
    );
  }

  if (error || !survey) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl border border-border bg-card p-8 text-center space-y-4 shadow-sm">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="size-6" />
          </div>
          <h2 className="text-lg font-bold text-foreground">
            {t("tasks.survey.public.notFound")}
          </h2>
          <p className="text-xs text-muted-foreground">
            {error || t("tasks.survey.public.notFound")}
          </p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl border border-border border-t-8 border-t-emerald-500 bg-card p-8 text-center space-y-4 shadow-sm">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-8" />
          </div>
          <h2 className="text-xl font-bold text-foreground">
            {t("tasks.survey.public.thankYouTitle")}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t("tasks.survey.public.thankYouDesc")}
          </p>
          <div className="pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="gap-2"
            >
              <span>{t("tasks.survey.public.submitAnother")}</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 sm:py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Form Header Card */}
        <div className="rounded-2xl border border-border border-t-8 border-t-brand-orange bg-card p-6 sm:p-8 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-brand-orange text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="size-4" />
            <span>BrandHub Workshop Survey</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {survey.title}
          </h1>
          {survey.description && (
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {survey.description}
            </p>
          )}
          <div className="pt-2 text-2xs text-muted-foreground border-t border-border/60">
            <span className="text-destructive font-bold">* </span>
            <span>Các câu hỏi có dấu hoa thị là bắt buộc</span>
          </div>
        </div>

        {/* Questions Form */}
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          {survey.questions.map((question, qIdx) => {
            const hasError = Boolean(validationErrors[question.id]);
            const selectedVal = answers[question.id];

            return (
              <div
                key={question.id || qIdx}
                className={cn(
                  "rounded-2xl border bg-card p-5 sm:p-6 shadow-2xs space-y-4 transition-colors",
                  hasError
                    ? "border-destructive/80 ring-1 ring-destructive/30"
                    : "border-border",
                )}
              >
                {/* Question Label */}
                <div className="space-y-1">
                  <h3 className="text-sm sm:text-base font-semibold text-foreground leading-snug">
                    {question.label}
                    {question.required && (
                      <span className="text-destructive ml-1">*</span>
                    )}
                  </h3>
                </div>

                {/* Question Input by Type */}
                <div className="pt-1">
                  {question.type === "SHORT_TEXT" && (
                    <Input
                      value={(selectedVal as string) || ""}
                      onChange={(e) =>
                        handleTextAnswer(question.id, e.target.value)
                      }
                      placeholder={t("tasks.survey.public.shortTextPlaceholder")}
                      className="border-border/80 focus-visible:ring-brand-orange"
                    />
                  )}

                  {question.type === "LONG_TEXT" && (
                    <Textarea
                      value={(selectedVal as string) || ""}
                      onChange={(e) =>
                        handleTextAnswer(question.id, e.target.value)
                      }
                      placeholder={t("tasks.survey.public.longTextPlaceholder")}
                      rows={3}
                      className="border-border/80 focus-visible:ring-brand-orange"
                    />
                  )}

                  {question.type === "MULTIPLE_CHOICE" && (
                    <div className="space-y-2">
                      {question.options?.map((option, optIdx) => {
                        const isSelected = selectedVal === option;
                        return (
                          <label
                            key={optIdx}
                            onClick={() =>
                              handleSingleChoice(question.id, option)
                            }
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                              isSelected
                                ? "border-brand-orange bg-brand-orange/5 text-foreground font-medium"
                                : "border-border/80 hover:bg-muted/40 text-foreground/90",
                            )}
                          >
                            <div
                              className={cn(
                                "flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors",
                                isSelected
                                  ? "border-brand-orange bg-brand-orange text-white"
                                  : "border-muted-foreground/60",
                              )}
                            >
                              {isSelected ? (
                                <div className="size-1.5 rounded-full bg-white" />
                              ) : (
                                <Circle className="size-3.5 opacity-0" />
                              )}
                            </div>
                            <span className="text-xs sm:text-sm">{option}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {question.type === "CHECKBOX" && (
                    <div className="space-y-2">
                      {question.options?.map((option, optIdx) => {
                        const checkedList = (selectedVal as string[]) || [];
                        const isChecked = checkedList.includes(option);
                        return (
                          <label
                            key={optIdx}
                            onClick={() =>
                              handleMultipleChoiceToggle(question.id, option)
                            }
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                              isChecked
                                ? "border-brand-orange bg-brand-orange/5 text-foreground font-medium"
                                : "border-border/80 hover:bg-muted/40 text-foreground/90",
                            )}
                          >
                            <div
                              className={cn(
                                "flex size-4 shrink-0 items-center justify-center rounded-sm border transition-colors",
                                isChecked
                                  ? "border-brand-orange bg-brand-orange text-white"
                                  : "border-muted-foreground/60",
                              )}
                            >
                              {isChecked ? (
                                <Square className="size-3 fill-white" />
                              ) : (
                                <Square className="size-3 opacity-0" />
                              )}
                            </div>
                            <span className="text-xs sm:text-sm">{option}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {question.type === "RATING" && (
                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const isSelected = selectedVal === String(star);
                        return (
                          <button
                            key={star}
                            type="button"
                            onClick={() =>
                              handleSingleChoice(question.id, String(star))
                            }
                            className={cn(
                              "flex flex-col items-center gap-1.5 p-3 rounded-xl border cursor-pointer transition-all min-w-[56px]",
                              isSelected
                                ? "border-brand-orange bg-brand-orange/10 font-bold text-brand-orange shadow-2xs"
                                : "border-border/80 hover:bg-muted/40 text-muted-foreground",
                            )}
                          >
                            <span className="text-sm font-semibold">{star}</span>
                            <Star
                              className={cn(
                                "size-4 transition-colors",
                                isSelected
                                  ? "text-brand-orange fill-brand-orange"
                                  : "text-muted-foreground/50",
                              )}
                            />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Error message */}
                {hasError && (
                  <p className="text-xs text-destructive flex items-center gap-1 pt-1">
                    <AlertCircle className="size-3.5" />
                    <span>{validationErrors[question.id]}</span>
                  </p>
                )}
              </div>
            );
          })}

          {/* Submit Action */}
          <div className="flex items-center justify-between pt-2">
            <Button
              type="submit"
              variant="orange"
              disabled={submitting}
              className="gap-2 px-8 py-2.5 text-sm shadow-sm cursor-pointer"
            >
              {submitting ? (
                <Spinner className="size-4" />
              ) : (
                <Send className="size-4" />
              )}
              <span>
                {submitting
                  ? t("tasks.survey.public.submitting")
                  : t("tasks.survey.public.submitButton")}
              </span>
            </Button>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center pt-6 pb-12">
          <p className="text-2xs text-muted-foreground">
            {t("tasks.survey.public.poweredBy")}
          </p>
        </div>
      </div>
    </div>
  );
}
