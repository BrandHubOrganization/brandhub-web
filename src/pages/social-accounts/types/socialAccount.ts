import type { Platform } from "@/types/post";

export type SocialAccountStatus = "CONNECTED" | "EXPIRED" | "DISCONNECTED";

export interface SocialAccount {
  id: string;
  platform: Platform;
  accountName: string;
  accountHandle: string;
  avatarUrl?: string;
  status: SocialAccountStatus;
  tokenExpiresAt?: string;
  connectedAt: string;
  rateLimitUsed?: number;
  rateLimitMax?: number;
}
