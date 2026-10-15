import { Search } from "lucide-react";
import { SelectMenu } from "@/components/ui/select-menu";

interface TaskFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  typeFilter: string;
  onTypeFilterChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
  onSearchSubmit: () => void;
}

const TYPE_OPTIONS = [
  { value: "ALL", label: "Tất cả loại việc" },
  { value: "POST", label: "Bài viết (Post)" },
  { value: "LIVESTREAM", label: "Livestream" },
  { value: "SURVEY", label: "Khảo sát" },
];

const STATUS_OPTIONS = [
  { value: "ALL", label: "Tất cả trạng thái" },
  { value: "BACKLOG", label: "Backlog" },
  { value: "ASSIGNED", label: "Cần làm (To Do)" },
  { value: "IN_PROGRESS", label: "Đang làm (In Progress)" },
  { value: "MANAGER_REVIEW", label: "Đang duyệt (In Review)" },
  { value: "COMPLETED", label: "Hoàn thành (Done)" },
];

export function TaskFilterBar({
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  statusFilter,
  onStatusFilterChange,
  onSearchSubmit,
}: TaskFilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="text-muted-foreground/60 absolute top-1/2 left-3.5 size-4 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Tìm kiếm công việc..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearchSubmit()}
          className="border-border bg-card/90 text-foreground placeholder:text-muted-foreground focus:ring-brand-orange/30 focus:border-brand-orange w-full rounded-xl border py-2 pr-4 pl-10 text-sm shadow-2xs transition-all focus:outline-hidden focus:ring-2"
        />
      </div>

      {/* Filter Dropdowns using Custom Radix SelectMenu */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Type Filter */}
        <SelectMenu
          ariaLabel="Lọc theo loại công việc"
          value={typeFilter}
          onChange={onTypeFilterChange}
          options={TYPE_OPTIONS}
          className="h-9 min-w-[155px] rounded-xl border-border bg-card shadow-2xs"
        />

        {/* Status Filter */}
        <SelectMenu
          ariaLabel="Lọc theo trạng thái"
          value={statusFilter}
          onChange={onStatusFilterChange}
          options={STATUS_OPTIONS}
          className="h-9 min-w-[170px] rounded-xl border-border bg-card shadow-2xs"
        />
      </div>
    </div>
  );
}

