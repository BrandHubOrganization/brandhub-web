import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useTaskWorkflow } from "@/pages/tasks/hooks/useTaskWorkflow";
import { TaskInlineDetails } from "@/pages/tasks/components/TaskInlineDetails";
import { TaskStartAction } from "@/pages/tasks/components/TaskStartAction";
import { TaskComments } from "@/pages/tasks/components/TaskComments";
import {
  TaskWorkflowProvider,
  useOptionalTaskEditContext,
  useTaskEditContext,
} from "@/pages/tasks/components/TaskWorkflowProvider";
import { workflowError } from "@/pages/tasks/taskWorkflowErrors";

interface Props {
  workspaceId: string;
  taskId: string;
  onUpdated?: () => void;
}
function TaskWorkflowView({ workspaceId, taskId }: Props) {
  const { t } = useTranslation();
  const state = useTaskWorkflow(workspaceId, taskId);
  const { canLeave } = useTaskEditContext();
  const [epoch, setEpoch] = useState(0);
  const task = state.query.data;
  async function reload() {
    if (!(await canLeave())) return;
    const result = await state.reload();
    if (result.isSuccess) setEpoch((value) => value + 1);
  }
  return (
    <div className="space-y-5 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <h2 className="min-w-0 text-xl font-semibold break-words">
          {task?.name || t("tasks.details")}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          aria-label={t("tasks.workflow.reload")}
          title={t("tasks.workflow.reload")}
          disabled={state.query.isFetching}
          onClick={() => void reload()}
        >
          <RefreshCw aria-hidden className="size-4" />
        </Button>
      </div>
      {state.query.isPending && (
        <div role="status" className="flex items-center gap-2">
          <Spinner />
          {t("tasks.loading")}
        </div>
      )}
      {state.query.isError && (
        <div role="alert" className="space-y-3 rounded-xl border p-4">
          <p>{workflowError(state.query.error, t)}</p>
          <Button variant="outline" onClick={() => void reload()}>
            {t("tasks.retry")}
          </Button>
        </div>
      )}
      {task && !state.query.isError && (
        <>
          {task.lockReason && (
            <p
              role="status"
              className="bg-muted text-muted-foreground rounded-xl border p-3 text-sm"
            >
              {t(
                task.lockReason === "TASK_SCHEMA_NOT_READY"
                  ? "tasks.inline.setupUnavailable"
                  : `tasks.workflow.errors.${task.lockReason}`,
              )}
            </p>
          )}
          <TaskInlineDetails key={epoch} task={task} />
          {task.allowedActions.canStart && (
            <TaskStartAction
              task={task}
              start={() => {
                state.retry();
                return state.start();
              }}
            />
          )}
          {task.type === "POST" && (
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" asChild>
                <Link
                  to={`/workspaces/${workspaceId}/task-approvals?task=${encodeURIComponent(taskId)}`}
                >
                  {t("tasks.approvalPage.title")}
                </Link>
              </Button>
            </div>
          )}
          <TaskComments workspaceId={workspaceId} taskId={taskId} />
        </>
      )}
    </div>
  );
}
export function TaskWorkflowContent(props: Props) {
  const context = useOptionalTaskEditContext();
  const content = (
    <TaskWorkflowView key={`${props.workspaceId}:${props.taskId}`} {...props} />
  );
  return context ? (
    content
  ) : (
    <TaskWorkflowProvider onUpdated={props.onUpdated}>
      {content}
    </TaskWorkflowProvider>
  );
}
