import type { Platform } from "@/types/post";

export type SocialAccountStatus =
  | "CONNECTED"
  | "ACTIVE"
  | "EXPIRED"
  | "REVOKED"
  | "DISCONNECTED";

export interface SocialAccount {
  id: string;
  platform: Platform;
  accountName: string;
  accountHandle: string;
  avatarUrl?: string;
  status: SocialAccountStatus;
  tokenExpiresAt?: string;
  connectedAt?: string;
  rateLimitUsed?: number;
  rateLimitMax?: number;
}

export interface SocialAccountStatusResponse {
  id?: string;
  platformAccountId: string;
  platform: string;
  accountName: string;
  accountHandle?: string;
  avatarUrl?: string;
  status?: string;
  tokenExpiresAt?: string;
  connectedAt?: string;
  rateLimitUsed?: number;
  rateLimitMax?: number;
}