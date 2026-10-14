import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FlaskConical } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore, type SystemRole, type User } from "@/store/authStore";
import { authService } from "@/services/authService";
import { extractErrorMessage } from "@/utils/error";
import { workspaceService } from "@/services/workspaceService";
import type { MemberRole } from "@/types/workspace";

/**
 * Real development accounts from the bulk seed or dev-quick-login.sql.
 * See the business service seed README; development password: Password123.
 * Authenticate normally, then select a workspace using the API's actual role.
 */
const QUICK_LOGIN_ACCOUNTS = [
  { email: "admin@brandhub.dev", labelKey: "nav.admin" },
  { email: "user177@hotmail.com", labelKey: "workspace.roles.OWNER" },
  // A user can be Manager and Creator in different workspaces.
  {
    email: "user1@gmail.com",
    labelKey: "workspace.roles.MANAGER",
    workspaceRole: "MANAGER",
  },
  {
    email: "user1@gmail.com",
    labelKey: "workspace.roles.CREATOR",
    workspaceRole: "CREATOR",
  },
  // Clients choose their brand profile before opening an assigned workspace.
  {
    email: "user59@gmail.com",
    labelKey: "workspace.roles.CLIENT",
    landingPath: "/client-profiles",
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
    landingPath?: string,
    workspaceRole?: MemberRole,
  ) {
    setLoadingKey(key);
    try {
      const res = await authService.login({
        identifier: email,
        password: DEV_PASSWORD,
      });
      const loginData = res.data.data;
      if (loginData.requireTwoFactor && loginData.twoFactorToken) {
        sessionStorage.setItem("brandhub-2fa-token", loginData.twoFactorToken);
        navigate("/2fa-verify");
        return;
      }
      const { accessToken, refreshToken } = loginData;

      useAuthStore.getState().setTokens(accessToken, refreshToken || null);
      const profileRes = await authService.getProfile();
      const profile = profileRes.data.data;
      if (!profile) throw new Error(t("auth.login.profileLoadFailed"));

      const user: User = {
        id: profile.userId,
        name: profile.fullName || email,
        email: profile.email,
        role: profile.role as SystemRole,
        workspaceId: profile.workspaceId,
        avatar: profile.avatarUrl,
      };
      setAuth(user, accessToken, refreshToken);
      if (user.role === "ADMIN") {
        navigate("/admin");
      } else if (workspaceRole) {
        const { data } = await workspaceService.list();
        const workspace = data.data.find(
          (item) => item.myRole === workspaceRole,
        );
        if (workspace) navigate(`/workspaces/${workspace.id}/dashboard`);
        else {
          toast.info(t("auth.login.devWorkspaceMissing"));
          navigate("/agency");
        }
      } else if (landingPath) {
        navigate(landingPath);
      } else {
        navigate("/agency");
      }
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, t("auth.login.errorDefault")));
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
                  "landingPath" in account ? account.landingPath : undefined,
                  "workspaceRole" in account
                    ? account.workspaceRole
                    : undefined,
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
