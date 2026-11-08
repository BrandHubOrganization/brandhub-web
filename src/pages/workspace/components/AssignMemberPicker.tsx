import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { agencyService } from "@/services/agencyService";
import { useAuthStore } from "@/store/authStore";
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
  const currentUserId = useAuthStore((s) => s.user?.id);
  const [members, setMembers] = useState<AgencyMember[]>([]);

  useEffect(() => {
    agencyService
      .listMembers(agencyId)
      .then(({ data }) =>
        setMembers(
          currentUserId
            ? data.data.filter((m) => m.userId !== currentUserId)
            : data.data,
        ),
      );
  }, [agencyId, currentUserId]);

  const toggle = (userId: string) => {
    const existing = value.find((v) => v.userId === userId);
    if (existing) {
      onChange(value.filter((v) => v.userId !== userId));
    } else {
      onChange([...value, { userId, role: "CREATOR" }]);
    }
  };

  const setRole = (userId: string, role: MemberRole) => {
    onChange(
      value.map((v) => {
        if (v.userId === userId) return { ...v, role };
        if (role === "MANAGER" && v.role === "MANAGER") {
          return { ...v, role: "CREATOR" };
        }
        return v;
      }),
    );
  };

  const visibleMembers = currentUserId
    ? members.filter((m) => m.userId !== currentUserId)
    : members;

  if (visibleMembers.length === 0) return null;

  return (
    <div className="border-border flex flex-col gap-2 rounded-lg border p-3">
      {visibleMembers.map((m) => {
        const entry = value.find((v) => v.userId === m.userId);
        return (
          <div
            key={m.id}
            className="flex items-center justify-between gap-3 py-0.5"
          >
            <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5">
              <input
                type="checkbox"
                checked={!!entry}
                onChange={() => toggle(m.userId)}
                className="accent-brand-orange size-4 shrink-0 cursor-pointer"
              />
              <div className="min-w-0 flex-1">
                <p className="text-foreground truncate text-sm font-medium">
                  {m.fullName || m.email}
                </p>
                <p className="text-muted-foreground truncate text-xs">
                  {m.email}
                </p>
              </div>
            </label>
            {entry && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-border h-8 w-48 shrink-0 cursor-pointer justify-between gap-1.5 rounded-lg px-2.5 text-xs font-normal"
                    aria-label={t("workspace.members.roleLabel")}
                    data-selectable-roles={ASSIGNABLE_ROLES.join(",")}
                  >
                    <span className="truncate">
                      {t(`workspace.roles.${entry.role}`)}
                    </span>
                    <ChevronDown className="text-muted-foreground size-3.5 shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="min-w-[192px] rounded-lg p-1 shadow-md"
                >
                  {ASSIGNABLE_ROLES.map((r) => (
                    <DropdownMenuItem
                      key={r}
                      data-role={r}
                      className="hover:bg-accent focus:bg-accent flex cursor-pointer items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-xs"
                      onClick={() => setRole(m.userId, r)}
                    >
                      <span>{t(`workspace.roles.${r}`)}</span>
                      {entry.role === r && (
                        <Check className="text-brand-orange size-3.5 shrink-0" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        );
      })}
    </div>
  );
}
