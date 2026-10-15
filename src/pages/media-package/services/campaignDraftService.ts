import { api } from "@/services/api";
import type { ApiResponse } from "@/services/authService";

export interface Allocation { deliverableId: string; quantity: number }
export interface CampaignDraft {
  id: string; name: string; status: string; allocationPeriod: string | null;
  allocations: Allocation[]; packageTermsVersion: number | null;
}
export interface CreateDraft {
  workspaceMediaPackageId: string; name: string; period?: string; allocations: Allocation[];
}
export const campaignDraftService = {
  list: (workspaceId: string) => api.get<ApiResponse<CampaignDraft[]>>(
    `/api/v1/media-campaigns/workspaces/${workspaceId}`),
  create: (request: CreateDraft) => api.post<ApiResponse<CampaignDraft>>("/api/v1/media-campaigns", request),
};
