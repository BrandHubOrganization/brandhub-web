import type { Platform, PostStatus } from "@/types/post";

export interface PostKpiStats {
  totalReach?: number;
  reachGrowth?: number;
  totalEngagements?: number;
  engagementsGrowth?: number;
  totalPosts: number;
  totalPostsGrowth: number;
  successRate: number;
  successRateGrowth?: number;
  scheduledCount: number;
  failedCount: number;
  inProgressCount: number;
}

export interface PlatformMetric {
  platform: Platform;
  count: number;
  percentage: number;
  reach?: number;
  engagements?: number;
  successCount: number;
  failedCount: number;
}

export interface PublishingTrendPoint {
  date: string; // e.g. "2026-10-09" or "09/10"
  published: number;
  scheduled: number;
  failed: number;
  engagements: number;
  impressions: number;
  clicks: number;
}

export interface RecentPostItem {
  id: string;
  postId: string;
  title: string;
  caption: string;
  platforms: Platform[];
  status: PostStatus | "IN_PROGRESS";
  authorName: string;
  authorAvatar?: string;
  publishedAt?: string;
  scheduledAt?: string;
  createdAt: string;
  platformPostUrl?: string;
  errorMessage?: string;
}

export interface PostDashboardData {
  kpis: PostKpiStats;
  platformBreakdown: PlatformMetric[];
  publishingTrends: PublishingTrendPoint[];
  recentPosts: RecentPostItem[];
}

export interface PostDashboardFilters {
  dateRange: "7d" | "14d" | "30d" | "90d" | "all";
  platform: Platform | "ALL";
  status: PostStatus | "IN_PROGRESS" | "ALL";
  search: string;
  page: number;
  limit: number;
}
