import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  Calendar,
  ClipboardList,
  FileText,
  Megaphone,
  Video,
} from "lucide-react";
import type { TaskListItem, TaskType } from "@/types/task";
import {
  JiraAssigneeAvatar,
  JiraStatusLozenge,
} from "@/pages/tasks/components/JiraSubtaskUI";
import { TaskTimelineBar } from "./TaskTimelineBar";
import type { TaskTimelineRowProps } from "./types";

export type { TaskTimelineRowProps };

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
}: TaskTimelineRowProps) {
  const { t } = useTranslation();
  const { task, isScheduled } = item;

  return (
    <div
      className="ct-grid-row hover:bg-muted/20 group transition-colors"
      style={{
        gridTemplateColumns: `280px 120px 90px ${calendarWidth}px`,
        width: 490 + calendarWidth,
      }}
    >
      <div
        className="ct-cell gap-2 pl-6"
        style={{ left: 0, width: 280, position: "sticky", zIndex: 10 }}
      >
        {renderTypeIcon(task.type)}
        <button
          type="button"
          onClick={() => onTaskClick(task)}
          className="hover:text-brand-orange truncate text-left text-xs font-medium transition-colors"
          title={task.name}
        >
          {task.name}
        </button>
        {!isScheduled && (
          <span
            className="border-border text-muted-foreground shrink-0 rounded border border-dashed px-1.5 py-0.5 text-[10px]"
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
  );
}
