import { api } from "@/lib/axios";

/** FR 3.7.2 caption generation inside a workspace, charged in AI credit. */
export type CaptionLength = "short" | "medium" | "long";

export interface CaptionOption {
  type: "HOOK_DRIVEN" | "STORYTELLING" | "DIRECT_CTA";
  title: string;
  caption: string;
  hashtags: string[];
  characterCount: number;
  recommendedMaxChars: number;
}

export interface CaptionRequest {
  topic: string;
  tone: string;
  platform: string;
  length: CaptionLength;
  language: "vi" | "en";
}

export const aiCaptionService = {
  generate: async (workspaceId: string, body: CaptionRequest) =>
    (
      await api.post<{
        data: {
          captions: CaptionOption[];
          creditsUsed: number;
          creditsRemaining: number;
        };
      }>(`/api/v1/workspaces/${workspaceId}/ai/captions`, body)
    ).data.data,
  credits: async (workspaceId: string) =>
    (
      await api.get<{ data: { remaining: number } }>(
        `/api/v1/workspaces/${workspaceId}/ai/credits`,
      )
    ).data.data,
};
