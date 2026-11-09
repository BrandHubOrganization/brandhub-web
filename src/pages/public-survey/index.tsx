import { useState, useEffect, type FormEvent } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AlertCircle, ArrowLeft, ArrowRight, Eye, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { surveyService } from "@/services/surveyService";
import { groupSurveySections, resolveNextSectionTarget, type SurveyModel, type SurveyQuestion, type SurveyAnswerSubmission } from "@/pages/tasks/types/survey";
import { PublicSurveyHeader } from "@/pages/public-survey/components/PublicSurveyHeader";
import { PublicQuestionCard } from "@/pages/public-survey/components/PublicQuestionCard";
import { PublicSurveySuccess } from "@/pages/public-survey/components/PublicSurveySuccess";
import { stripHtmlTags } from "@/pages/tasks/components/survey/SurveyFormatText";
import { SeoHead } from "@/components/seo/SeoHead";

function isAnswerEmpty(val: string | string[] | undefined): boolean {
  if (!val) return true;
  return Array.isArray(val) ? val.length === 0 : !val.trim();
}

function buildSubmissionAnswers(answers: Record<string, string | string[]>, allowedIds: Set<string>): SurveyAnswerSubmission[] {
  return Object.entries(answers)
    .filter(([questionId]) => allowedIds.has(questionId))
    .map(([questionId, val]) => {
      if (Array.isArray(val)) return { questionId, value: val.join(", "), selectedOptions: val };
      const strVal = val != null ? String(val) : "";
      return { questionId, value: strVal, selectedOptions: strVal ? [strVal] : [] };
    });
}

export default function PublicSurveyPage() {
  const { token } = useParams<{ token: string }>();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();

  const isPreview = searchParams.get("preview") === "true" || searchParams.get("preview") === "1";

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [survey, setSurvey] = useState<SurveyModel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [sectionHistory, setSectionHistory] = useState<number[]>([]);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const isPublished = survey?.status ? survey.status === "PUBLISHED" : true;
  const canSubmit = !isPreview && isPublished;

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
        setCurrentSectionIdx(0);
        setSectionHistory([]);
      } catch {
        if (isMounted) setError(t("tasks.survey.public.notFound"));
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    void fetchSurvey();
    return () => { isMounted = false; };
  }, [token, t]);

  const clearFieldError = (questionId: string) => {
    if (!validationErrors[questionId]) return;
    setValidationErrors((prev) => {
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
  };

  const handleSingleOrText = (questionId: string, val: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: val }));
    clearFieldError(questionId);
  };

  const handleMultipleChoiceToggle = (questionId: string, val: string) => {
    const current = (answers[questionId] as string[]) || [];
    const updated = current.includes(val) ? current.filter((item) => item !== val) : [...current, val];
    setAnswers((prev) => ({ ...prev, [questionId]: updated }));
    if (updated.length > 0) clearFieldError(questionId);
  };

  const validateQuestionList = (questions: SurveyQuestion[]): boolean => {
    const errors: Record<string, string> = {};
    for (const q of questions) {
      if (q.type !== "SECTION_HEADER" && q.required && isAnswerEmpty(answers[q.id])) {
        errors[q.id] = t("tasks.survey.public.requiredError");
      }
    }
    if (Object.keys(errors).length > 0) {
      setValidationErrors((prev) => ({ ...prev, ...errors }));
      toast.error(t("tasks.survey.public.requiredError"));
      return false;
    }
    return true;
  };

  const sections = survey ? groupSurveySections(survey.title, survey.description, survey.questions) : [];
  const totalSections = Math.max(1, sections.length);
  const safeSectionIdx = Math.min(currentSectionIdx, totalSections - 1);
  const currentSection = sections[safeSectionIdx] || sections[0];
  const nextResolution = currentSection
    ? resolveNextSectionTarget(currentSection, safeSectionIdx, sections, answers)
    : ({ action: "SUBMIT" } as const);
  const isSubmitStep = nextResolution.action === "SUBMIT";
  const canGoBack = sectionHistory.length > 0 || currentSectionIdx > 0;

  const handleNextSection = () => {
    const currentQuestions = (currentSection?.items ?? []).map((i) => i.question);
    if (!validateQuestionList(currentQuestions) || nextResolution.action !== "GOTO") return;
    setSectionHistory((prev) => [...prev, currentSectionIdx]);
    setCurrentSectionIdx(nextResolution.targetIndex);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrevSection = () => {
    if (sectionHistory.length > 0) {
      const prevIdx = sectionHistory[sectionHistory.length - 1];
      setSectionHistory((prev) => prev.slice(0, -1));
      setCurrentSectionIdx(prevIdx);
    } else if (currentSectionIdx > 0) {
      setCurrentSectionIdx(currentSectionIdx - 1);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isSubmitStep) {
      handleNextSection();
      return;
    }
    const visitedIndices = Array.from(new Set([...sectionHistory, currentSectionIdx]));
    const visitedQuestions = visitedIndices.flatMap((idx) =>
      (sections[idx]?.items ?? []).map((item) => item.question),
    );
    if (!survey || !token || !canSubmit || !validateQuestionList(visitedQuestions)) return;
    const allowedIds = new Set(visitedQuestions.map((q) => q.id));
    try {
      setSubmitting(true);
      await surveyService.submitPublicSurvey(token, { answers: buildSubmissionAnswers(answers, allowedIds) });
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
    setSectionHistory([]);
    setCurrentSectionIdx(0);
    setSubmitted(false);
  };

  if (loading) {
    return (
      <div className="bg-background flex min-h-screen flex-col items-center justify-center p-4">
        <Spinner className="text-brand-orange mb-3 size-8" />
        <p className="text-muted-foreground text-sm">{t("tasks.loading")}</p>
      </div>
    );
  }

  if (error || !survey) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center p-4">
        <div className="border-border bg-card w-full max-w-md space-y-4 rounded-2xl border p-6 text-center shadow-xs sm:p-8">
          <div className="bg-destructive/10 text-destructive mx-auto flex size-12 items-center justify-center rounded-2xl">
            <AlertCircle className="size-6" />
          </div>
          <h2 className="text-foreground text-lg font-bold">{t("tasks.survey.public.notFound")}</h2>
          <p className="text-muted-foreground text-xs">{error || t("tasks.survey.public.notFound")}</p>
        </div>
      </div>
    );
  }

  if (submitted) return <PublicSurveySuccess title={survey.title} bannerUrl={survey.bannerUrl} onReset={handleReset} />;

  const hasRequired = survey.questions.some((q) => q.type !== "SECTION_HEADER" && q.required);
  const submitLabel = submitting
    ? t("tasks.survey.public.submitting")
    : isPreview
      ? t("tasks.survey.public.previewDisabled", "Không thể gửi trong chế độ xem trước")
      : !isPublished
        ? t("tasks.survey.public.notPublishedDisabled", "Chưa xuất bản (Chỉ xem)")
        : t("tasks.survey.public.submitButton");

  return (
    <div className="bg-background min-h-screen px-4 py-8 sm:px-6">
      <SeoHead
        title={survey.title ? `${survey.title} — Khảo sát | BrandHub` : "Biểu mẫu Khảo sát | BrandHub"}
        canonicalPath="/public/surveys"
        noindex
      />
      <div className="mx-auto max-w-xl space-y-5">
        {isPreview && (
          <div className="flex items-center gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-700 dark:text-amber-300">
            <Eye className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>
              <strong className="font-semibold">{t("tasks.survey.public.previewTitle", "Chế độ xem trước")}:</strong>{" "}
              {t("tasks.survey.public.previewBanner", "Đây là bản xem trước của biểu mẫu. Bạn không thể gửi câu trả lời.")}
            </span>
          </div>
        )}
        {!isPublished && (
          <div className="flex items-center gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-700 dark:text-amber-300">
            <AlertCircle className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>
              <strong className="font-semibold">{t("tasks.survey.public.notPublishedTitle", "Chưa xuất bản")}:</strong>{" "}
              {t("tasks.survey.public.notPublishedBanner", "Biểu mẫu này chưa được công bố. Bạn không thể gửi phản hồi.")}
            </span>
          </div>
        )}

        {survey.bannerUrl && (
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
            <img
              src={survey.bannerUrl}
              alt={stripHtmlTags(survey.title)}
              className="h-36 sm:h-48 w-full object-cover"
            />
          </div>
        )}

        <PublicSurveyHeader
          title={survey.title}
          description={survey.description}
          hasRequiredQuestions={hasRequired}
          currentSectionIndex={safeSectionIdx + 1}
          totalSections={totalSections}
          sectionTitle={currentSection?.title}
          sectionDescription={currentSection?.description}
          isRootSection={currentSection?.isRoot ?? true}
        />

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          {currentSection?.items.map((item) => (
            <PublicQuestionCard
              key={item.question.id || item.flatIndex}
              question={item.question}
              index={item.questionNumber - 1}
              value={answers[item.question.id]}
              error={validationErrors[item.question.id]}
              onTextChange={handleSingleOrText}
              onSingleChoice={handleSingleOrText}
              onMultipleChoiceToggle={handleMultipleChoiceToggle}
            />
          ))}

          <div className="flex items-center justify-between gap-3 pt-2">
            {canGoBack ? (
              <Button type="button" variant="outline" onClick={handlePrevSection} className="cursor-pointer gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold shadow-2xs">
                <ArrowLeft className="size-4" />
                <span>{t("tasks.survey.public.prevSection", "Quay lại")}</span>
              </Button>
            ) : (
              totalSections > 1 && <div />
            )}

            {!isSubmitStep ? (
              <Button type="button" variant="orange" onClick={handleNextSection} className="cursor-pointer gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold shadow-xs">
                <span>{t("tasks.survey.public.nextSection", "Tiếp")}</span>
                <ArrowRight className="size-4" />
              </Button>
            ) : (
              <Button type="submit" variant="orange" disabled={submitting || !canSubmit} className={`cursor-pointer gap-2 rounded-xl text-sm font-semibold shadow-xs ${totalSections === 1 && !canGoBack ? "w-full py-3" : "px-6 py-2.5"}`}>
                {submitting ? <Spinner className="size-4" /> : <Send className="size-4" />}
                <span>{submitLabel}</span>
              </Button>
            )}
          </div>
        </form>

        <footer className="pt-4 pb-8 text-center">
          <p className="text-2xs text-muted-foreground">{t("tasks.survey.public.poweredBy")}</p>
        </footer>
      </div>
    </div>
  );
}
