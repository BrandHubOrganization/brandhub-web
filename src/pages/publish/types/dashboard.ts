import type { Platform, PostStatus } from "@/types/post";

export interface PostKpiStats {
  totalPosts: number;
  totalPostsGrowth: number; // percentage, e.g. +12.5%
  scheduledCount: number;
  successRate: number; // percentage, e.g. 98.2%
  failedCount: number;
  inProgressCount: number;
}

export interface PlatformMetric {
  platform: Platform;
  count: number;
  percentage: number;
  successCount: number;
  failedCount: number;
}

export interface PublishingTrendPoint {
  date: string; // e.g. "2026-10-09" or "09/10"
  published: number;
  scheduled: number;
  failed: number;
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
