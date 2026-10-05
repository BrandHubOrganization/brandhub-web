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

export const adminCrawlConfigService = {
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
