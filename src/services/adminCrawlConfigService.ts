import { api } from "@/lib/axios";

/** FR 3.7.9: trend crawler schedule, pages and posts per run (ADMIN only). */
export interface CrawlConfig {
  intervalMinutes: number | null;
  cron: string | null;
  sourcePages: string[];
  postsPerRun: number;
  running: boolean;
  enabled: boolean;
  nextRunAt: string | null;
  sources: string[];
}

export type CrawlConfigUpdate = {
  intervalMinutes?: number;
  cron?: string;
  sourcePages: string[];
  postsPerRun: number;
};

/** One crawl: pages visited, posts per page and errors (FR 3.7.9 run log). */
export interface CrawlRun {
  id: string;
  trigger: "MANUAL" | "SCHEDULE";
  status: "RUNNING" | "SUCCESS" | "PARTIAL" | "FAILED";
  startedAt: string | null;
  finishedAt: string | null;
  totalPosts: number;
  deduped: number;
  creditsRemaining: number | null;
  pages: {
    source: string;
    url: string | null;
    posts: number;
    requests: number | null;
    error: string | null;
  }[];
  errors: string[];
}

export const adminCrawlConfigService = {
  runs: async () =>
    (
      await api.get<{
        data: { running: CrawlRun | null; history: CrawlRun[] };
      }>("/api/v1/admin/ai/crawl-runs")
    ).data.data,
  runNow: async () =>
    (await api.post<{ data: CrawlRun }>("/api/v1/admin/ai/crawl-runs")).data
      .data,
  get: async () =>
    (await api.get<{ data: CrawlConfig }>("/api/v1/admin/ai/crawl-config")).data
      .data,
  update: async (body: CrawlConfigUpdate) =>
    (
      await api.patch<{ data: CrawlConfig }>(
        "/api/v1/admin/ai/crawl-config",
        body,
      )
    ).data.data,
};
