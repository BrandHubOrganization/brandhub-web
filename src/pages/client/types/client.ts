import type { Platform } from "@/types/post";

export type PackageTier = "FREE" | "STARTER" | "GROWTH" | "ENTERPRISE";
export type ClientStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

export interface ServicePackage {
  packageTier: PackageTier;
  monthlyPostQuota: number;
  platforms: Platform[];
  aiCreditsPerMonth?: number;
  expiryDate?: string;
}

export interface LinkedSocialAccount {
  id: string;
  platform: Platform;
  accountName: string;
  accountHandle: string;
  avatarUrl?: string;
  isConnected: boolean;
}

export interface ContentRequest {
  id: string;
  title: string;
  status: "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "PUBLISHED" | "REJECTED";
  authorName: string;
  createdAt: string;
}

export interface ClientAnalyticsSummary {
  totalPosts: number;
  publishedPosts: number;
  activeRequests: number;
  engagementRate: number;
}

export interface Client {
  id: string;
  workspaceId: string;
  name: string;
  logoUrl?: string;
  industry?: string;
  contactEmail: string;
  contactPhone?: string;
  assignedAccountManagerId?: string;
  assignedAccountManagerName?: string;
  assignedAccountManagerAvatar?: string;
  activePostsCount: number;
  servicePackage: ServicePackage;
  status: ClientStatus;
  linkedAccounts?: LinkedSocialAccount[];
  contentRequests?: ContentRequest[];
  analyticsSummary?: ClientAnalyticsSummary;
  contacts?: ClientContact[];
  preferences?: ClientPreferences;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateClientDTO {
  name: string;
  logoUrl?: string;
  industry?: string;
  contactEmail: string;
  assignedAccountManagerId?: string;
  packageTier: PackageTier;
  allowedPlatforms?: Platform[];
}

export interface UpdateServicePackageDTO {
  packageTier: PackageTier;
  monthlyPostLimit: number;
  allowedPlatforms?: Platform[];
  aiCreditsPerMonth?: number;
  expiryDate?: string;
}

export type ClientContactRole =
  "MARKETING_LEAD" | "APPROVER" | "FINANCE" | "LEGAL";

export interface ClientContact {
  id: string;
  name: string;
  email: string;
  role: ClientContactRole;
  canApproveContent: boolean;
}

export interface ClientPreferences {
  notifyOnNewRequest: boolean;
  notifyOnPublish: boolean;
  requireClientApprovalBeforePublish: boolean;
  preferredLanguage: "vi" | "en";
}

export interface UpdateClientSettingsDTO {
  contacts: ClientContact[];
  preferences: ClientPreferences;
}

export interface ClientListParams {
  workspaceId?: string;
  page?: number;
  size?: number;
  search?: string;
  platform?: string;
}
