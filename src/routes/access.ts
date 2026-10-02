import type { SystemRole } from "@/types/user";
import type { MemberRole } from "@/types/workspace";

export type AccessRule = MemberRole[] | "ADMIN";

/**
 * Nguồn sự thật duy nhất role → route. "ADMIN" = chỉ SystemRole ADMIN.
 * MemberRole[] = các role workspace được phép (SystemRole ADMIN bỏ qua mọi check).
 * AuthGuard + Sidebar/Layout đọc chung.
 */
export const ROUTE_ACCESS: Record<string, AccessRule> = {
  "/social-accounts": ["OWNER", "MANAGER", "CLIENT"],
  "/subscription/plans": ["OWNER"],
  "/subscription/checkout": ["OWNER"],
  "/subscription/invoices": ["OWNER"],
  "/clients": ["OWNER", "MANAGER"],
  "/analytics": ["OWNER", "MANAGER"],
  "/reports": ["OWNER", "MANAGER"],
  "/invitations": ["OWNER", "MANAGER"],
  "/requests": ["MANAGER", "CREATOR", "CLIENT"],
  "/portal": ["MANAGER", "CLIENT"],
  "/client-profile": ["CLIENT"],
  "/calendar": ["MANAGER", "CREATOR", "CLIENT"],
  "/library": ["MANAGER", "CREATOR", "CLIENT"],
  "/editor": ["MANAGER", "CREATOR"],
  "/content-writing": ["CREATOR"],
  "/templates": ["MANAGER", "CREATOR"],
  "/hashtag-groups": ["MANAGER", "CREATOR"],
  "/publish": ["MANAGER", "CREATOR"],
  "/ai-studio": ["MANAGER", "CREATOR"],
  "/admin": "ADMIN",
};

const SORTED_KEYS = Object.keys(ROUTE_ACCESS).sort(
  (a, b) => b.length - a.length,
);

const MEMBERS_PAGE_ACCESS: AccessRule = ["OWNER", "MANAGER"];
const WORKSPACE_SETTINGS_ACCESS: AccessRule = ["OWNER", "MANAGER"];
const SOCIAL_ACCOUNTS_ACCESS: AccessRule = ["OWNER", "MANAGER", "CLIENT"];

/** Rule access cho pathname, hoặc null nếu không khai báo (mọi authenticated được phép). */
export function resolveAccessRule(pathname: string): AccessRule | null {
  if (/^\/workspaces\/[^/]+\/members$/.test(pathname)) {
    return MEMBERS_PAGE_ACCESS;
  }
  if (/^\/workspaces\/[^/]+\/settings$/.test(pathname)) {
    return WORKSPACE_SETTINGS_ACCESS;
  }
  if (/^\/workspaces\/[^/]+\/social-accounts$/.test(pathname)) {
    return SOCIAL_ACCOUNTS_ACCESS;
  }
  const stripped = pathname.replace(/^\/workspaces\/[^/]+/, "") || "/";
  // Boundary-aware: "/workspace" không được nuốt "/workspaces/*".
  const key = SORTED_KEYS.find(
    (k) => stripped === k || stripped.startsWith(k + "/"),
  );
  return key ? ROUTE_ACCESS[key] : null;
}

export function canAccess(
  pathname: string,
  systemRole: SystemRole | null,
  memberRole: MemberRole | null,
): boolean {
  const rule = resolveAccessRule(pathname);
  if (!rule) return true;
  if (systemRole === "ADMIN") return true;
  if (rule === "ADMIN") return false;
  return memberRole !== null && rule.includes(memberRole);
}
