export type AmbassadorStatus = "TRAINING" | "READY" | "FAILED";

export interface Ambassador {
  id: string;
  name: string;
  faceImageUrl: string;
  status: AmbassadorStatus;
  createdAt: string;
  videosGenerated: number;
  modelId?: string;
}

export type AmbassadorVideoJobStatus =
  "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED";

export interface AmbassadorVideoJob {
  id: string;
  ambassadorId: string;
  prompt: string;
  status: AmbassadorVideoJobStatus;
  outputVideoUrl?: string;
  createdAt: string;
}
