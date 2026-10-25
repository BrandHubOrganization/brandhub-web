import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Search, RotateCcw, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectMenu } from "@/components/ui/select-menu";
import { REQUEST_STATUSES, REQUEST_TYPES } from "@/pages/requests/types/workspaceRequest";
import type { SelectMenuOption } from "@/components/ui/select-menu";

interface WorkspaceRequestFilterBarProps {
  search: string;
  status: string;
  type: string;
  sort: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onResetFilters: () => void;
}

export function WorkspaceRequestFilterBar({
  search,
  status,
  type,
  sort,
  onSearchChange,
  onStatusChange,
  onTypeChange,
  onSortChange,
  onResetFilters,
}: WorkspaceRequestFilterBarProps) {
  const { t } = useTranslation();

  const statusOptions: SelectMenuOption[] = useMemo(
    () => [
      { value: "", label: t("requests.v2.allStatuses") },
      ...REQUEST_STATUSES.map((s) => ({
        value: s,
        label: t(`requests.v2.status.${s}`),
      })),
    ],
    [t],
  );

  const typeOptions: SelectMenuOption[] = useMemo(
    () => [
      { value: "", label: t("requests.v2.allTypes") },
      ...REQUEST_TYPES.map((tp) => ({
        value: tp,
        label: t(`requests.v2.types.${tp}`),
      })),
    ],
    [t],
  );

  const sortOptions: SelectMenuOption[] = useMemo(
    () => [
      { value: "newest", label: t("requests.v2.sortNewest") },
      { value: "oldest", label: t("requests.v2.sortOldest") },
      { value: "due_asc", label: t("requests.v2.sortDueAsc") },
      { value: "due_desc", label: t("requests.v2.sortDueDesc") },
    ],
    [t],
  );

  const hasActiveFilters = Boolean(
    search || status || type || (sort && sort !== "newest"),
  );

  return (
    <div className="bg-card border-border/80 flex flex-col gap-3 rounded-2xl border p-4 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
      {/* Search Input using standard UI Input */}
      <div className="relative max-w-md flex-1">
        <Input
          placeholder={t("requests.v2.search")}
          aria-label={t("requests.v2.search")}
          maxLength={100}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          iconPrefix={<Search className="text-muted-foreground/60 size-4" />}
          className="bg-muted/20 pr-9 text-sm"
        />
        {search && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onSearchChange("")}
            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 size-6 -translate-y-1/2 rounded-md"
            aria-label={t("requests.v2.clearSearch", { defaultValue: "Xóa tìm kiếm" })}
          >
            <X className="size-3.5" />
          </Button>
        )}
      </div>

      {/* Filter Dropdowns using Custom Radix SelectMenu */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground text-xs font-medium hidden md:inline">
            {t("requests.v2.filterStatus")}:
          </span>
          <SelectMenu
            ariaLabel={t("requests.v2.filterStatus")}
            value={status}
            onChange={onStatusChange}
            options={statusOptions}
            className="border-border bg-card h-9 min-w-[155px] rounded-xl shadow-2xs text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground text-xs font-medium hidden md:inline">
            {t("requests.v2.filterType")}:
          </span>
          <SelectMenu
            ariaLabel={t("requests.v2.filterType")}
            value={type}
            onChange={onTypeChange}
            options={typeOptions}
            className="border-border bg-card h-9 min-w-[145px] rounded-xl shadow-2xs text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground text-xs font-medium hidden lg:inline">
            {t("requests.v2.filterSort")}:
          </span>
          <SelectMenu
            ariaLabel={t("requests.v2.filterSort")}
            value={sort}
            onChange={onSortChange}
            options={sortOptions}
            className="border-border bg-card h-9 min-w-[140px] rounded-xl shadow-2xs text-xs"
          />
        </div>

        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="text-muted-foreground hover:text-foreground h-9 px-2.5 text-xs rounded-xl"
            title={t("requests.v2.resetFilters")}
          >
            <RotateCcw className="size-3.5 mr-1" />
            {t("requests.v2.resetFilters")}
          </Button>
        )}
      </div>
    </div>
  );
}
