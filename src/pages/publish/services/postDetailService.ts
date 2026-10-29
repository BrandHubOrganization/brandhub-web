import { api } from "@/lib/axios";
import type { Platform } from "@/types/post";
import type {
  PlatformPostDetail,
  PostCommentItem,
  PostedDetailData,
  PostEngagementMetrics,
} from "@/pages/publish/types/postDetail";

interface RawMediaItem {
  s3Key?: string;
  url?: string;
  mediaType?: "IMAGE" | "VIDEO" | "NONE";
}

interface RawPlatformMetricsInput {
  reactionCount?: number;
  commentCount?: number;
  shareCount?: number;
  impressionCount?: number;
  reachCount?: number;
  clickCount?: number;
  savedCount?: number;
  reactionBreakdown?: Partial<
    Record<"LIKE" | "LOVE" | "HAHA" | "WOW" | "SAD" | "ANGRY", number>
  >;
  engagementUpdatedAt?: string;
  updatedAt?: string;
  createdAt?: string;
}

interface RawPlatformEntry extends RawPlatformMetricsInput {
  platform?: Platform;
  platformPostId?: string;
  platformPostUrl?: string;
  platformUrl?: string;
  status?: PostedDetailData["status"];
  errorCode?: string;
  errorMessage?: string;
  publishedAt?: string;
  comments?: PostCommentItem[];
}

interface RawPostDetailDto extends RawPlatformMetricsInput {
  id: string;
  workspaceId: string;
  caption?: string;
  contentText?: string;
  hashtags?: string[];
  media?: RawMediaItem[];
  targetPlatforms?: string[];
  platformPostUrl?: string;
  status: PostedDetailData["status"];
  errorCode?: string;
  errorMessage?: string;
  scheduledAt?: string;
  createdAt: string;
  metrics?: PostedDetailData["metrics"];
  platformData?: Record<string, RawPlatformEntry>;
}

export interface PostStatusData {
  postId: string;
  status: "PENDING" | "IN_PROGRESS" | "DONE" | "FAIL";
  failReason: string | null;
  updatedAt: string;
}

function mapRawMetrics(d: RawPlatformMetricsInput, fallbackDate: string): PostEngagementMetrics {
  const reactions = d.reactionCount ?? 0;
  return {
    reactions,
    likes: reactions,
    comments: d.commentCount ?? 0,
    shares: d.shareCount ?? 0,
    impressions: d.impressionCount ?? 0,
    reach: d.reachCount ?? 0,
    clicks: d.clickCount ?? 0,
    saved: d.savedCount ?? 0,
    reactionBreakdown: {
      LIKE: d.reactionBreakdown?.LIKE ?? reactions,
      LOVE: d.reactionBreakdown?.LOVE ?? 0,
      HAHA: d.reactionBreakdown?.HAHA ?? 0,
      WOW: d.reactionBreakdown?.WOW ?? 0,
      SAD: d.reactionBreakdown?.SAD ?? 0,
      ANGRY: d.reactionBreakdown?.ANGRY ?? 0,
    },
    engagementRate: 0,
    lastSyncedAt: d.engagementUpdatedAt || d.updatedAt || d.createdAt || fallbackDate,
  };
}

function mapPlatformData(
  rawMap: Record<string, RawPlatformEntry> | undefined,
  fallbackStatus: PostedDetailData["status"],
  fallbackDate: string,
): Partial<Record<Platform, PlatformPostDetail>> | undefined {
  if (!rawMap) return undefined;
  const result: Partial<Record<Platform, PlatformPostDetail>> = {};
  for (const [key, entry] of Object.entries(rawMap)) {
    const platform = (entry.platform || key) as Platform;
    result[platform] = {
      platform,
      platformPostId: entry.platformPostId,
      platformUrl: entry.platformPostUrl || entry.platformUrl || "",
      status: entry.status || fallbackStatus,
      errorCode: entry.errorCode,
      errorMessage: entry.errorMessage,
      publishedAt: entry.publishedAt || entry.updatedAt || fallbackDate,
      metrics: mapRawMetrics(entry, fallbackDate),
      comments: entry.comments || [],
    };
  }
  return result;
}

function mapRawPostDetail(d: RawPostDetailDto): PostedDetailData {
  const rawCaption = (d.caption ?? d.contentText ?? "").trim();
  const title = rawCaption
    ? rawCaption.length > 50 ? `${rawCaption.slice(0, 47)}...` : rawCaption
    : "Bài viết";
  const mediaUrls = (d.media || []).map((m) => m.url || m.s3Key || "").filter(Boolean);
  const mediaType = d.media && d.media.length > 0 ? d.media[0].mediaType || "IMAGE" : "NONE";
  const targetPlatforms = ((d.targetPlatforms || []) as Platform[]).length > 0
    ? (d.targetPlatforms as Platform[])
    : (["FACEBOOK"] as Platform[]);
  const fallbackDate = d.updatedAt || d.createdAt;

  return {
    id: d.id,
    postId: d.id,
    workspaceId: d.workspaceId,
    title,
    caption: rawCaption,
    hashtags: d.hashtags || [],
    mediaUrls,
    mediaType,
    platform: targetPlatforms[0],
    targetPlatforms,
    platformUrl: d.platformPostUrl || "",
    status: d.status,
    authorName: "Creator",
    publishedAt: fallbackDate,
    createdAt: d.createdAt,
    updatedAt: fallbackDate,
    metrics: mapRawMetrics(d, fallbackDate),
    platformData: mapPlatformData(d.platformData, d.status, fallbackDate),
    executionLogs: [],
    auditHistory: [],
  };
}

export const postDetailService = {
  async getPostStatus(workspaceId: string, postId: string): Promise<PostStatusData> {
    try {
      const response = await api.get<{ success: boolean; data: PostStatusData }>(
        `/api/v1/workspaces/${workspaceId}/posts/${postId}/status`,
      );
      if (response.data?.data) return response.data.data;
    } catch {
      // Fallback
    }
    return { postId, status: "DONE", failReason: null, updatedAt: new Date().toISOString() };
  },

  async getPostDetail(
    workspaceId: string,
    postId: string,
    refreshMetrics = false,
  ): Promise<PostedDetailData> {
    const response = await api.get<{ success: boolean; data: RawPostDetailDto }>(
      `/api/v1/workspaces/${workspaceId}/posts/${postId}/detail`,
      { params: { refresh: refreshMetrics } },
    );
    const d = response.data?.data;
    if (!d) throw new Error("No data returned from server");
    if (d.metrics) return d as unknown as PostedDetailData;
    return mapRawPostDetail(d);
  },

  async getComments(
    workspaceId: string,
    postId: string,
    platform?: string,
  ): Promise<PostCommentItem[]> {
    try {
      const response = await api.get<{ success: boolean; data: PostCommentItem[] }>(
        `/api/v1/workspaces/${workspaceId}/posts/${postId}/comments`,
        { params: platform ? { platform } : undefined },
      );
      if (response.data?.data) return response.data.data;
    } catch (err) {
      console.warn("Failed to fetch live comments:", err);
    }
    return [];
  },
};
