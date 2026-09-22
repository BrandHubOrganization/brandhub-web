import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Select } from "@/components/ui/select";
import { agencyService } from "@/services/agencyService";
import type { AgencyMember } from "@/types/agency";
import type { AssignEntry } from "@/services/workspaceService";
import type { MemberRole } from "@/types/workspace";

const ASSIGNABLE_ROLES: MemberRole[] = ["MANAGER", "CREATOR"];

interface Props {
  agencyId: string;
  value: AssignEntry[];
  onChange: (value: AssignEntry[]) => void;
}

export function AssignMemberPicker({ agencyId, value, onChange }: Props) {
  const { t } = useTranslation();
  const [members, setMembers] = useState<AgencyMember[]>([]);

  useEffect(() => {
    agencyService
      .listMembers(agencyId)
      .then(({ data }) => setMembers(data.data));
  }, [agencyId]);

  const toggle = (userId: string) => {
    const existing = value.find((v) => v.userId === userId);
    if (existing) {
      onChange(value.filter((v) => v.userId !== userId));
    } else {
      onChange([...value, { userId, role: "CREATOR" }]);
    }
  };

  const setRole = (userId: string, role: MemberRole) => {
    onChange(value.map((v) => (v.userId === userId ? { ...v, role } : v)));
  };

  if (members.length === 0) return null;

  return (
    <div className="border-border flex flex-col gap-2 rounded-lg border p-3">
      {members.map((m) => {
        const entry = value.find((v) => v.userId === m.userId);
        return (
          <div key={m.id} className="flex items-center gap-2.5">
            <input
              type="checkbox"
              checked={!!entry}
              onChange={() => toggle(m.userId)}
              className="accent-brand-orange size-4 cursor-pointer"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {m.fullName || m.email}
              </p>
              <p className="text-muted-foreground truncate text-xs">
                {m.email}
              </p>
            </div>
            {entry && (
              <Select
                value={entry.role}
                onChange={(e) =>
                  setRole(m.userId, e.target.value as MemberRole)
                }
                className="w-32"
              >
                {ASSIGNABLE_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {t(`workspace.roles.${r}`)}
                  </option>
                ))}
              </Select>
            )}
          </div>
        );
      })}
    </div>
  );
}
