import { api } from "@/services/api";
import { requireApiData } from "@/lib/apiData";

export interface CrawlRunPage {
  name?: string;
  url?: string;
  status?: string;
  posts?: number;
  [key: string]: unknown;
}

export interface CrawlRunItem {
  id: string;
  trigger: string;
  status: string;
  startedAt?: string | null;
  finishedAt?: string | null;
  totalPosts: number;
  deduped: number;
  creditsRemaining?: number | null;
  pages: CrawlRunPage[];
  errors: string[];
}

export interface CrawlRunsResponse {
  running: CrawlRunItem | null;
  history: CrawlRunItem[];
}

export interface CrawlConfig {
  intervalMinutes: number | null;
  cron: string | null;
  sourcePages: string[];
  postsPerRun: number;
  running: boolean;
  enabled: boolean;
  nextRunAt: string | null;
  sources: Array<{ name?: string; url?: string; [key: string]: unknown }>;
}

export interface UpdateCrawlConfigRequest {
  intervalMinutes?: number | null;
  cron?: string | null;
  sourcePages?: string[];
  postsPerRun?: number;
}

const RUNS_PATH = "/api/v1/admin/ai/crawl-runs";
const CONFIG_PATH = "/api/v1/admin/ai/crawl-config";

export const crawlConfigService = {
  async getRuns(signal?: AbortSignal): Promise<CrawlRunsResponse> {
    const response = await api.get(RUNS_PATH, { signal });
    return requireApiData<CrawlRunsResponse>(response.data);
  },

  async runNow(): Promise<CrawlRunItem> {
    const response = await api.post(RUNS_PATH);
    return requireApiData<CrawlRunItem>(response.data);
  },

  async getConfig(signal?: AbortSignal): Promise<CrawlConfig> {
    const response = await api.get(CONFIG_PATH, { signal });
    return requireApiData<CrawlConfig>(response.data);
  },

  async updateConfig(data: UpdateCrawlConfigRequest): Promise<CrawlConfig> {
    const response = await api.patch(CONFIG_PATH, data);
    return requireApiData<CrawlConfig>(response.data);
  },
};
