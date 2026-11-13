import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  Ban,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Eye,
  FileText,
  FolderKanban,
  Megaphone,
  PlayCircle,
  Video,
} from "lucide-react";
import type { TaskStatus, TaskType } from "@/types/task";
import type { TaskTimelineGroupRowProps } from "./types";

export type { TaskTimelineGroupRowProps };

function renderTypeIcon(type?: TaskType): ReactNode {
  switch (type) {
    case "POST":
      return <FileText className="size-3.5 text-blue-500" />;
    case "LIVESTREAM":
      return <Video className="size-3.5 text-rose-500" />;
    case "SURVEY":
      return <ClipboardList className="size-3.5 text-amber-500" />;
    case "EVENT_PLAN":
      return <Calendar className="size-3.5 text-indigo-500" />;
    case "PRESS_RECOMMENDATION":
      return <Megaphone className="size-3.5 text-emerald-500" />;
    default:
      return <FolderKanban className="size-3.5 text-muted-foreground" />;
  }
}

function renderStatusIcon(status?: TaskStatus): ReactNode {
  switch (status) {
    case "TODO":
      return <FolderKanban className="size-3.5 text-amber-600" />;
    case "IN_PROGRESS":
      return <PlayCircle className="size-3.5 text-brand-orange" />;
    case "IN_REVIEW":
      return <Eye className="size-3.5 text-sky-500" />;
    case "FINISHED":
      return <CheckCircle2 className="size-3.5 text-emerald-500" />;
    case "CANCELLED":
      return <Ban className="size-3.5 text-rose-500" />;
    default:
      return <FolderKanban className="size-3.5 text-brand-orange" />;
  }
}

export function TaskTimelineGroupRow({
  group,
  isCollapsed,
  onToggle,
  calendarWidth,
  ticks,
  todayX,
}: TaskTimelineGroupRowProps) {
  const { t } = useTranslation();

  const getGroupName = () => {
    const rawType = (group.type || group.name) as TaskType;
    if (group.type || group.id.startsWith("type:")) {
      const translated = t(`tasks.types.${rawType}`, {
        defaultValue: t(`tasks.type.${rawType}`, { defaultValue: "" }),
      });
      if (translated) return translated;
    }
    if (group.status || group.id.startsWith("status:")) {
      const rawStatus = (group.status || group.name) as TaskStatus;
      return t(`tasks.status.${rawStatus}`, { defaultValue: group.name });
    }
    if (group.name === "allTasks") {
      return t("tasks.timelineGrid.allTasks", {
        defaultValue: "Tất cả công việc",
      });
    }
    return group.name;
  };

  const groupIcon = group.type
    ? renderTypeIcon(group.type)
    : group.status
      ? renderStatusIcon(group.status)
      : <FolderKanban className="size-3.5 text-muted-foreground" />;

  return (
    <div
      className="ct-grid-row ct-group cursor-pointer select-none transition-colors hover:brightness-[0.98] dark:hover:brightness-[1.05]"
      onClick={onToggle}
      style={{
        gridTemplateColumns: `280px 120px 90px ${calendarWidth}px`,
        width: 490 + calendarWidth,
      }}
    >
      <div
        className="ct-cell gap-2 font-semibold"
        style={{ left: 0, width: 280, position: "sticky", zIndex: 20 }}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className="text-muted-foreground hover:text-foreground flex size-5 items-center justify-center rounded-sm hover:bg-muted/60 cursor-pointer transition-colors"
          aria-label={
            isCollapsed
              ? t("tasks.timelineGrid.expandGroup", { defaultValue: "Mở rộng" })
              : t("tasks.timelineGrid.collapseGroup", { defaultValue: "Thu nhỏ" })
          }
        >
          {isCollapsed ? (
            <ChevronRight className="size-3.5" />
          ) : (
            <ChevronDown className="size-3.5" />
          )}
        </button>
        {groupIcon}
        <span className="truncate text-xs font-semibold">{getGroupName()}</span>
        <span className="rounded-full bg-brand-orange text-white text-[10px] font-bold px-2 py-0.5 shadow-2xs tabular-nums">
          {group.items.length}
        </span>
      </div>

      <div
        className="ct-cell"
        style={{ left: 280, width: 120, position: "sticky", zIndex: 20 }}
      />

      <div
        className="ct-cell"
        style={{ left: 400, width: 90, position: "sticky", zIndex: 20 }}
      />

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
      </div>
    </div>
  );
}
