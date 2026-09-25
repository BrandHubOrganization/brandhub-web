import { api } from "./api";
import type { ApiResponse } from "./authService";
import type { WorkspaceTemplate } from "@/types/workspace";

export interface SaveWorkspaceTemplateRequest {
  name: string;
  sourceWorkspaceId?: string;
  configSnapshot: string;
}

export const workspaceTemplateService = {
  save: (data: SaveWorkspaceTemplateRequest) =>
    api.post<ApiResponse<WorkspaceTemplate>>(
      "/api/v1/workspace-templates",
      data,
    ),

  list: () =>
    api.get<ApiResponse<WorkspaceTemplate[]>>("/api/v1/workspace-templates"),

  getById: (templateId: string) =>
    api.get<ApiResponse<WorkspaceTemplate>>(
      `/api/v1/workspace-templates/${templateId}`,
    ),

  remove: (templateId: string) =>
    api.delete<ApiResponse<void>>(`/api/v1/workspace-templates/${templateId}`),
};
