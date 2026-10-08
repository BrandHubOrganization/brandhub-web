export type MediaPackageType = "BY_DURATION" | "BY_BUDGET" | "FULL_DELEGATION";

export type OfferingModel = "CAMPAIGN" | "RETAINER" | "DELIVERABLE_BUNDLE";
export type PackageServiceType = "SOCIAL_POST" | "EVENT_PLANNING" | "LIVESTREAM_PREPARATION"
  | "PRESS_RECOMMENDATION" | "WORKSHOP_SUPPORT";
export interface PackageDeliverable {
  id: string;
  serviceType: PackageServiceType;
  name: string;
  quantity: number;
  unit: string;
  description?: string;
  acceptanceCriteria?: string;
  revisionLimit?: number;
}
export interface PackageOfferingDetails { maxChanges?: number | null; deliverables: PackageDeliverable[] }
export interface OfferingFields {
  offeringModel?: OfferingModel | null;
  offeringDetails?: PackageOfferingDetails | null;
}

export type PackageNegotiationStatus =
  "DRAFT" | "CLIENT_REQUESTED_CHANGE" | "AGENCY_COUNTERED" | "APPROVED";

export interface MediaPackage extends OfferingFields {
  id: string;
  name: string;
  type: MediaPackageType;
  durationWeeks: number | null;
  budgetAmount: number | null;
  scopeDescription: string | null;
  isTemplate: boolean;
  agencyId: string | null;
  sourceTemplateId: string | null;
  availableToWorkspaces: boolean;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceMediaPackage {
  workspaceMediaPackageId: string;
  id?: string;
  workspaceId: string;
  mediaPackage: MediaPackage;
  negotiationStatus: PackageNegotiationStatus;
  finalTerms: Record<string, unknown>;
  previousTerms?: Record<string, unknown> | null;
  termsVersion: number;
  clientProposalCount: number;
  approvedByAgencyAt: string | null;
  approvedByClientAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomMediaPackageRequest extends OfferingFields {
  sourceTemplateId?: string;
  workspaceId?: string;
  name: string;
  type: MediaPackageType;
  durationWeeks?: number;
  budgetAmount?: number;
  scopeDescription?: string;
}

export interface NegotiateTermsRequest extends OfferingFields {
  budgetAmount?: number;
  durationWeeks?: number;
  scopeDescription?: string;
}

export interface SelectMediaPackageResponse {
  workspaceMediaPackageId: string;
}
