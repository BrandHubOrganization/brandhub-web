import { api } from "@/lib/axios";
import type {
  ApplyWatermarkRequest,
  BrandAssetItem,
  CreateWatermarkPresetRequest,
  MaterialItem,
  MaterialType,
  WatermarkPreset,
  MaterialUploadOptions,
  MaterialUploadSession,
} from "@/types/material";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const materialService = {
  async trash(workspaceId: string, page: number, search: string) {
    const response = await api.get<
      ApiResponse<MaterialItem[]> & { meta: { total: number } }
    >(`/api/v1/workspaces/${workspaceId}/materials`, {
      params: { deleted: true, page, size: 20, q: search },
    });
    return { items: response.data.data, total: response.data.meta.total };
  },

  async deleteMaterial(
    workspaceId: string,
    material: MaterialItem,
  ): Promise<MaterialItem> {
    const response = await api.delete<ApiResponse<MaterialItem>>(
      `/api/v1/workspaces/${workspaceId}/materials/${material.id}`,
      { params: { expectedVersion: material.version } },
    );
    return response.data.data;
  },

  async restoreMaterial(
    workspaceId: string,
    material: MaterialItem,
  ): Promise<MaterialItem> {
    const response = await api.post<ApiResponse<MaterialItem>>(
      `/api/v1/workspaces/${workspaceId}/materials/${material.id}/restore`,
      {},
      { params: { expectedVersion: material.version } },
    );
    return response.data.data;
  },
  async createUploadSession(
    workspaceId: string,
    file: File,
    options: MaterialUploadOptions,
    clientRequestId: string,
    signal: AbortSignal,
  ): Promise<MaterialUploadSession> {
    const response = await api.post<ApiResponse<MaterialUploadSession>>(
      `/api/v1/workspaces/${workspaceId}/materials/upload-session`,
      {
        ...options,
        context: "LIBRARY",
        filename: file.name,
        contentType: file.type,
        fileSize: file.size,
        clientRequestId,
      },
      { signal },
    );
    return response.data.data;
  },

  async confirmUploadSession(
    workspaceId: string,
    sessionId: string,
    signal: AbortSignal,
  ): Promise<MaterialItem> {
    const response = await api.post<ApiResponse<MaterialItem>>(
      `/api/v1/workspaces/${workspaceId}/materials/upload-session/confirm`,
      { sessionId },
      { signal },
    );
    return response.data.data;
  },
  async applyWatermark(
    workspaceId: string,
    materialId: string,
    data: ApplyWatermarkRequest,
  ): Promise<MaterialItem> {
    const response = await api.post<ApiResponse<MaterialItem>>(
      `/api/v1/workspaces/${workspaceId}/materials/${materialId}/watermark`,
      data,
    );
    return response.data.data;
  },

  async list(
    workspaceId: string,
    type?: MaterialType,
    search?: string,
  ): Promise<MaterialItem[]> {
    const response = await api.get<ApiResponse<MaterialItem[]>>(
      `/api/v1/workspaces/${workspaceId}/materials`,
      {
        params: { type, search },
      },
    );
    return response.data.data;
  },

  async get(workspaceId: string, materialId: string): Promise<MaterialItem> {
    const response = await api.get<ApiResponse<MaterialItem>>(
      `/api/v1/workspaces/${workspaceId}/materials/${materialId}`,
    );
    return response.data.data;
  },

  async listBrandAssets(workspaceId: string): Promise<BrandAssetItem[]> {
    const response = await api.get<ApiResponse<BrandAssetItem[]>>(
      `/api/v1/workspaces/${workspaceId}/materials/brand-assets`,
    );
    return response.data.data;
  },

  async upload(workspaceId: string, file: File): Promise<MaterialItem> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post<ApiResponse<MaterialItem>>(
      `/api/v1/workspaces/${workspaceId}/materials`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data.data;
  },

  async listPresets(
    workspaceId: string,
    clientProfileId?: string,
  ): Promise<WatermarkPreset[]> {
    const response = await api.get<ApiResponse<WatermarkPreset[]>>(
      `/api/v1/workspaces/${workspaceId}/watermark-presets`,
      { params: { clientProfileId } },
    );
    return response.data.data;
  },

  async createPreset(
    workspaceId: string,
    data: CreateWatermarkPresetRequest,
  ): Promise<WatermarkPreset> {
    const response = await api.post<ApiResponse<WatermarkPreset>>(
      `/api/v1/workspaces/${workspaceId}/watermark-presets`,
      data,
    );
    return response.data.data;
  },

  async setDefaultPreset(
    workspaceId: string,
    presetId: string,
  ): Promise<WatermarkPreset> {
    const response = await api.put<ApiResponse<WatermarkPreset>>(
      `/api/v1/workspaces/${workspaceId}/watermark-presets/${presetId}/set-default`,
    );
    return response.data.data;
  },

  async deletePreset(workspaceId: string, presetId: string): Promise<void> {
    await api.delete(
      `/api/v1/workspaces/${workspaceId}/watermark-presets/${presetId}`,
    );
  },
};
