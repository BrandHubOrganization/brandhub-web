import { api } from "./api";
import type { ApiResponse } from "./authService";
import type { MemberRole, Workspace, WorkspaceMember } from "@/types/workspace";

export interface CreateWorkspaceRequest {
  name: string;
  industry?: string;
}

export interface UpdateWorkspaceSettingsRequest {
  name?: string;
  timezone?: string;
  defaultPlatforms?: string[];
  reportFrequency?: string;
}

export interface InviteMemberRequest {
  email: string;
  role: MemberRole;
}

export const workspaceService = {
  list: () => api.get<ApiResponse<Workspace[]>>("/api/v1/workspaces"),

  create: (data: CreateWorkspaceRequest) =>
    api.post<ApiResponse<Workspace>>("/api/v1/workspaces", data),

  getById: (workspaceId: string) =>
    api.get<ApiResponse<Workspace>>(`/api/v1/workspaces/${workspaceId}`),

  updateSettings: (workspaceId: string, data: UpdateWorkspaceSettingsRequest) =>
    api.patch<ApiResponse<Workspace>>(
      `/api/v1/workspaces/${workspaceId}/settings`,
      data,
    ),

  listMembers: (workspaceId: string) =>
    api.get<ApiResponse<WorkspaceMember[]>>(
      `/api/v1/workspaces/${workspaceId}/members`,
    ),

  inviteMember: (workspaceId: string, data: InviteMemberRequest) =>
    api.post<ApiResponse<void>>(
      `/api/v1/workspaces/${workspaceId}/members/invite`,
      data,
    ),

  removeMember: (workspaceId: string, memberId: string) =>
    api.delete<ApiResponse<void>>(
      `/api/v1/workspaces/${workspaceId}/members/${memberId}`,
    ),
};
