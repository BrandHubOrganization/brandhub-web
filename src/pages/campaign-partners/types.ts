export type CooperationStatus = "CONTACTED" | "NEGOTIATING" | "CONFIRMED" | "LIVE";
export type CollaboratorType = "NEWSPAPER" | "BANNER" | "TV" | "OTHER";

export interface PartnerContactInfo {
  contactName?: string;
  email?: string;
  phone?: string;
  website?: string;
}

export function parsePartnerContactInfo(
  raw: PartnerContactInfo | Record<string, unknown> | string | null | undefined,
): PartnerContactInfo {
  if (!raw) return {};
  let parsed: Record<string, unknown> | null = null;
  if (typeof raw === "string") {
    try {
      const value = JSON.parse(raw);
      if (value && typeof value === "object" && !Array.isArray(value)) {
        parsed = value as Record<string, unknown>;
      }
    } catch {
      return {};
    }
  } else if (typeof raw === "object" && !Array.isArray(raw)) {
    parsed = raw as Record<string, unknown>;
  }
  if (!parsed) return {};
  return {
    contactName: typeof parsed.contactName === "string" ? parsed.contactName.trim() : "",
    email: typeof parsed.email === "string" ? parsed.email.trim() : "",
    phone: typeof parsed.phone === "string" ? parsed.phone.trim() : "",
    website: typeof parsed.website === "string" ? parsed.website.trim() : "",
  };
}

export interface CollaboratorOption {
  id: string;
  partnerName: string;
  partnerType: CollaboratorType;
  contactInfo?: PartnerContactInfo | string | null;
  notes?: string | null;
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
  contactInfo?: PartnerContactInfo | string | null;
  notes?: string | null;
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
export const COOPERATION_STATUSES: CooperationStatus[] = [
  "CONTACTED",
  "NEGOTIATING",
  "CONFIRMED",
  "LIVE",
];
