import { api } from "./api";
import type { ApiResponse } from "./authService";
import type {
  Workspace,
  WorkspaceTemplate,
  WorkspaceTemplateConfig,
} from "@/types/workspace";

export interface SaveWorkspaceTemplateRequest {
  name: string;
  sourceWorkspaceId?: string;
  config: WorkspaceTemplateConfig;
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

  applyToWorkspace: (templateId: string, workspaceId: string) =>
    api.post<ApiResponse<Workspace>>(
      `/api/v1/workspace-templates/${templateId}/apply/${workspaceId}`,
    ),

  listAll: () =>
    api.get<ApiResponse<WorkspaceTemplate[]>>(
      "/api/v1/admin/workspace-templates",
    ),

  saveGlobal: (data: SaveWorkspaceTemplateRequest) =>
    api.post<ApiResponse<WorkspaceTemplate>>(
      "/api/v1/workspace-templates/global",
      data,
    ),
};
