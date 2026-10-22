import { api } from "@/lib/axios";
import { requireApiData } from "@/lib/apiData";
import { postAiWithCredit, refreshAiCredit } from "@/services/aiCreditRequest";
import { useAuthStore } from "@/store/authStore";
import type { ApiResponse } from "@/services/authService";
import type {
  CaptionAdaptRequest,
  CaptionDraftResult,
  CaptionRefineRequest,
  WorkspaceAiBalance,
  WorkspaceCaptionRequest,
  WorkspaceCaptionResult,
  WorkspaceVideoJob,
  WorkspaceVideoRequest,
  WorkspaceVideoStarted,
} from "@/types/workspaceAi";

const prefix = (workspaceId: string) =>
  `/api/v1/workspaces/${encodeURIComponent(workspaceId)}/ai`;

async function generate<T>(
  workspaceId: string,
  action: string,
  payload: unknown,
) {
  const response = await postAiWithCredit<ApiResponse<T>>(
    `${prefix(workspaceId)}/${action}`,
    payload,
  );
  return requireApiData<T>(response.data);
}

/** Workspace adapters share DA-974; mock Studio screens are deliberately not connected here. */
export const workspaceAiService = {
  captions: (workspaceId: string, request: WorkspaceCaptionRequest) =>
    generate<WorkspaceCaptionResult>(workspaceId, "captions", request),
  refine: (workspaceId: string, request: CaptionRefineRequest) =>
    generate<CaptionDraftResult>(workspaceId, "captions/refine", request),
  adapt: (workspaceId: string, request: CaptionAdaptRequest) =>
    generate<CaptionDraftResult>(workspaceId, "captions/adapt", request),
  video: (workspaceId: string, request: WorkspaceVideoRequest) =>
    generate<WorkspaceVideoStarted>(workspaceId, "videos", request),
  async balance(workspaceId: string) {
    const response = await api.get<ApiResponse<WorkspaceAiBalance>>(
      `${prefix(workspaceId)}/credits`,
    );
    return requireApiData<WorkspaceAiBalance>(response.data);
  },
  async videoStatus(workspaceId: string, jobId: string) {
    const userId = useAuthStore.getState().user?.id;
    const response = await api.get<ApiResponse<WorkspaceVideoJob>>(
      `${prefix(workspaceId)}/videos/${encodeURIComponent(jobId)}`,
    );
    const job = requireApiData<WorkspaceVideoJob>(response.data);
    if (job.status === "COMPLETED" || job.status === "FAILED")
      refreshAiCredit(userId);
    return job;
  },
  async recentVideos(workspaceId: string) {
    const response = await api.get<ApiResponse<WorkspaceVideoJob[]>>(
      `${prefix(workspaceId)}/videos`,
    );
    return requireApiData<WorkspaceVideoJob[]>(response.data);
  },
};
