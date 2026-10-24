import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  AlertCircle,
  AlignLeft,
  Calendar,
  Clock,
  ExternalLink,
  FileText,
  FolderKanban,
  Globe,
  Link2,
  RefreshCw,
  Share2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskReferenceFields } from "@/pages/tasks/components/TaskReferenceFields";
import { InlineTaskField } from "@/pages/tasks/components/InlineTaskField";
import { TaskInlineAssignment } from "@/pages/tasks/components/TaskInlineAssignment";
import { useInlineTaskField } from "@/pages/tasks/hooks/useInlineTaskField";
import { useTaskWorkflow } from "@/pages/tasks/hooks/useTaskWorkflow";
import { taskInstant, taskLocalMinute } from "@/pages/tasks/utils/taskWorkflowDates";
import { canonicalTaskStatus } from "@/pages/tasks/utils/taskStatus";
import { STATUS_CONFIG } from "@/pages/tasks/constants";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTaskPost } from "@/pages/tasks/hooks/useTaskPost";
import { useWorkspaceStore } from "@/store/workspaceStore";
import type { TaskWorkflow } from "@/pages/tasks/types/taskWorkflow";

function readableDate(value: string | null, zone: string, language: string) {
  if (!value || !Number.isFinite(Date.parse(value))) return "";
  try {
    return new Intl.DateTimeFormat(language, {
      timeZone: zone,
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return "";
  }
}
function safeReference(value: string) {
  try {
    const url = new URL(value);
    return (
      ["http:", "https:"].includes(url.protocol) &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}

export function TaskDeadlineField({
  task,
  scope = "detail",
}: {
  task: TaskWorkflow;
  scope?: string;
}) {
  const { t, i18n } = useTranslation();
  const state = useTaskWorkflow(task.workspaceId, task.id);
  const zone = task.dates.timezone || "UTC";
  return (
    <div className="space-y-1.5">
      <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
        <Calendar className="text-muted-foreground size-3.5" />
        <span>{t("tasks.deadline")}</span>
      </div>
      <InlineTaskField
        id={`task-${task.id}-${scope}-deadline`}
        label=""
        type="datetime-local"
        value={taskLocalMinute(task.dueDate, zone)}
        displayValue={readableDate(task.dueDate, zone, i18n.language)}
        editable={task.allowedActions.canEditDetail && task.dates.ready}
        min={task.dates.minDate ? `${task.dates.minDate}T00:00` : undefined}
        max={
          task.publishDate
            ? taskLocalMinute(task.publishDate, zone)
            : task.dates.maxDate
              ? `${task.dates.maxDate}T23:59`
              : undefined
        }
        required={Boolean(task.assigneeId)}
        save={async (value) => {
          if (value && task.publishDate) {
            const nextDue = new Date(taskInstant(value, zone) || "").getTime();
            const pubTime = new Date(task.publishDate).getTime();
            if (nextDue >= pubTime) {
              toast.error(t("tasks.dueDateMustBeBeforePublishDate"));
              return;
            }
          }
          return state.field(
            "dueDate",
            value ? taskInstant(value, zone) : null,
          );
        }}
        retry={state.retry}
      />
    </div>
  );
}

export function TaskPublishTimeField({
  task,
  scope = "detail",
}: {
  task: TaskWorkflow;
  scope?: string;
}) {
  const { t, i18n } = useTranslation();
  const state = useTaskWorkflow(task.workspaceId, task.id);
  const zone = task.dates.timezone || "UTC";
  const { data: taskPost } = useTaskPost(
    task.workspaceId,
    task.id,
    task.type === "POST",
  );
  const post = taskPost?.post;
  const currentPublish = task.publishDate || post?.scheduledAt || null;
  const currentWorkspace = useWorkspaceStore((s) => s.currentWorkspace);
  const currentMemberRole = useWorkspaceStore((s) => s.currentMemberRole);
  const role = currentMemberRole || currentWorkspace?.myRole;
  const isManager = role === "MANAGER";
  const isPublishedOrPublishing =
    post?.status === "PUBLISHED" ||
    post?.status === "IN_PROGRESS" ||
    post?.status === "PUBLISHING";
  const canEditPublish =
    task.dates.ready &&
    task.lockReason !== "TASK_CAMPAIGN_COMPLETED" &&
    (task.allowedActions.canEditDetail ||
      (isManager && !isPublishedOrPublishing && (task.status as string) !== "CANCELLED"));

  return (
    <div className="space-y-1.5 pt-2">
      <div className="flex items-center justify-between">
        <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
          <Clock className="text-brand-orange size-3.5" />
          <span>{t("tasks.publishTime")}</span>
        </div>
        {currentPublish && (
          <div>
            {post?.status === "PUBLISHED" ? (
              <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-2xs rounded px-2 py-0.5 font-semibold">
                Đã đăng
              </span>
            ) : post?.status === "FAILED" ? (
              <span className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-2xs rounded px-2 py-0.5 font-semibold">
                Thất bại
              </span>
            ) : post?.status === "IN_PROGRESS" || post?.status === "PUBLISHING" ? (
              <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-2xs rounded px-2 py-0.5 font-semibold animate-pulse">
                Đang đăng...
              </span>
            ) : (
              <span className="bg-brand-orange-soft text-brand-orange text-2xs rounded px-2 py-0.5 font-semibold">
                Lên lịch
              </span>
            )}
          </div>
        )}
      </div>

      <InlineTaskField
        id={`task-${task.id}-${scope}-publishDate`}
        label=""
        type="datetime-local"
        value={taskLocalMinute(currentPublish, zone)}
        displayValue={
          currentPublish
            ? readableDate(currentPublish, zone, i18n.language)
            : t("tasks.notScheduled")
        }
        editable={canEditPublish}
        min={
          task.dueDate
            ? taskLocalMinute(task.dueDate, zone)
            : task.dates.minDate
              ? `${task.dates.minDate}T00:00`
              : undefined
        }
        max={task.dates.maxDate ? `${task.dates.maxDate}T23:59` : undefined}
        save={async (value) => {
          if (value && task.dueDate) {
            const nextPub = new Date(taskInstant(value, zone) || "").getTime();
            const dueTime = new Date(task.dueDate).getTime();
            if (nextPub <= dueTime) {
              toast.error(t("tasks.publishDateMustBeAfterDueDate"));
              return;
            }
          }
          return state.field(
            "publishDate",
            value ? taskInstant(value, zone) : null,
          );
        }}
        retry={state.retry}
      />

      {post?.status === "FAILED" && (
        <div className="bg-destructive/10 border-destructive/20 text-destructive mt-1.5 flex items-start gap-1.5 rounded-md border p-2 text-2xs">
          <AlertCircle className="size-3.5 shrink-0 mt-0.5" />
          <div className="leading-tight">
            <span className="font-semibold">Lỗi đăng bài: </span>
            <span>{post.errorMessage || "Đã thử lại 3 lần nhưng không thành công"}</span>
          </div>
        </div>
      )}

      {post?.status === "IN_PROGRESS" && post?.errorMessage && (
        <div className="bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400 mt-1.5 flex items-start gap-1.5 rounded-md border p-2 text-2xs">
          <RefreshCw className="size-3.5 shrink-0 mt-0.5 animate-spin" />
          <span className="leading-tight">{post.errorMessage}</span>
        </div>
      )}
    </div>
  );
}

function References({ task }: { task: TaskWorkflow }) {
  const { t } = useTranslation();
  const state = useTaskWorkflow(task.workspaceId, task.id);
  const field = useInlineTaskField(
    `task-${task.id}-references`,
    task.inputReferences,
    (value) => state.field("inputReferences", value),
  );

  if (!task.allowedActions.canEditDetail) {
    if (!task.inputReferences || task.inputReferences.length === 0) {
      return null;
    }
    return (
      <section className="bg-card/50 border-border/70 space-y-2.5 rounded-xl border p-4 shadow-xs">
        <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase">
          <Link2 className="text-brand-orange size-3.5" />
          <span>{t("tasks.workflow.fields.inputReferences")}</span>
        </div>
        <div className="flex flex-wrap gap-2 pt-0.5">
          {task.inputReferences.map((ref, index) => {
            const isUrl = safeReference(ref.url);
            return isUrl ? (
              <a
                key={index}
                href={ref.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-muted/40 hover:bg-muted/80 border-border/80 text-foreground group inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs transition-colors"
              >
                <Link2 className="text-brand-orange size-3.5 shrink-0" />
                <span className="max-w-[200px] truncate font-medium">
                  {ref.label || ref.url}
                </span>
                <ExternalLink className="text-muted-foreground group-hover:text-foreground size-3 shrink-0" />
              </a>
            ) : (
              <span
                key={index}
                className="bg-muted/40 border-border/80 text-muted-foreground inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs"
              >
                <Link2 className="size-3.5 shrink-0" />
                <span>{ref.label}</span>
              </span>
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <div
      className="bg-card/50 border-border/70 space-y-3 rounded-xl border p-4 shadow-xs"
      onBlur={(event) => {
        if (
          field.status !== "error" &&
          !event.currentTarget.contains(event.relatedTarget as Node | null)
        )
          void field.commit();
      }}
    >
      <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase">
        <Link2 className="text-brand-orange size-3.5" />
        <span>{t("tasks.workflow.fields.inputReferences")}</span>
      </div>
      <fieldset disabled={field.status === "saving"}>
        <TaskReferenceFields
          references={field.value}
          disabled={field.status === "saving"}
          onChange={field.change}
        />
      </fieldset>
      {(field.error || field.status === "saving") && (
        <p aria-live="polite" className="text-xs">
          {field.error ||
            (field.status === "saving" ? t("tasks.inline.saving") : "")}
        </p>
      )}
      {field.error && (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              state.retry();
              void field.commit();
            }}
          >
            {t("tasks.retry")}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              state.retry();
              field.discard();
            }}
          >
            {t("tasks.inline.discard")}
          </Button>
        </div>
      )}
    </div>
  );
}

export function TaskInlineDetails({ task }: { task: TaskWorkflow }) {
  const { t } = useTranslation();
  const state = useTaskWorkflow(task.workspaceId, task.id);
  const zone = task.dates.timezone || "UTC";
  const canonical = canonicalTaskStatus(task.status);
  const statusCfg = STATUS_CONFIG[canonical] || STATUS_CONFIG.TODO;

  return (
    <div className="space-y-4">
      {/* Top Status & Type Badges */}
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
            statusCfg.bg,
            statusCfg.text,
            statusCfg.border,
          )}
        >
          <span
            className={cn(
              "size-1.5 rounded-full",
              statusCfg.dot,
              canonical === "IN_REVIEW" && "animate-ping",
            )}
          />
          {t(`tasks.status.${task.status}`, {
            defaultValue: statusCfg.defaultLabel,
          })}
        </span>

        <span className="bg-muted/60 text-foreground border-border/80 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium">
          {task.type === "POST" ? (
            <Share2 className="text-brand-orange size-3.5" />
          ) : (
            <FileText className="text-muted-foreground size-3.5" />
          )}
          {t(`tasks.types.${task.type}`)}
        </span>

        {task.reviewStep && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-300">
            <ShieldCheck className="size-3.5 text-amber-600 dark:text-amber-400" />
            {t(`tasks.inline.reviewSteps.${task.reviewStep}`)}
          </span>
        )}
      </div>

      {/* Description Section */}
      <div className="bg-card/50 border-border/70 space-y-2 rounded-xl border p-4 shadow-xs">
        <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase">
          <AlignLeft className="text-brand-orange size-3.5" />
          <span>{t("tasks.workflow.fields.description")}</span>
        </div>
        <InlineTaskField
          id={`task-${task.id}-description`}
          label=""
          value={task.description || ""}
          editable={task.allowedActions.canEditDetail}
          multiline
          maxLength={10000}
          required={Boolean(task.assigneeId)}
          save={(value) => state.field("description", value)}
          retry={state.retry}
        />
      </div>

      {/* Properties & Assignment Card */}
      <div className="bg-card/50 border-border/70 space-y-4 rounded-xl border p-4 shadow-xs">
        <h3 className="text-muted-foreground flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase">
          <Sparkles className="text-brand-orange size-3.5" />
          <span>
            {t("tasks.workflow.properties", {
              defaultValue: "Thông tin & Phân công",
            })}
          </span>
        </h3>

        <TaskInlineAssignment task={task} />

        <div className="border-border/50 space-y-3 border-t pt-3">
          <TaskDeadlineField task={task} />
          {task.type === "POST" && <TaskPublishTimeField task={task} />}
          <div className="text-2xs text-muted-foreground flex items-center gap-1.5 pt-1.5">
            <Globe className="size-3" />
            <span>{t("tasks.workflow.timezone", { timezone: zone })}</span>
          </div>
        </div>
      </div>

      {/* References */}
      <References task={task} />

      {/* Context & Campaign Card */}
      {(task.sourceType || task.campaignId) && (
        <div className="bg-muted/20 border-border/70 space-y-2.5 rounded-xl border p-3.5 text-xs">
          <div className="text-muted-foreground flex items-center gap-1.5 font-semibold tracking-wider uppercase">
            <FolderKanban className="text-brand-orange size-3.5" />
            <span>Ngữ cảnh &amp; Nguồn gốc</span>
          </div>

          <div className="space-y-2 pt-0.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">{t("tasks.source")}</span>
              <span className="bg-muted text-foreground rounded-md px-2 py-0.5 font-medium">
                {task.sourceType
                  ? t(`tasks.sources.${task.sourceType}`)
                  : t("tasks.missing")}
              </span>
            </div>

            {task.campaignId && (
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">Chiến dịch</span>
                <Link
                  className="text-brand-orange hover:text-brand-orange/80 group flex items-center gap-1 font-medium transition-colors"
                  to={`/workspaces/${task.workspaceId}/campaigns`}
                >
                  <span className="max-w-[200px] truncate">
                    {task.campaignName || t("tasks.openCampaign")}
                  </span>
                  <ExternalLink className="size-3 opacity-70 group-hover:opacity-100" />
                </Link>
              </div>
            )}

            {task.sourceType === "CONTENT_REQUEST" && task.sourceRefId && (
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">Yêu cầu nội dung</span>
                <Link
                  className="text-brand-orange hover:text-brand-orange/80 group flex items-center gap-1 font-medium transition-colors"
                  to={`/workspaces/${task.workspaceId}/requests?request=${encodeURIComponent(task.sourceRefId)}`}
                >
                  <span>{t("tasks.openRequest")}</span>
                  <ExternalLink className="size-3 opacity-70 group-hover:opacity-100" />
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
