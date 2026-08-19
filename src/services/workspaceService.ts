import { api } from "./api";
import type { ApiResponse } from "./authService";
import type {
  AuditLogEntry,
  ManagedAuditLogEntry,
  ManagedWorkspace,
  MemberRole,
  PageResponse,
  ReportFrequency,
  Workspace,
  WorkspaceIndustry,
  WorkspaceInvitation,
  WorkspaceMember,
} from "@/types/workspace";

export interface CreateWorkspaceRequest {
  name: string;
  industry?: WorkspaceIndustry;
}

export interface UpdateWorkspaceSettingsRequest {
  name?: string;
  timezone?: string;
  defaultPlatforms?: string[];
  reportFrequency?: ReportFrequency;
}

export interface InviteMemberRequest {
  email: string;
  role: MemberRole;
}

export interface AcceptInvitationRequest {
  token: string;
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

  uploadLogo: (workspaceId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post<ApiResponse<Workspace>>(
      `/api/v1/workspaces/${workspaceId}/logo`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
  },

  acceptInvitation: (data: AcceptInvitationRequest) =>
    api.post<ApiResponse<WorkspaceMember>>(
      "/api/v1/workspaces/invitations/accept",
      data,
    ),

  listAuditLogs: (workspaceId: string, page = 0, size = 20) =>
    api.get<ApiResponse<PageResponse<AuditLogEntry>>>(
      `/api/v1/workspaces/${workspaceId}/audit-logs`,
      { params: { page, size } },
    ),

  listManagedWorkspaces: () =>
    api.get<ApiResponse<ManagedWorkspace[]>>("/api/v1/workspaces/my-managed"),

  listManagedAuditLogs: (page = 0, size = 20) =>
    api.get<ApiResponse<PageResponse<ManagedAuditLogEntry>>>(
      "/api/v1/workspaces/my-managed/audit-logs",
      { params: { page, size } },
    ),

  listMyPendingInvitations: () =>
    api.get<ApiResponse<WorkspaceInvitation[]>>(
      "/api/v1/workspaces/invitations/my-pending",
    ),

  declineInvitation: (token: string) =>
    api.post<ApiResponse<void>>("/api/v1/workspaces/invitations/decline", {
      token,
    }),
};
