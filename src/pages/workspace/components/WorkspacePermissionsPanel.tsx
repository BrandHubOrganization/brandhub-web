import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Check, Minus, Shield, UserCog } from "lucide-react";
import type { MemberRole, WorkspaceMember } from "@/types/workspace";

interface Props {
  members: WorkspaceMember[];
}

const ROLES: MemberRole[] = ["OWNER", "CREATOR", "VIEWER", "CLIENT", "ACCOUNT"];

const PERMISSIONS = [
  { key: "publish", roles: ["OWNER", "ACCOUNT"] },
  { key: "approve", roles: ["OWNER"] },
  { key: "invite", roles: ["OWNER", "ACCOUNT"] },
  { key: "manageRoles", roles: ["OWNER"] },
  { key: "viewAnalytics", roles: ["OWNER", "CREATOR", "ACCOUNT", "CLIENT"] },
  { key: "editWorkspace", roles: ["OWNER"] },
] as const;

export function WorkspacePermissionsPanel({ members }: Props) {
  const { t } = useTranslation();
  const [roles, setRoles] = useState<Record<string, MemberRole>>(() =>
    Object.fromEntries(members.map((m) => [m.id, m.role])),
  );

  const handleRoleChange = (member: WorkspaceMember, role: MemberRole) => {
    setRoles((prev) => ({ ...prev, [member.id]: role }));
    toast.success(
      t("workspace.permissions.roleChanged", {
        name: member.fullName,
        role: t(`workspace.roles.${role}`),
      }),
    );
  };

  return (
    <div className="space-y-4">
      {/* Role management */}
      <div className="border-border bg-card rounded-xl border p-5">
        <div className="border-border flex items-center gap-2 border-b pb-3">
          <UserCog className="text-brand-orange size-5" />
          <h3 className="text-foreground text-sm font-semibold">
            {t("workspace.permissions.roleManagement")}
          </h3>
        </div>
        <div className="divide-border mt-3 divide-y">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between py-2.5"
            >
              <div className="space-y-0.5">
                <p className="text-foreground text-xs font-medium">
                  {member.fullName}
                </p>
                <p className="text-muted-foreground text-2xs">{member.email}</p>
              </div>
              <select
                value={roles[member.id]}
                disabled={roles[member.id] === "OWNER"}
                onChange={(e) =>
                  handleRoleChange(member, e.target.value as MemberRole)
                }
                className="border-border bg-card text-foreground cursor-pointer rounded-lg border px-2 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-50"
              >
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {t(`workspace.roles.${role}`)}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Permissions matrix */}
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
    </div>
  );
}
