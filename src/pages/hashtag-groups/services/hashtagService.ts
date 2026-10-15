import { isAxiosError } from "axios";
import { api } from "@/services/api";
import type { ApiResponse } from "@/services/authService";
import type {
  CreateHashtag,
  HashtagEntry,
  HashtagFilter,
  HashtagPage,
  HashtagCampaign,
} from "@/pages/hashtag-groups/types/hashtag";

export async function listHashtags(
  workspaceId: string,
  filter: HashtagFilter,
  signal: AbortSignal,
) {
  const { data } = await api.get<ApiResponse<HashtagPage>>(
    `/api/v1/workspaces/${workspaceId}/hashtags`,
    {
      signal,
      params: {
        ...filter,
        purpose: filter.purpose || undefined,
        isRequired: filter.isRequired,
        size: 20,
      },
    },
  );
  return data.data;
}
export async function addHashtag(workspaceId: string, payload: CreateHashtag) {
  const { data } = await api.post<ApiResponse<HashtagEntry>>(
    `/api/v1/workspaces/${workspaceId}/hashtags`,
    payload,
  );
  return data.data;
}
export async function getHashtag(workspaceId: string, hashtagId: string) {
  const { data } = await api.get<ApiResponse<HashtagEntry>>(
    `/api/v1/workspaces/${workspaceId}/hashtags/${hashtagId}`,
  );
  return data.data;
}
export async function listHashtagCampaigns(workspaceId: string, signal: AbortSignal) {
  const { data } = await api.get<ApiResponse<HashtagCampaign[]>>(
    `/api/v1/media-campaigns/workspaces/${workspaceId}`,
    { signal },
  );
  return data.data;
}
export async function removeHashtag(workspaceId: string, hashtagId: string, expectedVersion: number) {
  await api.delete<ApiResponse<null>>(
    `/api/v1/workspaces/${workspaceId}/hashtags/${hashtagId}`,
    { params: { expectedVersion } },
  );
}
export function hashtagErrorKey(
  error: unknown,
  fallback: "loadError" | "saveError" | "removeError",
) {
  if (!isAxiosError<ApiResponse<unknown>>(error)) return fallback;
  if ([401, 403].includes(error.response?.status ?? 0)) return "denied";
  const code = error.response?.data.error?.code;
  if (code === "HASHTAG_ALREADY_EXISTS") return "duplicate";
  if (code === "HASHTAG_CHANGED") return "changed";
  if (code === "HASHTAG_ALREADY_REMOVED") return "alreadyRemoved";
  if (code === "HASHTAG_NOT_FOUND") return "notFound";
  if (error.response?.status === 400) return "invalid";
  return fallback;
}
