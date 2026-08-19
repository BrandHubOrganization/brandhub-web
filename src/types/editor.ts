export type SocialPlatform =
  "FACEBOOK" | "INSTAGRAM" | "TIKTOK" | "THREADS" | "YOUTUBE";

export interface PostDraft {
  id: string;
  requestId?: string;
  title: string;
  caption: string;
  hashtags: string[];
  mediaUrls: string[];
  targetPlatforms: SocialPlatform[];
  status: "DRAFT" | "PENDING_REVIEW" | "APPROVED" | "REJECTED";
  updatedAt: string;
}

export interface AIGenerateRequest {
  prompt: string;
  topic?: string;
  platforms: SocialPlatform[];
  tone?: string;
  userFeedback?: string;
  previousOutput?: {
    caption: string;
    hashtags: string[];
    imageUrl?: string;
  };
}

export interface AIGenerateResponse {
  caption: string;
  hashtags: string[];
  imageUrl?: string;
  reasoning?: string;
}

export type AIErrorType =
  "SERVICE_UNAVAILABLE" | "RATE_LIMITED" | "GENERATION_FAILED" | null;
