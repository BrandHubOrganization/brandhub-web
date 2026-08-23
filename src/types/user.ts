export type SystemRole = "ADMIN" | "USER";

export interface User {
  id: string;
  name: string;
  email: string;
  role: SystemRole;
  workspaceId?: string;
  clientId?: string;
  avatar?: string;
  isActive?: boolean;
  lastLoginAt?: string;
  createdAt?: string;
}
