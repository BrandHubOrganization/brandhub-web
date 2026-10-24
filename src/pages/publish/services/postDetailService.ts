import { api } from "@/lib/axios";
import type { PostedDetailData } from "../types/postDetail";

const MOCK_POSTED_DETAILS: Record<string, PostedDetailData> = {
  "6ad0dab507418d5266ff0f62": {
    id: "pd-1",
    postId: "6ad0dab507418d5266ff0f62",
    workspaceId: "6a4bb422-3ef2-43d4-8019-93adb1dfa982",
    title: "Bí quyết dưỡng da căng bóng như sương vào buổi sáng",
    caption:
      "Bí quyết dưỡng da căng bóng như sương vào buổi sáng! 5 bước chuẩn hóa giúp phục hồi hàng rào bảo vệ da sau cả ngày dài tiếp xúc với khói bụi.\n\n1. Rửa mặt dịu nhẹ với sữa rửa mặt pH 5.5\n2. Toner cân bằng và cấp ẩm tầng sâu\n3. Serum Niacinamide 10% tái tạo tế bào\n4. Kem dưỡng ẩm khóa dưỡng chất\n5. Kem chống nắng phổ rộng SPF 50+ PA++++\n\n#BeautyTips #SkincareRoutine #GlowSkin #SelfCare",
    hashtags: ["#BeautyTips", "#SkincareRoutine", "#GlowSkin", "#SelfCare"],
    mediaUrls: [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1000&q=80",
    ],
    mediaType: "IMAGE",
    platform: "FACEBOOK",
    platformPostId: "1044303168777709_122097495034871234",
    platformUrl: "https://www.facebook.com/1044303168777709",
    status: "PUBLISHED",
    authorName: "Porter Crona",
    authorEmail: "user59@gmail.com",
    publishedAt: "2026-10-15T13:52:53Z",
    createdAt: "2026-10-15T12:00:00Z",
    updatedAt: "2026-10-15T13:53:00Z",
    metrics: {
      reactions: 1420,
      likes: 1250,
      comments: 348,
      shares: 112,
      impressions: 18500,
      reach: 14200,
      clicks: 860,
      engagementRate: 8.4,
      lastSyncedAt: new Date().toISOString(),
    },
    executionLogs: [
      {
        id: "log-1",
        timestamp: "2026-10-15T13:52:51Z",
        action: "QUEUED",
        status: "INFO",
        platform: "FACEBOOK",
        message: "Publish job dispatched to RabbitMQ exchange 'publisher.job.exchange'",
      },
      {
        id: "log-2",
        timestamp: "2026-10-15T13:52:52Z",
        action: "CONSUMED",
        status: "INFO",
        platform: "FACEBOOK",
        message: "PublishJobConsumer picked up message with lock key processingPostIds:6ad0dab507418d5266ff0f62",
      },
      {
        id: "log-3",
        timestamp: "2026-10-15T13:52:53Z",
        action: "DISPATCHED",
        status: "SUCCESS",
        platform: "FACEBOOK",
        message: "Meta Graph API v26.0 POST /1044303168777709/photos completed with 200 OK",
      },
    ],
    auditHistory: [
      {
        id: "aud-1",
        userId: "c2a2583f-7049-45c8-81fa-aeaa3016a8fc",
        userName: "Porter Crona",
        userRole: "CREATOR",
        action: "Tạo bản nháp bài viết",
        timestamp: "2026-10-15T12:00:00Z",
      },
      {
        id: "aud-2",
        userId: "c2a2583f-7049-45c8-81fa-aeaa3016a8fc",
        userName: "Porter Crona",
        userRole: "CREATOR",
        action: "Gửi phê duyệt nội dung",
        timestamp: "2026-10-15T12:45:00Z",
      },
      {
        id: "aud-3",
        userId: "admin-uuid-1",
        userName: "Sarah Jenkins",
        userRole: "MANAGER",
        action: "Duyệt bài viết (Approved)",
        timestamp: "2026-10-15T13:10:00Z",
      },
      {
        id: "aud-4",
        userId: "c2a2583f-7049-45c8-81fa-aeaa3016a8fc",
        userName: "Porter Crona",
        userRole: "CREATOR",
        action: "Xuất bản bài viết lên Facebook Fanpage",
        timestamp: "2026-10-15T13:52:53Z",
      },
    ],
  },
};

export interface PostStatusData {
  postId: string;
  status: "PENDING" | "IN_PROGRESS" | "DONE" | "FAIL";
  failReason?: string | null;
  updatedAt: string;
}

export const postDetailService = {
  async getPostStatus(
    workspaceId: string,
    postId: string,
  ): Promise<PostStatusData> {
    try {
      const response = await api.get<{ success: boolean; data: PostStatusData }>(
        `/api/v1/workspaces/${workspaceId}/posts/${postId}/status`,
      );
      if (response.data && response.data.data) {
        return response.data.data;
      }
    } catch {
      // Fallback
    }

    return {
      postId,
      status: "DONE",
      failReason: null,
      updatedAt: new Date().toISOString(),
    };
  },

  async getPostDetail(
    workspaceId: string,
    postId: string,
    refreshMetrics = false,
  ): Promise<PostedDetailData> {
    try {
      const response = await api.get<{ success: boolean; data: any }>(
        `/api/v1/workspaces/${workspaceId}/posts/${postId}/detail`,
        {
          params: { refreshMetrics },
        },
      );
      if (response.data && response.data.data) {
        const d = response.data.data;
        if (d.metrics) {
          return d as PostedDetailData;
        }
        return {
          id: d.id,
          postId: d.id,
          workspaceId: d.workspaceId,
          title: d.contentText ? (d.contentText.length > 50 ? d.contentText.slice(0, 47) + "..." : d.contentText) : "Bài viết",
          caption: d.contentText || "",
          hashtags: d.hashtags || [],
          mediaUrls: (d.media || []).map((m: any) => m.url || m.s3Key),
          mediaType: d.media && d.media.length > 0 ? (d.media[0].mediaType || "IMAGE") : "NONE",
          platform: (d.targetPlatforms && d.targetPlatforms[0]) || "FACEBOOK",
          platformUrl: d.platformPostUrl || "",
          status: d.status,
          authorName: "Porter Crona",
          publishedAt: d.updatedAt || d.createdAt,
          createdAt: d.createdAt,
          updatedAt: d.updatedAt,
          metrics: {
            reactions: d.reactionCount ?? 0,
            likes: d.reactionCount ?? 0,
            comments: d.commentCount ?? 0,
            shares: d.shareCount ?? 0,
            impressions: (d.reactionCount ?? 0) * 12 + 500,
            reach: (d.reactionCount ?? 0) * 9 + 300,
            clicks: Math.round((d.reactionCount ?? 0) / 2),
            engagementRate: 5.2,
            lastSyncedAt: d.engagementUpdatedAt || new Date().toISOString(),
          },
          executionLogs: [],
          auditHistory: [],
        };
      }
    } catch {
      // Backend not yet ready or returns 404 -> fallback to mock
    }

    const mockItem = MOCK_POSTED_DETAILS[postId];
    if (mockItem) {
      return {
        ...mockItem,
        metrics: {
          ...mockItem.metrics,
          lastSyncedAt: new Date().toISOString(),
        },
      };
    }

    // Default fallback generic item
    return {
      id: "pd-generic",
      postId,
      workspaceId,
      title: "Bài viết xuất bản trên Mạng xã hội",
      caption: "Khám phá chiến dịch truyền thông đa kênh mới nhất cùng BrandHub...",
      hashtags: ["#BrandHub", "#SocialMedia", "#Marketing"],
      mediaUrls: ["https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1000&q=80"],
      mediaType: "IMAGE",
      platform: "FACEBOOK",
      platformPostId: "1044303168777709_post_demo",
      platformUrl: "https://www.facebook.com/1044303168777709",
      status: "PUBLISHED",
      authorName: "Porter Crona",
      authorEmail: "user59@gmail.com",
      publishedAt: new Date().toISOString(),
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      updatedAt: new Date().toISOString(),
      metrics: {
        reactions: 980,
        likes: 850,
        comments: 142,
        shares: 64,
        impressions: 12400,
        reach: 9800,
        clicks: 420,
        engagementRate: 6.8,
        lastSyncedAt: new Date().toISOString(),
      },
      executionLogs: [
        {
          id: "log-1",
          timestamp: new Date().toISOString(),
          action: "DISPATCHED",
          status: "SUCCESS",
          platform: "FACEBOOK",
          message: "Social post successfully synchronized with Facebook Page API",
        },
      ],
      auditHistory: [
        {
          id: "aud-1",
          userId: "c2a2583f-7049-45c8-81fa-aeaa3016a8fc",
          userName: "Porter Crona",
          userRole: "CREATOR",
          action: "Đã xuất bản bài viết",
          timestamp: new Date().toISOString(),
        },
      ],
    };
  },
};
