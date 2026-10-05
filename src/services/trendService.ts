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
}

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

export async function fetchTrends(period: TrendPeriod, topic: string) {
  const res = await api.get<{
    data: {
      items: TrendItem[];
      topics: string[];
      topicStats: TopicStat[];
      crawl: CrawlSummary | null;
    };
  }>("/api/v1/ai/trending-topics", {
    params: { period, topic: topic || undefined, limit: 30 },
  });
  return res.data.data;
}
