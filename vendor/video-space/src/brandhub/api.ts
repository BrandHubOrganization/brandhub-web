import type { SerializedProject, MediaAssetData } from "@/services/storage/types";
import { getHostContext, getProjectApiBase, hostFetch } from "@/platform/host";

export const API_BASE = getProjectApiBase();

export interface SavedAsset {
  id: string;
  name: string;
  mime_type: string;
  sha256: string;
  metadata: MediaAssetData;
}

export interface RemoteProject {
  id: string;
  revision: number;
  updated_at: string;
  snapshot: SerializedProject;
  assets: SavedAsset[];
}

export interface ProjectSummary {
  id: string;
  name: string;
  revision: number;
  updated_at: string;
  thumbnail?: string;
}

export class VideoSpaceApiError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

export async function projectRequest<T>({ path, options }: { path: string; options?: RequestInit }): Promise<T> {
  const response = await hostFetch(path, options);
  const body: { data: T; detail?: unknown; message?: unknown } | null = await response.json().catch(() => null);
  if (!response.ok) {
    throw new VideoSpaceApiError(
      typeof body?.message === "string" ? body.message : typeof body?.detail === "string" ? body.detail :
        getHostContext().locale === "en" ? "Could not complete the Video Space request. Your local draft is retained." :
          "Chưa hoàn tất yêu cầu Video Space. Bản nháp trên máy được giữ nguyên.", response.status);
  }
  if (!body || !("data" in body)) throw new Error("Invalid Video Space response");
  return body.data;
}
