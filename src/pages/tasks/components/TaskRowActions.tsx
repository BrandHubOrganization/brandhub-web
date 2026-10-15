import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { TaskInlineAssignment } from "@/pages/tasks/components/TaskInlineAssignment";
import { TaskDeadlineField } from "@/pages/tasks/components/TaskInlineDetails";
import { TaskStartAction } from "@/pages/tasks/components/TaskStartAction";
import { useTaskWorkflow } from "@/pages/tasks/hooks/useTaskWorkflow";
import { useTaskEditContext } from "@/pages/tasks/components/TaskWorkflowProvider";
import { workflowError } from "@/pages/tasks/taskWorkflowErrors";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useAuthStore } from "@/store/authStore";
import type { TaskListItem } from "@/types/task";

export function TaskRowActions({
  task,
  field,
}: {
  task: TaskListItem;
  field: "assignee" | "deadline" | "start";
}) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const state = useTaskWorkflow(task.workspaceId, task.id, open);
  const { canLeave } = useTaskEditContext();
  const role = useWorkspaceStore(
    (store) =>
      store.workspaceList.find((ws) => ws.id === task.workspaceId)?.myRole ||
      (store.currentWorkspace?.id === task.workspaceId
        ? store.currentMemberRole
        : null),
  );
  const userId = useAuthStore((store) => store.user?.id);
  const manager = role === "MANAGER" || role === "OWNER";
  const creator = role === "CREATOR" && userId === task.assigneeId;
  const todo = ["TODO", "BACKLOG", "DETAIL_IDENTIFIED", "ASSIGNED"].includes(
    task.status,
  );
  let display = task.assigneeName || t("tasks.unassigned");
  if (field === "deadline")
    display =
      task.dueDate && Number.isFinite(Date.parse(task.dueDate))
        ? new Intl.DateTimeFormat(i18n.language, {
            dateStyle: "short",
            timeStyle: "short",
          }).format(new Date(task.dueDate))
        : t("tasks.missing");
  const eligible = todo && (field === "start" ? creator : manager);
  if (!eligible)
    return field === "start" ? null : (
      <span className="text-xs">{display}</span>
    );
  return (
    <div
      className="max-w-64 min-w-40"
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => {
        event.stopPropagation();
        if (event.key === "Escape" && canLeave()) setOpen(false);
      }}
    >
      {!open ? (
        <Button
          size="sm"
          variant="ghost"
          className="h-auto justify-start px-1 py-1 text-left text-xs font-normal"
          aria-label={
            field === "start"
              ? t("tasks.workflow.start")
              : t("tasks.inline.edit", {
                  field:
                    field === "assignee"
                      ? t("tasks.assignee")
                      : t("tasks.deadline"),
                })
          }
          onClick={() => setOpen(true)}
        >
          {field === "start" ? t("tasks.workflow.start") : display}
        </Button>
      ) : (
        <div className="space-y-2 py-1">
          {state.query.isPending && <Spinner />}
          {state.query.isError && (
            <div role="alert" className="text-destructive text-xs">
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
          {state.query.data && (
            <>
              {state.query.data.lockReason && (
                <p className="text-muted-foreground text-xs">
                  {t(
                    state.query.data.lockReason === "TASK_SCHEMA_NOT_READY"
                      ? "tasks.inline.setupUnavailable"
                      : `tasks.workflow.errors.${state.query.data.lockReason}`,
                  )}
                </p>
              )}
              {field === "assignee" && (
                <TaskInlineAssignment task={state.query.data} onlyAssignee />
              )}
              {field === "deadline" && (
                <TaskDeadlineField task={state.query.data} scope="row" />
              )}
              {field === "start" &&
                state.query.data.allowedActions.canStart && (
                  <TaskStartAction
                    start={() => {
                      state.retry();
                      return state.start();
                    }}
                  />
                )}
            </>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              if (canLeave()) setOpen(false);
            }}
          >
            {t("tasks.close")}
          </Button>
        </div>
      )}
    </div>
  );
}
