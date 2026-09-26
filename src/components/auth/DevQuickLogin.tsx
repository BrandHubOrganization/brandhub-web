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
  { email: "user317@gmail.com", labelKey: "workspace.roles.MANAGER" }, // 11 workspaces
  { email: "user1@gmail.com", labelKey: "workspace.roles.CREATOR" }, // 1 workspace, myRole=CREATOR (verified, not lost among OWNER agencies)
  // CLIENT is never a WorkspaceMember.userId row (only clientProfileId —
  // see WorkspaceSeeder.seedWorkspaceMembers) — a client user has no
  // "/workspaces" list to land on, they view via client-profile instead.
  {
    email: "user4@gmail.com",
    labelKey: "workspace.roles.CLIENT",
    clientProfileAgencyId: "ccbaf388-e756-448e-ae6c-697ce31cc67d",
  },
] as const;

const DEV_PASSWORD = "Password123";

export function DevQuickLogin() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loadingEmail, setLoadingEmail] = React.useState<string | null>(null);

  if (!import.meta.env.DEV) return null;

  async function handleQuickLogin(
    email: string,
    clientProfileAgencyId?: string,
  ) {
    setLoadingEmail(email);
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
        navigate(`/client-profile?agencyId=${clientProfileAgencyId}`);
      } else {
        navigate("/dashboard");
      }
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, "Quick login failed"));
    } finally {
      setLoadingEmail(null);
    }
  }

  return (
    <div className="border-border mt-6 rounded-xl border border-dashed p-3">
      <div className="text-muted-foreground text-2xs mb-2 flex items-center gap-1.5 font-semibold">
        <FlaskConical className="size-3.5" />
        {t("auth.login.devQuickLoginLabel")}
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {QUICK_LOGIN_ACCOUNTS.map((account) => (
          <button
            key={account.email}
            type="button"
            disabled={loadingEmail !== null}
            onClick={() =>
              handleQuickLogin(
                account.email,
                "clientProfileAgencyId" in account
                  ? account.clientProfileAgencyId
                  : undefined,
              )
            }
            className="border-border hover:bg-accent hover:text-accent-foreground text-2xs cursor-pointer rounded-lg border px-2 py-1.5 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loadingEmail === account.email ? "..." : t(account.labelKey)}
          </button>
        ))}
      </div>
    </div>
  );
}

export default DevQuickLogin;
