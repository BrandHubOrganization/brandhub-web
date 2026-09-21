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
  | "SIZE_1_10"
  | "SIZE_11_50"
  | "SIZE_51_200"
  | "SIZE_201_500"
  | "SIZE_500_PLUS";

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
  status: AgencyStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AgencyMember {
  id: string;
  agencyId: string;
  userId: string;
  fullName: string | null;
  email: string | null;
  role: AgencyMemberRole;
  joinedAt: string;
}

export interface AgencyInvitation {
  id: string;
  agencyId: string;
  agencyName: string | null;
  invitedEmail: string;
  invitedBy: string;
  token: string;
  status: InvitationStatus;
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
}
