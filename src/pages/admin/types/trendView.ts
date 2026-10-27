import { z } from "zod";

const sourcePost = z.object({
  url: z.string().nullable().optional(),
  text: z.string().optional(),
  author: z.string().nullable().optional(),
  source: z.string().optional(),
  likes: z.number().optional(),
  shares: z.number().optional(),
  comments: z.number().optional(),
});

export const publishedTrendSchema = z.object({
  trend_id: z.string().nullable().optional(),
  rank: z.number(),
  keyword: z.string(),
  final_score: z.number(),
  anomaly_score: z.number(),
  virality_score: z.number(),
  engagement_score: z.number(),
  weekly_final_score: z.number().optional(),
  topic: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  mood: z.string().nullable().optional(),
  brand_risk: z.string().nullable().optional(),
  keywords: z.array(z.string()).default([]),
  sample_posts: z.array(z.string()).default([]),
  post_items: z.array(sourcePost).default([]),
  momentum: z
    .object({
      days: z.array(z.string()).optional(),
      counts: z.array(z.number()).optional(),
    })
    .default({}),
});

export const trendSummarySchema = z.object({
  latest_run: z
    .object({
      run_id: z.string(),
      status: z.string(),
      published_at: z.string().optional(),
      entity_resolution: z.object({ status: z.string() }).optional(),
    })
    .nullable(),
});

export type PublishedTrend = z.infer<typeof publishedTrendSchema>;
export interface TrendViewSelection {
  period: "6h" | "24h" | "7d";
  date?: string;
  limit: number;
}
