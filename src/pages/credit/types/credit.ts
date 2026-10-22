export const CREDIT_OPERATIONS = [
  "CONTENT_GENERATE",
  "AMBASSADOR_GENERATE",
  "COMMERCIAL_IMAGE",
  "VIDEO_GENERATE",
] as const;
export type CreditOperation =
  | (typeof CREDIT_OPERATIONS)[number]
  | "CAPTION_VARIANTS"
  | "HASHTAG_GENERATE"
  | "CHARACTER_SHEET";
export interface CreditPolicy {
  agencyId: string;
  defaultMemberLimit: number | null;
  revision: number;
}
export interface MemberCreditLimit {
  agencyId: string;
  userId: string;
  effectiveLimit: number | null;
  source:
    | "OVERRIDE"
    | "AGENCY_DEFAULT"
    | "SYSTEM_DEFAULT"
    | "UNCONFIGURED"
    | "OWNER_UNLIMITED";
  revision: number;
}
export interface CreditPrice {
  operation: CreditOperation;
  revision: number;
  unitCredits: number;
  enabled: boolean;
  createdAt: string;
}

export interface CreditBalance {
  agencyId: string;
  planAvailable: number;
  purchasedAvailable: number;
  held: number;
  developmentAvailable?: number;
  otherAvailable?: number;
}
export interface CreditBreakdown {
  operation: CreditOperation;
  successfulUnits: number;
  charged: number;
  held: number;
}
export interface CreditUsage {
  agencyId: string;
  userId: string;
  limit: number | null;
  used: number;
  held: number;
  periodStart: string;
  periodEnd: string;
  byOperation: CreditBreakdown[];
}
export interface WorkspaceCredit {
  agencyId: string;
  workspaceId: string;
  workspaceName: string;
  cap: number | null;
  revision: number;
  used: number;
  held: number;
  periodStart: string;
  periodEnd: string;
}
