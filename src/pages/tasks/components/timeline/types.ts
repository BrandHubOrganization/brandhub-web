import type { TaskListItem, TaskStatus, TaskType } from "@/types/task";

export type TimelineZoom = "day" | "week" | "month" | "quarter";
export type TimelineGroupBy = "type" | "status" | "none";

export interface TaskTimelineItem {
  task: TaskListItem;
  startDate: string | null;
  endDate: string | null;
  isScheduled: boolean;
}

export interface TaskTimelineGroup {
  id: string;
  name: string;
  type?: TaskType;
  status?: TaskStatus;
  items: TaskTimelineItem[];
}

export interface TimelineTick {
  dayNum: number;
  dateStr: string;
  left: number;
}

export interface JiraTimelineZoomControlProps {
  zoom: TimelineZoom;
  onZoomChange: (zoom: TimelineZoom) => void;
  onScrollToToday: () => void;
  onStepForward?: () => void;
  className?: string;
}

export interface ZoomOption {
  id: TimelineZoom;
  labelKey: string;
  defaultLabel: string;
}

export interface TaskTimelineBarProps {
  item: TaskTimelineItem;
  dayWidth: number;
  x: (date: string) => number;
  onTaskClick: (task: TaskListItem) => void;
  workspaceId?: string;
  onUpdated?: () => void;
}

export interface TaskTimelineGroupRowProps {
  group: TaskTimelineGroup;
  isCollapsed: boolean;
  onToggle: () => void;
  calendarWidth: number;
  ticks: TimelineTick[];
  todayX: number;
}

export interface TaskTimelineHeaderRowProps {
  calendarWidth: number;
  ticks: TimelineTick[];
  todayX: number;
  zoom: TimelineZoom;
}

export interface TaskTimelineRowProps {
  item: TaskTimelineItem;
  onTaskClick: (task: TaskListItem) => void;
  calendarWidth: number;
  dayWidth: number;
  x: (date: string) => number;
  ticks: TimelineTick[];
  todayX: number;
  workspaceId?: string;
  onUpdated?: () => void;
}

export interface TaskTimelineToolbarProps {
  groupBy: TimelineGroupBy;
  onGroupByChange: (groupBy: TimelineGroupBy) => void;
  totalCount: number;
  unscheduledCount: number;
}

export interface TaskTimelineViewProps {
  tasks: TaskListItem[];
  onTaskClick: (task: TaskListItem) => void;
  workspaceId?: string;
  onUpdated?: () => void;
}

export interface TimelineFilterCriteria {
  search: string;
  assignees: string[];
  statuses: TaskStatus[];
  types: TaskType[];
  schedules: string[];
}

export interface UseTaskTimelineResizeOptions {
  startDate: string;
  endDate: string;
  dayWidth: number;
  canManageSchedule: boolean;
  onUnauthorized: () => void;
  onCommit: (newEndDate: string) => void | Promise<void>;
}

