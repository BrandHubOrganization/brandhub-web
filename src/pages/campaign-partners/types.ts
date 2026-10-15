export type CooperationStatus = "CONTACTED" | "NEGOTIATING" | "CONFIRMED" | "LIVE";
export type CollaboratorType = "NEWSPAPER" | "BANNER" | "TV" | "OTHER";
export interface CollaboratorOption {
  id: string;
  partnerName: string;
  partnerType: CollaboratorType;
}
export interface CampaignPartnerLink {
  id: string;
  mediaCampaignId: string;
  collaboratorId: string;
  cooperationStatus: CooperationStatus;
  updatedBy: string | null;
  updatedAt: string;
}
export interface CampaignPartner extends CampaignPartnerLink {
  partnerName: string;
  partnerType: CollaboratorType;
  updatedByName: string | null;
  partnerActive?: boolean;
}
export interface PartnerPage<T> {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
export interface CampaignPartnerContext {
  campaignId: string | null;
  campaignName: string | null;
  canEdit: boolean;
  partners: PartnerPage<CampaignPartner>;
}
export const COOPERATION_STATUSES: CooperationStatus[] = ["CONTACTED", "NEGOTIATING", "CONFIRMED", "LIVE"];
