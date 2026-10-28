import { api } from "@/lib/axios";
import { requireApiData } from "@/lib/apiData";
import type { ApiResponse } from "@/services/authService";
import type { ModerationResult } from "@/types/moderation";

export async function checkCaption(
  workspaceId: string,
  text: string,
  signal?: AbortSignal,
) {
  const response = await api.post<ApiResponse<ModerationResult>>(
    `/api/v1/workspaces/${encodeURIComponent(workspaceId)}/ai/captions/moderate`,
    { text },
    { signal },
  );
  const result = requireApiData<ModerationResult>(response.data);
  if (
    !result ||
    !["PASSED", "WARNING", "BLOCKED", "NOT_CHECKED"].includes(result.status) ||
    !Array.isArray(result.issues) ||
    result.issues.some(
      (issue) =>
        !issue ||
        typeof issue.code !== "string" ||
        typeof issue.message !== "string" ||
        typeof issue.excerpt !== "string",
    )
  ) {
    throw new Error("INVALID_MODERATION_RESPONSE");
  }
  return result;
}
