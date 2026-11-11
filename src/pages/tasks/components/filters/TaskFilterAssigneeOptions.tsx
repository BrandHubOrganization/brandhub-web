import { useTranslation } from "react-i18next";
import { User, UserX } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { FilterCheckbox } from "./TaskFilterCategoryList";
import type { AssigneeListProps } from "./types";

export type { AssigneeListProps };

export function AssigneeOptionList({
  assignees,
  selectedAssignees,
  onToggleAssignee,
  searchQuery,
}: AssigneeListProps) {
  const { t } = useTranslation();
  const currentUser = useAuthStore((s) => s.user);
  const q = searchQuery.trim().toLowerCase();

  const unassignedLabel = t("tasks.timelineGrid.unassigned", {
    defaultValue: "Chưa phân công",
  });
  const showUnassigned =
    !q ||
    unassignedLabel.toLowerCase().includes(q) ||
    "unassigned".includes(q) ||
    "chưa giao việc".includes(q);

  const currentUserLabel = t("tasks.timelineGrid.currentUser", {
    defaultValue: "Người dùng hiện tại (đã đăng nhập)",
  });
  const currentUserName = currentUser?.name || "";
  const showCurrentUser =
    !q ||
    currentUserLabel.toLowerCase().includes(q) ||
    "current user".includes(q) ||
    (currentUserName && currentUserName.toLowerCase().includes(q));

  const validMembers = assignees
    .filter(
      (p) =>
        p.id !== "UNASSIGNED" &&
        p.name.trim().toLowerCase() !== "unknown" &&
        p.id !== currentUser?.id,
    )
    .filter((p) => !q || p.name.toLowerCase().includes(q));

  const currentUserId = currentUser?.id || "CURRENT_USER";
  const isCurrentChecked =
    selectedAssignees.includes(currentUserId) ||
    (currentUser?.id ? selectedAssignees.includes(currentUser.id) : false);

  return (
    <>
      {showUnassigned && (
        <button
          type="button"
          onClick={() => onToggleAssignee("UNASSIGNED")}
          className="group flex w-full cursor-pointer select-none items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors hover:bg-muted/60"
        >
          <FilterCheckbox isChecked={selectedAssignees.includes("UNASSIGNED")} />
          <div className="flex size-5 shrink-0 items-center justify-center rounded-full border border-dashed border-border text-muted-foreground">
            <UserX className="size-3" />
          </div>
          <span className="truncate flex-1 text-foreground">
            {unassignedLabel}
          </span>
        </button>
      )}

      {showCurrentUser && (
        <button
          type="button"
          onClick={() => onToggleAssignee(currentUserId)}
          className="group flex w-full cursor-pointer select-none items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors hover:bg-muted/60"
        >
          <FilterCheckbox isChecked={isCurrentChecked} />
          <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-orange/15 text-brand-orange text-[10px] font-semibold">
            {currentUser?.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUserName}
                className="size-full rounded-full object-cover"
              />
            ) : (
              <User className="size-3" />
            )}
          </div>
          <span className="truncate flex-1 text-foreground">
            {currentUserLabel}
            {currentUserName && (
              <span className="text-muted-foreground ml-1 font-normal">
                ({currentUserName})
              </span>
            )}
          </span>
        </button>
      )}

      {validMembers.map((person) => (
        <button
          key={person.id}
          type="button"
          onClick={() => onToggleAssignee(person.id)}
          className="group flex w-full cursor-pointer select-none items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors hover:bg-muted/60"
        >
          <FilterCheckbox isChecked={selectedAssignees.includes(person.id)} />
          <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground overflow-hidden">
            {person.avatar ? (
              <img
                src={person.avatar}
                alt={person.name}
                className="size-full rounded-full object-cover"
              />
            ) : (
              person.initials
            )}
          </div>
          <span className="truncate flex-1 text-foreground">{person.name}</span>
        </button>
      ))}

      {!showUnassigned && !showCurrentUser && validMembers.length === 0 && (
        <div className="py-6 text-center text-xs text-muted-foreground">
          {t("tasks.timelineGrid.noOptionsFound", {
            defaultValue: "Không tìm thấy người phụ trách phù hợp",
          })}
        </div>
      )}
    </>
  );
}
