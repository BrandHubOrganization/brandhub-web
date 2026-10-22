export type CaptionPlatform =
  "facebook" | "instagram" | "tiktok" | "threads" | "linkedin";

export interface WorkspaceCaptionRequest {
  topic: string;
  tone?:
    | "professional"
    | "friendly"
    | "humorous"
    | "inspirational"
    | "bold"
    | "empathetic"
    | "trendy";
  platform?: CaptionPlatform;
  length?: "short" | "medium" | "long";
  language?: "vi" | "en";
  goal?: "engagement" | "sales" | "announcement" | "storytelling";
  trend?: { keyword: string; topic?: string; keywords?: string[] };
  taskId?: string;
  trendId?: string;
  techniques?: string[];
}

export interface CaptionDraft {
  platform?: CaptionPlatform;
  type?: string;
  title?: string;
  caption: string;
  hashtags: string[];
  characterCount: number;
  recommendedMaxChars: number;
  signals: {
    emotion: Record<string, number>;
    trendUsed: boolean;
    unverifiedClaims: string[];
    issues: string[];
  };
  compliance: unknown;
  trendTechnique?: string | null;
}

export interface WorkspaceCaptionResult {
  generationId: string;
  captions: CaptionDraft[];
  context: {
    brand: boolean;
    trend: boolean;
    examples: number;
    knowledgeChunks: number;
    task: boolean;
  };
  creditsUsed: number;
  creditsRemaining: number;
}

export interface CaptionRefineRequest {
  caption: string;
  instruction:
    | "shorter"
    | "longer"
    | "add_cta"
    | "less_emoji"
    | "more_formal"
    | "more_casual"
    | "custom";
  feedback?: string;
  platform?: CaptionPlatform;
  language?: "vi" | "en";
  topic?: string;
}

export interface CaptionAdaptRequest {
  caption: string;
  platforms: CaptionPlatform[];
  language?: "vi" | "en";
  topic?: string;
}

export interface CaptionDraftResult {
  drafts: CaptionDraft[];
  creditsUsed: number;
  creditsRemaining: number;
}

export interface WorkspaceVideoRequest {
  prompt: string;
  styleKey?: string;
  ambassadorId?: string;
  aspectRatio?: "16:9" | "9:16";
}

export interface WorkspaceVideoJob {
  jobId: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  prompt: string;
  styleKey: string | null;
  ambassadorId: string | null;
  aspectRatio: string;
  videoUrl: string | null;
  s3Key: string | null;
  errorCode: string | null;
  refunded: boolean;
  createdAt: string;
  finishedAt: string | null;
}

export interface WorkspaceVideoStarted {
  job: WorkspaceVideoJob;
  creditsUsed: number;
  creditsRemaining: number;
  creditsHeld: number;
}

export interface WorkspaceAiBalance {
  agencyId: string;
  allowance: number;
  used: number;
  creatorLimit: number | null;
  creatorUsed: number;
  available: number;
  held: number;
  creatorHeld: number;
  remaining: number;
  periodStart: string;
  periodEnd: string;
}
