export type PostStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "APPROVED"
  | "SCHEDULED"
  | "PUBLISHED"
  | "FAILED"
  | "REJECTED";
export type MediaType = "IMAGE" | "VIDEO" | "NONE";
export type Platform =
  "FACEBOOK" | "INSTAGRAM" | "TIKTOK" | "THREADS" | "ZALO_OA" | "YOUTUBE";

export interface PlatformTarget {
  platform: Platform;
  postType: string;
  optimizedCaption: string;
  platformSpecificParams?: Record<string, unknown>;
}

export interface Post {
  id: string;
  workspaceId: string;
  clientId: string;
  contentRequestId?: string;
  campaignId?: string;
  title: string;
  caption: string;
  hashtags: string[];
  mediaUrls: string[];
  mediaType: MediaType;
  platformTargets: PlatformTarget[];
  status: PostStatus;
  scheduledAt?: string;
  publishedAt?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  /** Deliverability metadata — surfaced to make retry/DLQ visible in the UI. */
  delivery?: {
    attempt: number;
    maxAttempts: number;
    lastBackoffSec: number;
    nextAttemptAt?: string;
    inDeadLetterQueue?: boolean;
    lastError?: string;
  };
}
