import { useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { toast } from "sonner";
import type { TaskStatus } from "@/types/task";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { taskWorkflowService } from "@/pages/tasks/services/taskWorkflowService";
import { dayNumber } from "@/pages/campaign/utils/timelineDates";
import { cn } from "@/lib/utils";
import { useTaskTimelineResize } from "./useTaskTimelineResize";
import type { TaskTimelineBarProps } from "./types";

export type { TaskTimelineBarProps };

function getStatusStyle(status: TaskStatus): string {
  switch (status) {
    case "FINISHED":
      return "border-emerald-500/40 bg-emerald-500/20 text-emerald-800 dark:text-emerald-200";
    case "IN_PROGRESS":
      return "border-sky-500/40 bg-sky-500/20 text-sky-800 dark:text-sky-200";
    case "IN_REVIEW":
      return "border-amber-500/40 bg-amber-500/20 text-amber-800 dark:text-amber-200";
    case "CANCELLED":
      return "border-border bg-muted/60 text-muted-foreground line-through opacity-70";
    case "TODO":
    default:
      return "border-brand-orange/40 bg-brand-orange/15 text-brand-orange";
  }
}

function formatDisplayDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-");
  if (!y || !m || !d) return dateStr;
  return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
}

function buildNewDueDateIso(
  originalDueDate: string | null | undefined,
  newDateStr: string,
): string {
  const [year, month, day] = newDateStr.split("-").map(Number);
  const original = originalDueDate ? new Date(originalDueDate) : null;
  const valid = original && !isNaN(original.getTime());
  const hours = valid ? original.getHours() : 18;
  const minutes = valid ? original.getMinutes() : 0;
  const seconds = valid ? original.getSeconds() : 0;
  const target = new Date(year, month - 1, day, hours, minutes, seconds);
  return target.toISOString();
}

function validateCampaignBounds(
  dates: { minDate: string | null; maxDate: string | null } | undefined,
  targetDate: Date,
  t: (key: string, options?: Record<string, unknown>) => string,
): string | null {
  if (dates?.minDate) {
    const minDate = new Date(`${dates.minDate}T00:00:00`);
    if (targetDate < minDate) {
      return t("tasks.timelineGrid.beforeMinDate", {
        date: dates.minDate,
        defaultValue: `Hạn chót không được trước ngày bắt đầu (${dates.minDate})!`,
      });
    }
  }
  if (dates?.maxDate) {
    const maxDate = new Date(`${dates.maxDate}T23:59:59`);
    if (targetDate > maxDate) {
      return t("tasks.timelineGrid.afterMaxDate", {
        date: dates.maxDate,
        defaultValue: `Hạn chót không được vượt quá kết thúc chiến dịch (${dates.maxDate})!`,
      });
    }
  }
  return null;
}

function extractErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as
      | { message?: string; error?: { message?: string } }
      | undefined;
    return data?.error?.message || data?.message || fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

export function TaskTimelineBar({
  item,
  dayWidth,
  x,
  onTaskClick,
  workspaceId,
  onUpdated,
}: TaskTimelineBarProps) {
  const { t } = useTranslation();
  const [isSaving, setIsSaving] = useState(false);

  const currentMemberRole = useWorkspaceStore((s) => s.currentMemberRole);
  const currentWorkspace = useWorkspaceStore((s) => s.currentWorkspace);
  const targetWs =
    workspaceId || currentWorkspace?.id || item.task.workspaceId || "";

  const canManageSchedule =
    currentMemberRole === "MANAGER" || currentMemberRole === "OWNER";

  const { task, startDate, endDate } = item;
  const activeStartDate = startDate || "";
  const activeEndDate = endDate || "";

  const handleUnauthorized = () => {
    toast.error(
      t(
        "tasks.timelineGrid.managerOnlyToast",
        "Chỉ Quản lý (Manager) hoặc Chủ sở hữu mới có quyền thay đổi thời hạn công việc.",
      ),
    );
  };

  const executeScheduleUpdate = async (newEndDate: string, toastId: string) => {
    const workflow = await taskWorkflowService.read(targetWs, task.id);
    const newIsoString = buildNewDueDateIso(task.dueDate, newEndDate);
    const boundError = validateCampaignBounds(
      workflow.dates,
      new Date(newIsoString),
      t,
    );
    if (boundError) {
      toast.error(boundError, { id: toastId });
      return;
    }
    await taskWorkflowService.field(targetWs, task.id, {
      field: "dueDate",
      value: newIsoString,
      expectedRevision: workflow.workflowRevision ?? 0,
    });
    toast.success(
      t("tasks.timelineGrid.scheduleUpdated", "Đã cập nhật thời hạn công việc thành công!"),
      { id: toastId },
    );
    onUpdated?.();
  };

  const handleCommitSchedule = async (newEndDate: string) => {
    const toastId = `schedule-${task.id}`;
    setIsSaving(true);
    toast.loading(
      t("tasks.timelineGrid.updatingSchedule", "Đang cập nhật thời hạn công việc..."),
      { id: toastId },
    );
    try {
      await executeScheduleUpdate(newEndDate, toastId);
    } catch (err: unknown) {
      const msg = extractErrorMessage(
        err,
        t("tasks.timelineGrid.updateFailed", "Không thể cập nhật thời hạn công việc. Vui lòng thử lại."),
      );
      toast.error(msg, { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  const {
    isDragging,
    deltaDays,
    previewEndDate,
    handlePointerDown,
    handleClick,
  } = useTaskTimelineResize({
    startDate: activeStartDate,
    endDate: activeEndDate,
    dayWidth,
    canManageSchedule,
    onUnauthorized: handleUnauthorized,
    onCommit: handleCommitSchedule,
  });

  const barLeft = activeStartDate ? x(activeStartDate) : 0;
  const currentEnd = previewEndDate ?? activeEndDate;
  const barDurationDays =
    activeStartDate && currentEnd
      ? Math.max(1, dayNumber(currentEnd) - dayNumber(activeStartDate) + 1)
      : 1;
  const barWidth = barDurationDays * dayWidth;

  const tooltipTitle = `${task.name} (${activeStartDate} → ${currentEnd})`;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onTaskClick(task)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onTaskClick(task);
      }}
      title={tooltipTitle}
      className={cn(
        "group/bar absolute top-1.5 flex h-6 cursor-pointer items-center rounded-md border px-2 shadow-2xs transition-[colors,box-shadow] select-none hover:brightness-105 active:scale-[0.99]",
        getStatusStyle(task.status),
        isDragging && "ring-primary/60 z-30 shadow-md ring-2 brightness-105",
        isSaving && "opacity-60",
      )}
      style={{
        left: barLeft,
        width: barWidth,
      }}
    >
      <span className="truncate pr-3 text-[10px] leading-none font-semibold">
        {task.name}
      </span>

      {/* Resize Handle on the right edge */}
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label={t("tasks.timelineGrid.resizeTooltip", "Kéo để điều chỉnh hạn chót")}
        title={
          canManageSchedule
            ? t("tasks.timelineGrid.resizeTooltip", "Kéo để điều chỉnh hạn chót")
            : t(
                "tasks.timelineGrid.managerOnlyToast",
                "Chỉ Quản lý (Manager) hoặc Chủ sở hữu mới có quyền thay đổi thời hạn công việc.",
              )
        }
        onPointerDown={handlePointerDown}
        onClick={handleClick}
        className={cn(
          "group/handle absolute top-0 right-0 bottom-0 flex w-2.5 items-center justify-center transition-colors",
          canManageSchedule
            ? "cursor-ew-resize hover:bg-foreground/10 active:bg-foreground/20"
            : "cursor-not-allowed",
        )}
      >
        <span
          className={cn(
            "h-3 w-1 rounded-full transition-opacity",
            canManageSchedule
              ? "bg-foreground/30 group-hover/handle:bg-foreground/80 group-hover/handle:opacity-100 opacity-40"
              : "bg-destructive/40 opacity-30",
          )}
        />
      </div>

      {/* Floating Drag Preview Tooltip */}
      {isDragging && previewEndDate && (
        <div
          className="bg-popover text-popover-foreground border-border pointer-events-none absolute -top-9 right-0 z-50 flex translate-x-1/2 items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium shadow-md animate-in fade-in-0 zoom-in-95 whitespace-nowrap"
        >
          <span>{formatDisplayDate(previewEndDate)}</span>
          <span
            className={cn(
              "rounded px-1 py-0.5 text-[10px] font-semibold",
              deltaDays > 0
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                : deltaDays < 0
                  ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                  : "bg-muted text-muted-foreground",
            )}
          >
            {deltaDays > 0 ? `+${deltaDays}` : deltaDays}{" "}
            {t("tasks.timelineGrid.days", "ngày")}
          </span>
          <div className="border-border bg-popover absolute -bottom-1 left-1/2 size-2 -translate-x-1/2 rotate-45 border-r border-b" />
        </div>
      )}
    </div>
  );
}
