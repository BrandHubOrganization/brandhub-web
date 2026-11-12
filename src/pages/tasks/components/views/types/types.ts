import type React from "react";
import type { TaskListItem, TaskStatus } from "@/types/task";
import type { TaskViewMode } from "@/pages/tasks/components/TaskViewSwitcher";
import type { useTasks } from "@/pages/tasks/hooks/useTasks";
import type { useTaskPanel } from "@/pages/tasks/hooks/useTaskPanel";
import type { TaskTimelineViewProps } from "@/pages/tasks/components/timeline/types";

// Active View Props
export interface TaskActiveViewProps {
  view: TaskViewMode;
  workspaceId: string;
  state: ReturnType<typeof useTasks>;
  filteredTasks: TaskListItem[];
  panel: ReturnType<typeof useTaskPanel>;
  guard: (action: () => void) => void;
  unscheduled?: number;
  isFiltered?: boolean;
  onResetFilters?: () => void;
}

// Table View Props
export type TaskTableSortField = "dueDate" | "createdAt" | "name" | "status";

export interface TaskTableProps {
  tasks: TaskListItem[];
  loading: boolean;
  page: number;
  totalPages: number;
  totalElements: number;
  onPageChange: (page: number) => void;
  sortField: TaskTableSortField;
  sortDirection?: "asc" | "desc";
  onSort: (field: TaskTableSortField) => void;
  onTaskClick: (task: TaskListItem) => void;
  activeTaskId?: string;
  onResetFilters?: () => void;
  isFiltered?: boolean;
  workspaceId?: string;
  onUpdated?: () => void;
}

// Calendar & Timeline View Props
export interface TaskCalendarTimelineProps {
  tasks: TaskListItem[];
  onTaskClick: (task: TaskListItem) => void;
  workspaceId?: string;
  onUpdated?: () => void;
}

export type CalendarViewType =
  | "timeGridWeek"
  | "timeGridDay"
  | "dayGridMonth"
  | "yearGrid";

export interface ActiveEventDetail {
  task: TaskListItem;
  title: string;
  timeText: string;
  location: string;
  pillColor: string;
  dateStr: string;
  x: number;
  y: number;
  isPinned: boolean;
}

// Unscheduled Alert Props
export interface TaskUnscheduledAlertProps {
  tasks: TaskListItem[];
  onTaskClick: (task: TaskListItem) => void;
  className?: string;
}

export interface TaskUnscheduledItemProps {
  task: TaskListItem;
  onTaskClick: (task: TaskListItem) => void;
}

// Gantt View Props (alias to timeline props)
export type TaskGanttViewProps = TaskTimelineViewProps;

// Board View Props
export interface TaskBoardCardProps {
  task: TaskListItem;
  isDragging: boolean;
  onTaskClick: (task: TaskListItem) => void;
  onDragStart: (
    e: React.DragEvent<HTMLButtonElement>,
    task: TaskListItem,
  ) => void;
  onDragEnd: () => void;
}

export interface TaskBoardColumnProps {
  status: TaskStatus;
  tasks: TaskListItem[];
  limit: number;
  isHovered: boolean;
  draggedTaskId: string | null;
  onDragOver: (e: React.DragEvent<HTMLElement>, status: TaskStatus) => void;
  onDragLeave: (e: React.DragEvent<HTMLElement>, status: TaskStatus) => void;
  onDrop: (e: React.DragEvent<HTMLElement>, status: TaskStatus) => void;
  onDragStart: (
    e: React.DragEvent<HTMLButtonElement>,
    task: TaskListItem,
  ) => void;
  onDragEnd: () => void;
  onTaskClick: (task: TaskListItem) => void;
  onLoadMore: (status: TaskStatus) => void;
}

export interface TaskBoardViewProps {
  tasks: TaskListItem[];
  onTaskClick: (task: TaskListItem) => void;
  workspaceId?: string;
  onStatusChange?: (taskId: string, newStatus: TaskStatus) => Promise<void> | void;
}
