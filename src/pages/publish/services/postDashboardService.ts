import { api } from "@/lib/axios";
import type { PostDashboardData, PostDashboardFilters, PublishingTrendPoint } from "../types/dashboard";

interface RawPlatformMetric {
  platform: PostDashboardData["platformBreakdown"][number]["platform"];
  count?: number;
  percentage?: number;
  reach?: number;
  engagements?: number;
  successCount?: number;
  failedCount?: number;
}

interface RawRecentPostItem {
  id: string;
  postId?: string;
  title?: string;
  caption?: string;
  platforms?: PostDashboardData["recentPosts"][number]["platforms"];
  status?: PostDashboardData["recentPosts"][number]["status"];
  authorName?: string;
  publishedAt?: string;
  scheduledAt?: string;
  createdAt?: string;
  platformPostUrl?: string;
  errorMessage?: string;
}

interface RawDashboardResponse {
  kpis?: Partial<PostDashboardData["kpis"]>;
  platformBreakdown?: RawPlatformMetric[];
  publishingTrends?: Partial<PublishingTrendPoint>[];
  recentPosts?: RawRecentPostItem[];
}

export const postDashboardService = {
  async getDashboard(
    workspaceId: string,
    filters: Partial<PostDashboardFilters>,
  ): Promise<PostDashboardData> {
    const response = await api.get<{ success: boolean; data: RawDashboardResponse }>(
      `/api/v1/workspaces/${workspaceId}/posts/dashboard`,
      {
        params: {
          dateRange: filters.dateRange,
          platform: filters.platform !== "ALL" ? filters.platform : undefined,
          status: filters.status !== "ALL" ? filters.status : undefined,
          search: filters.search || undefined,
          page: filters.page,
          limit: filters.limit,
        },
      },
    );

    const raw = response.data?.data ?? {};
    return {
      kpis: {
        totalReach: raw.kpis?.totalReach ?? 0,
        reachGrowth: raw.kpis?.reachGrowth ?? 0,
        totalEngagements: raw.kpis?.totalEngagements ?? 0,
        engagementsGrowth: raw.kpis?.engagementsGrowth ?? 0,
        totalPosts: raw.kpis?.totalPosts ?? 0,
        totalPostsGrowth: raw.kpis?.totalPostsGrowth ?? 0,
        successRate: raw.kpis?.successRate ?? 0,
        successRateGrowth: raw.kpis?.successRateGrowth ?? 0,
        scheduledCount: raw.kpis?.scheduledCount ?? 0,
        failedCount: raw.kpis?.failedCount ?? 0,
        inProgressCount: raw.kpis?.inProgressCount ?? 0,
      },
      platformBreakdown: (raw.platformBreakdown || []).map((p: RawPlatformMetric) => ({
        platform: p.platform,
        count: p.count ?? 0,
        percentage: p.percentage ?? 0,
        reach: p.reach ?? 0,
        engagements: p.engagements ?? 0,
        successCount: p.successCount ?? p.count ?? 0,
        failedCount: p.failedCount ?? 0,
      })),
      publishingTrends: (raw.publishingTrends || []).map((pt) => ({
        date: pt.date || "",
        published: pt.published ?? 0,
        scheduled: pt.scheduled ?? 0,
        failed: pt.failed ?? 0,
        engagements: pt.engagements ?? 0,
        impressions: pt.impressions ?? 0,
        clicks: pt.clicks ?? 0,
      })),
      recentPosts: (raw.recentPosts || []).map((rp: RawRecentPostItem) => ({
        id: rp.id,
        postId: rp.postId || rp.id,
        title: rp.title || "Post",
        caption: rp.caption || "",
        platforms: rp.platforms || ["FACEBOOK"],
        status: rp.status || "PUBLISHED",
        authorName: rp.authorName || "",
        publishedAt: rp.publishedAt,
        scheduledAt: rp.scheduledAt,
        createdAt: rp.createdAt || new Date().toISOString(),
        platformPostUrl: rp.platformPostUrl,
        errorMessage: rp.errorMessage,
      })),
    };
  },

  async retryPublish(workspaceId: string, postId: string): Promise<void> {
    await api.post(`/api/v1/workspaces/${workspaceId}/posts/${postId}/publish`);
  },
};
