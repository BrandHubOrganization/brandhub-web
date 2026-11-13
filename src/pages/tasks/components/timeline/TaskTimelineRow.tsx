import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Eye,
  FileText,
  Megaphone,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";
import { useWorkspaceStore } from "@/store/workspaceStore";
import type { TaskType } from "@/types/task";
import {
  JiraAssigneeAvatar,
  JiraStatusLozenge,
} from "@/pages/tasks/components/JiraSubtaskUI";
import { dayNumber, localDay } from "@/pages/campaign/utils/timelineDates";
import { cn } from "@/lib/utils";
import { TaskTimelineBar } from "./TaskTimelineBar";
import type { TaskTimelineRowProps } from "./types";

export type { TaskTimelineRowProps };

interface SubtaskRow {
  subtask: {
    id: string;
    name: string;
    status: string;
    dueDate: string | null;
    plannedStartDate?: string | null;
    assigneeId: string | null;
  };
  assigneeName: string | null;
}

function renderTypeIcon(type?: TaskType): ReactNode {
  switch (type) {
    case "POST":
      return <FileText className="text-muted-foreground size-3.5 shrink-0" />;
    case "LIVESTREAM":
      return <Video className="text-muted-foreground size-3.5 shrink-0" />;
    case "SURVEY":
      return (
        <ClipboardList className="text-muted-foreground size-3.5 shrink-0" />
      );
    case "EVENT_PLAN":
      return <Calendar className="text-muted-foreground size-3.5 shrink-0" />;
    case "PRESS_RECOMMENDATION":
      return <Megaphone className="text-muted-foreground size-3.5 shrink-0" />;
    default:
      return <FileText className="text-muted-foreground size-3.5 shrink-0" />;
  }
}

export function TaskTimelineRow({
  item,
  onTaskClick,
  calendarWidth,
  dayWidth,
  x,
  ticks,
  todayX,
  workspaceId,
  onUpdated,
  isExpanded: externalIsExpanded,
  onToggleExpand,
  timezone = "Asia/Ho_Chi_Minh",
}: TaskTimelineRowProps) {
  const { t } = useTranslation();
  const { task, isScheduled } = item;
  const currentWorkspace = useWorkspaceStore((s) => s.currentWorkspace);
  const effectiveWs =
    workspaceId || currentWorkspace?.id || task.workspaceId || "";

  const [internalExpanded, setInternalExpanded] = useState(false);
  const isExpanded = externalIsExpanded ?? internalExpanded;
  const toggle = onToggleExpand ?? (() => setInternalExpanded((prev) => !prev));

  // Query subtasks for the task
  const subtasksQuery = useQuery({
    queryKey: ["task-timeline-subtasks", effectiveWs, task.id],
    queryFn: async () => {
      if (!effectiveWs || !task.id) return [];
      const res = await api.get<{ data?: { rows?: SubtaskRow[] } }>(
        `/api/v1/workspaces/${effectiveWs}/tasks/${task.id}/subtasks`,
      );
      return res.data?.data?.rows ?? [];
    },
    staleTime: 60000,
    enabled: Boolean(effectiveWs && task.id),
  });

  const subtasks = subtasksQuery.data ?? [];
  const hasSubtasks = subtasks.length > 0;
  const finishedSubtasksCount = subtasks.filter(
    (s) =>
      s.subtask.status === "FINISHED" || s.subtask.status === "COMPLETED",
  ).length;

  return (
    <>
      {/* Parent Task Row */}
      <div
        className="ct-grid-row hover:bg-muted/20 group transition-colors"
        style={{
          gridTemplateColumns: `280px 120px 90px ${calendarWidth}px`,
          width: 490 + calendarWidth,
        }}
      >
        <div
          className="ct-cell gap-1.5 pl-2"
          style={{ left: 0, width: 280, position: "sticky", zIndex: 10 }}
        >
          {/* Subtask Expand/Collapse Chevron */}
          <Button
            variant="ghost"
            size="icon"
            className="size-5 shrink-0 text-muted-foreground hover:text-foreground cursor-pointer"
            disabled={!hasSubtasks}
            onClick={(e) => {
              e.stopPropagation();
              if (hasSubtasks) toggle();
            }}
            aria-label={
              hasSubtasks
                ? isExpanded
                  ? t("tasks.timelineGrid.collapseSubtasks", {
                      defaultValue: "Thu gọn việc con",
                    })
                  : t("tasks.timelineGrid.expandSubtasks", {
                      defaultValue: "Mở rộng việc con",
                    })
                : undefined
            }
          >
            {hasSubtasks ? (
              isExpanded ? (
                <ChevronDown className="size-3 text-foreground" />
              ) : (
                <ChevronRight className="size-3 text-muted-foreground" />
              )
            ) : (
              <span className="size-3" />
            )}
          </Button>

          {renderTypeIcon(task.type)}

          <button
            type="button"
            onClick={() => onTaskClick(task)}
            className={cn(
              "hover:text-brand-orange truncate text-left text-xs font-medium transition-colors cursor-pointer",
              task.status === "FINISHED" && "line-through text-muted-foreground",
            )}
            title={task.name}
          >
            {task.name}
          </button>

          {/* Subtask progress count badge e.g. 0/5 */}
          {hasSubtasks && (
            <span
              className="shrink-0 text-[9px] font-medium text-muted-foreground tabular-nums"
              title={`${finishedSubtasksCount}/${subtasks.length} ${t("tasks.timelineGrid.subtasksCompleted", { defaultValue: "công việc con hoàn thành" })}`}
            >
              {finishedSubtasksCount}/{subtasks.length}
            </span>
          )}

          {/* Status badge for review / awaiting approval */}
          {task.status === "IN_REVIEW" && (
            <span
              className="inline-flex shrink-0 items-center gap-0.5 rounded border border-amber-500/30 bg-amber-500/15 px-1 py-0.2 text-[9px] font-semibold text-amber-700 dark:text-amber-300"
              title={t("tasks.status.IN_REVIEW", { defaultValue: "Chờ duyệt" })}
            >
              <Eye className="size-2.5 text-amber-600" />
              {t("tasks.status.IN_REVIEW", { defaultValue: "Chờ duyệt" })}
            </span>
          )}

          {task.requiresClientApproval && task.status !== "IN_REVIEW" && (
            <span
              className="inline-flex shrink-0 items-center gap-0.5 rounded border border-amber-500/25 bg-amber-500/10 px-1 py-0.2 text-[9px] font-semibold text-amber-600 dark:text-amber-400"
              title={t("campaign.timeline.awaitingClient", {
                defaultValue: "Chờ Client",
              })}
            >
              {t("campaign.timeline.awaitingClient", {
                defaultValue: "Chờ Client",
              })}
            </span>
          )}

          {!isScheduled && (
            <span
              className="border-border text-muted-foreground shrink-0 rounded border border-dashed px-1.5 py-0.2 text-[9px]"
              title={t("tasks.timelineGrid.unscheduled", {
                defaultValue: "Chưa lên lịch",
              })}
            >
              {t("tasks.timelineGrid.unscheduled", {
                defaultValue: "Chưa lên lịch",
              })}
            </span>
          )}
        </div>

        <div
          className="ct-cell justify-center"
          style={{ left: 280, width: 120, position: "sticky", zIndex: 10 }}
        >
          <JiraStatusLozenge
            status={task.status}
            label={t(`tasks.status.${task.status}`, {
              defaultValue: task.status,
            })}
            className="text-[10px] whitespace-nowrap"
          />
        </div>

        <div
          className="ct-cell justify-center"
          style={{ left: 400, width: 90, position: "sticky", zIndex: 10 }}
        >
          <JiraAssigneeAvatar name={task.assigneeName || null} />
        </div>

        <div className="ct-axis" style={{ width: calendarWidth }}>
          {ticks.map((tick) => (
            <span
              key={tick.dayNum}
              className="ct-gridline"
              style={{ left: tick.left }}
              aria-hidden
            />
          ))}

          <span className="ct-today" style={{ left: todayX }} />

          {isScheduled && (
            <TaskTimelineBar
              item={item}
              dayWidth={dayWidth}
              x={x}
              onTaskClick={onTaskClick}
              workspaceId={workspaceId}
              onUpdated={onUpdated}
            />
          )}
        </div>
      </div>

      {/* Expanded Subtask Rows */}
      {isExpanded &&
        subtasks.map((row) => {
          const { subtask, assigneeName } = row;
          const subtaskDueDate = subtask.dueDate
            ? localDay(subtask.dueDate, timezone)
            : null;
          const subtaskStart = subtask.plannedStartDate
            ? localDay(subtask.plannedStartDate, timezone)
            : item.startDate || subtaskDueDate;
          const subtaskScheduled = Boolean(subtaskStart && subtaskDueDate);

          const subtaskDuration =
            subtaskStart && subtaskDueDate
              ? Math.max(
                  1,
                  dayNumber(subtaskDueDate) - dayNumber(subtaskStart) + 1,
                )
              : 1;

          const subtaskLeft = subtaskStart ? x(subtaskStart) : 0;
          const subtaskWidth = subtaskDuration * dayWidth;

          return (
            <div
              key={subtask.id}
              className="ct-grid-row ct-sub hover:bg-muted/30 group transition-colors"
              style={{
                gridTemplateColumns: `280px 120px 90px ${calendarWidth}px`,
                width: 490 + calendarWidth,
              }}
            >
              <div
                className="ct-cell gap-2 pl-9"
                style={{ left: 0, width: 280, position: "sticky", zIndex: 10 }}
              >
                <span className="text-muted-foreground select-none text-xs">
                  ↳
                </span>
                <button
                  type="button"
                  onClick={() => onTaskClick(task)}
                  className={cn(
                    "hover:text-brand-orange truncate text-left text-xs transition-colors cursor-pointer",
                    subtask.status === "FINISHED" &&
                      "line-through text-muted-foreground",
                  )}
                  title={subtask.name}
                >
                  {subtask.name}
                </button>
                {!subtaskDueDate && (
                  <span
                    className="border-border text-muted-foreground shrink-0 rounded border border-dashed px-1.5 py-0.2 text-[9px]"
                    title={t("tasks.timelineGrid.unscheduled", {
                      defaultValue: "Chưa lên lịch",
                    })}
                  >
                    {t("tasks.timelineGrid.unscheduled", {
                      defaultValue: "Chưa lên lịch",
                    })}
                  </span>
                )}
              </div>

              <div
                className="ct-cell justify-center"
                style={{ left: 280, width: 120, position: "sticky", zIndex: 10 }}
              >
                <JiraStatusLozenge
                  status={subtask.status}
                  label={t(`tasks.status.${subtask.status}`, {
                    defaultValue: subtask.status,
                  })}
                  className="text-[10px] whitespace-nowrap"
                />
              </div>

              <div
                className="ct-cell justify-center"
                style={{ left: 400, width: 90, position: "sticky", zIndex: 10 }}
              >
                <JiraAssigneeAvatar name={assigneeName || null} />
              </div>

              <div className="ct-axis" style={{ width: calendarWidth }}>
                {ticks.map((tick) => (
                  <span
                    key={tick.dayNum}
                    className="ct-gridline"
                    style={{ left: tick.left }}
                    aria-hidden
                  />
                ))}

                <span className="ct-today" style={{ left: todayX }} />

                {subtaskScheduled && (
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => onTaskClick(task)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") onTaskClick(task);
                    }}
                    className={cn(
                      "ct-range absolute top-1.5 flex h-6 cursor-pointer items-center rounded-md border px-2 shadow-2xs transition-[colors,box-shadow] select-none hover:brightness-105",
                      subtask.status === "FINISHED" && "ct-range-done",
                      subtask.status === "IN_PROGRESS" && "ct-range-working",
                      subtask.status === "IN_REVIEW" && "ct-range-review",
                      (subtask.status === "TODO" || !subtask.status) &&
                        "border-brand-orange/40 bg-brand-orange/15 text-brand-orange",
                    )}
                    style={{
                      left: subtaskLeft,
                      width: subtaskWidth,
                    }}
                    title={`${subtask.name} (${subtaskStart} → ${subtaskDueDate})`}
                  >
                    <span
                      className={cn(
                        "truncate text-[10px] leading-none font-medium text-center w-full",
                        subtaskWidth < 55 && "ct-short-duration",
                      )}
                    >
                      {t("campaign.timeline.days", {
                        count: subtaskDuration,
                        defaultValue: `${subtaskDuration} ngày`,
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
    </>
  );
}
