export interface TeamMemberStat {
  memberId: string;
  memberName: string | null;
  avatar?: string | null;
  role: string | null;
  postCount: number;
  publishedCount: number;
}

export interface ActivityEvent {
  id: string;
  actorName: string | null;
  actorAvatar?: string | null;
  targetTitle?: string;
  timestamp: string;
  type: "POST_PUBLISHED" | "POST_FAILED";
}

export type AnalyticsPlatform =
  "FACEBOOK" | "INSTAGRAM" | "TIKTOK" | "THREADS";

export interface ChannelStat {
  platform: AnalyticsPlatform;
  postCount: number;
  reach: number;
  engagement: number;
}

export interface DailyPoint {
  date: string;
  reach: number;
  engagement: number;
  posts: number;
}

export interface HourBucket {
  hour: number;
  facebook: number;
  instagram: number;
  tiktok: number;
  threads: number;
}

export interface AnalyticsOverview {
  totalPosts: number;
  publishedCount: number;
  failedCount: number;
  successRate: number;
  totalReach: number;
  totalEngagement: number;
  statusCounts: Record<string, number>;
  teamStats: TeamMemberStat[];
  channelStats: ChannelStat[];
  dailyTrend: DailyPoint[];
  reachGrowth: number | null;
  engagementGrowth: number | null;
  publishHours: HourBucket[];
  activities: ActivityEvent[];
}

export interface StatSummaryCard {
  key: "reach" | "engagement" | "posts" | "successRate";
  value: string;
  deltaPercent: number | null;
}
