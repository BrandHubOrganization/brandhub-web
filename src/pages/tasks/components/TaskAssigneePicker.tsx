import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useTaskWorkflow } from "@/pages/tasks/hooks/useTaskWorkflow";
import { useInlineTaskField } from "@/pages/tasks/hooks/useInlineTaskField";
import { taskWorkflowService } from "@/pages/tasks/services/taskWorkflowService";
import { workflowError } from "@/pages/tasks/utils/taskWorkflowErrors";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useAuthStore } from "@/store/authStore";
import type { TaskWorkflow } from "@/pages/tasks/types/taskWorkflow";

export function TaskAssigneePicker({
  workspaceId,
  taskId,
  assigneeName,
  task: propTask,
  scope = "detail",
}: {
  workspaceId: string;
  taskId: string;
  assigneeName?: string | null;
  task?: TaskWorkflow | null;
  scope?: "row" | "detail";
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const state = useTaskWorkflow(workspaceId, taskId, open || !propTask);
  const task = propTask || state.query.data;
  const currentWorkspace = useWorkspaceStore((s) => s.currentWorkspace);
  const currentMemberRole = useWorkspaceStore((s) => s.currentMemberRole);
  const systemRole = useAuthStore((s) => s.systemRole);
  const role = currentMemberRole || currentWorkspace?.myRole;
  const canManage =
    role === "MANAGER" ||
    role === "OWNER" ||
    systemRole === "ADMIN";
  const canPick =
    canManage ||
    Boolean(task?.allowedActions?.canAssign) ||
    Boolean(task?.allowedActions?.canEditDetail) ||
    (role !== "CLIENT" && task?.status !== "FINISHED" && task?.status !== "CANCELLED");

  const field = useInlineTaskField(
    `task-${taskId}-${scope}-assignee`,
    task?.assigneeId || "",
    (assigneeId) => state.assign({ assigneeId }),
  );
  const pending = field.status === "saving";

  const options = useQuery({
    queryKey: ["task-member-options", workspaceId, taskId],
    queryFn: () => taskWorkflowService.options(workspaceId, taskId),
    enabled: open && canPick,
    retry: false,
    refetchOnWindowFocus: false,
  });
  async function save(value: string) {
    field.change(value);
    if (await field.commit(value)) setOpen(false);
  }
  const label = task?.assigneeName || assigneeName || t("tasks.unassigned");
  return (
    <div
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <DropdownMenu
        open={open}
        onOpenChange={(next) => {
          if (!pending) setOpen(next);
        }}
      >
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={pending || !canPick}
            className="border-input bg-card/60 hover:bg-muted/80 text-foreground h-8 max-w-full justify-between gap-2 px-2.5 text-xs font-normal rounded-lg cursor-pointer shadow-2xs"
            aria-label={t("tasks.inline.edit", { field: t("tasks.assignee") })}
          >
            <span className="truncate font-medium">{label}</span>
            <ChevronDown
              aria-hidden
              className="text-muted-foreground size-3.5 shrink-0"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-72 max-w-[calc(100vw-2rem)] rounded-xl p-1 shadow-lg z-[70]"
          onEscapeKeyDown={(event) => {
            if (pending) event.preventDefault();
          }}
          onInteractOutside={(event) => {
            if (pending) event.preventDefault();
          }}
        >
          <DropdownMenuLabel className="text-muted-foreground text-2xs uppercase tracking-wider font-semibold">
            {t("tasks.workflow.chooseCreator")}
          </DropdownMenuLabel>
          {state.query.isPending && (
            <p role="status" className="p-2 text-sm">
              {t("tasks.loading")}
            </p>
          )}
          {state.query.isError && (
            <div role="alert" className="space-y-2 p-2 text-sm">
              <p>{workflowError(state.query.error, t)}</p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => void state.reload()}
              >
                {t("tasks.retry")}
              </Button>
            </div>
          )}
          {!canPick && task && !state.query.isError && (
            <p role="status" className="text-muted-foreground p-2 text-xs">
              {t(
                task.lockReason
                  ? task.lockReason === "TASK_SCHEMA_NOT_READY"
                    ? "tasks.inline.setupUnavailable"
                    : `tasks.workflow.errors.${task.lockReason}`
                  : "tasks.workflow.errors.FORBIDDEN",
              )}
            </p>
          )}
          {canPick && !state.query.isError && (
            <>
              {options.isPending && (
                <p role="status" className="p-2 text-xs text-muted-foreground">
                  {t("tasks.loading")}
                </p>
              )}
              {options.isError && (
                <div role="alert" className="space-y-2 p-2 text-sm">
                  <p className="text-xs text-destructive">{t("tasks.inline.membersError")}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={options.isFetching}
                    onClick={() => void options.refetch()}
                  >
                    {t("tasks.retry")}
                  </Button>
                </div>
              )}
              {options.isSuccess && options.data.length === 0 && (
                <p className="text-muted-foreground p-2 text-xs">
                  {t("tasks.inline.noCreators")}
                </p>
              )}
              {options.data && (
                <div className="max-h-60 overflow-y-auto">
                  {options.data.map((member) => (
                    <DropdownMenuItem
                      key={member.userId}
                      disabled={pending}
                      className="min-h-9 cursor-pointer text-xs rounded-lg flex items-center justify-between"
                      onSelect={(event) => {
                        event.preventDefault();
                        void save(member.userId);
                      }}
                    >
                      <span className="min-w-0 flex-1 truncate font-medium">
                        {member.displayName}
                      </span>
                      {task?.assigneeId === member.userId && (
                        <Check aria-hidden className="size-4 shrink-0 text-brand-orange" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </div>
              )}
            </>
          )}
          {field.error && (
            <div role="alert" className="space-y-2 border-t p-2 text-sm">
              <p className="text-destructive">{field.error}</p>
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  state.retry();
                  if (await field.commit()) setOpen(false);
                }}
              >
                {t("tasks.retry")}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  field.discard();
                  state.retry();
                }}
              >
                {t("tasks.inline.discard")}
              </Button>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      {(pending || field.error) && (
        <p aria-live="polite" className="text-muted-foreground text-xs">
          {pending ? t("tasks.inline.saving") : field.error}
        </p>
      )}
    </div>
  );
}
