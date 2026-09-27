import type { MemberRole } from "@/types/workspace";

export type AgencyMemberRole = "OWNER" | "MEMBER";

export type AgencyStatus = "ACTIVE" | "SOFT_DELETED" | "INACTIVE";

export type InvitationStatus = "PENDING" | "ACCEPTED" | "EXPIRED" | "REVOKED";

export type AgencyCategory =
  | "MARKETING"
  | "FNB"
  | "FASHION"
  | "BEAUTY"
  | "TECHNOLOGY"
  | "REAL_ESTATE"
  | "EDUCATION"
  | "HEALTHCARE"
  | "RETAIL"
  | "FINANCE"
  | "ENTERTAINMENT"
  | "OTHER";

export type CompanySize =
  "SIZE_1_10" | "SIZE_11_50" | "SIZE_51_200" | "SIZE_201_500" | "SIZE_500_PLUS";

export interface Agency {
  id: string;
  name: string;
  ownerId: string;
  logoUrl: string | null;
  description: string | null;
  category: AgencyCategory | null;
  companySize: CompanySize | null;
  website: string | null;
  phone: string | null;
  location: string | null;
  brandColor: string | null;
  logoIcon: string | null;
  tagline: string | null;
  foundedYear: number | null;
  facebookUrl: string | null;
  linkedinUrl: string | null;
  instagramUrl: string | null;
  status: AgencyStatus;
  createdAt: string;
  updatedAt: string;
  /** Role của currentUser trong agency này (OWNER/MEMBER) — null nếu response
   * không tính theo currentUser context. Dùng để hiện đúng menu quản lý
   * trước khi chọn workspace, thay vì suy luận qua ownerId. */
  myRole: AgencyMemberRole | null;
}

export interface AgencyMember {
  id: string;
  agencyId: string;
  userId: string;
  fullName: string | null;
  email: string | null;
  avatarUrl: string | null;
  role: AgencyMemberRole;
  joinedAt: string;
}

export interface MonthCount {
  month: string;
  count: number;
}

export type AuditAction =
  | "LOGIN"
  | "LOGOUT"
  | "TOKEN_REFRESH"
  | "PASSWORD_RESET"
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "ROLE_CHANGE"
  | "PERMISSION_CHANGE";

export interface AgencyMemberActivity {
  id: number;
  userId: string;
  userFullName: string | null;
  action: AuditAction;
  resourceType: string;
  resourceId: string | null;
  createdAt: string;
}

export interface AgencyStatsResponse {
  memberCount: number;
  workspaceCount: number;
  membersByRole: Record<string, number>;
  workspacesByIndustry: Record<string, number>;
  contentByStatus: Record<string, number>;
  memberGrowthByMonth: MonthCount[];
  postsPublishedByMonth: MonthCount[];
}

export interface AgencyInvitation {
  id: string;
  agencyId: string;
  agencyName: string | null;
  invitedEmail: string;
  invitedBy: string;
  token: string;
  note: string | null;
  workspaceId: string | null;
  workspaceName: string | null;
  role: MemberRole | null;
  status: InvitationStatus;
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
}
