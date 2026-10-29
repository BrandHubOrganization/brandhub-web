export type PipelineStage =
  | "STARTING"
  | "CRAWLING"
  | "QUEUED"
  | "PROCESSING"
  | "AGGREGATING"
  | "RESOLVING"
  | "COMPLETED"
  | "PARTIAL"
  | "FAILED";

export interface TrendPipelineRun {
  id: string;
  pipelineRunId: string | null;
  trigger: string;
  status: "RUNNING" | "COMPLETED" | "PARTIAL" | "FAILED";
  stage: PipelineStage;
  startedAt: string | null;
  totalPosts: number;
  batchTotal: number;
  batchFinished: number;
  databaseSaved: boolean;
  liveUpdated: boolean;
  resolutionStatus: string;
}

export interface TrendPipelineRuns {
  running: TrendPipelineRun | null;
  history: TrendPipelineRun[];
}

export interface TrendPipelineStatus {
  ready: boolean;
  cron: string;
  timezone: string;
  scheduleEnabled: boolean;
  scheduleValid: boolean;
  schedulerRunning: boolean;
  nextRunAt: string | null;
  running: TrendPipelineRun | null;
}
