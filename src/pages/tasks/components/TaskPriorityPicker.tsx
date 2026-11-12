import { useState, useEffect } from "react";
import type React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ChevronDown, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { taskService } from "@/services/taskService";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { cn } from "@/lib/utils";
import type { TaskPriority } from "@/types/task";

export interface PriorityStyle {
  defaultLabel: string;
  barColor: string;
  color: string;
}

export const PRIORITY_UI_CONFIG: Record<TaskPriority, PriorityStyle> = {
  LOW: {
    defaultLabel: "Low",
    barColor: "bg-slate-400 dark:bg-slate-500",
    color: "text-slate-600 dark:text-slate-400",
  },
  MEDIUM: {
    defaultLabel: "Medium",
    barColor: "bg-amber-400",
    color: "text-amber-600 dark:text-amber-400",
  },
  HIGH: {
    defaultLabel: "High",
    barColor: "bg-orange-500",
    color: "text-orange-600 dark:text-orange-400",
  },
  URGENT: {
    defaultLabel: "Urgent",
    barColor: "bg-rose-500",
    color: "text-rose-600 dark:text-rose-400",
  },
};

const PRIORITIES: TaskPriority[] = ["URGENT", "HIGH", "MEDIUM", "LOW"];

export function TaskPriorityBadge({
  priority,
  className,
}: {
  priority?: TaskPriority;
  className?: string;
}) {
  const { t } = useTranslation();
  const p = priority ?? "MEDIUM";
  const conf = PRIORITY_UI_CONFIG[p] ?? PRIORITY_UI_CONFIG.MEDIUM;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap",
        className,
      )}
    >
      <span className="flex flex-col gap-0.5">
        <span className={cn("h-0.5 w-3 rounded-full", conf.barColor)} />
        <span className={cn("h-0.5 w-3 rounded-full", conf.barColor)} />
      </span>
      <span className={conf.color}>
        {t(`tasks.priority.${p}`, { defaultValue: conf.defaultLabel })}
      </span>
    </span>
  );
}

export interface TaskPriorityPickerProps {
  workspaceId: string;
  taskId: string;
  priority?: TaskPriority;
  disabled?: boolean;
  onUpdated?: (newPriority: TaskPriority) => void;
  className?: string;
}

export function TaskPriorityPicker({
  workspaceId,
  taskId,
  priority = "MEDIUM",
  disabled = false,
  onUpdated,
  className,
}: TaskPriorityPickerProps) {
  const { t } = useTranslation();
  const role = useWorkspaceStore(
    (state) => state.currentMemberRole || state.currentWorkspace?.myRole,
  );
  const [currentPriority, setCurrentPriority] = useState<TaskPriority>(priority);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setCurrentPriority(priority);
  }, [priority]);

  const canEdit =
    !disabled &&
    Boolean(
      role &&
        (role === "OWNER" || role === "MANAGER" || role === "CREATOR"),
    );

  if (!canEdit) {
    return (
      <div className={cn("inline-flex items-center px-1.5 py-0.5", className)}>
        <TaskPriorityBadge priority={currentPriority} />
      </div>
    );
  }

  const handleSelect = async (newPriority: TaskPriority, e: React.MouseEvent) => {
    e.stopPropagation();
    if (newPriority === currentPriority || isUpdating) return;

    const previous = currentPriority;
    setCurrentPriority(newPriority);
    setIsUpdating(true);

    try {
      await taskService.updateTaskPriority(workspaceId, taskId, newPriority);
      toast.success(
        t("tasks.priorityUpdated", { defaultValue: "Đã cập nhật độ ưu tiên" }),
      );
      onUpdated?.(newPriority);
    } catch {
      setCurrentPriority(previous);
      toast.error(
        t("tasks.priorityUpdateFailed", {
          defaultValue: "Không thể cập nhật độ ưu tiên",
        }),
      );
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={cn("inline-flex items-center", className)}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild disabled={isUpdating}>
          <button
            type="button"
            className={cn(
              "group/priority hover:bg-muted/60 focus-visible:ring-ring inline-flex cursor-pointer items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium transition-all active:scale-97 focus-visible:ring-1 focus-visible:outline-none",
              isUpdating && "pointer-events-none opacity-50",
            )}
            title={t(`tasks.priority.${currentPriority}`, {
              defaultValue: currentPriority,
            })}
          >
            <TaskPriorityBadge priority={currentPriority} />
            <ChevronDown className="text-muted-foreground/40 group-hover/priority:text-muted-foreground size-3 transition-colors" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-36">
          {PRIORITIES.map((item) => {
            const isSelected = item === currentPriority;
            return (
              <DropdownMenuItem
                key={item}
                onClick={(e) => void handleSelect(item, e)}
                className="flex cursor-pointer items-center justify-between text-xs active:scale-97"
              >
                <TaskPriorityBadge priority={item} />
                {isSelected && (
                  <Check className="text-brand-orange size-3.5" />
                )}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

