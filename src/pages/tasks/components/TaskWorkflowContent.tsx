import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ClipboardCheck,
  Clock,
  Eye,
  PenSquare,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useTaskWorkflow } from "@/pages/tasks/hooks/useTaskWorkflow";
import { useTaskPost } from "@/pages/tasks/hooks/useTaskPost";
import { TaskInlineDetails } from "@/pages/tasks/components/TaskInlineDetails";
import { TaskStartAction } from "@/pages/tasks/components/TaskStartAction";
import { TaskComments } from "@/pages/tasks/components/comments/TaskComments";
import {
  TaskWorkflowProvider,
  useOptionalTaskEditContext,
  useTaskEditContext,
} from "@/pages/tasks/components/TaskWorkflowProvider";
import { workflowError } from "@/pages/tasks/utils/taskWorkflowErrors";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";

interface Props {
  workspaceId: string;
  taskId: string;
  onUpdated?: () => void;
}

function TaskPostScheduleNotice({
  workspaceId,
  taskId,
  timezone,
  isTaskFinished,
}: {
  workspaceId: string;
  taskId: string;
  timezone: string;
  isTaskFinished?: boolean;
}) {
  const { t, i18n } = useTranslation();
  const { data: taskPost, isLoading } = useTaskPost(workspaceId, taskId);
  const post = taskPost?.post;
  const scheduledAt = post?.scheduledAt;

  if (isLoading) {
    return (
      <div className="bg-card/50 border-border/70 h-11 animate-pulse rounded-lg border" />
    );
  }

  if (scheduledAt) {
    let formatted = "";
    try {
      formatted = new Intl.DateTimeFormat(i18n.language, {
        timeZone: timezone,
        dateStyle: "full",
        timeStyle: "short",
      }).format(new Date(scheduledAt));
    } catch {
      formatted = scheduledAt;
    }

    const isPublished = post?.status === "PUBLISHED" || isTaskFinished;

    return (
      <div className="bg-background/90 border-brand-orange/30 flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3 shadow-2xs">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="bg-brand-orange/15 text-brand-orange flex size-8 shrink-0 items-center justify-center rounded-md">
            <Clock className="size-4" />
          </div>
          <div className="min-w-0">
            <div className="text-muted-foreground text-2xs font-semibold tracking-wider uppercase">
              {t("tasks.publishTime")}
            </div>
            <div className="text-foreground truncate text-xs font-semibold sm:text-sm">
              {formatted}
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {post?.targetPlatforms?.map((platform) => (
            <span
              key={platform}
              className="bg-muted text-foreground border-border/80 text-2xs rounded border px-2 py-0.5 font-medium"
            >
              {platform}
            </span>
          ))}
          {isPublished ? (
            <span className="text-2xs rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 font-semibold text-emerald-600 dark:text-emerald-400">
              Đã đăng
            </span>
          ) : post?.status === "FAILED" ? (
            <span className="text-2xs rounded border border-rose-500/20 bg-rose-500/10 px-2 py-0.5 font-semibold text-rose-600 dark:text-rose-400">
              Thất bại
            </span>
          ) : post?.status === "IN_PROGRESS" ||
            post?.status === "PUBLISHING" ? (
            <span className="text-2xs animate-pulse rounded border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 font-semibold text-blue-600 dark:text-blue-400">
              Đang đăng...
            </span>
          ) : (
            <span className="bg-brand-orange-soft text-brand-orange text-2xs rounded px-2 py-0.5 font-semibold">
              Lên lịch
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted/20 border-border/70 text-muted-foreground flex items-center gap-2.5 rounded-lg border border-dashed p-2.5 text-xs">
      <Clock className="text-muted-foreground size-4 shrink-0" />
      <span>
        {t("tasks.notScheduled")} &mdash; {t("tasks.scheduleInEditorHint")}
      </span>
    </div>
  );
}

function TaskWorkflowView({ workspaceId, taskId }: Props) {
  const { t } = useTranslation();
  const state = useTaskWorkflow(workspaceId, taskId);
  const task = state.query.data;
  const { canLeave } = useTaskEditContext();
  const [epoch, setEpoch] = useState(0);
  const currentWorkspace = useWorkspaceStore((s) => s.currentWorkspace);
  const currentMemberRole = useWorkspaceStore((s) => s.currentMemberRole);
  const userId = useAuthStore((s) => s.user?.id);
  const role = currentMemberRole || currentWorkspace?.myRole;
  const isAssignee = userId === task?.assigneeId;
  const isOtherCreator = role === "CREATOR" && !isAssignee;
  const isTaskFinished = task?.status === "FINISHED";
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
                      {isOtherCreator
                        ? "Xem bài viết (Post Content)"
                        : "Nội dung bài viết (Post Content)"}
                    </h3>
                    <p className="text-2xs text-muted-foreground">
                      {isOtherCreator
                        ? "Chế độ xem bài viết của người phụ trách khác"
                        : "Soạn thảo bài viết & theo dõi phê duyệt"}
                    </p>
                  </div>
                </div>
                <span
                  className={cn(
                    "text-2xs rounded-md px-2 py-0.5 font-semibold",
                    isTaskFinished
                      ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-brand-orange-soft text-brand-orange",
                  )}
                >
                  {isOtherCreator
                    ? "Chỉ xem"
                    : isTaskFinished
                      ? "Đã đăng"
                      : "Tự động đăng"}
                </span>
              </div>

              <TaskPostScheduleNotice
                workspaceId={task.workspaceId}
                taskId={task.id}
                timezone={task.dates.timezone || "UTC"}
                isTaskFinished={isTaskFinished}
              />

              <p className="text-muted-foreground text-xs leading-relaxed">
                {isOtherCreator
                  ? (task.status as string) === "TODO" ||
                    (task.status as string) === "BACKLOG"
                    ? `Bài viết đang ở trạng thái cần làm. Đang chờ người phụ trách (${task.assigneeName || "chưa phân công"}) bắt đầu viết bài.`
                    : "Bạn đang xem bài viết của người phụ trách khác. Chỉ người được giao hoặc Quản lý mới có quyền chỉnh sửa."
                  : isTaskFinished
                    ? "Bài viết đã hoàn thành phê duyệt và đã được đăng tải tự động lên các kênh mạng xã hội."
                    : "Soạn thảo nội dung và chuẩn bị hình ảnh bài viết. Lịch xuất bản do Quản lý thiết lập tại Chi tiết Task sẽ tự động áp dụng khi bài viết được duyệt."}
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {isOtherCreator ? (
                  !(
                    (task.status as string) === "TODO" ||
                    (task.status as string) === "BACKLOG"
                  ) && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-border text-muted-foreground hover:text-foreground gap-2 shadow-xs"
                      asChild
                    >
                      <Link
                        to={`/workspaces/${task.workspaceId}/editor?taskId=${task.id}`}
                      >
                        <Eye className="size-4" />
                        Xem bài viết (Chỉ xem)
                      </Link>
                    </Button>
                  )
                ) : isTaskFinished ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border/80 hover:border-brand-orange/60 hover:text-brand-orange gap-2 shadow-xs"
                    asChild
                  >
                    <Link
                      to={`/workspaces/${task.workspaceId}/editor?taskId=${task.id}`}
                    >
                      <Eye className="size-4" />
                      Xem bài viết trong Editor
                    </Link>
                  </Button>
                ) : (
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
                      Mở bài viết trong Editor
                    </Link>
                  </Button>
                )}

                {task.status === "IN_REVIEW" && (
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
                )}
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
