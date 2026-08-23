import { api } from "./api";
import type { AnalyticsOverview, ActivityEvent } from "@/types/analytics";

const MOCK_ANALYTICS_OVERVIEW: AnalyticsOverview = {
  totalPosts: 148,
  publishedCount: 132,
  failedCount: 6,
  successRate: 95.6,
  teamStats: [
    {
      memberId: "u-1",
      memberName: "Nguyễn Văn An",
      role: "ACCOUNT",
      postCount: 42,
      publishedCount: 40,
    },
    {
      memberId: "u-2",
      memberName: "Trần Thị Bình",
      role: "CREATOR",
      postCount: 58,
      publishedCount: 52,
    },
    {
      memberId: "u-3",
      memberName: "Lê Hoàng Cường",
      role: "CREATOR",
      postCount: 36,
      publishedCount: 30,
    },
    {
      memberId: "u-4",
      memberName: "Phạm Minh Dung",
      role: "CREATOR",
      postCount: 12,
      publishedCount: 10,
    },
  ],
};

const MOCK_ACTIVITIES: ActivityEvent[] = [
  {
    id: "act-1",
    actorName: "Nguyễn Văn An",
    actionText: "đã xuất bản bài viết",
    targetTitle: "Chiến dịch Tết 2026 - Heineken",
    timestamp: "5 phút trước",
    type: "POST_PUBLISHED",
  },
  {
    id: "act-2",
    actorName: "Trần Thị Bình",
    actionText: "đã gán công việc cho",
    targetTitle: "Lên lịch bài đăng Nike Air Max",
    timestamp: "18 phút trước",
    type: "TASK_ASSIGNED",
  },
  {
    id: "act-3",
    actorName: "Lê Hoàng Cường",
    actionText: "đã bình luận vào bài viết",
    targetTitle: "Review bộ ảnh Sữa Hạt Organic",
    timestamp: "1 giờ trước",
    type: "COMMENT_ADDED",
  },
  {
    id: "act-4",
    actorName: "Phạm Minh Dung",
    actionText: "đã phê duyệt nội dung",
    targetTitle: "Video Reel giới thiệu sản phẩm mới",
    timestamp: "2 giờ trước",
    type: "POST_APPROVED",
  },
  {
    id: "act-5",
    actorName: "System Auto-Publisher",
    actionText: "gặp lỗi xuất bản bài viết",
    targetTitle: "Post Facebook Fanpage Heineken VN",
    timestamp: "3 giờ trước",
    type: "POST_FAILED",
  },
  {
    id: "act-6",
    actorName: "Nguyễn Văn An",
    actionText: "đã tạo chiến dịch mới",
    targetTitle: "Branding Campaign Q3 2026",
    timestamp: "5 giờ trước",
    type: "TASK_ASSIGNED",
  },
  {
    id: "act-7",
    actorName: "Trần Thị Bình",
    actionText: "đã xuất bản bài viết",
    targetTitle: "Mẹo chăm sóc da mùa hè - Post 04",
    timestamp: "6 giờ trước",
    type: "POST_PUBLISHED",
  },
  {
    id: "act-8",
    actorName: "Lê Hoàng Cường",
    actionText: "đã gửi phê duyệt bài viết",
    targetTitle: "Carousel Hướng dẫn sử dụng App",
    timestamp: "8 giờ trước",
    type: "POST_APPROVED",
  },
  {
    id: "act-9",
    actorName: "Phạm Minh Dung",
    actionText: "đã thêm 5 hình ảnh vào thư viện",
    targetTitle: "Media Library - Nike Brand",
    timestamp: "12 giờ trước",
    type: "TASK_ASSIGNED",
  },
  {
    id: "act-10",
    actorName: "Nguyễn Văn An",
    actionText: "đã xuất bản bài viết",
    targetTitle: "Story khuyến mãi cuối tuần",
    timestamp: "1 ngày trước",
    type: "POST_PUBLISHED",
  },
];

export const dashboardService = {
  async getAnalyticsOverview(): Promise<AnalyticsOverview> {
    try {
      const response = await api.get("/api/v1/analytics/overview");
      // Handle standard envelope response format if present ({ data: ... })
      return response.data?.data ?? response.data ?? MOCK_ANALYTICS_OVERVIEW;
    } catch (error) {
      console.warn(
        "Backend API /api/v1/analytics/overview offline or error, using fallback data",
        error,
      );
      return MOCK_ANALYTICS_OVERVIEW;
    }
  },

  async getActivityFeed(page = 0, size = 10): Promise<ActivityEvent[]> {
    try {
      const response = await api.get("/api/v1/notifications", {
        params: { type: "activity", page, size },
      });
      const data =
        response.data?.data?.content ?? response.data?.content ?? response.data;
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
      return MOCK_ACTIVITIES;
    } catch (error) {
      console.warn(
        "Backend API /api/v1/notifications offline or error, using fallback data",
        error,
      );
      return MOCK_ACTIVITIES;
    }
  },
};
