export type MemberRole = "OWNER" | "CREATOR" | "VIEWER" | "CLIENT" | "ACCOUNT";

export interface WorkspaceSettings {
  timezone: string | null;
  defaultPlatforms: string[] | null;
  reportFrequency: string | null;
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
  userId: string;
  fullName: string | null;
  email: string | null;
  role: MemberRole;
  joinedAt: string | null;
  isActive: boolean;
}
