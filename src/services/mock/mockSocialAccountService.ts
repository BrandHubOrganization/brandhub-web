import type { Platform } from "@/types/post";
import type { SocialAccount } from "@/pages/social-accounts/types/socialAccount";

const MOCK_ACCOUNTS: SocialAccount[] = [
  {
    id: "acc-1",
    platform: "FACEBOOK",
    accountName: "BrandHub Official",
    accountHandle: "@brandhub.official",
    status: "CONNECTED",
    tokenExpiresAt: "2026-11-20T00:00:00Z",
    connectedAt: "2026-05-02T00:00:00Z",
    rateLimitUsed: 45,
    rateLimitMax: 100,
  },
  {
    id: "acc-2",
    platform: "INSTAGRAM",
    accountName: "BrandHub",
    accountHandle: "@brandhub",
    status: "CONNECTED",
    tokenExpiresAt: "2026-09-10T00:00:00Z",
    connectedAt: "2026-05-02T00:00:00Z",
    rateLimitUsed: 12,
    rateLimitMax: 50,
  },
  {
    id: "acc-3",
    platform: "TIKTOK",
    accountName: "BrandHub Vietnam",
    accountHandle: "@brandhub.vn",
    status: "EXPIRED",
    tokenExpiresAt: "2026-08-01T00:00:00Z",
    connectedAt: "2026-03-14T00:00:00Z",
  },
  {
    id: "acc-4",
    platform: "THREADS",
    accountName: "BrandHub",
    accountHandle: "@brandhub",
    status: "DISCONNECTED",
    connectedAt: "2026-02-01T00:00:00Z",
  },
  {
    id: "acc-5",
    platform: "ZALO_OA",
    accountName: "BrandHub OA",
    accountHandle: "brandhub-oa",
    status: "CONNECTED",
    tokenExpiresAt: "2026-12-01T00:00:00Z",
    connectedAt: "2026-06-20T00:00:00Z",
    rateLimitUsed: 8,
    rateLimitMax: 20,
  },
  {
    id: "acc-6",
    platform: "YOUTUBE",
    accountName: "BrandHub Channel",
    accountHandle: "@brandhubchannel",
    status: "EXPIRED",
    tokenExpiresAt: "2026-07-15T00:00:00Z",
    connectedAt: "2026-01-10T00:00:00Z",
  },
];

export async function getSocialAccounts(): Promise<SocialAccount[]> {
  return Promise.resolve(MOCK_ACCOUNTS.map((a) => ({ ...a })));
}

export async function connectAccount(
  platform: Platform,
): Promise<SocialAccount> {
  const newAccount: SocialAccount = {
    id: `acc-${Date.now()}`,
    platform,
    accountName: "BrandHub",
    accountHandle: `@brandhub.${platform.toLowerCase()}`,
    status: "CONNECTED",
    tokenExpiresAt: new Date(
      Date.now() + 90 * 24 * 60 * 60 * 1000,
    ).toISOString(),
    connectedAt: new Date().toISOString(),
    rateLimitUsed: 0,
    rateLimitMax: 100,
  };
  MOCK_ACCOUNTS.push(newAccount);
  return Promise.resolve({ ...newAccount });
}

export async function disconnectAccount(id: string): Promise<void> {
  const account = MOCK_ACCOUNTS.find((a) => a.id === id);
  if (account) account.status = "DISCONNECTED";
  return Promise.resolve();
}

export async function refreshToken(id: string): Promise<SocialAccount> {
  const account = MOCK_ACCOUNTS.find((a) => a.id === id);
  if (!account) throw new Error("Account not found");
  account.status = "CONNECTED";
  account.tokenExpiresAt = new Date(
    Date.now() + 90 * 24 * 60 * 60 * 1000,
  ).toISOString();
  return Promise.resolve({ ...account });
}
