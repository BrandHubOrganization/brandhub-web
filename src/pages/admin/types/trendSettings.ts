export type TrendPlatform = "facebook" | "threads" | "tiktok";

export interface TrendSettings {
  revision: number;
  enabled: boolean;
  cron: string;
  timezone?: string;
  platforms: TrendPlatform[];
  threads: {
    maxTopics: number;
    maxPostsPerTopic: number;
    maxPosts: number;
    maxSeconds: number;
    maxCommentsPerPost: number;
  };
  tiktok: {
    hashtags: string[];
    useCreativeCenter: boolean;
    periodDays: number;
    pagesPerHashtag: number;
    topPostsPerHashtag: number;
    maxCommentsPerPost: number;
    collectMedia: boolean;
  };
}

export const threadFields = [
  ["maxTopics", 1, 50],
  ["maxPostsPerTopic", 1, 100],
  ["maxPosts", 1, 1000],
  ["maxSeconds", 30, 3600],
  ["maxCommentsPerPost", 0, 500],
] as const;

export const tiktokFields = [
  ["pagesPerHashtag", 1, 5],
  ["topPostsPerHashtag", 1, 30],
  ["maxCommentsPerPost", 0, 100],
] as const;
