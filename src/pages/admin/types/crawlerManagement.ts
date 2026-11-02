import type {
  TrendSettings,
  TrendPlatform,
} from "@/pages/admin/types/trendSettings";

export type CredentialKind = "facebook" | "threads" | "proxy" | "tiktok";
export interface CrawlerCheck {
  component: string;
  platform: string | null;
  status: "OK" | "BLOCKED" | "UNKNOWN";
  code: string;
  required: boolean;
  checkedAt: string;
  consumers?: number;
  messagesReady?: number;
}
export interface CrawlerHealth {
  checks: CrawlerCheck[];
  alerts?: { code: string; component: string; checkedAt: string }[];
  manualReady: boolean;
  schedulerHealthy: boolean;
  secretStorageReady: boolean;
  nextRuns: string[];
  timezone: string;
  checkedAt: string;
  platforms: TrendPlatform[];
}
export interface CredentialMetadata {
  kind: CredentialKind;
  revision: number;
  version: string | null;
  configured: boolean;
  updatedAt: number | null;
  checkedAt: number | null;
  status: string;
  probeCode: string | null;
}
export interface RunOptions {
  platforms: TrendPlatform[];
  test: boolean;
  retryRunId?: string;
}
export interface RunPreview extends RunOptions {
  revision: number;
  sourceRevision?: number | null;
  sourceCount: number;
  maxPostsPerSource: number;
  publishesLive: boolean;
  threads?: TrendSettings["threads"];
  tiktok?: TrendSettings["tiktok"];
}
export interface CrawlerRunDetail {
  run: {
    id: string;
    status: string;
    started_at: string;
    total_posts: number;
    pages: { name: string; status: string; posts: number }[];
  };
  snapshot: {
    platforms?: TrendPlatform[];
    test?: boolean;
    credentialVersions?: Record<string, string>;
  };
  events: { stage: string; message: string }[];
  nextOffset: number | null;
}
