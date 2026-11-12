import type { ReactNode } from "react";
import type { TaskPriority, TaskStatus, TaskType } from "@/types/task";
import type {
  TaskTimelineAssignee,
  TaskTimelineParent,
} from "@/pages/tasks/utils/taskFilterUtils";

export type FilterCategory =
  | "parent"
  | "assignee"
  | "status"
  | "type"
  | "schedule"
  | "priority"
  | "reporter"
  | "approval";

export interface CategoryItem {
  id: FilterCategory;
  label: string;
  count: number;
  removable?: boolean;
}

export interface ExtraFieldItem {
  id: FilterCategory;
  label: string;
  icon: ReactNode;
}

export interface TaskFilterPopoverProps {
  workspaceId?: string;
  assignees: TaskTimelineAssignee[];
  selectedAssignees: string[];
  onToggleAssignee: (id: string) => void;
  selectedStatuses: TaskStatus[];
  onToggleStatus: (status: TaskStatus) => void;
  selectedTypes: TaskType[];
  onToggleType: (type: TaskType) => void;
  selectedSchedules: string[];
  onToggleSchedule: (schedule: string) => void;
  parents?: TaskTimelineParent[];
  selectedParents?: string[];
  onToggleParent?: (id: string) => void;
  selectedPriorities?: TaskPriority[];
  onTogglePriority?: (priority: TaskPriority) => void;
  reporters?: TaskTimelineAssignee[];
  selectedReporters?: string[];
  onToggleReporter?: (id: string) => void;
  selectedApprovals?: ("YES" | "NO")[];
  onToggleApproval?: (approval: "YES" | "NO") => void;
  onClearCategory?: (category: FilterCategory) => void;
  onClearFilters: () => void;
  activeFilterCount: number;
  className?: string;
}

export interface TaskFilterPopoverOptionsProps {
  activeCategory: FilterCategory;
  parents: TaskTimelineParent[];
  selectedParents: string[];
  onToggleParent: (id: string) => void;
  assignees: TaskTimelineAssignee[];
  selectedAssignees: string[];
  onToggleAssignee: (id: string) => void;
  selectedStatuses: TaskStatus[];
  onToggleStatus: (status: TaskStatus) => void;
  selectedTypes: TaskType[];
  onToggleType: (type: TaskType) => void;
  selectedSchedules: string[];
  onToggleSchedule: (schedule: string) => void;
  selectedPriorities?: TaskPriority[];
  onTogglePriority?: (priority: TaskPriority) => void;
  reporters?: TaskTimelineAssignee[];
  selectedReporters?: string[];
  onToggleReporter?: (id: string) => void;
  selectedApprovals?: ("YES" | "NO")[];
  onToggleApproval?: (approval: "YES" | "NO") => void;
  onClearCategory: (category: FilterCategory) => void;
}

export interface TaskFilterCategorySidebarProps {
  categories: CategoryItem[];
  activeCategory: FilterCategory;
  onSelectCategory: (id: FilterCategory) => void;
  availableExtraFields: ExtraFieldItem[];
  onAddField: (id: FilterCategory) => void;
  onRemoveField?: (id: FilterCategory) => void;
  activeFilterCount: number;
  onClearFilters: () => void;
}

export interface TaskAssigneeFilterAvatarsProps {
  assignees: TaskTimelineAssignee[];
  selectedAssignees: string[];
  onToggleAssignee: (id: string) => void;
  maxVisible?: number;
}

export interface AssigneeListProps {
  assignees: TaskTimelineAssignee[];
  selectedAssignees: string[];
  onToggleAssignee: (id: string) => void;
  searchQuery: string;
}
export type AssigneeOptionListProps = AssigneeListProps;

export interface StatusListProps {
  selectedStatuses: TaskStatus[];
  onToggleStatus: (status: TaskStatus) => void;
  searchQuery: string;
}
export type StatusOptionListProps = StatusListProps;

export interface TypeListProps {
  selectedTypes: TaskType[];
  onToggleType: (type: TaskType) => void;
  searchQuery: string;
}
export type TypeOptionListProps = TypeListProps;

export interface ScheduleListProps {
  selectedSchedules: string[];
  onToggleSchedule: (schedule: string) => void;
  searchQuery: string;
}
export type ScheduleOptionListProps = ScheduleListProps;

export interface ParentListProps {
  parents: TaskTimelineParent[];
  selectedParents: string[];
  onToggleParent: (id: string) => void;
  searchQuery: string;
}
export type ParentOptionListProps = ParentListProps;

export interface PriorityOptionListProps {
  selectedPriorities: TaskPriority[];
  onTogglePriority: (priority: TaskPriority) => void;
  searchQuery: string;
}

export interface ReporterOptionListProps {
  reporters: TaskTimelineAssignee[];
  selectedReporters: string[];
  onToggleReporter: (id: string) => void;
  searchQuery: string;
}

export interface ApprovalOptionListProps {
  selectedApprovals: ("YES" | "NO")[];
  onToggleApproval: (approval: "YES" | "NO") => void;
  searchQuery: string;
}

