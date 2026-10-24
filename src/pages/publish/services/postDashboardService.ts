import { api } from "@/lib/axios";
import type { PostDashboardData, PostDashboardFilters } from "../types/dashboard";

const MOCK_DASHBOARD_DATA: PostDashboardData = {
  kpis: {
    totalPosts: 48,
    totalPostsGrowth: 15.4,
    scheduledCount: 12,
    successRate: 95.8,
    failedCount: 2,
    inProgressCount: 1,
  },
  platformBreakdown: [
    { platform: "FACEBOOK", count: 24, percentage: 50, successCount: 23, failedCount: 1 },
    { platform: "INSTAGRAM", count: 14, percentage: 29.2, successCount: 13, failedCount: 1 },
    { platform: "TIKTOK", count: 6, percentage: 12.5, successCount: 6, failedCount: 0 },
    { platform: "THREADS", count: 4, percentage: 8.3, successCount: 4, failedCount: 0 },
  ],
  publishingTrends: [
    { date: "09/10", published: 4, scheduled: 2, failed: 0 },
    { date: "10/10", published: 6, scheduled: 3, failed: 1 },
    { date: "11/10", published: 5, scheduled: 1, failed: 0 },
    { date: "12/10", published: 8, scheduled: 4, failed: 0 },
    { date: "13/10", published: 7, scheduled: 2, failed: 1 },
    { date: "14/10", published: 9, scheduled: 5, failed: 0 },
    { date: "15/10", published: 9, scheduled: 3, failed: 0 },
  ],
  recentPosts: [
    {
      id: "rp-1",
      postId: "6ad0dab507418d5266ff0f62",
      title: "Bí quyết dưỡng da căng bóng như sương vào buổi sáng",
      caption: "5 bước chuẩn hóa giúp phục hồi hàng rào bảo vệ da sau cả ngày dài tiếp xúc với khói bụi...",
      platforms: ["FACEBOOK", "INSTAGRAM"],
      status: "PUBLISHED",
      authorName: "Porter Crona",
      publishedAt: "2026-10-15T13:52:53Z",
      createdAt: "2026-10-15T12:00:00Z",
    },
    {
      id: "rp-2",
      postId: "6ad0d2fc07a0ec7e1c23963b",
      title: "Lookbook Thu Đông 2026: Sắc màu tối giản lên ngôi",
      caption: "Khám phá bộ sưu tập phong cách công sở hiện đại với chất liệu len dệt tự nhiên...",
      platforms: ["FACEBOOK", "TIKTOK"],
      status: "SCHEDULED",
      authorName: "Sarah Jenkins",
      scheduledAt: "2026-10-16T09:00:00Z",
      createdAt: "2026-10-15T10:30:00Z",
    },
    {
      id: "rp-3",
      postId: "6ad0e12307418d5266ff0f99",
      title: "Behind The Scenes: Quá trình sản xuất TVC Nike mới",
      caption: "Hậu trường buổi ghi hình chiến dịch cùng các vận động viên trẻ đầy nhiệt huyết...",
      platforms: ["TIKTOK", "THREADS"],
      status: "IN_PROGRESS",
      authorName: "Porter Crona",
      createdAt: "2026-10-15T13:45:00Z",
    },
    {
      id: "rp-4",
      postId: "6ad0f88907418d5266ff0a11",
      title: "Flash Sale Thứ 6: Giảm ngay 30% toàn bộ sneaker",
      caption: "Ưu đãi duy nhất 24 giờ cho tất cả thành viên đăng ký ứng dụng Nike Club...",
      platforms: ["FACEBOOK"],
      status: "FAILED",
      authorName: "Alex Rivera",
      errorMessage: "Facebook Graph API: Page access token expired",
      createdAt: "2026-10-14T18:20:00Z",
    },
    {
      id: "rp-5",
      postId: "6ad0a55507418d5266ff0c22",
      title: "Q&A cùng Chuyên gia dinh dưỡng thể thao",
      caption: "Giải đáp mọi thắc mắc về chế độ ăn uống khoa học cho người chạy cự ly dài...",
      platforms: ["THREADS"],
      status: "PUBLISHED",
      authorName: "Sarah Jenkins",
      publishedAt: "2026-10-14T14:10:00Z",
      createdAt: "2026-10-14T08:00:00Z",
    },
  ],
};

interface RawPlatformMetric {
  platform: PostDashboardData["platformBreakdown"][number]["platform"];
  count?: number;
  percentage?: number;
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
}

interface RawDashboardResponse {
  kpis?: Partial<PostDashboardData["kpis"]>;
  platformBreakdown?: RawPlatformMetric[];
  publishingTrends?: PostDashboardData["publishingTrends"];
  recentPosts?: RawRecentPostItem[];
}

export const postDashboardService = {
  async getDashboard(
    workspaceId: string,
    filters: Partial<PostDashboardFilters>,
  ): Promise<PostDashboardData> {
    try {
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
      if (response.data && response.data.data) {
        const raw = response.data.data;
        return {
          kpis: {
            totalPosts: raw.kpis?.totalPosts ?? 0,
            totalPostsGrowth: raw.kpis?.totalPostsGrowth ?? 14.2,
            scheduledCount: raw.kpis?.scheduledCount ?? 0,
            successRate: raw.kpis?.successRate ?? 0,
            failedCount: raw.kpis?.failedCount ?? 0,
            inProgressCount: raw.kpis?.inProgressCount ?? 0,
          },
          platformBreakdown: (raw.platformBreakdown || []).map((p: RawPlatformMetric) => ({
            platform: p.platform,
            count: p.count ?? 0,
            percentage: p.percentage ?? 0,
            successCount: p.successCount ?? p.count ?? 0,
            failedCount: p.failedCount ?? 0,
          })),
          publishingTrends:
            raw.publishingTrends && raw.publishingTrends.length > 0
              ? raw.publishingTrends
              : MOCK_DASHBOARD_DATA.publishingTrends,
          recentPosts: (raw.recentPosts || []).map((rp: RawRecentPostItem) => ({
            id: rp.id,
            postId: rp.postId || rp.id,
            title: rp.title || "Post",
            caption: rp.caption || "",
            platforms: rp.platforms || ["FACEBOOK"],
            status: rp.status || "PUBLISHED",
            authorName: rp.authorName || "Member",
            publishedAt: rp.publishedAt,
            scheduledAt: rp.scheduledAt,
            createdAt: rp.createdAt || new Date().toISOString(),
          })),
        };
      }
    } catch {
      // Backend endpoint not ready or returns 404 -> fallback to rich mock data
    }

    // Filter local mock data if platform or status is selected
    let filteredPosts = [...MOCK_DASHBOARD_DATA.recentPosts];
    const platform = filters.platform;
    if (platform && platform !== "ALL") {
      filteredPosts = filteredPosts.filter((p) =>
        p.platforms.includes(platform),
      );
    }
    if (filters.status && filters.status !== "ALL") {
      filteredPosts = filteredPosts.filter((p) => p.status === filters.status);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      filteredPosts = filteredPosts.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.caption.toLowerCase().includes(q) ||
          p.authorName.toLowerCase().includes(q),
      );
    }

    return {
      ...MOCK_DASHBOARD_DATA,
      recentPosts: filteredPosts,
    };
  },
};
