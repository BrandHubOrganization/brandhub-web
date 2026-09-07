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

export type AIContentType = "CAPTION" | "BLOG" | "AD_COPY";

export type BlogLength = "SHORT" | "MEDIUM" | "LONG";
export type AdObjective = "AWARENESS" | "TRAFFIC" | "CONVERSION";

export interface AIGenerateRequest {
  prompt: string;
  contentType: AIContentType;
  topic?: string;
  platforms: SocialPlatform[];
  tone?: string;
  userFeedback?: string;
  hashtagCount?: number;
  blogLength?: BlogLength;
  blogKeyword?: string;
  adObjective?: AdObjective;
  adCallToAction?: string;
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
  blogTitle?: string;
  adHeadline?: string;
  adDescription?: string;
}

export type AIErrorType =
  "SERVICE_UNAVAILABLE" | "RATE_LIMITED" | "GENERATION_FAILED" | null;
