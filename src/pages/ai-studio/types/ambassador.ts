export type AmbassadorStatus = "TRAINING" | "READY" | "FAILED";

export type PosePreservation = "LOW" | "MEDIUM" | "HIGH";
export type ModelQualityTier = "STANDARD" | "HIGH" | "ULTRA";

export interface InstantIdSettings {
  identityStrength: number;
  posePreservation: PosePreservation;
  qualityTier: ModelQualityTier;
  negativePrompt?: string;
}

export interface Ambassador {
  id: string;
  name: string;
  faceImageUrl: string;
  status: AmbassadorStatus;
  createdAt: string;
  videosGenerated: number;
  modelId?: string;
  instantIdSettings?: InstantIdSettings;
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
