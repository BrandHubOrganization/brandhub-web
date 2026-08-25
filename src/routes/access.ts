import type { SystemRole } from "@/types/user";
import type { MemberRole } from "@/types/workspace";

export type AccessRule = MemberRole[] | "ADMIN";

/**
 * Nguồn sự thật duy nhất role → route. "ADMIN" = chỉ SystemRole ADMIN.
 * MemberRole[] = các role workspace được phép (SystemRole ADMIN bỏ qua mọi check).
 * AuthGuard + Sidebar/Layout đọc chung.
 */
export const ROUTE_ACCESS: Record<string, AccessRule> = {
  "/dashboard": ["OWNER", "ACCOUNT", "CREATOR", "VIEWER", "CLIENT"],
  "/change-password": ["OWNER", "ACCOUNT", "CREATOR", "VIEWER", "CLIENT"],
  "/requests": ["OWNER", "ACCOUNT", "CREATOR", "CLIENT"],
  "/portal": ["OWNER", "ACCOUNT", "CLIENT"],
  "/library": ["OWNER", "ACCOUNT", "CREATOR", "VIEWER", "CLIENT"],
  "/editor": ["OWNER", "CREATOR"],
  "/templates": ["OWNER", "ACCOUNT", "CREATOR", "VIEWER"],
  "/hashtag-groups": ["OWNER", "ACCOUNT", "CREATOR", "VIEWER"],
  "/calendar": ["OWNER", "ACCOUNT", "CREATOR", "VIEWER", "CLIENT"],
  "/analytics": ["OWNER", "ACCOUNT"],
  "/clients": ["OWNER", "ACCOUNT"],
  "/workspace": ["OWNER"],
  "/invitations": ["OWNER", "ACCOUNT"],
  "/admin": "ADMIN",
};

const SORTED_KEYS = Object.keys(ROUTE_ACCESS).sort(
  (a, b) => b.length - a.length,
);

const MEMBERS_PAGE_ACCESS: AccessRule = ["OWNER", "ACCOUNT"];

/** Rule access cho pathname, hoặc null nếu không khai báo (mọi authenticated được phép). */
export function resolveAccessRule(pathname: string): AccessRule | null {
  if (/^\/workspaces\/[^/]+\/members$/.test(pathname)) {
    return MEMBERS_PAGE_ACCESS;
  }
  const key = SORTED_KEYS.find((k) => pathname === k || pathname.startsWith(k));
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
