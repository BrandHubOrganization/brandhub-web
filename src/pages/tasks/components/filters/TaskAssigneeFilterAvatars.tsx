import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import type { TaskAssigneeFilterAvatarsProps } from "./types";

export type { TaskAssigneeFilterAvatarsProps };

export function TaskAssigneeFilterAvatars({
  assignees,
  selectedAssignees,
  onToggleAssignee,
  maxVisible = 5,
}: TaskAssigneeFilterAvatarsProps) {
  const { t } = useTranslation();

  const realAssignees = assignees.filter(
    (person) =>
      person.id !== "UNASSIGNED" &&
      person.name.trim().toLowerCase() !== "unknown",
  );

  if (realAssignees.length === 0) return null;

  const visible = realAssignees.slice(0, maxVisible);
  const remaining = realAssignees.length - maxVisible;

  return (
    <div
      className="flex items-center -space-x-1 overflow-visible py-0.5"
      role="group"
      aria-label={t("tasks.timelineGrid.categoryAssignee", {
        defaultValue: "Người phụ trách",
      })}
    >
      {visible.map((person) => {
        const isSelected = selectedAssignees.includes(person.id);
        return (
          <button
            key={person.id}
            type="button"
            onClick={() => onToggleAssignee(person.id)}
            title={t("tasks.timelineGrid.filterByAssignee", {
              name: person.name,
              defaultValue: `Lọc theo: ${person.name}`,
            })}
            aria-pressed={isSelected}
            className={cn(
              "relative inline-flex size-7 shrink-0 items-center justify-center rounded-full text-2xs font-semibold ring-2 ring-card transition-all cursor-pointer select-none active:scale-95",
              isSelected
                ? "bg-brand-orange text-white ring-brand-orange ring-offset-1 z-20 scale-105 shadow-xs"
                : "border-border/80 bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground hover:z-10",
            )}
          >
            {person.avatar ? (
              <img
                src={person.avatar}
                alt={person.name}
                className="size-full rounded-full object-cover"
              />
            ) : (
              person.initials
            )}
          </button>
        );
      })}
      {remaining > 0 && (
        <span
          className="text-muted-foreground border-border bg-card flex size-7 shrink-0 items-center justify-center rounded-full border border-dashed text-2xs font-medium z-0"
          title={`+${remaining}`}
        >
          +{remaining}
        </span>
      )}
    </div>
  );
}
