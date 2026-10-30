import type { TFunction } from "i18next";
import { api } from "@/lib/axios";

/** FR 3.7.1: trending keywords from the AI-05 pipeline (T0→T7), proxied by the Business service. */
export type TrendPeriod = "6h" | "24h" | "7d";

export interface TrendItem {
  id: string;
  rank: number;
  keyword: string;
  score: number;
  virality: number;
  dailyCounts: number[];
  topic: string | null;
  status: "new" | "rising" | "peaking" | "declining" | null;
  mood: string | null;
  emotion: string | null;
  brandRisk: "low" | "medium" | "high" | null;
  crossTopic: boolean;
  keywords: string[];
  sources: Record<string, number>;
  samplePosts: string[];
  posts?: TrendPost[];
  /** T4 momentum: posts per active day and the change from the day before. */
  growth?: { day: string; posts: number; change: number }[];
  /** Average softmax per author emotion (vui, buồn, ...), 0..1. */
  emotionDist?: Record<string, number>;
  /** Most posts are another brand's paid promotion: study it, don't ride it. */
  isCampaign?: boolean;
  /** TikTok only: how the trend's videos are made. */
  format?: TrendFormat | null;
}

/** How a TikTok trend's videos are made, so a Creator can borrow the format. */
export interface TrendFormat {
  topVideo: string | null;
  sound: string | null;
  /** "original" = the creator's own voice; "music" = a song. */
  soundKind: "music" | "original" | null;
  /** A song several of the trend's videos use. */
  sharedSound: string | null;
  medianDurationS?: number;
  /** What the creator says first, heard by whisper. */
  openingLine: string | null;
  coverUrl: string | null;
}

export const PLATFORM_LABEL: Record<string, string> = {
  facebook: "Facebook",
  threads: "Threads",
  tiktok: "TikTok",
};

/** Platforms a trend was seen on: its per-platform post counts, else the posts shown with it. */
export const trendPlatforms = (item: TrendItem) => {
  const counted = Object.keys(item.sources ?? {});
  return counted.length
    ? counted
    : [...new Set((item.posts ?? []).map((p) => p.source).filter((s): s is string => !!s))];
};

/** A post behind a trend (T7 post_items), shown in the card's hover popup. */
export interface TrendPost {
  url: string | null;
  author: string | null;
  source: string | null;
  likes: number;
  shares: number;
  comments: number;
  postedAt: string | null;
  text: string;
}

/** Display name of a topic-model label such as "thời_trang_làm_đẹp"; unknown labels fall back to plain text. */
export const topicLabel = (t: TFunction, topic: string) =>
  t(`aiStudio.trends.topicName.${topic}`, topic.replace(/_/g, " "));

/** Summed trend score, trend count and rising trends of one topic (T3 label). */
export interface TopicStat {
  topic: string;
  score: number;
  trends: number;
  rising: number;
}

/** FR 3.7.9 summary shown on the dashboard; null when the AI service cannot report it. */
export interface CrawlSummary {
  intervalMinutes: number | null;
  cron: string | null;
  pageCount: number;
  sources: string[];
  nextRunAt: string | null;
}

export async function fetchTrends(period: TrendPeriod, topic: string, platform = "") {
  const res = await api.get<{
    data: {
      items: TrendItem[];
      topics: string[];
      /** Platforms that have at least one trend in this period. */
      platforms?: string[];
      topicStats: TopicStat[];
      crawl: CrawlSummary | null;
    };
  }>("/api/v1/ai/trending-topics", {
    params: { period, topic: topic || undefined, platform: platform || undefined, limit: 30 },
  });
  return res.data.data;
}
