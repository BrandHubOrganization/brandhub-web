import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ClipboardCheck, PenSquare, RefreshCw, Sparkles } from "lucide-react";
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
import { cn } from "@/lib/utils";

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
      <div className="border-border/60 flex items-start justify-between gap-3 border-b pb-4">
        <h2 className="text-foreground min-w-0 text-lg font-semibold tracking-tight break-words sm:text-xl">
          {task?.name || t("tasks.details")}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground size-8 shrink-0 rounded-lg"
          aria-label={t("tasks.workflow.reload")}
          title={t("tasks.workflow.reload")}
          disabled={state.query.isFetching}
          onClick={() => void reload()}
        >
          <RefreshCw
            aria-hidden
            className={cn(
              "size-4 transition-transform",
              state.query.isFetching && "text-brand-orange animate-spin",
            )}
          />
        </Button>
      </div>
      {state.query.isPending && (
        <div
          role="status"
          className="text-muted-foreground flex items-center gap-2 py-4 text-sm"
        >
          <Spinner className="size-4" />
          <span>{t("tasks.loading")}</span>
        </div>
      )}
      {state.query.isError && (
        <div
          role="alert"
          className="border-destructive/30 bg-destructive/10 space-y-3 rounded-xl border p-4"
        >
          <p className="text-destructive text-sm">
            {workflowError(state.query.error, t)}
          </p>
          <Button variant="outline" size="sm" onClick={() => void reload()}>
            {t("tasks.retry")}
          </Button>
        </div>
      )}
      {task && !state.query.isError && (
        <>
          {task.lockReason && (
            <p
              role="status"
              className="bg-muted text-muted-foreground border-border/80 rounded-xl border p-3 text-xs leading-relaxed"
            >
              {t(
                task.lockReason === "TASK_SCHEMA_NOT_READY"
                  ? "tasks.inline.setupUnavailable"
                  : `tasks.workflow.errors.${task.lockReason}`,
              )}
            </p>
          )}

          {/* Core Properties & Metadata Bento */}
          <TaskInlineDetails key={epoch} task={task} />

          {/* Social Post Content & Review Action Hub */}
          {task.type === "POST" && !task.allowedActions.canStart && (
            <div className="border-brand-orange/30 from-brand-orange/10 via-card to-card relative space-y-3 overflow-hidden rounded-xl border bg-gradient-to-br p-4 shadow-xs">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="bg-brand-orange/15 text-brand-orange flex size-7 items-center justify-center rounded-lg">
                    <Sparkles className="size-4" />
                  </div>
                  <div>
                    <h3 className="text-foreground text-sm font-semibold">
                      Nội dung bài viết (Post Content)
                    </h3>
                    <p className="text-2xs text-muted-foreground">
                      Soạn thảo bài viết &amp; theo dõi phê duyệt
                    </p>
                  </div>
                </div>
                <span className="bg-brand-orange-soft text-brand-orange text-2xs rounded-md px-2 py-0.5 font-semibold">
                  Tự động đăng
                </span>
              </div>

              <p className="text-muted-foreground text-xs leading-relaxed">
                Soạn bài, kiểm tra hình ảnh và thiết lập{" "}
                <strong className="text-foreground">
                  Lịch xuất bản (Publish Date)
                </strong>{" "}
                trong Editor. Hệ thống sẽ tự động xuất bản khi đến giờ hẹn.
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Button
                  variant="orange"
                  size="sm"
                  className="gap-2 shadow-xs"
                  asChild
                >
                  <Link
                    to={`/workspaces/${task.workspaceId}/editor?taskId=${task.id}`}
                  >
                    <PenSquare className="size-4" />
                    Mở bài viết &amp; Lên lịch trong Editor
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="border-border/80 hover:border-brand-orange/60 hover:text-brand-orange gap-2"
                  asChild
                >
                  <Link
                    to={`/workspaces/${workspaceId}/task-approvals?task=${encodeURIComponent(taskId)}`}
                  >
                    <ClipboardCheck className="text-brand-orange size-4" />
                    {t("tasks.approvalPage.title")}
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {/* Start Task Action if startable */}
          {task.allowedActions.canStart && (
            <div className="space-y-3">
              <TaskStartAction
                task={task}
                start={() => {
                  state.retry();
                  return state.start();
                }}
              />
              {task.type === "POST" && (
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link
                      to={`/workspaces/${workspaceId}/task-approvals?task=${encodeURIComponent(taskId)}`}
                      className="gap-2"
                    >
                      <ClipboardCheck className="text-brand-orange size-4" />
                      {t("tasks.approvalPage.title")}
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Comments Section */}
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
