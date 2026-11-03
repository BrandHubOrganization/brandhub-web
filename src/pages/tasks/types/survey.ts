export type SurveyQuestionType =
  | "SHORT_TEXT"
  | "LONG_TEXT"
  | "MULTIPLE_CHOICE"
  | "CHECKBOX"
  | "RATING";

export interface SurveyQuestion {
  id: string;
  type: SurveyQuestionType;
  label: string;
  timeSlot?: string;
  options?: string[];
  required?: boolean;
}

export interface SurveySaveRequest {
  formName?: string;
  title: string;
  description?: string;
  questions: SurveyQuestion[];
}

export interface SurveyModel {
  id?: string;
  surveyId?: string;
  taskId: string;
  formName?: string;
  title: string;
  description?: string;
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
