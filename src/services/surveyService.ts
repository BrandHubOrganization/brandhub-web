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

function mapSurveyAnalysisResponse(
  raw: SurveyAnalysisBackendResponse,
): SurveyAnalysis {
  const questionBreakdown: QuestionAnalysis[] = (raw.questionBreakdown || []).map(
    (item) => {
      const type = item.type as SurveyQuestionType;
      let optionsBreakdown: OptionBreakdown[] | undefined;
      let ratingBreakdown: RatingBreakdown[] | undefined;

      if (type === "MULTIPLE_CHOICE" || type === "CHECKBOX") {
        if (item.optionCounts) {
          optionsBreakdown = Object.entries(item.optionCounts).map(
            ([option, count]) => {
              const percentage =
                item.optionPercentages?.[option] ??
                (item.responseCount > 0
                  ? Math.round(((count * 100) / item.responseCount) * 10) / 10
                  : 0);
              return {
                option,
                count,
                percentage,
              };
            },
          );
        }
      } else if (type === "RATING") {
        if (item.optionCounts) {
          ratingBreakdown = [1, 2, 3, 4, 5].map((star) => {
            const count = item.optionCounts?.[String(star)] ?? 0;
            const percentage =
              item.responseCount > 0
                ? Math.round(((count * 100) / item.responseCount) * 10) / 10
                : 0;
            return {
              rating: star,
              count,
              percentage,
            };
          });
        }
      }

      return {
        questionId: item.questionId,
        type,
        label: item.label,
        timeSlot: item.timeSlot,
        totalAnswers: item.responseCount ?? 0,
        optionsBreakdown,
        ratingBreakdown,
        averageRating: item.averageRating ?? undefined,
        textAnswers: item.textAnswers || [],
      };
    },
  );

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
