import { api } from "./api";
import type { ApiResponse } from "./authService";
import type {
  CompanySize,
  ManagedWorkspace,
  MemberRole,
  ReportFrequency,
  Workspace,
  WorkspaceDashboard,
  WorkspaceIndustry,
  WorkspaceInvitation,
  WorkspaceMember,
} from "@/types/workspace";

export interface AssignEntry {
  userId: string;
  role: MemberRole;
}

export interface CreateWorkspaceRequest {
  name: string;
  agencyId: string;
  industry?: WorkspaceIndustry;
  companySize?: CompanySize;
  website?: string;
  phone?: string;
  location?: string;
  description?: string;
  brandColor?: string;
  logoIcon?: string;
  tagline?: string;
  foundedYear?: number;
  facebookUrl?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
  assignMembers?: AssignEntry[];
}

export interface UpdateWorkspaceSettingsRequest {
  name?: string;
  timezone?: string;
  defaultPlatforms?: string[];
  reportFrequency?: ReportFrequency;
  industry?: WorkspaceIndustry;
  companySize?: CompanySize;
  website?: string;
  phone?: string;
  location?: string;
}

export interface InviteMemberRequest {
  email: string;
  role: MemberRole;
  note?: string;
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

  assignMembers: (workspaceId: string, members: AssignEntry[]) =>
    api.post<ApiResponse<WorkspaceMember[]>>(
      `/api/v1/workspaces/${workspaceId}/members/assign`,
      { members },
    ),

  removeMember: (workspaceId: string, memberId: string) =>
    api.delete<ApiResponse<void>>(
      `/api/v1/workspaces/${workspaceId}/members/${memberId}`,
    ),

  updateMemberRole: (workspaceId: string, memberId: string, role: MemberRole) =>
    api.patch<ApiResponse<WorkspaceMember>>(
      `/api/v1/workspaces/${workspaceId}/members/${memberId}/role`,
      { role },
    ),

  leaveWorkspace: (workspaceId: string) =>
    api.delete<ApiResponse<void>>(`/api/v1/workspaces/${workspaceId}/leave`),

  addClient: (workspaceId: string, clientProfileId: string) =>
    api.post<ApiResponse<WorkspaceMember>>(
      `/api/v1/workspaces/${workspaceId}/clients`,
      { clientProfileId },
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

  listManagedWorkspaces: () =>
    api.get<ApiResponse<ManagedWorkspace[]>>("/api/v1/workspaces/my-managed"),

  listMyPendingInvitations: () =>
    api.get<ApiResponse<WorkspaceInvitation[]>>(
      "/api/v1/workspaces/invitations/my-pending",
    ),

  declineInvitation: (token: string) =>
    api.post<ApiResponse<void>>("/api/v1/workspaces/invitations/decline", {
      token,
    }),

  deleteWorkspace: (workspaceId: string) =>
    api.delete<ApiResponse<void>>(`/api/v1/workspaces/${workspaceId}`),

  restoreWorkspace: (workspaceId: string) =>
    api.post<ApiResponse<Workspace>>(
      `/api/v1/workspaces/${workspaceId}/restore`,
    ),

  getDashboard: (workspaceId: string) =>
    api.get<ApiResponse<WorkspaceDashboard>>(
      `/api/v1/workspaces/${workspaceId}/dashboard`,
    ),
};
