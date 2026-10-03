import { api } from "@/lib/axios";
import type { Platform } from "@/types/post";
import type {
  SocialAccount,
  SocialAccountStatus,
  SocialAccountStatusResponse,
} from "../types/socialAccount";

// URL của API Gateway (mặc định http://localhost:8080)
const GATEWAY_API_URL =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_BASE_URL) ||
  "http://localhost:8080";

export function buildOAuthConnectUrl(
  platform: Platform,
  workspaceId: string,
  clientId?: string,
): string {
  const normalizedPlatform = platform.toLowerCase();
  const effectiveClientId = clientId || "default-client";
  // Route qua Gateway :8080 -> publisher-service :8083
  return `${GATEWAY_API_URL}/api/v1/social/${normalizedPlatform}/connect?workspaceId=${encodeURIComponent(
    workspaceId,
  )}&clientId=${encodeURIComponent(effectiveClientId)}`;
}

export async function fetchSocialAccounts(
  workspaceId: string,
): Promise<SocialAccount[]> {
  try {
    // Gọi qua API Gateway với Axios apiClient (tự động đính kèm JWT Bearer Token)
    const response = await api.get<{
      success: boolean;
      data: SocialAccountStatusResponse[];
    }>("/api/v1/social-accounts", {
      params: { workspaceId },
    });

    const data = response.data?.data || [];

    const normalizeStatus = (rawStatus?: string): SocialAccountStatus => {
      const upper = (rawStatus || "").toUpperCase();
      if (upper === "ACTIVE" || upper === "CONNECTED") return "CONNECTED";
      if (upper === "EXPIRED") return "EXPIRED";
      if (upper === "REVOKED") return "REVOKED";
      return "DISCONNECTED";
    };

    return data.map((item) => ({
      id: item.id || item.platformAccountId || `acc-${item.platform}-${Date.now()}`,
      platform: item.platform.toUpperCase() as Platform,
      accountName: item.accountName || `${item.platform} Account`,
      accountHandle: item.accountHandle || `@${item.platform.toLowerCase()}`,
      avatarUrl: item.avatarUrl,
      status: normalizeStatus(item.status),
      tokenExpiresAt: item.tokenExpiresAt,
      connectedAt: item.connectedAt || new Date().toISOString(),
      rateLimitUsed: item.rateLimitUsed,
      rateLimitMax: item.rateLimitMax,
    }));
  } catch (err) {
    console.warn("Could not load social accounts from gateway:", err);
    return [];
  }
}

export async function disconnectSocialAccount(
  accountId: string,
  workspaceId?: string,
): Promise<void> {
  await api.delete(`/api/v1/social-accounts/${accountId}`, {
    params: { workspaceId },
  });
}
