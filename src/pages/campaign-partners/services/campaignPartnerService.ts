import { api } from "@/services/api";
import type { ApiResponse } from "@/services/authService";
import type {
  CampaignPartner,
  CampaignPartnerContext,
  CampaignPartnerLink,
  CollaboratorOption,
  CooperationStatus,
  PartnerPage,
} from "../types";

const base = (workspaceId: string) => `/api/v1/workspaces/${workspaceId}`;

export const campaignPartnerService = {
  list: (workspaceId: string, page: number, size = 20) =>
    api.get<ApiResponse<CampaignPartnerContext>>(
      `${base(workspaceId)}/campaign-collaborators`,
      { params: { page, size } },
    ),
  options: (workspaceId: string, page: number, size = 50) =>
    api.get<ApiResponse<PartnerPage<CollaboratorOption>>>(
      `${base(workspaceId)}/collaborators`,
      { params: { page, size } },
    ),
  assign: (workspaceId: string, campaignId: string, collaboratorId: string) =>
    api.post<ApiResponse<CampaignPartnerLink>>(
      `${base(workspaceId)}/campaigns/${campaignId}/collaborators`,
      { collaboratorId },
    ),
  update: (
    workspaceId: string,
    partner: CampaignPartner,
    cooperationStatus: CooperationStatus,
  ) =>
    api.put<ApiResponse<CampaignPartnerLink>>(
      `${base(workspaceId)}/campaigns/${partner.mediaCampaignId}/collaborators/${partner.id}`,
      { cooperationStatus, expectedUpdatedAt: partner.updatedAt },
    ),
  unlink: (workspaceId: string, campaignId: string, linkId: string) =>
    api.delete<void>(
      `${base(workspaceId)}/campaigns/${campaignId}/collaborators/${linkId}`,
    ),
};
