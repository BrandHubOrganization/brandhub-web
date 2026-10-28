import type { Platform, PostStatus } from "@/types/post";

export interface ReactionBreakdown {
  LIKE: number;
  LOVE: number;
  HAHA: number;
  WOW: number;
  SAD: number;
  ANGRY: number;
}

export interface PostEngagementMetrics {
  reactions: number;
  likes: number;
  comments: number;
  shares: number;
  impressions: number;
  reach: number;
  clicks: number;
  saved: number;
  reactionBreakdown: ReactionBreakdown;
  engagementRate: number; // e.g. 5.4 (%)
  lastSyncedAt: string;
}

export interface PostExecutionLog {
  id: string;
  timestamp: string;
  action: string;
  status: "SUCCESS" | "FAILED" | "INFO";
  platform: Platform;
  message: string;
  details?: Record<string, unknown>;
}

export interface PostAuditItem {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  timestamp: string;
}

export interface PostCommentItem {
  id: string;
  authorName: string;
  authorAvatar?: string | null;
  content: string;
  commentedAt: string;
}

export interface PlatformPostDetail {
  platform: Platform;
  platformPostId?: string;
  platformUrl?: string;
  status: PostStatus | "IN_PROGRESS";
  errorCode?: string;
  errorMessage?: string;
  publishedAt?: string;
  metrics: PostEngagementMetrics;
  comments: PostCommentItem[];
}

export interface PostedDetailData {
  id: string;
  postId: string;
  workspaceId: string;
  title: string;
  caption: string;
  hashtags: string[];
  mediaUrls: string[];
  mediaType: "IMAGE" | "VIDEO" | "NONE";
  platform: Platform;
  targetPlatforms: Platform[];
  platformPostId?: string;
  platformUrl?: string;
  status: PostStatus | "IN_PROGRESS";
  authorName: string;
  authorEmail?: string;
  publishedAt?: string;
  scheduledAt?: string;
  createdAt: string;
  updatedAt: string;
  metrics: PostEngagementMetrics;
  platformData?: Partial<Record<Platform, PlatformPostDetail>>;
  executionLogs: PostExecutionLog[];
  auditHistory: PostAuditItem[];
}
