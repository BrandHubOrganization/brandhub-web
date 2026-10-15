import type { CollaboratorType, PartnerPage } from "@/pages/campaign-partners/types";
export type { CollaboratorType, PartnerPage };
export const PARTNER_TYPES: CollaboratorType[] = ["NEWSPAPER", "BANNER", "TV", "OTHER"];
export interface DirectoryPartner {
  id: string;
  agencyId: string;
  partnerName: string;
  partnerType: CollaboratorType;
  contactInfo: Record<string, unknown>;
  notes: string | null;
  isActive: boolean;
  firstUsedAt: string | null;
  usageHistoryVerified: boolean;
  version: number;
  canDelete: boolean;
  deleteBlockedReason: "USED" | "HISTORY_UNVERIFIED" | null;
}
export interface PartnerFields {
  partnerName: string;
  partnerType: CollaboratorType;
  contactInfo: Record<string, unknown>;
  notes: string;
}
