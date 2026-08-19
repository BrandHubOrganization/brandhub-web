export type MemberRole = "OWNER" | "CREATOR" | "VIEWER" | "CLIENT" | "ACCOUNT";

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
  slug: string;
  ownerId: string;
  logoUrl: string | null;
  settings: WorkspaceSettings;
  isActive: boolean;
  createdAt: string;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  fullName: string | null;
  email: string | null;
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
