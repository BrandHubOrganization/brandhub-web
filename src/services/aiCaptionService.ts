import { api } from "@/lib/axios";

/** FR 3.7.2 caption pipeline inside a workspace, charged in AI credit. */
export type CaptionLength = "short" | "medium" | "long";
export type CaptionGoal =
  "engagement" | "sales" | "announcement" | "storytelling";
export type RefineInstruction =
  | "shorter"
  | "longer"
  | "add_cta"
  | "less_emoji"
  | "more_formal"
  | "more_casual"
  | "custom";

export interface CaptionSignals {
  /** PhoBERT author-emotion softmax (vui, buồn, ...), empty when the model is off. */
  emotion: Record<string, number>;
  trendUsed: boolean;
  /** Numbers (price, %, date) not found in the topic or verified brand facts. */
  unverifiedClaims: string[];
}

export interface CaptionCompliance {
  /** NOT_CHECKED until FR 3.6.33 is plugged in (CaptionComplianceCheck on the backend). */
  status: "NOT_CHECKED" | "PASSED" | "WARNING" | "BLOCKED";
  issues: { code: string; message: string; excerpt: string }[];
}

export interface CaptionOption {
  type: "HOOK_DRIVEN" | "STORYTELLING" | "DIRECT_CTA";
  title: string;
  caption: string;
  hashtags: string[];
  characterCount: number;
  recommendedMaxChars: number;
  signals: CaptionSignals;
  compliance: CaptionCompliance;
}

export interface CaptionDraft extends Omit<CaptionOption, "type" | "title"> {
  platform: string;
}

export interface CaptionContextUsed {
  brand: boolean;
  trend: boolean;
  examples: number;
  knowledgeChunks: number;
  task: boolean;
}

export interface CaptionRequest {
  topic: string;
  tone: string;
  platform: string;
  length: CaptionLength;
  language: "vi" | "en";
  goal: CaptionGoal;
  trend?: { keyword: string; topic?: string | null; keywords?: string[] };
  taskId?: string | null;
}

interface Charged {
  creditsUsed: number;
  creditsRemaining: number;
}

const base = (workspaceId: string) => `/api/v1/workspaces/${workspaceId}/ai`;

export const aiCaptionService = {
  generate: async (workspaceId: string, body: CaptionRequest) =>
    (
      await api.post<{
        data: Charged & {
          generationId: string;
          captions: CaptionOption[];
          context: CaptionContextUsed;
        };
      }>(`${base(workspaceId)}/captions`, body)
    ).data.data,
  refine: async (
    workspaceId: string,
    body: {
      caption: string;
      instruction: RefineInstruction;
      feedback?: string;
      platform: string;
      language: "vi" | "en";
      topic?: string;
    },
  ) =>
    (
      await api.post<{ data: Charged & { drafts: CaptionDraft[] } }>(
        `${base(workspaceId)}/captions/refine`,
        body,
      )
    ).data.data,
  adapt: async (
    workspaceId: string,
    body: {
      caption: string;
      platforms: string[];
      language: "vi" | "en";
      topic?: string;
    },
  ) =>
    (
      await api.post<{ data: Charged & { drafts: CaptionDraft[] } }>(
        `${base(workspaceId)}/captions/adapt`,
        body,
      )
    ).data.data,
  /** Fire-and-forget: which option the Creator kept (history + future examples). */
  choose: (
    workspaceId: string,
    generationId: string,
    body: { type: string; action: "INSERT" | "REPLACE"; finalText: string },
  ) =>
    api
      .post(`${base(workspaceId)}/captions/${generationId}/choice`, body)
      .catch(() => undefined),
  credits: async (workspaceId: string) =>
    (
      await api.get<{ data: { remaining: number } }>(
        `${base(workspaceId)}/credits`,
      )
    ).data.data,
};
