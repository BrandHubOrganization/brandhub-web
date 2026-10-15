import { api } from "@/services/api";
import type { ApiResponse } from "@/services/authService";
import type { Campaign, CampaignPlan, CampaignReviewEvent, CampaignVersion,
  CampaignDeployment, CampaignTask } from "@/pages/campaign/types";

const base = (workspaceId: string) => `/api/v1/workspaces/${workspaceId}/campaigns`;
export const campaignService = {
  list: (workspaceId: string) => api.get<ApiResponse<Campaign[]>>(base(workspaceId)),
  create: (workspaceId: string, plan: CampaignPlan) => api.post<ApiResponse<Campaign>>(base(workspaceId), plan),
  update: (workspaceId: string, campaign: Campaign, plan: CampaignPlan) =>
    api.patch<ApiResponse<Campaign>>(`${base(workspaceId)}/${campaign.id}`,
      { ...plan, expectedVersion: campaign.contentVersion }),
  feedback: (workspaceId: string, campaign: Campaign, comment: string) =>
    api.post<ApiResponse<CampaignReviewEvent>>(`${base(workspaceId)}/${campaign.id}/feedback`,
      { contentVersion: campaign.contentVersion, comment }),
  events: (workspaceId: string, campaignId: string) =>
    api.get<ApiResponse<CampaignReviewEvent[]>>(`${base(workspaceId)}/${campaignId}/feedback`),
  versions: (workspaceId: string, campaignId: string) =>
    api.get<ApiResponse<CampaignVersion[]>>(`${base(workspaceId)}/${campaignId}/versions`),
  approve: (workspaceId: string, campaign: Campaign) =>
    api.post<ApiResponse<Campaign>>(`${base(workspaceId)}/${campaign.id}/approve`,
      { expectedVersion: campaign.contentVersion }),
  deploy: (workspaceId: string, campaign: Campaign) =>
    api.post<ApiResponse<CampaignDeployment>>(`${base(workspaceId)}/${campaign.id}/deploy`,
      { expectedVersion: campaign.contentVersion }),
  deployment: (workspaceId: string, campaignId: string) =>
    api.get<ApiResponse<CampaignDeployment>>(`${base(workspaceId)}/${campaignId}/deployment`),
  tasks: (workspaceId: string, campaignId: string) =>
    api.get<ApiResponse<CampaignTask[]>>(`${base(workspaceId)}/${campaignId}/tasks`),
  complete: (workspaceId: string, campaign: Campaign, reason: string) =>
    api.post<ApiResponse<Campaign>>(`${base(workspaceId)}/${campaign.id}/complete`,
      { expectedVersion: campaign.contentVersion, reason }),
};
