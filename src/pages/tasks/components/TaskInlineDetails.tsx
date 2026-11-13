import { opensPostEditor } from "@/types/task";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  AlertCircle,
  AlignLeft,
  Calendar,
  Clock,
  ExternalLink,
  FolderKanban,
  Globe,
  Link2,
  Share2,
  ShieldCheck,
  Sparkles,
  User2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { JiraDatePicker } from "@/components/ui/jira-date-picker";
import { TaskReferenceFields } from "@/pages/tasks/components/TaskReferenceFields";
import { InlineTaskField } from "@/pages/tasks/components/InlineTaskField";
import { TaskInlineAssignment } from "@/pages/tasks/components/TaskInlineAssignment";
import { TaskAssigneePicker } from "@/pages/tasks/components/TaskAssigneePicker";
import { TaskTargetPlatformsPicker } from "@/pages/tasks/components/TaskTargetPlatformsPicker";
import { TaskPartnerContactSection } from "@/pages/tasks/components/TaskPartnerContactSection";
import { useInlineTaskField } from "@/pages/tasks/hooks/useInlineTaskField";
import { useTaskWorkflow } from "@/pages/tasks/hooks/useTaskWorkflow";
import { STATUS_CONFIG } from "@/pages/tasks/constants";
import { workflowError } from "@/pages/tasks/utils/taskWorkflowErrors";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTaskPost } from "@/pages/tasks/hooks/useTaskPost";
import { useWorkspaceStore } from "@/store/workspaceStore";
import type { TaskWorkflow } from "@/pages/tasks/types/taskWorkflow";

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

function getPlatformBadgeStyle(platform: string) {
  const p = platform.toUpperCase();
  if (p.includes("FACEBOOK")) {
    return "bg-[#1877F2]/10 text-[#1877F2] border-[#1877F2]/25";
  }
  if (p.includes("TIKTOK")) {
    return "bg-slate-900/10 text-slate-900 dark:bg-white/10 dark:text-white border-slate-900/20 dark:border-white/20";
  }
  if (p.includes("INSTAGRAM")) {
    return "bg-[#E4405F]/10 text-[#E4405F] border-[#E4405F]/25";
  }
  if (p.includes("YOUTUBE")) {
    return "bg-[#FF0000]/10 text-[#FF0000] border-[#FF0000]/25";
  }
  return "bg-muted text-muted-foreground border-border";
}

export function TaskDeadlineField({
  task,
  scope = "detail",
}: {
  task: TaskWorkflow;
  scope?: string;
}) {
  const { t } = useTranslation();
  const state = useTaskWorkflow(task.workspaceId, task.id);
  const zone = task.dates.timezone || "UTC";
  const editable = task.allowedActions.canEditDetail && task.dates.ready;
  const [saving, setSaving] = useState(false);

  const handleSave = async (nextIso: string | null) => {
    if (nextIso && task.publishDate) {
      const nextDue = new Date(nextIso).getTime();
      const pubTime = new Date(task.publishDate).getTime();
      if (nextDue >= pubTime) {
        toast.error(
          t(
            "tasks.dueDateMustBeBeforePublishDate",
            "Hạn hoàn thành phải trước thời gian đăng bài",
          ),
        );
        return Promise.reject(
          new Error(t("tasks.dueDateMustBeBeforePublishDate")),
        );
      }
    }
    setSaving(true);
    try {
      await state.field("dueDate", nextIso);
    } catch (err) {
      toast.error(workflowError(err, t));
      throw err;
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-1">
      <JiraDatePicker
        id={`task-${task.id}-${scope}-deadline`}
        value={task.dueDate}
        onChange={handleSave}
        timezone={zone}
        includeTime={true}
        disabled={!editable || saving}
        readOnly={!editable}
        placeholder={t("tasks.deadlinePlaceholder", "Thiết lập thời hạn...")}
        minDate={
          task.dates.minDate ? `${task.dates.minDate}T00:00:00Z` : undefined
        }
        maxDate={
          task.publishDate
            ? task.publishDate
            : task.dates.maxDate
              ? `${task.dates.maxDate}T23:59:59Z`
              : undefined
        }
        allowClear={!task.assigneeId}
        ariaLabel={t("tasks.deadline", "Thời hạn hoàn thành")}
      />
      {saving && (
        <span className="text-3xs text-muted-foreground italic">
          {t("tasks.inline.saving", "Đang lưu...")}
        </span>
      )}
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
  const { t } = useTranslation();
  const state = useTaskWorkflow(task.workspaceId, task.id);
  const zone = task.dates.timezone || "UTC";
  const { data: taskPost } = useTaskPost(
    task.workspaceId,
    task.id,
    opensPostEditor(task.type),
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
      (isManager &&
        !isPublishedOrPublishing &&
        (task.status as string) !== "CANCELLED"));
  const [saving, setSaving] = useState(false);

  const handleSave = async (nextIso: string | null) => {
    if (nextIso && task.dueDate) {
      const nextPub = new Date(nextIso).getTime();
      const dueTime = new Date(task.dueDate).getTime();
      if (nextPub <= dueTime) {
        toast.error(
          t(
            "tasks.publishDateMustBeAfterDueDate",
            "Thời gian đăng bài phải sau hạn hoàn thành",
          ),
        );
        return Promise.reject(
          new Error(t("tasks.publishDateMustBeAfterDueDate")),
        );
      }
    }
    setSaving(true);
    try {
      await state.field("publishDate", nextIso);
    } catch (err) {
      toast.error(workflowError(err, t));
      throw err;
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-1.5 pt-1">
      <div className="flex items-center justify-between">
        <div className="text-muted-foreground text-2xs flex items-center gap-1.5 font-semibold tracking-wider uppercase">
          <Clock className="text-brand-orange size-3" />
          <span>{t("tasks.publishTime", "Lịch đăng")}</span>
        </div>
        {currentPublish && (
          <div>
            {post?.status === "PUBLISHED" ? (
              <span className="text-3xs rounded border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 font-semibold text-emerald-600 dark:text-emerald-400">
                Đã đăng
              </span>
            ) : post?.status === "FAILED" ? (
              <span className="text-3xs rounded border border-rose-500/20 bg-rose-500/10 px-1.5 py-0.5 font-semibold text-rose-600 dark:text-rose-400">
                Thất bại
              </span>
            ) : post?.status === "IN_PROGRESS" ||
              post?.status === "PUBLISHING" ? (
              <span className="text-3xs animate-pulse rounded border border-blue-500/20 bg-blue-500/10 px-1.5 py-0.5 font-semibold text-blue-600 dark:text-blue-400">
                Đang đăng...
              </span>
            ) : (
              <span className="bg-brand-orange/10 text-brand-orange border-brand-orange/20 text-3xs rounded border px-1.5 py-0.5 font-semibold">
                Lên lịch
              </span>
            )}
          </div>
        )}
      </div>

      <JiraDatePicker
        id={`task-${task.id}-${scope}-publishDate`}
        value={currentPublish}
        onChange={handleSave}
        timezone={zone}
        includeTime={true}
        disabled={!canEditPublish || saving}
        readOnly={!canEditPublish}
        placeholder={t(
          "tasks.publishPlaceholder",
          "Thiết lập thời gian đăng...",
        )}
        minDate={
          task.dueDate ||
          (task.dates.minDate ? `${task.dates.minDate}T00:00:00Z` : undefined)
        }
        maxDate={
          task.dates.maxDate ? `${task.dates.maxDate}T23:59:59Z` : undefined
        }
        allowClear={true}
        ariaLabel={t("tasks.publishTime", "Lịch đăng")}
      />
      {saving && (
        <span className="text-3xs text-muted-foreground italic">
          {t("tasks.inline.saving", "Đang lưu...")}
        </span>
      )}
    </div>
  );
}

export function References({ task }: { task: TaskWorkflow }) {
  const { t } = useTranslation();
  const state = useTaskWorkflow(task.workspaceId, task.id);
  const field = useInlineTaskField(
    `task-${task.id}-references`,
    task.inputReferences,
    (value) => state.field("inputReferences", value),
  );

  if (!task.allowedActions.canEditDetail) {
    if (!task.inputReferences || task.inputReferences.length === 0) {
      return (
        <span className="text-3xs text-muted-foreground italic">
          Không có tài liệu tham khảo
        </span>
      );
    }
    return (
      <div className="flex flex-wrap gap-1.5 pt-0.5">
        {task.inputReferences.map((ref, index) => {
          const isUrl = safeReference(ref.url);
          return isUrl ? (
            <a
              key={index}
              href={ref.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-muted/40 hover:bg-muted/80 border-border/80 text-foreground group text-2xs inline-flex items-center gap-1.5 rounded-md border px-2 py-1 transition-colors"
            >
              <Link2 className="text-brand-orange size-3 shrink-0" />
              <span className="max-w-[150px] truncate font-medium">
                {ref.label || ref.url}
              </span>
              <ExternalLink className="text-muted-foreground group-hover:text-foreground size-2.5 shrink-0" />
            </a>
          ) : (
            <span
              key={index}
              className="bg-muted/40 border-border/80 text-muted-foreground text-2xs inline-flex items-center gap-1.5 rounded-md border px-2 py-1"
            >
              <Link2 className="size-3 shrink-0" />
              <span>{ref.label}</span>
            </span>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className="space-y-2 pt-0.5"
      onBlur={(event) => {
        if (
          field.status !== "error" &&
          !event.currentTarget.contains(event.relatedTarget as Node | null)
        )
          void field.commit();
      }}
    >
      <fieldset disabled={field.status === "saving"}>
        <TaskReferenceFields
          references={field.value}
          disabled={field.status === "saving"}
          onChange={field.change}
        />
      </fieldset>
      {(field.error || field.status === "saving") && (
        <p aria-live="polite" className="text-2xs text-muted-foreground">
          {field.error ||
            (field.status === "saving" ? t("tasks.inline.saving") : "")}
        </p>
      )}
      {field.error && (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs"
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
            className="h-7 text-xs"
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

export function TaskDescriptionSection({ task }: { task: TaskWorkflow }) {
  const { t } = useTranslation();
  const state = useTaskWorkflow(task.workspaceId, task.id);

  return (
    <div className="space-y-2">
      <div className="text-foreground flex items-center justify-between text-xs font-semibold">
        <div className="text-muted-foreground text-2xs flex items-center gap-1.5 font-semibold tracking-wider uppercase">
          <AlignLeft className="text-brand-orange size-3.5" />
          <span>
            {t("tasks.workflow.fields.description", "Mô tả / Yêu cầu chi tiết")}
          </span>
        </div>
      </div>

      <div className="group border-border/70 bg-card/40 hover:border-border rounded-xl border p-4 shadow-2xs transition-colors">
        <InlineTaskField
          id={`task-${task.id}-description`}
          label=""
          value={task.description || ""}
          placeholder="Thêm mô tả chi tiết cho công việc này... (Add a description...)"
          editable={task.allowedActions.canEditDetail}
          multiline
          maxLength={10000}
          required={Boolean(task.assigneeId)}
          save={(value) => state.field("description", value)}
          retry={state.retry}
        />

        {task.sourceType === "CAMPAIGN" && (
          <div className="mt-4 space-y-1.5 pt-1">
            <div className="text-2xs text-muted-foreground flex items-center gap-1.5 font-semibold tracking-wider uppercase">
              <Sparkles className="text-brand-orange size-3" />
              <span>
                {t(
                  "mediaPackage.offering.acceptance",
                  "Tiêu chí nghiệm thu (Acceptance Criteria)",
                )}
              </span>
            </div>
            <InlineTaskField
              id={`task-${task.id}-acceptance-criteria`}
              label=""
              value={task.typeMetadata?.acceptanceCriteria ?? ""}
              placeholder="Thêm tiêu chí nghiệm thu công việc..."
              editable={task.allowedActions.canEditDetail}
              multiline
              maxLength={2000}
              save={(value) => state.field("acceptanceCriteria", value)}
              retry={state.retry}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export function TaskDetailsSidebar({ task }: { task: TaskWorkflow }) {
  const role = useWorkspaceStore(
    (state) => state.currentMemberRole || state.currentWorkspace?.myRole,
  );
  const { t } = useTranslation();
  const [openedAt] = useState(Date.now);
  const zone = task.dates.timezone || "UTC";
  const canEditAssignee = task.allowedActions.canAssign;

  const assigneeInitials = task.assigneeName
    ? task.assigneeName
        .trim()
        .split(/\s+/)
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  // Overdue check
  const isOverdue = Boolean(
    task.dueDate &&
    Number.isFinite(Date.parse(task.dueDate)) &&
    new Date(task.dueDate).getTime() < openedAt &&
    task.status !== "FINISHED" &&
    task.status !== "CANCELLED",
  );

  const platforms: string[] = Array.isArray(task.typeMetadata?.targetPlatforms)
    ? (task.typeMetadata.targetPlatforms as string[])
    : [];

  return (
    <aside className="border-border/70 bg-card/60 space-y-4 rounded-xl border p-4 shadow-2xs">
      <div className="flex items-center justify-between pb-1">
        <h3 className="text-2xs text-muted-foreground flex items-center gap-1.5 font-bold tracking-wider uppercase">
          <Sparkles className="text-brand-orange size-3" />
          <span>{t("tasks.details")}</span>
        </h3>
        <span className="text-3xs text-muted-foreground/60 font-mono tabular-nums">
          #{task.id.slice(-6).toUpperCase()}
        </span>
      </div>

      <div className="space-y-4">
        {/* Assignee */}
        <div className="space-y-1.5 pt-1 first:pt-0">
          <div className="flex items-center justify-between">
            <span className="text-2xs text-muted-foreground flex items-center gap-1.5 font-semibold">
              <User2 className="text-muted-foreground/70 size-3" />
              {t("tasks.assignee")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-3xs flex size-6 shrink-0 items-center justify-center rounded-full border border-indigo-200 bg-indigo-100 font-bold text-indigo-700 uppercase shadow-2xs select-none dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
              {assigneeInitials}
            </div>
            <div className="min-w-0 flex-1">
              {canEditAssignee ? (
                <TaskAssigneePicker
                  workspaceId={task.workspaceId}
                  taskId={task.id}
                  assigneeName={task.assigneeName}
                  task={task}
                />
              ) : (
                <span className="text-foreground block truncate text-xs font-medium">
                  {task.assigneeName || t("tasks.unassigned", "Chưa phân công")}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Approvals / Review & Client Approval Settings */}
        <div className="space-y-2.5 pt-3">
          {task.reviewStep && (
            <div className="text-2xs inline-flex items-center gap-1.5 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1 font-semibold text-amber-700 dark:text-amber-400">
              <ShieldCheck className="size-3" />
              <span>
                {t(
                  `tasks.inline.reviewSteps.${task.reviewStep}`,
                  task.reviewStep,
                )}
              </span>
            </div>
          )}
          <TaskInlineAssignment task={task} />
        </div>

        {/* Due date */}
        <div className="space-y-1.5 pt-3">
          <div className="flex items-center justify-between">
            <span className="text-2xs text-muted-foreground flex items-center gap-1.5 font-semibold">
              <Calendar className="text-muted-foreground/70 size-3" />
              {t("tasks.deadline", "Thời hạn hoàn thành")}
            </span>
            {isOverdue && (
              <span className="text-3xs inline-flex items-center gap-1 rounded border border-rose-500/25 bg-rose-500/10 px-1.5 py-0.5 font-semibold text-rose-600 dark:text-rose-400">
                <AlertCircle className="size-2.5" />
                Quá hạn
              </span>
            )}
          </div>
          <TaskDeadlineField task={task} />
        </div>

        {/* Publish date (if POST) */}
        {task.type === "POST" && (
          <div className="pt-3">
            <TaskPublishTimeField task={task} />
          </div>
        )}

        {/* Platforms */}
        {(task.type === "POST" || platforms.length > 0) && (
          <div className="space-y-2 pt-3">
            <span className="text-2xs text-muted-foreground flex items-center gap-1.5 font-semibold">
              <Share2 className="text-muted-foreground/70 size-3" />
              {t("tasks.platformsTitle", "Nền tảng / Kênh")}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {platforms.length > 0 ? (
                platforms.map((p) => (
                  <span
                    key={p}
                    className={cn(
                      "text-3xs inline-flex items-center gap-1 rounded border px-2 py-0.5 font-bold tracking-wider uppercase shadow-2xs",
                      getPlatformBadgeStyle(p),
                    )}
                  >
                    {t(`tasks.platforms.${p}`, p)}
                  </span>
                ))
              ) : (
                <span className="text-muted-foreground text-3xs italic">
                  Chưa cấu hình kênh
                </span>
              )}
            </div>
            {task.type === "POST" && <TaskTargetPlatformsPicker task={task} />}
          </div>
        )}

        {/* Deliverable / Campaign & Source */}
        {(task.sourceType || task.campaignId) && (
          <div className="space-y-2 pt-3">
            <span className="text-2xs text-muted-foreground flex items-center gap-1.5 font-semibold">
              <FolderKanban className="text-muted-foreground/70 size-3" />
              {t("tasks.deliverable", "Hạng mục liên kết")}
            </span>

            {task.campaignId && (
              <Link
                to={`/workspaces/${task.workspaceId}/campaigns`}
                className="group border-border/70 bg-muted/20 text-foreground hover:bg-muted/50 hover:text-brand-orange flex items-center justify-between gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium shadow-2xs transition-colors"
              >
                <span className="truncate">
                  {task.campaignName || "Chiến dịch"}
                </span>
                <ExternalLink className="text-muted-foreground group-hover:text-brand-orange size-3 shrink-0" />
              </Link>
            )}

            {task.sourceType === "CONTENT_REQUEST" &&
              task.sourceRefId &&
              role !== "CREATOR" && (
                <Link
                  to={`/workspaces/${task.workspaceId}/requests?request=${encodeURIComponent(task.sourceRefId)}`}
                  className="group border-border/70 bg-muted/20 text-foreground hover:bg-muted/50 hover:text-brand-orange flex items-center justify-between gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium shadow-2xs transition-colors"
                >
                  <span className="truncate">Yêu cầu nội dung</span>
                  <ExternalLink className="text-muted-foreground group-hover:text-brand-orange size-3 shrink-0" />
                </Link>
              )}
          </div>
        )}

        {/* Contact with Campaign / Agency Partners */}
        <TaskPartnerContactSection task={task} />

        {/* References */}
        <div className="space-y-1.5 pt-3">
          <span className="text-2xs text-muted-foreground flex items-center gap-1.5 font-semibold">
            <Link2 className="text-muted-foreground/70 size-3" />
            {t("tasks.workflow.fields.inputReferences", "Tài liệu tham khảo")}
          </span>
          <References task={task} />
        </div>

        {/* Timezone */}
        <div className="text-3xs text-muted-foreground flex items-center gap-1.5 pt-3">
          <Globe className="text-muted-foreground/70 size-3 shrink-0" />
          <span>{t("tasks.workflow.timezone", { timezone: zone })}</span>
        </div>
      </div>
    </aside>
  );
}

export function TaskInlineDetails({ task }: { task: TaskWorkflow }) {
  const { t } = useTranslation();
  const canonical = task.status;
  const statusCfg = STATUS_CONFIG[canonical] || STATUS_CONFIG.TODO;

  return (
    <div className="space-y-4">
      {/* Top Status & Type Badges */}
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-semibold transition-colors",
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

        <span className="bg-muted/60 text-foreground border-border/80 inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium">
          {task.type === "POST" ? (
            <Share2 className="text-brand-orange size-3.5" />
          ) : (
            <User2 className="text-muted-foreground size-3.5" />
          )}
          {t(`tasks.types.${task.type}`, task.type)}
        </span>

        {task.reviewStep && (
          <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-700 dark:text-amber-300">
            <ShieldCheck className="size-3.5 text-amber-600 dark:text-amber-400" />
            {t(`tasks.inline.reviewSteps.${task.reviewStep}`)}
          </span>
        )}
      </div>

      {/* 2-Column Jira View */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-7">
          <TaskDescriptionSection task={task} />
        </div>
        <div className="lg:col-span-5">
          <TaskDetailsSidebar task={task} />
        </div>
      </div>
    </div>
  );
}
