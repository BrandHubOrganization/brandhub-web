export type ReplayStatus =
  "PREVIEW" | "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "INTERRUPTED";
export interface ReplaySelection {
  startDate: string;
  endDate: string;
  prefix: string;
}
export interface ReplayFile {
  key: string;
  size: number;
  status: ReplayStatus;
  raw_posts: number;
  adapted_posts: number;
  batches: number;
  error?: string;
}
export interface ReplayDay {
  persistence?: {
    status: string;
    live_updated: boolean;
    entity_resolution: { status?: string };
  };
  date: string;
  status: ReplayStatus;
  files: ReplayFile[];
  trends_count: number;
  error: string | null;
}
export interface ReplayJob {
  processing_mode?: string;
  id: string;
  status: ReplayStatus;
  bucket: string;
  prefix: string;
  stage: string;
  created_at: string;
  updated_at: string;
  error: string | null;
  ignored_keys: number;
  days: ReplayDay[];
}
export type ReplaySummary = Omit<ReplayJob, "days"> & {
  total_days: number;
  completed_days: number;
  total_files: number;
};
export interface ReplayResult {
  date: string;
  candidates: {
    keyword: string;
    final_score: number;
    rank: number;
    trend_id: string;
  }[];
}
