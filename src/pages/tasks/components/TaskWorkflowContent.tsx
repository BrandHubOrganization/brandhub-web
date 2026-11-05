import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ClipboardCheck,
  Copy,
  FileText,
  HelpCircle,
  MessageSquare,
  Pencil,
  RefreshCw,
  Share2,
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
import { SurveyTaskSection } from "@/pages/tasks/components/survey/SurveyTaskSection";
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
      return {
        icon: Video,
        style: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/25",
        name: "Event / Live",
      };
    case "SURVEY":
      return {
        icon: HelpCircle,
        style: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25",
        name: "Survey",
      };
    default:
      return {
        icon: FileText,
        style: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/25",
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
    <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-2.5 text-xs text-muted-foreground shadow-2xs">
      <div className="font-semibold text-foreground text-2xs uppercase tracking-wider">
        Mốc thời gian &amp; Thông tin kiểm soát
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-2xs">
        <div>
          <span className="text-muted-foreground/80">Phiên bản quy trình: </span>
          <span className="font-mono text-foreground font-semibold tabular-nums">
            rev#{task.workflowRevision ?? 1}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground/80">Múi giờ làm việc: </span>
          <span className="text-foreground font-medium">{zone}</span>
        </div>
        {started && (
          <div>
            <span className="text-muted-foreground/80">Thời gian bắt đầu: </span>
            <span className="text-foreground font-medium">{started}</span>
          </div>
        )}
        {publish && (
          <div>
            <span className="text-muted-foreground/80">Thời gian đăng bài: </span>
            <span className="text-foreground font-medium">{publish}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function TaskWorkflowView({
  workspaceId,
  taskId,
  onUpdated,
  onClose,
}: Props) {
  const { t } = useTranslation();
  const state = useTaskWorkflow(workspaceId, taskId);
  const task = state.query.data;
  const { canLeave } = useTaskEditContext();

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
    <div className="flex flex-col h-full overflow-hidden bg-background">
      {/* 1. Header Bar chuẩn Jira Software */}
      <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-border/70 bg-background/95 px-5 py-3 backdrop-blur-md shrink-0">
        {/* Left: Breadcrumb / Task key / Campaign context */}
        <div className="flex items-center gap-2 min-w-0">
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
            className="group inline-flex items-center gap-1 font-mono text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer transition-colors tabular-nums"
            title="Nhấp để sao chép mã công việc"
          >
            <span>{taskKey}</span>
            <Copy className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          <span className="text-muted-foreground/40 text-xs font-mono">/</span>

          {task?.campaignName ? (
            <Link
              to={`/workspaces/${workspaceId}/campaigns`}
              className="text-muted-foreground hover:text-foreground truncate text-xs font-medium max-w-[160px] sm:max-w-[240px] hover:underline transition-colors"
              title={task.campaignName}
            >
              {task.campaignName}
            </Link>
          ) : (
            <span className="text-muted-foreground truncate text-xs font-medium">
              {task?.type ? t(`tasks.types.${task.type}`, task.type) : t("tasks.details", "Chi tiết")}
            </span>
          )}
        </div>

        {/* Right: Jira Status Lozenge + Quick actions */}
        <div className="flex items-center gap-2 shrink-0">
          {task && <TaskStatusControl key={task.id} task={task} />}

          <div className="h-4 w-px bg-border/60 mx-0.5" />

          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground hover:text-foreground rounded-lg"
            aria-label="Sao chép link"
            title="Sao chép liên kết công việc"
            onClick={() => void copyLink()}
          >
            <Copy className="size-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground hover:text-foreground rounded-lg"
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
              className="size-8 text-muted-foreground hover:text-foreground rounded-lg"
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
            <Spinner className="size-4 text-brand-orange" />
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
          <div className="p-4 sm:p-6 space-y-6">
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
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Cột trái (Main - 58%) */}
              <div className="lg:col-span-7 space-y-6 min-w-0">
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
                        className="text-base sm:text-lg font-semibold h-9 px-3 tracking-tight"
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
                          "text-lg sm:text-xl font-semibold tracking-tight text-foreground break-words transition-colors",
                          task.allowedActions.canEditDetail &&
                            "hover:bg-muted/40 cursor-pointer rounded px-1.5 -mx-1.5 py-0.5",
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
                          className="size-7 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-opacity shrink-0"
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

                {task.type === "SURVEY" && (
                  <SurveyTaskSection
                    workspaceId={task.workspaceId}
                    taskId={task.id}
                    taskTitle={task.name}
                    onUpdated={() => {
                      onUpdated?.();
                    }}
                  />
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
                        <Button variant="outline" size="sm" asChild className="h-8 text-xs">
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
                <div className="space-y-3.5 pt-4 border-t border-border/60">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <MessageSquare className="size-4 text-brand-orange" />
                      <span>{t("tasks.activity")}</span>
                    </h3>
                  </div>

                  <Tabs defaultValue="comments" className="w-full">
                    <TabsList className="h-8 p-0.5 bg-muted/60 border border-border/50 rounded-lg">
                      <TabsTrigger value="all" className="text-xs h-7 px-3 rounded-md">
                        Tất cả
                      </TabsTrigger>
                      <TabsTrigger value="comments" className="text-xs h-7 px-3 rounded-md">
                        Bình luận
                      </TabsTrigger>
                      <TabsTrigger value="history" className="text-xs h-7 px-3 rounded-md">
                        Lịch sử
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="comments" className="pt-3">
                      <TaskComments workspaceId={workspaceId} taskId={taskId} />
                    </TabsContent>

                    <TabsContent value="history" className="pt-3 space-y-4">
                      {task.campaignId && task.type !== "POST" && (
                        <TaskApprovalHistoryTab task={task} />
                      )}
                      <TaskAuditTimeline task={task} />
                    </TabsContent>

                    <TabsContent value="all" className="pt-3 space-y-6">
                      <TaskComments workspaceId={workspaceId} taskId={taskId} />
                      <div className="border-t border-border/50 pt-4 space-y-3">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
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
              <div className="lg:col-span-5 min-w-0">
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
