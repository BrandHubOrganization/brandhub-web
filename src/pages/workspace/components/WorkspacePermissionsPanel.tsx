import { useTranslation } from "react-i18next";
import { Check, Minus, Shield } from "lucide-react";
import type { MemberRole, WorkspaceMember } from "@/types/workspace";

interface Props {
  workspaceId?: string;
  members?: WorkspaceMember[];
  onChanged?: () => void;
  currentRole?: MemberRole;
  currentUserId?: string | null;
}

const ROLES: MemberRole[] = ["OWNER", "MANAGER", "CREATOR", "CLIENT"];

const PERMISSIONS = [
  { key: "publish", roles: ["CREATOR"] },
  { key: "approve", roles: ["OWNER", "MANAGER"] },
  { key: "invite", roles: ["OWNER", "MANAGER"] },
  { key: "manageRoles", roles: ["OWNER", "MANAGER"] },
  { key: "viewAnalytics", roles: ["OWNER", "MANAGER"] },
  { key: "editWorkspace", roles: ["OWNER"] },
] as const;

export function WorkspacePermissionsPanel(_props: Props = {}) {
  const { t } = useTranslation();

  return (
    <div className="border-border bg-card overflow-hidden rounded-xl border">
      <div className="border-border flex items-center gap-2 border-b p-4">
        <Shield className="text-brand-orange size-5" />
        <h3 className="text-foreground text-sm font-semibold">
          {t("workspace.permissions.matrixTitle")}
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-border bg-muted/20 border-b">
              <th className="text-muted-foreground px-4 py-2.5 font-semibold">
                {t("workspace.permissions.permission")}
              </th>
              {ROLES.map((role) => (
                <th
                  key={role}
                  className="text-muted-foreground px-3 py-2.5 text-center font-semibold"
                >
                  {t(`workspace.roles.${role}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERMISSIONS.map((perm) => (
              <tr key={perm.key} className="border-border border-b">
                <td className="text-foreground px-4 py-2.5 font-medium">
                  {t(`workspace.permissions.perms.${perm.key}`)}
                </td>
                {ROLES.map((role) => (
                  <td key={role} className="px-3 py-2.5 text-center">
                    {(perm.roles as readonly string[]).includes(role) ? (
                      <Check className="text-brand-orange mx-auto size-4" />
                    ) : (
                      <Minus className="text-muted-foreground/40 mx-auto size-4" />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}