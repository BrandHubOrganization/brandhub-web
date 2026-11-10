import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useTaskPost } from "@/pages/tasks/hooks/useTaskPost";

import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  AlertCircle,
  ClipboardCheck,
  Clock,
  Copy,
  Eye,
  FileText,
  HelpCircle,
  MessageSquare,
  Pencil,
  PenSquare,
  RefreshCw,
  Share2,
  Sparkles,
  Video,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTaskWorkflow } from "@/pages/tasks/hooks/useTaskWorkflow";
import { useTaskApproval } from "@/pages/tasks/hooks/useTaskApproval";
import {
  TaskDescriptionSection,
  TaskDetailsSidebar,
} from "@/pages/tasks/components/TaskInlineDetails";
import { TaskStartAction } from "@/pages/tasks/components/TaskStartAction";
import { TaskComments } from "@/pages/tasks/components/comments/TaskComments";
import { TaskMeetingCard } from "@/pages/tasks/components/meeting";
import { SurveyOverviewCard } from "@/pages/tasks/components/survey/SurveyOverviewCard";
import { TaskPhoneMedia } from "@/pages/tasks/components/TaskPhoneMedia";

import {
  TaskWorkflowProvider,
  useOptionalTaskEditContext,
  useTaskEditContext,
} from "@/pages/tasks/components/TaskWorkflowProvider";
import { workflowError } from "@/pages/tasks/utils/taskWorkflowErrors";
import { CampaignSubtasks } from "@/pages/tasks/components/CampaignSubtasks";
import { TaskApprovalSection } from "@/pages/tasks/components/approval/TaskApprovalSection";
import { TaskApprovalHistory } from "@/pages/tasks/components/approval/TaskApprovalHistory";
import { TaskStatusControl } from "@/pages/tasks/components/TaskStatusControl";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { TaskWorkflow } from "@/pages/tasks/types/taskWorkflow";

interface Props {
  workspaceId: string;
  taskId: string;
  onUpdated?: () => void;
  onClose?: () => void;
}

function getTaskTypeBadge(type?: string) {
  switch (type) {
    case "POST":
      return {
        icon: Share2,
        style: "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/25",
        name: "Post",
      };
    case "LIVESTREAM":
    case "EVENT_PLAN":
    case "SHORT_VIDEO":
    case "WORKSHOP":
      return {
        icon: Video,
        style:
          "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/25",
        name: "Event / Live",
      };
    case "SURVEY":
      return {
        icon: HelpCircle,
        style:
          "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25",
        name: "Survey",
      };
    default:
      return {
        icon: FileText,
        style:
          "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/25",
        name: "Task",
      };
  }
}

function TaskApprovalHistoryTab({ task }: { task: TaskWorkflow }) {
  const approval = useTaskApproval(task);
  return <TaskApprovalHistory history={approval.history} />;
}

function TaskAuditTimeline({ task }: { task: TaskWorkflow }) {
  const { i18n } = useTranslation();
  const zone = task.dates.timezone || "UTC";

  const formatDate = (iso: string | null | undefined) => {
    if (!iso || !Number.isFinite(Date.parse(iso))) return null;
    try {
      return new Intl.DateTimeFormat(i18n.language, {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: zone,
      }).format(new Date(iso));
    } catch {
      return iso;
    }
  };

  const started = formatDate(task.firstStartedAt);
  const publish = formatDate(task.publishDate);

  return (
    <div className="border-border/60 bg-muted/20 text-muted-foreground space-y-2.5 rounded-xl border p-3.5 text-xs shadow-2xs">
      <div className="text-foreground text-2xs font-semibold tracking-wider uppercase">
        Mốc thời gian &amp; Thông tin kiểm soát
      </div>
      <div className="text-2xs grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div>
          <span className="text-muted-foreground/80">
            Phiên bản quy trình:{" "}
          </span>
          <span className="text-foreground font-mono font-semibold tabular-nums">
            rev#{task.workflowRevision ?? 1}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground/80">Múi giờ làm việc: </span>
          <span className="text-foreground font-medium">{zone}</span>
        </div>
        {started && (
          <div>
            <span className="text-muted-foreground/80">
              Thời gian bắt đầu:{" "}
            </span>
            <span className="text-foreground font-medium">{started}</span>
          </div>
        )}
        {publish && (
          <div>
            <span className="text-muted-foreground/80">
              Thời gian đăng bài:{" "}
            </span>
            <span className="text-foreground font-medium">{publish}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function TaskPostScheduleNotice({
  workspaceId,
  taskId,
  timezone,
  publishDate,
  canOpenEditor,
}: {
  workspaceId: string;
  taskId: string;
  timezone: string;
  isTaskFinished?: boolean;
  publishDate?: string | null;
  canOpenEditor: boolean;
}) {
  const { t, i18n } = useTranslation();
  const { data: taskPost, isLoading } = useTaskPost(workspaceId, taskId);
  const post = taskPost?.post;
  const scheduledAt = post?.scheduledAt || publishDate;

  if (isLoading) {
    return (
      <div className="bg-card/50 border-border/70 h-11 animate-pulse rounded-lg border" />
    );
  }

  if (scheduledAt) {
    let formatted: string;
    try {
      formatted = new Intl.DateTimeFormat(i18n.language, {
        timeZone: timezone,
        dateStyle: "full",
        timeStyle: "short",
      }).format(new Date(scheduledAt));
    } catch {
      formatted = scheduledAt;
    }

    const isPublished = post?.status === "PUBLISHED";

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
        {t("tasks.notScheduled")}
        {canOpenEditor && <> &mdash; {t("tasks.scheduleInEditorHint")}</>}
      </span>
    </div>
  );
}

function TaskWorkflowView({ workspaceId, taskId, onUpdated, onClose }: Props) {
  const { t } = useTranslation();
  const state = useTaskWorkflow(workspaceId, taskId);
  const task = state.query.data;
  const { canLeave } = useTaskEditContext();
  const userId = useAuthStore((state) => state.user?.id);
  const role = useWorkspaceStore(
    (state) => state.currentMemberRole || state.currentWorkspace?.myRole,
  );

  const isAssignee = userId === task?.assigneeId;
  const isOtherCreator = role === "CREATOR" && !isAssignee;
  const isTaskFinished = task?.status === "FINISHED";
  const { data: taskPost } = useTaskPost(workspaceId, taskId);
  const post = taskPost?.post;
  const isPostPublished = post?.status === "PUBLISHED";

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");

  async function reload() {
    if (!(await canLeave())) return;
    await state.reload();
  }

  const taskKey =
    ((task as unknown as Record<string, unknown>)?.key as string) ||
    `TASK-${taskId.slice(-4).toUpperCase()}`;

  async function copyKey(keyToCopy: string) {
    try {
      await navigator.clipboard.writeText(keyToCopy);
      toast.success(t("tasks.copiedKey", "Đã sao chép mã công việc"));
    } catch {
      toast.error("Không thể sao chép");
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success(t("tasks.copiedLink", "Đã sao chép liên kết công việc"));
    } catch {
      toast.error("Không thể sao chép liên kết");
    }
  }

  async function handleSaveTitle() {
    const trimmed = titleDraft.trim();
    if (!trimmed || trimmed === task?.name) {
      setIsEditingTitle(false);
      return;
    }
    try {
      await state.field("name", trimmed);
      setIsEditingTitle(false);
      toast.success("Đã cập nhật tiêu đề công việc");
    } catch (err) {
      toast.error(workflowError(err, t));
    }
  }

  const typeBadge = getTaskTypeBadge(task?.type);
  const TypeIcon = typeBadge.icon;

  return (
    <div className="bg-background flex h-full flex-col overflow-hidden">
      {/* 1. Header Bar chuẩn Jira Software */}
      <header className="border-border/70 bg-background/95 sticky top-0 z-30 flex shrink-0 flex-wrap items-center justify-between gap-3 border-b px-5 py-3 backdrop-blur-md">
        {/* Left: Breadcrumb / Task key / Campaign context */}
        <div className="flex min-w-0 items-center gap-2">
          <div
            className={cn(
              "flex size-6 shrink-0 items-center justify-center rounded-[4px] border text-xs shadow-2xs",
              typeBadge.style,
            )}
            title={t(`tasks.types.${task?.type || "POST"}`, typeBadge.name)}
          >
            <TypeIcon className="size-3.5" />
          </div>

          <button
            type="button"
            onClick={() => void copyKey(taskKey)}
            className="group text-muted-foreground hover:text-foreground inline-flex cursor-pointer items-center gap-1 font-mono text-xs font-semibold tabular-nums transition-colors"
            title="Nhấp để sao chép mã công việc"
          >
            <span>{taskKey}</span>
            <Copy className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
          </button>

          <span className="text-muted-foreground/40 font-mono text-xs">/</span>

          {task?.campaignName ? (
            <Link
              to={`/workspaces/${workspaceId}/campaigns`}
              className="text-muted-foreground hover:text-foreground max-w-[160px] truncate text-xs font-medium transition-colors hover:underline sm:max-w-[240px]"
              title={task.campaignName}
            >
              {task.campaignName}
            </Link>
          ) : (
            <span className="text-muted-foreground truncate text-xs font-medium">
              {task?.type
                ? t(`tasks.types.${task.type}`, task.type)
                : t("tasks.details", "Chi tiết")}
            </span>
          )}
        </div>

        {/* Right: Jira Status Lozenge + Quick actions */}
        <div className="flex shrink-0 items-center gap-2">
          {task && <TaskStatusControl key={task.id} task={task} />}

          <div className="bg-border/60 mx-0.5 h-4 w-px" />

          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground size-8 rounded-lg"
            aria-label="Sao chép link"
            title="Sao chép liên kết công việc"
            onClick={() => void copyLink()}
          >
            <Copy className="size-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground size-8 rounded-lg"
            aria-label={t("tasks.workflow.reload")}
            title={t("tasks.workflow.reload")}
            disabled={state.query.isFetching}
            onClick={() => void reload()}
          >
            <RefreshCw
              aria-hidden
              className={cn(
                "size-3.5 transition-transform",
                state.query.isFetching && "text-brand-orange animate-spin",
              )}
            />
          </Button>

          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground size-8 rounded-lg"
              aria-label={t("tasks.close", "Đóng")}
              title={t("tasks.close", "Đóng")}
              onClick={onClose}
            >
              <X className="size-4" />
            </Button>
          )}
        </div>
      </header>

      {/* Main Body with scrolling */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        {state.query.isPending && (
          <div
            role="status"
            className="text-muted-foreground flex items-center justify-center gap-2 py-12 text-sm"
          >
            <Spinner className="text-brand-orange size-4" />
            <span>{t("tasks.loading")}</span>
          </div>
        )}

        {state.query.isError && (
          <div className="p-4 sm:p-6">
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
          </div>
        )}

        {task && !state.query.isError && (
          <div className="space-y-6 p-4 sm:p-6">
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

            {/* 2. Bố cục 2 cột chuẩn Jira (Master - Details) */}
            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
              {/* Cột trái (Main - 58%) */}
              <div className="min-w-0 space-y-6 lg:col-span-7">
                {/* Summary / Title to rõ ràng */}
                <div className="group relative">
                  {isEditingTitle ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={titleDraft}
                        onChange={(e) => setTitleDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") void handleSaveTitle();
                          if (e.key === "Escape") setIsEditingTitle(false);
                        }}
                        className="h-9 px-3 text-base font-semibold tracking-tight sm:text-lg"
                        autoFocus
                      />
                      <Button
                        size="sm"
                        onClick={() => void handleSaveTitle()}
                        className="h-9 px-3 text-xs"
                      >
                        Lưu
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsEditingTitle(false)}
                        className="h-9 px-3 text-xs"
                      >
                        Hủy
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-2">
                      <h1
                        onClick={() => {
                          if (task.allowedActions.canEditDetail) {
                            setTitleDraft(task.name);
                            setIsEditingTitle(true);
                          }
                        }}
                        className={cn(
                          "text-foreground text-lg font-semibold tracking-tight break-words transition-colors sm:text-xl",
                          task.allowedActions.canEditDetail &&
                            "hover:bg-muted/40 -mx-1.5 cursor-pointer rounded px-1.5 py-0.5",
                        )}
                        title={
                          task.allowedActions.canEditDetail
                            ? "Nhấp để đổi tên công việc"
                            : undefined
                        }
                      >
                        {task.name || t("tasks.details")}
                      </h1>
                      {task.allowedActions.canEditDetail && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-foreground size-7 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                          onClick={() => {
                            setTitleDraft(task.name);
                            setIsEditingTitle(true);
                          }}
                          title="Chỉnh sửa tiêu đề"
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* Section Description / Yêu cầu chi tiết */}
                <TaskDescriptionSection task={task} />

                {/* Special Hubs: Post / Meet / Survey */}
                {(task.type === "LIVESTREAM" ||
                  task.type === "EVENT_PLAN" ||
                  Boolean(task.meetingUrl)) && (
                  <TaskMeetingCard
                    workspaceId={task.workspaceId}
                    taskId={task.id}
                    meetingUrl={task.meetingUrl}
                    meetingExpiresAt={task.meetingExpiresAt}
                    isMeetingExpired={task.isMeetingExpired}
                    onMeetingUrlGenerated={() => {
                      onUpdated?.();
                    }}
                  />
                )}

                {/* Workshop Survey Form Builder & Analysis Hub */}
                {task.type === "SURVEY" && (
                  <div className="space-y-4">
                    <SurveyOverviewCard
                      workspaceId={task.workspaceId}
                      taskId={task.id}
                      taskTitle={task.name}
                    />
                  </div>
                )}

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
                          isPostPublished
                            ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-brand-orange-soft text-brand-orange",
                        )}
                      >
                        {isOtherCreator
                          ? "Chỉ xem"
                          : isPostPublished
                            ? "Đã đăng"
                            : "Tự động đăng"}
                      </span>
                    </div>

                    <TaskPostScheduleNotice
                      workspaceId={task.workspaceId}
                      taskId={task.id}
                      timezone={task.dates.timezone || "UTC"}
                      isTaskFinished={isTaskFinished}
                      publishDate={task.publishDate}
                      canOpenEditor={
                        role === "MANAGER" || (role === "CREATOR" && isAssignee)
                      }
                    />

                    {post?.status === "FAILED" && (
                      <div className="bg-destructive/10 border-destructive/25 text-destructive flex items-start gap-3 rounded-lg border p-3 text-xs">
                        <AlertCircle className="text-destructive mt-0.5 size-4 shrink-0" />
                        <div className="min-w-0 space-y-1">
                          <div className="text-destructive font-semibold">
                            Xuất bản bài viết thất bại
                          </div>
                          <p className="text-muted-foreground text-xs leading-relaxed">
                            {post.errorMessage ||
                              "Hệ thống đã thử lại 3 lần nhưng không thể đăng bài lên mạng xã hội."}
                          </p>
                          <p className="text-muted-foreground text-2xs">
                            Vui lòng mở bài viết trong Editor để kiểm tra tài
                            khoản mạng xã hội hoặc đổi lại lịch đăng bài để thử
                            lại.
                          </p>
                        </div>
                      </div>
                    )}

                    {post?.status === "IN_PROGRESS" && post?.errorMessage && (
                      <div className="flex items-start gap-3 rounded-lg border border-blue-500/20 bg-blue-500/10 p-3 text-xs text-blue-600 dark:text-blue-400">
                        <RefreshCw className="mt-0.5 size-4 shrink-0 animate-spin" />
                        <div className="min-w-0">
                          <div className="font-semibold">
                            Đang trong tiến trình xuất bản
                          </div>
                          <p className="text-muted-foreground mt-0.5 text-xs">
                            {post.errorMessage}
                          </p>
                        </div>
                      </div>
                    )}

                    <p className="text-muted-foreground text-xs leading-relaxed">
                      {role === "OWNER"
                        ? "Owner theo dõi tiến độ tại đây. Người được giao và Quản lý soạn bài trong Editor."
                        : isOtherCreator
                          ? (task.status as string) === "TODO" ||
                            (task.status as string) === "BACKLOG"
                            ? `Bài viết đang ở trạng thái cần làm. Đang chờ người phụ trách (${task.assigneeName || "chưa phân công"}) bắt đầu viết bài.`
                            : "Bạn đang xem bài viết của người phụ trách khác. Chỉ người được giao hoặc Quản lý mới có quyền chỉnh sửa."
                          : isTaskFinished
                            ? isPostPublished
                              ? "Bài viết đã hoàn thành phê duyệt và đã được đăng tải tự động lên các kênh mạng xã hội."
                              : "Bài viết đã hoàn thành phê duyệt. Hệ thống sẽ tự động xuất bản lên các kênh mạng xã hội theo đúng lịch đăng đã lên."
                            : "Soạn thảo nội dung và chuẩn bị hình ảnh bài viết. Lịch xuất bản do Quản lý thiết lập tại Chi tiết Task sẽ tự động áp dụng khi bài viết được duyệt."}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {role === "OWNER" ? null : isOtherCreator ? (
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
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="h-8 text-xs"
                        >
                          <Link
                            to={`/workspaces/${workspaceId}/task-approvals?task=${encodeURIComponent(taskId)}`}
                            className="gap-2"
                          >
                            <ClipboardCheck className="text-brand-orange size-3.5" />
                            {t("tasks.approvalPage.title")}
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Phê duyệt / Approval Workflow Section */}
                {task.campaignId &&
                  task.type !== "POST" &&
                  (task.sourceType === "CAMPAIGN" ||
                    task.sourceType === "CONTENT_REQUEST") &&
                  (task.status === "IN_PROGRESS" ||
                    task.status === "IN_REVIEW" ||
                    task.status === "FINISHED") && (
                    <TaskApprovalSection task={task} />
                  )}

                {/* Section Sub-tasks với progress bar kiểu Jira */}
                <CampaignSubtasks
                  key={task.id}
                  workspaceId={task.workspaceId}
                  taskId={task.id}
                  parentRevision={task.workflowRevision}
                  parentDueDate={task.dueDate}
                />

                {/* Section Activity (Tabs: All, Comments, History) */}
                {role !== "CLIENT" && (
                  <TaskPhoneMedia
                    workspaceId={workspaceId}
                    taskId={taskId}
                    isPostTask={task.type === "POST"}
                    isAssignee={task.assigneeId === userId}
                  />
                )}
                <div className="border-border/60 space-y-3.5 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-foreground flex items-center gap-2 text-sm font-semibold">
                      <MessageSquare className="text-brand-orange size-4" />
                      <span>{t("tasks.activity")}</span>
                    </h3>
                  </div>

                  <Tabs defaultValue="comments" className="w-full">
                    <TabsList className="bg-muted/60 border-border/50 h-8 rounded-lg border p-0.5">
                      <TabsTrigger
                        value="all"
                        className="h-7 rounded-md px-3 text-xs"
                      >
                        Tất cả
                      </TabsTrigger>
                      <TabsTrigger
                        value="comments"
                        className="h-7 rounded-md px-3 text-xs"
                      >
                        Bình luận
                      </TabsTrigger>
                      <TabsTrigger
                        value="history"
                        className="h-7 rounded-md px-3 text-xs"
                      >
                        Lịch sử
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="comments" className="pt-3">
                      {role !== "OWNER" && (
                        <TaskComments
                          workspaceId={workspaceId}
                          taskId={taskId}
                        />
                      )}
                    </TabsContent>

                    <TabsContent value="history" className="space-y-4 pt-3">
                      {task.campaignId && task.type !== "POST" && (
                        <TaskApprovalHistoryTab task={task} />
                      )}
                      <TaskAuditTimeline task={task} />
                    </TabsContent>

                    <TabsContent value="all" className="space-y-6 pt-3">
                      {role !== "OWNER" && (
                        <TaskComments
                          workspaceId={workspaceId}
                          taskId={taskId}
                        />
                      )}
                      <div className="border-border/50 space-y-3 border-t pt-4">
                        <h4 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                          Nhật ký hoạt động &amp; Phê duyệt
                        </h4>
                        {task.campaignId && task.type !== "POST" && (
                          <TaskApprovalHistoryTab task={task} />
                        )}
                        <TaskAuditTimeline task={task} />
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>

              {/* Cột phải (Sidebar / Details - 42%) */}
              <div className="min-w-0 lg:col-span-5">
                <TaskDetailsSidebar task={task} />
              </div>
            </div>
          </div>
        )}
      </div>
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
