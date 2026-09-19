export type AgencyMemberRole = "OWNER" | "MEMBER";

export type AgencyStatus = "ACTIVE" | "SOFT_DELETED" | "INACTIVE";

export type InvitationStatus = "PENDING" | "ACCEPTED" | "EXPIRED" | "REVOKED";

export interface Agency {
  id: string;
  name: string;
  ownerId: string;
  logoUrl: string | null;
  description: string | null;
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
