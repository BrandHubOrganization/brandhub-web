import { api } from "@/lib/axios";
import type {
  ApplyWatermarkRequest,
  BrandAssetItem,
  MaterialItem,
  MaterialType,
} from "@/types/material";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const materialService = {
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
};
