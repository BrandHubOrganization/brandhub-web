import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CheckSquare,
  Square,
  RotateCcw,
  Flag,
  UserCheck,
  Trash2,
  X,
  ChevronDown,
  AlertTriangle,
  ArrowUp,
  Equal,
  ArrowDown,
  User,
  UserX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { taskService } from "@/services/taskService";
import { workspaceService } from "@/services/workspaceService";
import type { TaskStatus, TaskPriority } from "@/types/task";
import type { WorkspaceMember } from "@/types/workspace";

export interface TaskBulkActionBarProps {
  selectedTaskIds: string[];
  workspaceId: string;
  isAllSelected: boolean;
  onToggleSelectAll: () => void;
  onClearSelection: () => void;
  onUpdated?: () => void;
}

const STATUS_OPTS = [
  {
    value: "TODO" as TaskStatus,
    labelKey: "tasks.status.TODO",
    dot: "bg-slate-400",
  },
  {
    value: "IN_PROGRESS" as TaskStatus,
    labelKey: "tasks.status.IN_PROGRESS",
    dot: "bg-sky-500",
  },
  {
    value: "IN_REVIEW" as TaskStatus,
    labelKey: "tasks.status.IN_REVIEW",
    dot: "bg-amber-500",
  },
  {
    value: "FINISHED" as TaskStatus,
    labelKey: "tasks.status.FINISHED",
    dot: "bg-emerald-500",
  },
  {
    value: "CANCELLED" as TaskStatus,
    labelKey: "tasks.status.CANCELLED",
    dot: "bg-rose-500",
  },
];

const PRIORITY_OPTS = [
  {
    value: "URGENT" as TaskPriority,
    labelKey: "tasks.priority.URGENT",
    Icon: AlertTriangle,
    color: "text-rose-500",
  },
  {
    value: "HIGH" as TaskPriority,
    labelKey: "tasks.priority.HIGH",
    Icon: ArrowUp,
    color: "text-amber-500",
  },
  {
    value: "MEDIUM" as TaskPriority,
    labelKey: "tasks.priority.MEDIUM",
    Icon: Equal,
    color: "text-yellow-500",
  },
  {
    value: "LOW" as TaskPriority,
    labelKey: "tasks.priority.LOW",
    Icon: ArrowDown,
    color: "text-blue-500",
  },
];

export function TaskBulkActionBar({
  selectedTaskIds,
  workspaceId,
  isAllSelected,
  onToggleSelectAll,
  onClearSelection,
  onUpdated,
}: TaskBulkActionBarProps) {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!workspaceId) return;
    let active = true;
    workspaceService
      .listMembers(workspaceId)
      .then((res) => {
        if (active && res.data?.data) {
          setMembers(res.data.data.filter((m) => m.isActive !== false));
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [workspaceId]);

  if (selectedTaskIds.length === 0) return null;
  const count = selectedTaskIds.length;

  const runBatch = async (
    action: (id: string) => Promise<unknown>,
    successMsg: string,
  ) => {
    setIsLoading(true);
    try {
      const results = await Promise.allSettled(selectedTaskIds.map(action));
      const failures = results.filter((r) => r.status === "rejected");
      if (failures.length === results.length) {
        toast.error(t("common.error", { defaultValue: "Có lỗi xảy ra" }));
        return;
      }
      if (failures.length > 0) {
        toast.warning(
          t("tasks.bulk.partialSuccess", {
            defaultValue: `Đã cập nhật ${results.length - failures.length}/${results.length} công việc`,
          }),
        );
      } else {
        toast.success(successMsg);
      }
      qc.invalidateQueries({ queryKey: ["task-workflow"] });
      onUpdated?.();
      onClearSelection();
    } catch {
      toast.error(t("common.error", { defaultValue: "Có lỗi xảy ra" }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="border-border bg-card/95 animate-in fade-in slide-in-from-bottom-4 fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full border px-4 py-2 shadow-2xl backdrop-blur-md transition-all duration-200">
        <span className="bg-brand-orange/15 text-brand-orange rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap">
          {count} {t("tasks.bulk.selected", { defaultValue: "đã chọn" })}
        </span>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onToggleSelectAll}
          className="h-8 cursor-pointer gap-1.5 rounded-full px-2.5 text-xs font-medium active:scale-97"
        >
          {isAllSelected ? (
            <CheckSquare className="text-brand-orange size-3.5" />
          ) : (
            <Square className="size-3.5" />
          )}
          <span>
            {isAllSelected
              ? t("tasks.bulk.deselectAll")
              : t("tasks.bulk.selectAll")}
          </span>
        </Button>

        <div className="bg-border h-4 w-px shrink-0" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isLoading}
              className="h-8 cursor-pointer gap-1.5 rounded-full px-2.5 text-xs font-medium active:scale-97"
            >
              <RotateCcw className="size-3.5 text-blue-500" />
              <span>{t("tasks.bulk.changeStatus")}</span>
              <ChevronDown className="size-3 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-40">
            {STATUS_OPTS.map((item) => (
              <DropdownMenuItem
                key={item.value}
                onClick={() =>
                  void runBatch(
                    (id) =>
                      taskService.updateTaskStatus(workspaceId, id, item.value),
                    t("tasks.bulk.statusUpdated", { count }),
                  )
                }
                className="flex cursor-pointer items-center gap-2 text-xs active:scale-97"
              >
                <span
                  className={cn("size-2 shrink-0 rounded-full", item.dot)}
                />
                <span className="truncate">
                  {t(item.labelKey, { defaultValue: item.value })}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isLoading}
              className="h-8 cursor-pointer gap-1.5 rounded-full px-2.5 text-xs font-medium active:scale-97"
            >
              <Flag className="size-3.5 text-amber-500" />
              <span>{t("tasks.bulk.changePriority")}</span>
              <ChevronDown className="size-3 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-36">
            {PRIORITY_OPTS.map((item) => {
              const Icon = item.Icon;
              return (
                <DropdownMenuItem
                  key={item.value}
                  onClick={() =>
                    void runBatch(
                      (id) =>
                        taskService.updateTaskPriority(
                          workspaceId,
                          id,
                          item.value,
                        ),
                      t("tasks.bulk.priorityUpdated", { count }),
                    )
                  }
                  className="flex cursor-pointer items-center gap-2 text-xs active:scale-97"
                >
                  <Icon className={cn("size-3.5 shrink-0", item.color)} />
                  <span className="truncate">
                    {t(item.labelKey, { defaultValue: item.value })}
                  </span>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isLoading}
              className="h-8 cursor-pointer gap-1.5 rounded-full px-2.5 text-xs font-medium active:scale-97"
            >
              <UserCheck className="size-3.5 text-emerald-500" />
              <span>{t("tasks.bulk.assignMember")}</span>
              <ChevronDown className="size-3 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="center"
            className="max-h-56 w-48 overflow-y-auto overflow-x-hidden"
          >
            <DropdownMenuItem
              onClick={() =>
                void runBatch(
                  (id) => taskService.updateTaskAssignee(workspaceId, id, null),
                  t("tasks.bulk.assignedUpdated", { count }),
                )
              }
              className="text-muted-foreground flex cursor-pointer items-center gap-2 text-xs active:scale-97"
            >
              <UserX className="text-muted-foreground size-3.5 shrink-0" />
              <span>{t("tasks.bulk.unassign")}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {members.length === 0 ? (
              <div className="text-muted-foreground px-2 py-1.5 text-center text-xs">
                {t("tasks.unassigned")}
              </div>
            ) : (
              members.map((m) => (
                <DropdownMenuItem
                  key={m.id}
                  onClick={() =>
                    void runBatch(
                      (id) =>
                        taskService.updateTaskAssignee(
                          workspaceId,
                          id,
                          m.userId || m.id,
                        ),
                      t("tasks.bulk.assignedUpdated", { count }),
                    )
                  }
                  className="flex cursor-pointer items-center gap-2 text-xs active:scale-97"
                >
                  <User className="text-muted-foreground size-3.5 shrink-0" />
                  <span className="truncate">
                    {m.fullName || m.email || m.id}
                  </span>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="bg-border h-4 w-px shrink-0" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={isLoading}
          onClick={() => setIsDeleteDialogOpen(true)}
          className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 cursor-pointer gap-1.5 rounded-full px-2.5 text-xs font-medium active:scale-97"
        >
          <Trash2 className="size-3.5" />
          <span>{t("tasks.bulk.delete")}</span>
        </Button>

        <div className="bg-border h-4 w-px shrink-0" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          aria-label={t("tasks.bulk.close")}
          className="hover:bg-muted text-muted-foreground hover:text-foreground size-7 cursor-pointer rounded-full p-0 active:scale-97"
        >
          <X className="size-3.5" />
        </Button>
      </div>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={async () => {
          await runBatch(
            (id) => taskService.deleteTask(workspaceId, id),
            t("tasks.bulk.deletedSuccess", { count }),
          );
          setIsDeleteDialogOpen(false);
        }}
        title={t("tasks.bulk.deleteConfirmTitle")}
        description={t("tasks.bulk.deleteConfirmDesc", { count })}
        confirmText={t("tasks.bulk.delete")}
        cancelText={t("common.cancel")}
        variant="danger"
        isLoading={isLoading}
      />
    </>
  );
}
