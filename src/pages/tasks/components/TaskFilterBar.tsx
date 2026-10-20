import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { STATUS_CONFIG } from "@/pages/tasks/constants";
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

export function TaskFilterBar({
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  statusFilter,
  onStatusFilterChange,
  onSearchSubmit,
}: TaskFilterBarProps) {
  const { t } = useTranslation();
  const types = [
    "POST",
    "LIVESTREAM",
    "SURVEY",
    "EVENT_PLAN",
    "PRESS_RECOMMENDATION",
  ];
  const typeOptions = [
    { value: "ALL", label: t("tasks.allTypes") },
    ...types.map((value) => ({ value, label: t(`tasks.types.${value}`) })),
  ];
  const statusOptions = [
    { value: "ALL", label: t("tasks.allStatuses") },
    ...Object.keys(STATUS_CONFIG).map((value) => ({
      value,
      label: t(`tasks.status.${value}`),
    })),
  ];
  return (
    <div className="flex shrink-0 flex-col flex-wrap items-stretch justify-between gap-3 sm:flex-row sm:items-center">
      {/* Search Input */}
      <div className="relative max-w-md flex-1">
        <Search className="text-muted-foreground/60 absolute top-1/2 left-3.5 size-4 -translate-y-1/2" />
        <input
          type="text"
          placeholder={t("tasks.search")}
          aria-label={t("tasks.search")}
          maxLength={200}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearchSubmit()}
          className="border-border bg-card/90 text-foreground placeholder:text-muted-foreground focus:ring-brand-orange/30 focus:border-brand-orange w-full rounded-xl border py-2 pr-4 pl-10 text-sm shadow-2xs transition-all focus:ring-2 focus:outline-hidden"
        />
      </div>

      {/* Filter Dropdowns using Custom Radix SelectMenu */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Type Filter */}
        <SelectMenu
          ariaLabel={t("tasks.filterType")}
          value={typeFilter}
          onChange={onTypeFilterChange}
          options={typeOptions}
          className="border-border bg-card h-9 min-w-[155px] rounded-xl shadow-2xs"
        />

        {/* Status Filter */}
        <SelectMenu
          ariaLabel={t("tasks.filterStatus")}
          value={statusFilter}
          onChange={onStatusFilterChange}
          options={statusOptions}
          className="border-border bg-card h-9 min-w-[170px] rounded-xl shadow-2xs"
        />
      </div>
    </div>
  );
}
