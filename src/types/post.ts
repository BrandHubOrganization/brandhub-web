export type PostStatus = "DRAFT" | "PENDING_REVIEW" | "APPROVED" | "SCHEDULED" | "PUBLISHED" | "FAILED" | "REJECTED";
export type MediaType = "IMAGE" | "VIDEO" | "NONE";
export type Platform = "FACEBOOK" | "INSTAGRAM" | "TIKTOK" | "THREADS" | "ZALO_OA";

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
}
