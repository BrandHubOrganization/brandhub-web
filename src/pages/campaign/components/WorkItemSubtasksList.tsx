import { useState, type MouseEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { CornerDownRight, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";
import type { ApiResponse } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import { taskWorkflowService } from "@/pages/tasks/services/taskWorkflowService";
import { TaskDrawerSheet } from "@/pages/campaign/components/TaskDrawerSheet";
import {
  JiraAssigneeAvatar,
  JiraInlineSubtaskCreator,
  JiraStatusLozenge,
  JiraSubtaskDueDate,
  JiraSubtaskIcon,
  JiraSubtaskRoleBadge,
} from "@/pages/tasks/components/JiraSubtaskUI";
import { taskCatalogService } from "@/services/taskCatalogService";
import { isSubtaskDone } from "@/pages/tasks/utils/jiraSubtaskUtils";

export interface SubtaskDetails {
  name: string;
  assigneeId: string;
  supervisorOverrideId: string | null;
  dueDate: string;
  /** Catalogue role (`tasks.subtaskRoles.<ROLE>`); null = free subtask. */
  subtaskRole?: string | null;
}

export interface SubtaskRow {
  subtask: SubtaskDetails & { id: string; status: string };
  assigneeName: string | null;
  supervisorId?: string | null;
  supervisorName: string | null;
  allowedStatuses: string[];
}

export interface SubtasksView {
  canManage: boolean;
  parentAssigneeId?: string | null;
  parentAssigneeName?: string | null;
  parentDueDate?: string | null;
  members: { userId: string; displayName: string }[];
  rows: SubtaskRow[];
}

export interface WorkItemSubtasksListProps {
  workspaceId: string;
  taskId: string;
  className?: string;
  onOpenTaskDrawer?: () => void;
  onOpenTaskDetails?: (taskId: string) => void;
  showMainTaskLink?: boolean;
}

export function WorkItemSubtasksList({
  workspaceId,
  taskId,
  className,
  onOpenTaskDrawer,
  onOpenTaskDetails,
}: WorkItemSubtasksListProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Quick subtask creation state
  const [isCreating, setIsCreating] = useState(false);

  const path = `/api/v1/workspaces/${workspaceId}/tasks/${taskId}/subtasks`;
  const queryKey = ["campaign-subtasks", userId, workspaceId, taskId];

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey,
    queryFn: async () =>
      (await api.get<ApiResponse<SubtasksView>>(path)).data.data,
    staleTime: 10000,
    enabled: Boolean(workspaceId && taskId),
  });

  // Fallback query to get parent task workflow details if backend view hasn't propagated
  const { data: parentTaskWorkflow } = useQuery({
    queryKey: ["task-workflow", workspaceId, taskId],
    queryFn: () => taskWorkflowService.read(workspaceId, taskId),
    staleTime: 30000,
    enabled: Boolean(workspaceId && taskId),
  });

  const taskType = parentTaskWorkflow?.type;
  const catalog = useQuery({
    queryKey: ["task-catalog", taskType],
    queryFn: () => taskCatalogService.get(taskType!),
    enabled: Boolean(taskType),
    staleTime: Infinity,
  });
  const roleName = (role?: string | null) =>
    role
      ? t(`tasks.subtaskRoles.${role}`, {
          defaultValue:
            catalog.data?.roles.find((r) => r.role === role)?.name ?? role,
        })
      : null;

  const parentAssigneeId =
    data?.parentAssigneeId || parentTaskWorkflow?.assigneeId || null;
  const parentAssigneeName =
    data?.parentAssigneeName || parentTaskWorkflow?.assigneeName || null;
  const parentDueDate =
    data?.parentDueDate || parentTaskWorkflow?.dueDate || null;

  const createSubtaskMutation = useMutation({
    mutationFn: async (payload: {
      name: string;
      assigneeId: string;
      supervisorOverrideId: string | null;
      dueDate: string;
      subtaskRole?: string | null;
    }) => {
      return (await api.post<ApiResponse<SubtasksView>>(path, payload)).data
        .data;
    },
    onSuccess: (updatedView) => {
      queryClient.setQueryData(queryKey, updatedView);
      queryClient.invalidateQueries({ queryKey: ["campaign-subtasks"] });
      queryClient.invalidateQueries({ queryKey: ["task-review"] });
      queryClient.invalidateQueries({ queryKey: ["campaign-planned-tasks"] });
      toast.success(
        t("tasks.subtasks.createdSuccess", "Đã tạo subtask thành công!"),
      );
    },
    onError: () => {
      toast.error(
        t(
          "tasks.subtasks.createError",
          "Không thể tạo subtask. Vui lòng kiểm tra lại thông tin.",
        ),
      );
    },
  });

  const handleOpenSheet = (e?: MouseEvent) => {
    if (e) e.stopPropagation();
    if (onOpenTaskDetails) {
      onOpenTaskDetails(taskId);
    } else if (onOpenTaskDrawer) {
      onOpenTaskDrawer();
    } else {
      setDrawerOpen(true);
    }
  };

  if (isLoading) {
    return (
      <div
        className={cn(
          "border-border/50 bg-muted/10 text-2xs text-muted-foreground flex items-center justify-center gap-2 overflow-x-hidden rounded-lg border p-3",
          className,
        )}
      >
        <Loader2 className="text-brand-orange size-3.5 animate-spin" />
        <span>{t("tasks.loading", "Đang tải danh sách subtasks...")}</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className={cn(
          "border-destructive/20 bg-destructive/5 text-2xs text-destructive flex items-center justify-between gap-2 overflow-x-hidden rounded-lg border p-2.5",
          className,
        )}
      >
        <span>
          {t("tasks.subtasks.error", "Không thể tải danh sách subtasks.")}
        </span>
        <button
          type="button"
          onClick={() => void refetch()}
          className="text-destructive hover:text-destructive/80 cursor-pointer font-medium underline"
        >
          {t("tasks.retry", "Thử lại")}
        </button>
      </div>
    );
  }

  const rows = data?.rows ?? [];
  const canManage = data?.canManage ?? true;

  return (
    <div className={cn("w-full space-y-2.5 overflow-x-hidden", className)}>
      {/* Jira Subtasks Header */}
      <div className="bg-card/70 border-border/60 rounded-lg border p-2.5 shadow-2xs">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <JiraSubtaskIcon />
            <h4 className="text-foreground text-xs font-semibold tracking-tight">
              {t("tasks.subtasks.title", "Sub-tasks")}
            </h4>
            {rows.length > 0 && (
              <span className="text-3xs text-muted-foreground bg-muted/60 rounded-full px-1.5 py-0.5 font-mono">
                {rows.length}
              </span>
            )}
          </div>

          {canManage && !isCreating && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsCreating(true)}
              className="text-3xs text-brand-orange hover:bg-brand-orange/10 h-6 cursor-pointer gap-1 px-2 font-medium"
            >
              <Plus className="size-3" />
              <span>{t("tasks.subtasks.add", "Create subtask")}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Empty State: Only shown when no subtasks AND not currently creating */}
      {rows.length === 0 && !isCreating && (
        <div
          onClick={canManage ? () => setIsCreating(true) : undefined}
          className={cn(
            "border-border/70 bg-card/40 text-2xs flex items-center justify-between gap-2 overflow-x-hidden rounded-lg border border-dashed p-2.5",
            canManage &&
              "hover:bg-muted/20 hover:border-border cursor-pointer transition-colors",
          )}
          title={
            canManage ? t("tasks.subtasks.add", "Create subtask") : undefined
          }
        >
          <div className="text-muted-foreground flex items-center gap-2">
            <CornerDownRight className="text-muted-foreground/60 size-3 shrink-0" />
            <span className="italic">
              {t("tasks.subtasks.empty", "Chưa có công việc con.")}
            </span>
          </div>
          {canManage && (
            <span className="text-3xs text-brand-orange font-medium hover:underline">
              {t("tasks.subtasks.clickToAdd", "+ Thêm")}
            </span>
          )}
        </div>
      )}

      {/* Subtasks List: Jira Subtask Icon, Name, Assignee (Avatar + Name), Deadline, Status */}
      {rows.length > 0 && (
        <div className="border-border/60 bg-card/60 divide-border/40 divide-y overflow-hidden rounded-lg border shadow-2xs">
          {rows.map((row) => {
            const isDone = isSubtaskDone(row.subtask.status);
            const statusLabel =
              t(`tasks.subtasks.status.${row.subtask.status}`) ||
              row.subtask.status;

            return (
              <div
                key={row.subtask.id}
                onClick={handleOpenSheet}
                className={cn(
                  "flex min-h-[38px] items-center justify-between gap-2.5 px-3 py-2",
                  "hover:bg-muted/40 group cursor-pointer overflow-x-hidden text-xs transition-colors",
                )}
                title={t(
                  "tasks.clickToOpenTaskDetails",
                  "Click để mở chi tiết công việc",
                )}
              >
                {/* Left: Jira Subtask Icon + Title */}
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <JiraSubtaskIcon />
                  <span
                    className={cn(
                      "min-w-0 flex-1 truncate text-left text-xs transition-colors",
                      isDone
                        ? "text-muted-foreground/75 font-normal line-through"
                        : "text-foreground group-hover:text-brand-orange font-medium",
                    )}
                    title={row.subtask.name}
                  >
                    {row.subtask.name}
                  </span>
                  <JiraSubtaskRoleBadge
                    roleName={roleName(row.subtask.subtaskRole)}
                  />
                </div>

                {/* Right metadata: Assignee avatar & name + Due date + Status */}
                <div className="flex shrink-0 items-center gap-2.5">
                  {/* Assignee Avatar + Real Name */}
                  <div
                    className="flex max-w-[140px] shrink-0 items-center gap-1.5"
                    title={`${t("tasks.subtasks.assignee", "Người thực hiện (Assignee)")}: ${row.assigneeName || t("tasks.subtasks.unassigned", "Chưa phân công")}`}
                  >
                    <JiraAssigneeAvatar name={row.assigneeName} />
                    <span className="text-2xs text-foreground/80 hidden truncate font-medium sm:inline">
                      {row.assigneeName ||
                        t("tasks.subtasks.unassigned", "Chưa phân công")}
                    </span>
                  </div>

                  {/* Due Date with Overdue check */}
                  <JiraSubtaskDueDate
                    dueDate={row.subtask.dueDate}
                    isDone={isDone}
                  />

                  {/* Status Lozenge */}
                  <JiraStatusLozenge
                    status={row.subtask.status}
                    label={statusLabel}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Jira Standard 1-Line Inline Subtask Creator */}
      {isCreating && (
        <JiraInlineSubtaskCreator
          parentAssigneeId={parentAssigneeId}
          parentAssigneeName={parentAssigneeName}
          parentDueDate={parentDueDate}
          members={data?.members || []}
          isLoading={createSubtaskMutation.isPending}
          taskType={taskType}
          onSubmit={(payload) => createSubtaskMutation.mutate(payload)}
          onCancel={() => setIsCreating(false)}
        />
      )}

      {/* Internal TaskDrawerSheet if opened outside custom handler */}
      {!onOpenTaskDrawer && !onOpenTaskDetails && (
        <TaskDrawerSheet
          workspaceId={workspaceId}
          taskId={taskId}
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
        />
      )}
    </div>
  );
}
