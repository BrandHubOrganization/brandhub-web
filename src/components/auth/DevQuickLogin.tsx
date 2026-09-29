import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FlaskConical } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore, type SystemRole, type User } from "@/store/authStore";
import { authService } from "@/services/authService";
import { extractErrorMessage } from "@/utils/error";

/**
 * Dev-only quick login — real accounts seeded by DataSeeder (profile=seed,
 * see brandhub-business-service/.../seed/README.md), all password
 * "Password123". Picked for cross-linked data: each covers a different
 * workspace role so a dev can see real data immediately without memorizing
 * credentials. Calls the real /auth/login + /users/me endpoints, same as
 * the manual login form — not a fake/bypassed session.
 */
const QUICK_LOGIN_ACCOUNTS = [
  { email: "admin@brandhub.dev", labelKey: "nav.admin" },
  { email: "user177@hotmail.com", labelKey: "workspace.roles.OWNER" }, // owns 2 agencies (Agency.ownerId) — AgencySeeder.PINNED_OWNER_USER_INDEX pins this user as owner of the first 2 seeded agencies every reseed, no longer random
  // WorkspaceSeeder always makes the workspace creator = the agency owner
  // = the seeded MANAGER, so myRole normally resolves to "OWNER" (owner
  // precedence in WorkspaceServiceImpl.listMyWorkspaces) even for a
  // MANAGER row — WorkspaceSeeder.seedWorkspaceMembers special-cases the
  // FIRST seeded workspace to give users[1] (first regular user, always
  // "user1@...") a genuine non-owner MANAGER row so this button is
  // reachable in seed data.
  {
    email: "user1@gmail.com",
    labelKey: "workspace.roles.MANAGER",
    landingPath: "/workspaces/23dce5be-d3e1-40e4-b604-d90ccb1b1ce1/dashboard",
  },
  { email: "user1@gmail.com", labelKey: "workspace.roles.CREATOR" }, // same account also holds CREATOR at another workspace — realistic multi-role user
  // CLIENT is never a WorkspaceMember.userId row (only clientProfileId —
  // see WorkspaceSeeder.seedWorkspaceMembers) — a client user has no
  // "/workspaces" list to land on, they view via client-profile instead.
  {
    email: "user59@gmail.com",
    labelKey: "workspace.roles.CLIENT",
    clientProfileAgencyId: "3bd5e94e-ccba-4b24-9840-24f246e8975e",
  },
] as const;

const DEV_PASSWORD = "Password123";

export function DevQuickLogin() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loadingKey, setLoadingKey] = React.useState<string | null>(null);

  if (!import.meta.env.DEV) return null;

  async function handleQuickLogin(
    key: string,
    email: string,
    clientProfileAgencyId?: string,
    landingPath?: string,
  ) {
    setLoadingKey(key);
    try {
      const res = await authService.login({
        identifier: email,
        password: DEV_PASSWORD,
      });
      const { accessToken } = res.data.data;

      useAuthStore.getState().setTokens(accessToken, null);
      const profileRes = await authService.getProfile();
      const profile = profileRes.data.data;
      if (!profile) throw new Error("Profile load failed");

      const user: User = {
        id: profile.userId,
        name: profile.fullName || email,
        email: profile.email,
        role: profile.role as SystemRole,
        workspaceId: profile.workspaceId,
        avatar: profile.avatarUrl,
      };
      setAuth(user, accessToken);
      if (user.role === "ADMIN") {
        navigate("/admin");
      } else if (clientProfileAgencyId) {
        navigate("/client-profiles");
      } else if (landingPath) {
        navigate(landingPath);
      } else {
        navigate("/agency");
      }
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, "Quick login failed"));
    } finally {
      setLoadingKey(null);
    }
  }

  return (
    <div className="border-border mt-6 rounded-xl border border-dashed p-3">
      <div className="text-muted-foreground text-2xs mb-2 flex items-center gap-1.5 font-semibold">
        <FlaskConical className="size-3.5" />
        {t("auth.login.devQuickLoginLabel")}
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {QUICK_LOGIN_ACCOUNTS.map((account, idx) => {
          const key = `${account.email}-${account.labelKey}-${idx}`;
          return (
            <button
              key={key}
              type="button"
              disabled={loadingKey !== null}
              onClick={() =>
                handleQuickLogin(
                  key,
                  account.email,
                  "clientProfileAgencyId" in account
                    ? account.clientProfileAgencyId
                    : undefined,
                  "landingPath" in account ? account.landingPath : undefined,
                )
              }
              className="border-border hover:bg-accent hover:text-accent-foreground text-2xs cursor-pointer rounded-lg border px-2 py-1.5 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingKey === key ? "..." : t(account.labelKey)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default DevQuickLogin;
