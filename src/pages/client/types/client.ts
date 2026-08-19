import type { Platform } from "@/types/post";

export type PackageTier = "STARTER" | "GROWTH" | "ENTERPRISE";
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

export interface ClientListParams {
  workspaceId?: string;
  page?: number;
  size?: number;
  search?: string;
  platform?: string;
}
