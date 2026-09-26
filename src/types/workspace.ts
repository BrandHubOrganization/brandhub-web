import type { CompanySize } from "@/types/agency";

export type { CompanySize };

export type MemberRole = "OWNER" | "MANAGER" | "CREATOR" | "CLIENT";

export type WorkspaceIndustry =
  | "FNB"
  | "FASHION"
  | "BEAUTY"
  | "TECHNOLOGY"
  | "REAL_ESTATE"
  | "EDUCATION"
  | "HEALTHCARE"
  | "SERVICES"
  | "RETAIL"
  | "OTHER";

export type ReportFrequency = "WEEKLY" | "MONTHLY";

export interface WorkspaceSettings {
  industry: WorkspaceIndustry | null;
  timezone: string | null;
  defaultPlatforms: string[] | null;
  reportFrequency: ReportFrequency | null;
}

export interface Workspace {
  id: string;
  name: string;
  agencyId: string | null;
  slug: string;
  ownerId: string;
  logoUrl: string | null;
  settings: WorkspaceSettings;
  industry: WorkspaceIndustry | null;
  companySize: CompanySize | null;
  website: string | null;
  phone: string | null;
  location: string | null;
  description: string | null;
  brandColor: string | null;
  logoIcon: string | null;
  tagline: string | null;
  foundedYear: number | null;
  facebookUrl: string | null;
  linkedinUrl: string | null;
  instagramUrl: string | null;
  isActive: boolean;
  createdAt: string;
  /** Vai trò của người dùng hiện tại trong workspace này — chỉ có ở
   * GET /workspaces (list-mine); null ở các endpoint khác. */
  myRole: MemberRole | null;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string | null;
  fullName: string | null;
  email: string | null;
  clientProfileId: string | null;
  role: MemberRole;
  joinedAt: string | null;
  isActive: boolean;
}

export interface AuditLogEntry {
  id: number;
  userId: string;
  userFullName: string | null;
  action: string;
  resourceType: string;
  resourceId: string | null;
  createdAt: string;
}

export interface ManagedAuditLogEntry extends AuditLogEntry {
  workspaceId: string;
  workspaceName: string;
}

export interface ManagedWorkspace {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  role: MemberRole;
  memberCount: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface WorkspaceInvitation {
  id: string;
  workspaceId: string;
  workspaceName: string | null;
  role: MemberRole;
  invitedByName: string | null;
  expiresAt: string;
  token: string;
}

export interface WorkspaceDashboard {
  workspace: Workspace;
  totalActiveMembers: number;
  membersByRole: Record<string, number>;
  totalCampaigns: number;
  campaignsByStatus: Record<string, number>;
  packageNegotiationStatus: string | null;
  agencyId: string;
  aiCreditMonth: string;
  agencyAiCreditsUsedThisMonth: number;
}

export interface WorkspaceTemplate {
  id: string;
  agencyId: string;
  name: string;
  sourceWorkspaceId: string | null;
  configSnapshot: string;
  createdBy: string;
  createdAt: string;
}
