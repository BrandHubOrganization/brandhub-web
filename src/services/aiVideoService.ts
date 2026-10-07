import { api } from "@/lib/axios";
import { resolveAiAssetUrl } from "@/services/aiGenerationService";

/** FR 3.7.6 video style templates and FR 3.7.7 async video jobs, charged in AI credit. */
export interface VideoStyle {
  id: string;
  name_vi: string;
  name_en: string;
  description_vi: string;
  description_en: string;
  aspect_ratio: "16:9" | "9:16";
  /** Swatch colour used until a real preview clip is uploaded. */
  accent: string;
  preview_url: string | null;
}

export type VideoStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

export interface VideoJob {
  jobId: string;
  status: VideoStatus;
  prompt: string;
  styleKey: string | null;
  ambassadorId: string | null;
  aspectRatio: "16:9" | "9:16";
  videoUrl: string | null;
  /** S3 key of the MP4, used to attach the video to a post. */
  s3Key: string | null;
  errorCode: string | null;
  refunded: boolean;
  createdAt: string;
  finishedAt: string | null;
}

const base = (workspaceId: string) => `/api/v1/workspaces/${workspaceId}/ai`;
const withAssetUrl = (job: VideoJob): VideoJob => ({
  ...job,
  videoUrl: job.videoUrl ? resolveAiAssetUrl(job.videoUrl) : null,
});

export const aiVideoService = {
  styles: async (workspaceId: string) =>
    (await api.get<{ data: VideoStyle[] }>(`${base(workspaceId)}/video-styles`))
      .data.data,
  generate: async (
    workspaceId: string,
    body: {
      prompt: string;
      styleKey?: string | null;
      ambassadorId?: string | null;
      aspectRatio: "16:9" | "9:16";
    },
  ) => {
    const data = (
      await api.post<{
        data: { job: VideoJob; creditsUsed: number; creditsRemaining: number };
      }>(`${base(workspaceId)}/videos`, body)
    ).data.data;
    return { ...data, job: withAssetUrl(data.job) };
  },
  status: async (workspaceId: string, jobId: string) =>
    withAssetUrl(
      (
        await api.get<{ data: VideoJob }>(
          `${base(workspaceId)}/videos/${encodeURIComponent(jobId)}`,
        )
      ).data.data,
    ),
  recent: async (workspaceId: string) =>
    (
      await api.get<{ data: VideoJob[] }>(`${base(workspaceId)}/videos`)
    ).data.data.map(withAssetUrl),
};
