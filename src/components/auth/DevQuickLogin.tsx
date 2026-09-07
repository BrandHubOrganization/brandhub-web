import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FlaskConical } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import type { SystemRole, User } from "@/types/user";
import type { MemberRole, Workspace } from "@/types/workspace";

interface QuickRole {
  systemRole: SystemRole;
  memberRole: MemberRole | null;
  labelKey: string;
}

const QUICK_ROLES: QuickRole[] = [
  { systemRole: "ADMIN", memberRole: null, labelKey: "nav.admin" },
  {
    systemRole: "USER",
    memberRole: "OWNER",
    labelKey: "workspace.roles.OWNER",
  },
  {
    systemRole: "USER",
    memberRole: "MANAGER",
    labelKey: "workspace.roles.MANAGER",
  },
  {
    systemRole: "USER",
    memberRole: "ACCOUNT",
    labelKey: "workspace.roles.ACCOUNT",
  },
  {
    systemRole: "USER",
    memberRole: "CREATOR",
    labelKey: "workspace.roles.CREATOR",
  },
  {
    systemRole: "USER",
    memberRole: "CLIENT",
    labelKey: "workspace.roles.CLIENT",
  },
];

const DEV_WORKSPACE: Workspace = {
  id: "dev-ws-1",
  name: "Dev Workspace",
  slug: "dev-workspace",
  ownerId: "dev-owner",
  logoUrl: null,
  settings: {
    industry: null,
    timezone: null,
    defaultPlatforms: null,
    reportFrequency: null,
  },
  isActive: true,
  createdAt: new Date().toISOString(),
};

export function DevQuickLogin() {
  if (!import.meta.env.DEV) return null;

  const { t } = useTranslation();
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const setSystemRole = useAuthStore((s) => s.setSystemRole);
  const setCurrentWorkspace = useWorkspaceStore((s) => s.setCurrentWorkspace);
  const setWorkspaceList = useWorkspaceStore((s) => s.setWorkspaceList);
  const setCurrentMemberRole = useWorkspaceStore((s) => s.setCurrentMemberRole);

  function handleQuickLogin(quick: QuickRole) {
    const devUser: User = {
      id: `dev-${quick.memberRole ?? "admin"}`,
      name: `Dev ${t(quick.labelKey)}`,
      email: `dev-${(quick.memberRole ?? "admin").toLowerCase()}@brandhub.dev`,
      role: quick.systemRole,
      workspaceId: DEV_WORKSPACE.id,
    };
    setAuth(devUser, `dev-token-${devUser.id}`);
    setSystemRole(quick.systemRole);
    setWorkspaceList(quick.memberRole ? [DEV_WORKSPACE] : []);
    setCurrentWorkspace(quick.memberRole ? DEV_WORKSPACE : null);
    setCurrentMemberRole(quick.memberRole);
    navigate("/dashboard");
  }

  return (
    <div className="border-border mt-6 rounded-xl border border-dashed p-3">
      <div className="text-muted-foreground text-2xs mb-2 flex items-center gap-1.5 font-semibold">
        <FlaskConical className="size-3.5" />
        {t("auth.login.devQuickLoginLabel")}
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {QUICK_ROLES.map((quick) => (
          <button
            key={quick.memberRole ?? quick.systemRole}
            type="button"
            onClick={() => handleQuickLogin(quick)}
            className="border-border hover:bg-accent hover:text-accent-foreground text-2xs cursor-pointer rounded-lg border px-2 py-1.5 font-medium transition-colors"
          >
            {t(quick.labelKey)}
          </button>
        ))}
      </div>
    </div>
  );
}

export default DevQuickLogin;
