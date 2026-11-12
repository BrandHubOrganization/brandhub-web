import { useTranslation } from "react-i18next";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { TaskPriority, TaskStatus, TaskType } from "@/types/task";
import type {
  TaskTimelineAssignee,
  TaskTimelineParent,
} from "@/pages/tasks/utils/taskFilterUtils";
import type { FilterCategory } from "./filters/TaskFilterPopoverOptions";
import { TaskAssigneeFilterAvatars } from "./filters/TaskAssigneeFilterAvatars";
import { TaskFilterPopover } from "./filters/TaskFilterPopover";
import { TaskRefreshButton } from "./TaskViewSwitcher";

export interface TaskFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
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
  onRefresh?: () => void;
  loading?: boolean;
  className?: string;
}

interface TaskFilterSearchProps {
  search: string;
  onChange: (val: string) => void;
}

function TaskFilterSearch({ search, onChange }: TaskFilterSearchProps) {
  const { t } = useTranslation();
  return (
    <div className="relative w-44 shrink-0 sm:w-56 md:w-64">
      <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
      <Input
        value={search}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t("tasks.search", {
          defaultValue: "Tìm kiếm công việc...",
        })}
        aria-label={t("tasks.search")}
        className="bg-card/90 h-8 rounded-xl pr-7 pl-8 text-xs"
      />
      {search && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer p-0.5"
          aria-label={t("common.clear", { defaultValue: "Xóa" })}
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}

export function TaskFilterBar(props: TaskFilterBarProps) {
  const {
    search,
    onSearchChange,
    assignees,
    selectedAssignees,
    onToggleAssignee,
    onRefresh,
    loading = false,
    className,
  } = props;
  const hasAssignees = assignees.some(
    (p) => p.id !== "UNASSIGNED" && p.name.trim().toLowerCase() !== "unknown",
  );

  return (
    <div className={cn("flex flex-wrap items-center gap-2.5", className)}>
      <TaskFilterSearch search={search} onChange={onSearchChange} />
      {hasAssignees && (
        <TaskAssigneeFilterAvatars
          assignees={assignees}
          selectedAssignees={selectedAssignees}
          onToggleAssignee={onToggleAssignee}
        />
      )}
      <TaskFilterPopover {...props} />
      {onRefresh && (
        <TaskRefreshButton onRefresh={onRefresh} loading={loading} />
      )}
    </div>
  );
}
