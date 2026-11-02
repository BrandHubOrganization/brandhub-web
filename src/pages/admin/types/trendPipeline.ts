export type PipelineStage =
  | "STARTING"
  | "CRAWLING"
  | "RECOVERING"
  | "INTERRUPTED"
  | "QUEUED"
  | "PROCESSING"
  | "AGGREGATING"
  | "RESOLVING"
  | "COMPLETED"
  | "PARTIAL"
  | "FAILED";

export interface TrendPipelineRun {
  test?: boolean;
  stopRequested?: boolean;
  platforms?: { platform: string; status: string; posts: number }[];
  id: string;
  pipelineRunId: string | null;
  trigger: string;
  status: "RUNNING" | "COMPLETED" | "PARTIAL" | "FAILED" | "INTERRUPTED";
  stage: PipelineStage;
  startedAt: string | null;
  totalPosts: number;
  batchTotal: number;
  batchFinished: number;
  batchProcessing?: number;
  batchFailed?: number;
  databaseSaved: boolean;
  liveUpdated: boolean;
  resolutionStatus: string;
  canRecover: boolean;
}

export interface TrendPipelineRuns {
  running: TrendPipelineRun | null;
  history: TrendPipelineRun[];
}

export interface TrendPipelineStatus {
  platforms?: string[];
  ready: boolean;
  recoveryReady: boolean;
  readinessReason: string | null;
  cron: string;
  timezone: string;
  scheduleEnabled: boolean;
  scheduleValid: boolean;
  schedulerRunning: boolean;
  nextRunAt: string | null;
  running: TrendPipelineRun | null;
}
