import { api } from "@/lib/axios";

export interface CrawlCookieStatus {
  configured: boolean;
  valid: boolean;
  status: "valid" | "expired" | "invalid" | "missing";
  cookieCount: number;
  cUser: string | null;
  expiresAt: string | null;
  updatedAt: string | null;
}

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
  fbCookie?: CrawlCookieStatus;
}

export type CrawlConfigUpdate = {
  intervalMinutes?: number;
  cron?: string;
  sourcePages: string[];
  postsPerRun: number;
};

export type FbCookieValidationError =
  | "empty"
  | "invalidJson"
  | "missingRequired";

export function validateFbCookieJson(
  raw: string,
): FbCookieValidationError | null {
  const trimmed = raw.trim();
  if (!trimmed) return "empty";

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return "invalidJson";
  }

  const cookies = Array.isArray(parsed)
    ? parsed
    : parsed &&
        typeof parsed === "object" &&
        Array.isArray((parsed as { cookies?: unknown }).cookies)
      ? (parsed as { cookies: unknown[] }).cookies
      : null;

  if (!cookies || cookies.length === 0) return "invalidJson";

  const names = new Set<string>();
  for (const item of cookies) {
    if (!item || typeof item !== "object") continue;
    const entry = item as { name?: unknown; value?: unknown };
    const name = typeof entry.name === "string" ? entry.name.trim() : "";
    const value =
      entry.value !== undefined && entry.value !== null
        ? String(entry.value).trim()
        : "";
    if (name && value) names.add(name);
  }

  if (!names.has("c_user") || !names.has("xs")) return "missingRequired";
  return null;
}

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
  /** Pages not crawled yet; only present while the run is in progress. */
  pending?: string[];
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
  getCookie: async () =>
    (
      await api.get<{ data: CrawlCookieStatus }>(
        "/api/v1/admin/ai/crawl-cookie",
      )
    ).data.data,
  updateCookie: async (cookieJson: string) =>
    (
      await api.put<{ data: CrawlCookieStatus }>(
        "/api/v1/admin/ai/crawl-cookie",
        { cookieJson },
      )
    ).data.data,
};
