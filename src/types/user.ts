export type UserRole = "ADMIN" | "AGENCY_OWNER" | "ACCOUNT_MANAGER" | "CONTENT_CREATOR" | "BRAND_CLIENT" | "GUEST";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  workspaceId?: string;
  clientId?: string;
  avatar?: string;
  isActive?: boolean;
  lastLoginAt?: string;
  createdAt?: string;
}
