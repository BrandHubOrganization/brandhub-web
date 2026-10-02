export type MediaPackageType = "BY_DURATION" | "BY_BUDGET" | "FULL_DELEGATION";

export type PackageNegotiationStatus =
  "DRAFT" | "CLIENT_REQUESTED_CHANGE" | "AGENCY_COUNTERED" | "APPROVED";

export interface MediaPackage {
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
  workspaceId: string;
  mediaPackage: MediaPackage;
  negotiationStatus: PackageNegotiationStatus;
  finalTerms: Record<string, unknown>;
  termsVersion: number;
  approvedByAgencyAt: string | null;
  approvedByClientAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomMediaPackageRequest {
  sourceTemplateId?: string;
  name: string;
  type: MediaPackageType;
  durationWeeks?: number;
  budgetAmount?: number;
  scopeDescription?: string;
}

export interface SelectMediaPackageResponse {
  workspaceMediaPackageId: string;
}
