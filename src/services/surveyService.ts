import { api } from "@/services/api";
import { requireApiData } from "@/lib/apiData";
import type { ApiResponse } from "@/services/authService";
import type {
  SurveyModel,
  SurveySaveRequest,
  SurveyAnalysis,
  SurveySubmissionPayload,
  SurveyQuestionType,
  OptionBreakdown,
  RatingBreakdown,
  QuestionAnalysis,
  SurveyAnalysisBackendResponse,
} from "@/pages/tasks/types/survey";

const VALID_QUESTION_TYPES: ReadonlySet<SurveyQuestionType> = new Set([
  "SHORT_TEXT",
  "LONG_TEXT",
  "MULTIPLE_CHOICE",
  "CHECKBOX",
  "DROPDOWN",
  "FILE_UPLOAD",
  "LINEAR_SCALE",
  "RATING",
  "SECTION_HEADER",
]);

function normalizeQuestionType(rawType?: string): SurveyQuestionType {
  if (rawType && VALID_QUESTION_TYPES.has(rawType as SurveyQuestionType)) {
    return rawType as SurveyQuestionType;
  }
  return "SHORT_TEXT";
}

function buildOptionsBreakdown(
  counts: Record<string, number>,
  percentages: Record<string, number> | undefined,
  total: number,
): OptionBreakdown[] {
  return Object.entries(counts).map(([option, count]) => ({
    option,
    count,
    percentage:
      percentages?.[option] ??
      (total > 0 ? Math.round(((count * 100) / total) * 10) / 10 : 0),
  }));
}

function buildRatingBreakdown(
  type: SurveyQuestionType,
  counts: Record<string, number>,
  total: number,
): RatingBreakdown[] {
  const keys = Object.keys(counts)
    .map(Number)
    .filter((n) => !Number.isNaN(n));
  const scores =
    type === "LINEAR_SCALE" && keys.length > 0
      ? keys.sort((a, b) => a - b)
      : [1, 2, 3, 4, 5];
  return scores.map((score) => {
    const count = counts[String(score)] ?? 0;
    const percentage =
      total > 0 ? Math.round(((count * 100) / total) * 10) / 10 : 0;
    return { rating: score, count, percentage };
  });
}

function mapSurveyAnalysisResponse(
  raw: SurveyAnalysisBackendResponse,
): SurveyAnalysis {
  const questionBreakdown: QuestionAnalysis[] = (raw.questionBreakdown || [])
    .filter((item) => item.type !== "SECTION_HEADER")
    .map((item) => {
      const type = normalizeQuestionType(item.type);
      const total = item.responseCount ?? 0;
      const isOptionType =
        type === "MULTIPLE_CHOICE" ||
        type === "CHECKBOX" ||
        type === "DROPDOWN";
      const isScaleType = type === "RATING" || type === "LINEAR_SCALE";

      return {
        questionId: item.questionId,
        type,
        label: item.label,
        sectionTitle: item.sectionTitle,
        timeSlot: item.timeSlot,
        totalAnswers: total,
        optionsBreakdown:
          isOptionType && item.optionCounts
            ? buildOptionsBreakdown(
                item.optionCounts,
                item.optionPercentages,
                total,
              )
            : undefined,
        ratingBreakdown:
          isScaleType && item.optionCounts
            ? buildRatingBreakdown(type, item.optionCounts, total)
            : undefined,
        averageRating: item.averageRating ?? undefined,
        textAnswers: item.textAnswers || [],
      };
    });

  return {
    taskId: raw.taskId,
    totalResponses: raw.totalResponses,
    overallSatisfaction: raw.averageSatisfaction ?? undefined,
    spreadsheetUrl: raw.spreadsheetUrl ?? undefined,
    questionBreakdown,
  };
}

export const surveyService = {
  getSurvey: async (
    workspaceId: string,
    taskId: string,
  ): Promise<SurveyModel> => {
    const response = await api.get<ApiResponse<SurveyModel>>(
      `/api/v1/workspaces/${workspaceId}/tasks/${taskId}/survey`,
    );
    return requireApiData<SurveyModel>(response.data);
  },

  saveSurvey: async (
    workspaceId: string,
    taskId: string,
    data: SurveySaveRequest,
  ): Promise<SurveyModel> => {
    const response = await api.post<ApiResponse<SurveyModel>>(
      `/api/v1/workspaces/${workspaceId}/tasks/${taskId}/survey`,
      data,
    );
    return requireApiData<SurveyModel>(response.data);
  },

  getSurveyAnalysis: async (
    workspaceId: string,
    taskId: string,
  ): Promise<SurveyAnalysis> => {
    const response = await api.get<ApiResponse<SurveyAnalysisBackendResponse>>(
      `/api/v1/workspaces/${workspaceId}/tasks/${taskId}/survey/analysis`,
    );
    const data = requireApiData<SurveyAnalysisBackendResponse>(response.data);
    return mapSurveyAnalysisResponse(data);
  },

  getPublicSurvey: async (token: string): Promise<SurveyModel> => {
    const response = await api.get<ApiResponse<SurveyModel>>(
      `/api/v1/public/surveys/${token}`,
    );
    return requireApiData<SurveyModel>(response.data);
  },

  submitPublicSurvey: async (
    token: string,
    data: SurveySubmissionPayload,
  ): Promise<void> => {
    const response = await api.post<ApiResponse<void>>(
      `/api/v1/public/surveys/${token}/submit`,
      data,
    );
    requireApiData<void>(response.data);
  },
};
