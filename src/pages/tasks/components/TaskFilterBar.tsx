import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowDown,
  ArrowDownAZ,
  ArrowUp,
  ArrowUpZA,
  CalendarArrowDown,
  CalendarArrowUp,
  Clock,
  Search,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { SelectMenu, type SelectMenuOption } from "@/components/ui/select-menu";
import { cn } from "@/lib/utils";
import type { TaskPriority, TaskStatus, TaskType } from "@/types/task";
import type {
  TaskSortOption,
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
  sort?: TaskSortOption;
  onSortChange?: (sort: TaskSortOption) => void;
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
        placeholder={t("tasks.search", { defaultValue: "Tìm kiếm công việc..." })}
        aria-label={t("tasks.search")}
        className="bg-card/90 h-8 rounded-xl pl-8 pr-7 text-xs"
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

interface TaskSortSelectProps {
  sort: TaskSortOption;
  onSortChange: (sort: TaskSortOption) => void;
}

function TaskSortSelect({ sort, onSortChange }: TaskSortSelectProps) {
  const { t } = useTranslation();

  const options: SelectMenuOption[] = useMemo(
    () => [
      {
        value: "DEFAULT",
        label: t("tasks.sort.default", { defaultValue: "Mặc định" }),
        icon: <Clock className="size-3.5" />,
      },
      {
        value: "NAME_ASC",
        label: t("tasks.sort.nameAsc", { defaultValue: "Tên (A-Z)" }),
        icon: <ArrowDownAZ className="size-3.5" />,
        dividerBefore: true,
      },
      {
        value: "NAME_DESC",
        label: t("tasks.sort.nameDesc", { defaultValue: "Tên (Z-A)" }),
        icon: <ArrowUpZA className="size-3.5" />,
      },
      {
        value: "DUE_DATE_ASC",
        label: t("tasks.sort.dueDateAsc", { defaultValue: "Hạn chót (Gần nhất)" }),
        icon: <CalendarArrowUp className="size-3.5" />,
        dividerBefore: true,
      },
      {
        value: "DUE_DATE_DESC",
        label: t("tasks.sort.dueDateDesc", { defaultValue: "Hạn chót (Xa nhất)" }),
        icon: <CalendarArrowDown className="size-3.5" />,
      },
      {
        value: "START_DATE_DESC",
        label: t("tasks.sort.startDateDesc", { defaultValue: "Thời gian bắt đầu (Mới nhất)" }),
        icon: <Clock className="size-3.5" />,
        dividerBefore: true,
      },
      {
        value: "START_DATE_ASC",
        label: t("tasks.sort.startDateAsc", { defaultValue: "Thời gian bắt đầu (Cũ nhất)" }),
        icon: <Clock className="size-3.5" />,
      },
      {
        value: "PRIORITY_DESC",
        label: t("tasks.sort.priorityDesc", { defaultValue: "Độ ưu tiên (Cao → Thấp)" }),
        icon: <ArrowDown className="size-3.5" />,
        dividerBefore: true,
      },
      {
        value: "PRIORITY_ASC",
        label: t("tasks.sort.priorityAsc", { defaultValue: "Độ ưu tiên (Thấp → Cao)" }),
        icon: <ArrowUp className="size-3.5" />,
      },
    ],
    [t],
  );

  return (
    <SelectMenu
      value={sort}
      onChange={(val) => onSortChange(val as TaskSortOption)}
      options={options}
      ariaLabel={t("tasks.sort.label", { defaultValue: "Sắp xếp" })}
      className="bg-card/90 h-8 w-44 rounded-xl text-xs"
    />
  );
}

export function TaskFilterBar(props: TaskFilterBarProps) {
  const {
    search,
    onSearchChange,
    assignees,
    selectedAssignees,
    onToggleAssignee,
    sort,
    onSortChange,
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
      {sort && onSortChange && (
        <TaskSortSelect sort={sort} onSortChange={onSortChange} />
      )}
      {onRefresh && (
        <TaskRefreshButton onRefresh={onRefresh} loading={loading} />
      )}
    </div>
  );
}
