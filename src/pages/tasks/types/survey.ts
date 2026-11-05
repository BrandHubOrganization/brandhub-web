export type SurveyQuestionType =
  | "SHORT_TEXT"
  | "LONG_TEXT"
  | "MULTIPLE_CHOICE"
  | "CHECKBOX"
  | "DROPDOWN"
  | "FILE_UPLOAD"
  | "LINEAR_SCALE"
  | "RATING"
  | "SECTION_HEADER";

export interface SurveyQuestion {
  id: string;
  type: SurveyQuestionType;
  label: string;
  description?: string;
  timeSlot?: string;
  options?: string[];
  required?: boolean;
  nextSectionId?: string;
  optionTargets?: Record<string, string>;
}

export interface SurveySectionItem {
  question: SurveyQuestion;
  flatIndex: number;
  questionNumber: number;
}

export interface SurveySectionGroup {
  id: string;
  sectionIndex: number;
  title: string;
  description?: string;
  isRoot: boolean;
  headerFlatIndex?: number;
  nextSectionId?: string;
  items: SurveySectionItem[];
}

export function groupSurveySections(
  formTitle: string,
  formDescription: string | undefined,
  questions: SurveyQuestion[],
): SurveySectionGroup[] {
  const sections: SurveySectionGroup[] = [
    { id: "section_root", sectionIndex: 1, title: formTitle, description: formDescription, isRoot: true, items: [] },
  ];
  let qNum = 0;
  questions.forEach((q, flatIndex) => {
    if (q.type === "SECTION_HEADER") {
      sections.push({
        id: q.id,
        sectionIndex: sections.length + 1,
        title: q.label,
        description: q.description,
        isRoot: false,
        headerFlatIndex: flatIndex,
        nextSectionId: q.nextSectionId || "NEXT",
        items: [],
      });
    } else {
      qNum += 1;
      sections[sections.length - 1].items.push({ question: q, flatIndex, questionNumber: qNum });
    }
  });
  const rootNext = sections[0].items.find((it) => it.question.nextSectionId)?.question.nextSectionId;
  sections[0].nextSectionId = rootNext || "NEXT";
  return sections;
}

export function resolveNextSectionTarget(
  currentSection: SurveySectionGroup,
  currentSectionIdx: number,
  allSections: SurveySectionGroup[],
  answers: Record<string, string | string[]>,
): { action: "GOTO"; targetIndex: number } | { action: "SUBMIT" } {
  let branchTarget: string | undefined;
  for (const { question: q } of currentSection.items) {
    const selectedVal = answers[q.id];
    if (
      (q.type === "MULTIPLE_CHOICE" || q.type === "DROPDOWN") &&
      q.optionTargets &&
      q.options &&
      typeof selectedVal === "string" &&
      selectedVal
    ) {
      const optIdx = q.options.indexOf(selectedVal);
      const target = optIdx !== -1 ? q.optionTargets[String(optIdx)] : undefined;
      if (target) branchTarget = target;
    }
  }
  const effectiveTarget = branchTarget || currentSection.nextSectionId || "NEXT";
  if (effectiveTarget === "SUBMIT") return { action: "SUBMIT" };
  if (effectiveTarget !== "NEXT") {
    const foundIdx = allSections.findIndex((s) => s.id === effectiveTarget);
    if (foundIdx !== -1 && foundIdx !== currentSectionIdx) return { action: "GOTO", targetIndex: foundIdx };
  }
  if (currentSectionIdx + 1 < allSections.length) return { action: "GOTO", targetIndex: currentSectionIdx + 1 };
  return { action: "SUBMIT" };
}

export function moveSurveyOption(
  question: SurveyQuestion,
  from: number,
  to: number,
): Partial<SurveyQuestion> | null {
  const cur = question.options ?? [];
  if (from === to || Math.min(from, to) < 0 || Math.max(from, to) >= cur.length)
    return null;
  const pairs = cur.map((opt, idx) => ({
    opt,
    target: question.optionTargets?.[String(idx)],
  }));
  const [moved] = pairs.splice(from, 1);
  pairs.splice(to, 0, moved);
  const optionTargets = question.optionTargets
    ? Object.fromEntries(
        pairs.flatMap((it, i) =>
          it.target !== undefined ? [[String(i), it.target]] : [],
        ),
      )
    : undefined;
  return { options: pairs.map((it) => it.opt), optionTargets };
}

export function deleteSurveyOption(
  question: SurveyQuestion,
  idxToRemove: number,
): Partial<SurveyQuestion> | null {
  if ((question.options?.length ?? 0) <= 1) return null;
  let optionTargets: Record<string, string> | undefined;
  if (question.optionTargets) {
    optionTargets = Object.fromEntries(
      Object.entries(question.optionTargets).flatMap(([k, v]) => {
        const n = Number(k);
        return n === idxToRemove
          ? []
          : [[String(n < idxToRemove ? n : n - 1), v]];
      }),
    );
    if (Object.keys(optionTargets).length === 0) optionTargets["0"] = "NEXT";
  }
  return {
    options: question.options!.filter((_, idx) => idx !== idxToRemove),
    optionTargets,
  };
}

export interface SurveySaveRequest {
  formName?: string;
  title: string;
  description?: string;
  bannerUrl?: string;
  questions: SurveyQuestion[];
}

export interface SurveyModel {
  id?: string;
  surveyId?: string;
  taskId: string;
  formName?: string;
  title: string;
  description?: string;
  bannerUrl?: string;
  questions: SurveyQuestion[];
  status?: "DRAFT" | "PUBLISHED";
  publicToken?: string;
  publicLink?: string;
  spreadsheetId?: string;
  spreadsheetUrl?: string;
  questionCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface OptionBreakdown {
  option: string;
  count: number;
  percentage: number;
}

export interface RatingBreakdown {
  rating: number;
  count: number;
  percentage: number;
}

export interface QuestionAnalysis {
  questionId: string;
  type: SurveyQuestionType;
  label: string;
  sectionTitle?: string;
  timeSlot?: string;
  totalAnswers: number;
  optionsBreakdown?: OptionBreakdown[];
  ratingBreakdown?: RatingBreakdown[];
  averageRating?: number;
  textAnswers?: string[];
}

export interface SurveyAnalysis {
  taskId: string;
  surveyTitle?: string;
  totalResponses: number;
  overallSatisfaction?: number;
  spreadsheetUrl?: string;
  questionBreakdown: QuestionAnalysis[];
}

export interface QuestionAnalysisBackendItem {
  questionId: string;
  type: string;
  label: string;
  sectionTitle?: string;
  timeSlot?: string;
  responseCount: number;
  averageRating?: number;
  optionCounts?: Record<string, number>;
  optionPercentages?: Record<string, number>;
  textAnswers?: string[];
}

export interface SurveyAnalysisBackendResponse {
  surveyId?: string;
  taskId: string;
  totalResponses: number;
  averageSatisfaction?: number;
  spreadsheetUrl?: string;
  questionBreakdown: QuestionAnalysisBackendItem[];
}

export interface SurveyAnswerSubmission {
  questionId: string;
  value: string;
  selectedOptions?: string[];
}

export interface SurveySubmissionPayload {
  answers: SurveyAnswerSubmission[];
}

export interface SurveyResponse {
  id?: string;
  surveyId?: string;
  submittedAt?: string;
  answers: SurveyAnswerSubmission[];
}
