import { api } from "./api";
import type { ApiResponse } from "./authService";
import type {
  Agency,
  AgencyCategory,
  AgencyInvitation,
  AgencyMember,
  CompanySize,
} from "@/types/agency";
import type { MemberRole } from "@/types/workspace";

export interface CreateAgencyRequest {
  name: string;
  logoUrl?: string;
  description?: string;
  category?: AgencyCategory;
  companySize?: CompanySize;
  website?: string;
  phone?: string;
  location?: string;
  brandColor?: string;
  logoIcon?: string;
  tagline?: string;
  foundedYear?: number;
  facebookUrl?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
}

export interface InviteAgencyMemberRequest {
  email: string;
  inviteeName?: string;
  note?: string;
  workspaceId?: string;
  role?: MemberRole;
  expiryDays?: number;
}

export const agencyService = {
  list: () => api.get<ApiResponse<Agency[]>>("/api/v1/agencies"),

  create: (data: CreateAgencyRequest) =>
    api.post<ApiResponse<Agency>>("/api/v1/agencies", data),

  getById: (agencyId: string) =>
    api.get<ApiResponse<Agency>>(`/api/v1/agencies/${agencyId}`),

  update: (agencyId: string, data: CreateAgencyRequest) =>
    api.put<ApiResponse<Agency>>(`/api/v1/agencies/${agencyId}`, data),

  remove: (agencyId: string) =>
    api.delete<ApiResponse<void>>(`/api/v1/agencies/${agencyId}`),

  listMembers: (agencyId: string) =>
    api.get<ApiResponse<AgencyMember[]>>(
      `/api/v1/agencies/${agencyId}/members`,
    ),

  inviteMember: (agencyId: string, data: InviteAgencyMemberRequest) =>
    api.post<ApiResponse<AgencyInvitation>>(
      `/api/v1/agencies/${agencyId}/invitations`,
      data,
    ),

  listInvitations: (agencyId: string) =>
    api.get<ApiResponse<AgencyInvitation[]>>(
      `/api/v1/agencies/${agencyId}/invitations`,
    ),

  removeMember: (agencyId: string, memberId: string) =>
    api.delete<ApiResponse<void>>(
      `/api/v1/agencies/${agencyId}/members/${memberId}`,
    ),

  cancelInvitation: (agencyId: string, invitationId: string) =>
    api.delete<ApiResponse<void>>(
      `/api/v1/agencies/${agencyId}/invitations/${invitationId}`,
    ),

  acceptInvitation: (token: string) =>
    api.post<ApiResponse<AgencyMember>>("/api/v1/agencies/invitations/accept", {
      token,
    }),

  declineInvitation: (token: string) =>
    api.post<ApiResponse<void>>("/api/v1/agencies/invitations/decline", {
      token,
    }),

  listMyPendingInvitations: () =>
    api.get<ApiResponse<AgencyInvitation[]>>(
      "/api/v1/agencies/invitations/my-pending",
    ),

  uploadLogo: (agencyId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post<ApiResponse<Agency>>(
      `/api/v1/agencies/${agencyId}/logo`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
  },
};
