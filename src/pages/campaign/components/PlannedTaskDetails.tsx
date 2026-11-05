import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ExternalLink, ListTree } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";
import type { ApiResponse } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import { TaskWorkflowProvider } from "@/pages/tasks/components/TaskWorkflowProvider";
import {
  TaskDrawerSheet,
  TaskFields,
} from "@/pages/campaign/components/TaskDrawerSheet";
import {
  WorkItemSubtasksList,
  type SubtasksView,
} from "@/pages/campaign/components/WorkItemSubtasksList";
import { JiraSubtaskIcon } from "@/pages/tasks/components/JiraSubtaskUI";

export interface PlannedTaskDetailsProps {
  workspaceId: string;
  taskId: string;
  className?: string;
  triggerLabel?: string;
  variant?: "button" | "ghost" | "outline";
  showSubtaskCount?: boolean;
  onOpenDetails?: (taskId: string) => void;
}

export function PlannedTaskDetails({
  workspaceId,
  taskId,
  className,
  triggerLabel,
  variant: _variant = "outline",
  showSubtaskCount = true,
  onOpenDetails,
}: PlannedTaskDetailsProps) {
  const { t } = useTranslation();
  const userId = useAuthStore((state) => state.user?.id);
  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const path = `/api/v1/workspaces/${workspaceId}/tasks/${taskId}/subtasks`;
  const queryKey = ["campaign-subtasks", userId, workspaceId, taskId];
  const { data: subtasksView } = useQuery({
    queryKey,
    queryFn: async () =>
      (await api.get<ApiResponse<SubtasksView>>(path)).data.data,
    staleTime: 15000,
    enabled: Boolean(workspaceId && taskId),
  });

  const rows = subtasksView?.rows ?? [];
  const totalCount = rows.length;

  const handleOpenSheet = () => {
    if (onOpenDetails) {
      onOpenDetails(taskId);
    } else {
      setOpen(true);
    }
  };

  return (
    <div className={cn("flex flex-col gap-2 overflow-x-hidden", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <details
          className="border-border/60 [&>summary::-webkit-details-marker]:hidden"
          open={detailsOpen}
          onToggle={(e) => setDetailsOpen(e.currentTarget.open)}
        >
          <summary
            className="text-brand-orange hover:text-brand-orange/80 inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium transition-colors select-none"
            title={t("tasks.details")}
          >
            <ListTree className="size-3.5 text-brand-orange shrink-0" />
            <span>
              {triggerLabel ||
                `${t("tasks.details")} · ${t("tasks.subtasks.title", "Sub-tasks")}`}
            </span>
            {showSubtaskCount && totalCount > 0 && (
              <span
                className="ml-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full font-mono text-3xs font-semibold border bg-muted text-foreground/80 border-border/60"
                title={`${totalCount} subtasks`}
              >
                <JiraSubtaskIcon className="size-3" />
                <span>{totalCount}</span>
              </span>
            )}
          </summary>
          {detailsOpen && (
            <div className="mt-2.5 max-w-full overflow-hidden rounded-lg border border-border/50 bg-background/60 p-3">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/40">
                <span className="text-2xs text-muted-foreground font-medium">
                  {t("tasks.inlineEditor", "Xem nhanh")}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-brand-orange hover:bg-brand-orange/10 h-6 gap-1 px-2 text-2xs font-medium cursor-pointer"
                  onClick={handleOpenSheet}
                >
                  <ExternalLink className="size-3" />
                  <span>
                    {t("tasks.panel.openRight", "Mở thao tác bên phải")}
                  </span>
                </Button>
              </div>
              <TaskWorkflowProvider>
                <TaskFields workspaceId={workspaceId} taskId={taskId} />
              </TaskWorkflowProvider>
            </div>
          )}
        </details>
      </div>

      {!onOpenDetails && (
        <TaskDrawerSheet
          workspaceId={workspaceId}
          taskId={taskId}
          open={open}
          onOpenChange={setOpen}
        />
      )}
    </div>
  );
}

// Re-export companion components for seamless integration
export { TaskFields, TaskDrawerSheet };
export { WorkItemSubtasksList };
export type { PlannedTaskDetailsProps as TaskDetailsProps };
