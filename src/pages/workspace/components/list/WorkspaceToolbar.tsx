import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Search,
  X,
  Building2,
  Filter,
  ArrowUpDown,
  Shield,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { WORKSPACE_INDUSTRIES } from "@/pages/workspace/constants";
import { AgencyQuickFilterPills } from "@/pages/agency/components/hub/AgencyQuickFilterPills";
import {
  CustomFilterDropdown,
  HubAdvancedFilterPopover,
  DEFAULT_WORKSPACE_ADVANCED_FILTERS,
  getWorkspaceAdvancedFilterCount,
  type WorkspaceAdvancedFilters,
} from "@/pages/agency/components/hub/HubAdvancedFilterPopover";
import type { Agency } from "@/types/agency";
import type { Workspace } from "@/types/workspace";
import type { RoleFilter, SortOption } from "../../hooks/useWorkspaceList";

export interface WorkspaceToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  agencyFilter: string;
  onAgencyChange: (value: string) => void;
  roleFilter: RoleFilter;
  onRoleChange: (value: RoleFilter) => void;
  industryFilter: string;
  onIndustryChange: (value: string) => void;
  sortOption: SortOption;
  onSortChange: (value: SortOption) => void;
  advancedFilters?: WorkspaceAdvancedFilters;
  onAdvancedFiltersChange?: (next: WorkspaceAdvancedFilters) => void;
  agencies: Agency[];
  workspaces?: Workspace[];
  workspaceCountByAgency?: Map<string, number> | Record<string, number>;
  filteredCount: number;
  totalCount: number;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export function WorkspaceToolbar({
  searchQuery,
  onSearchChange,
  agencyFilter,
  onAgencyChange,
  roleFilter,
  onRoleChange,
  industryFilter,
  onIndustryChange,
  sortOption,
  onSortChange,
  advancedFilters: controlledAdvFilters,
  onAdvancedFiltersChange,
  agencies,
  workspaces,
  workspaceCountByAgency,
  filteredCount,
  totalCount,
  hasActiveFilters,
  onClearFilters,
}: WorkspaceToolbarProps) {
  const { t } = useTranslation();
  const [internalAdvFilters, setInternalAdvFilters] =
    useState<WorkspaceAdvancedFilters>(DEFAULT_WORKSPACE_ADVANCED_FILTERS);

  const advFilters = controlledAdvFilters ?? internalAdvFilters;
  const setAdvFilters = onAdvancedFiltersChange ?? setInternalAdvFilters;
  const activeAdvCount = getWorkspaceAdvancedFilterCount(advFilters);

  const agencyOptions = [
    {
      value: "",
      label: t("workspace.list.filterAgency", "Tất cả công ty"),
    },
    ...agencies.map((a) => ({
      value: a.id,
      label: a.name,
    })),
  ];

  const roleOptions = [
    {
      value: "all",
      label: t("workspace.list.filterRole", "Tất cả vai trò"),
    },
    {
      value: "OWNER",
      label: t("workspace.roles.OWNER", "Chủ sở hữu"),
    },
    {
      value: "MANAGER",
      label: t("workspace.roles.MANAGER", "Quản lý"),
    },
    {
      value: "CREATOR",
      label: t("workspace.roles.CREATOR", "Sáng tạo"),
    },
    {
      value: "CLIENT",
      label: t("workspace.roles.CLIENT", "Khách hàng"),
    },
  ];

  const industryOptions = [
    {
      value: "",
      label: t("workspace.list.filterIndustry", "Tất cả ngành nghề"),
    },
    ...WORKSPACE_INDUSTRIES.map((ind) => ({
      value: ind,
      label: t(`workspace.industry.${ind}`, ind),
    })),
  ];

  const sortOptions = [
    {
      value: "newest",
      label: t("workspace.list.sortNewest", "Mới nhất"),
    },
    {
      value: "oldest",
      label: t("workspace.list.sortOldest", "Cũ nhất"),
    },
    {
      value: "name_asc",
      label: t("workspace.list.sortNameAsc", "Tên A → Z"),
    },
    {
      value: "name_desc",
      label: t("workspace.list.sortNameDesc", "Tên Z → A"),
    },
    {
      value: "role",
      label: t("workspace.list.sortRole", "Ưu tiên Owner"),
    },
  ];

  const handleResetAll = () => {
    setAdvFilters(DEFAULT_WORKSPACE_ADVANCED_FILTERS);
    onClearFilters();
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-3">
      {/* Quick Filter Pills theo Công ty */}
      {agencies.length > 0 && (
        <div className="pb-1 border-b border-border/60">
          <AgencyQuickFilterPills
            agencies={agencies}
            selectedAgencyId={agencyFilter}
            onSelectAgency={onAgencyChange}
            workspaces={workspaces}
            workspaceCountByAgency={workspaceCountByAgency}
            totalCount={agencies.length}
          />
        </div>
      )}

      {/* Search Box */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t(
              "workspace.list.searchPlaceholder",
              "Tìm kiếm không gian làm việc theo tên, công ty, ngành nghề...",
            )}
            className="pl-9 pr-8 h-9 text-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter & Sort Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-border/60">
        <div className="flex flex-wrap items-center gap-2">
          {/* Công ty Filter */}
          <CustomFilterDropdown
            value={agencyFilter}
            onChange={onAgencyChange}
            options={agencyOptions}
            defaultValue=""
            icon={<Building2 className="size-3.5" />}
            className="w-[150px] sm:w-[175px]"
          />

          {/* Role Filter */}
          <CustomFilterDropdown
            value={roleFilter}
            onChange={(val) => onRoleChange(val as RoleFilter)}
            options={roleOptions}
            defaultValue="all"
            icon={<Shield className="size-3.5" />}
            className="w-[135px] sm:w-[155px]"
          />

          {/* Industry Filter */}
          <CustomFilterDropdown
            value={industryFilter}
            onChange={onIndustryChange}
            options={industryOptions}
            defaultValue=""
            icon={<Filter className="size-3.5" />}
            className="w-[150px] sm:w-[175px]"
          />

          {/* Sort Option */}
          <CustomFilterDropdown
            value={sortOption}
            onChange={(val) => onSortChange(val as SortOption)}
            options={sortOptions}
            defaultValue="newest"
            icon={<ArrowUpDown className="size-3.5" />}
            className="w-[155px] sm:w-[175px]"
          />

          {/* Advanced Filter Popover */}
          <HubAdvancedFilterPopover
            mode="workspaces"
            filters={advFilters}
            onChange={setAdvFilters}
            onReset={() => setAdvFilters(DEFAULT_WORKSPACE_ADVANCED_FILTERS)}
          />
        </div>

        {/* Counts & Clear Filter summary */}
        <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
          <span className="font-medium text-foreground/80">
            {filteredCount} / {totalCount}{" "}
            {t("workspace.list.workspacesCount", "workspace")}
          </span>
          <span>•</span>
          <span>
            {agencies.length} {t("agency.list.companiesCount", "công ty")}
          </span>
          {(hasActiveFilters || activeAdvCount > 0) && (
            <button
              type="button"
              onClick={handleResetAll}
              className="text-brand-orange hover:underline cursor-pointer font-medium text-xs ml-1"
            >
              {t("workspace.list.clearFilter", "Xóa bộ lọc")}
            </button>
          )}
        </div>
      </div>

      {/* Active Advanced Filter Chips */}
      {activeAdvCount > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border/50">
          <span className="text-[11px] text-muted-foreground mr-1">
            {t("agency.list.activeFiltersLabel", "Đang lọc:")}
          </span>
          {advFilters.companySize !== "" && (
            <span className="inline-flex items-center gap-1 rounded-full border border-brand-orange/30 bg-brand-orange/10 px-2.5 py-0.5 text-[11px] font-medium text-brand-orange">
              {t(
                `agency.companySize.${advFilters.companySize}`,
                advFilters.companySize,
              )}
              <button
                type="button"
                onClick={() =>
                  setAdvFilters({ ...advFilters, companySize: "" })
                }
                className="ml-0.5 rounded-full p-0.5 hover:bg-brand-orange/20 cursor-pointer"
              >
                <X className="size-2.5" />
              </button>
            </span>
          )}
          {advFilters.packageStatus !== "all" && (
            <span className="inline-flex items-center gap-1 rounded-full border border-brand-orange/30 bg-brand-orange/10 px-2.5 py-0.5 text-[11px] font-medium text-brand-orange">
              {advFilters.packageStatus === "APPROVED"
                ? t("workspace.list.packageApproved", "Đã duyệt gói")
                : advFilters.packageStatus === "NEGOTIATING"
                  ? t("workspace.list.packageNegotiating", "Đang đàm phán")
                  : t("workspace.list.packageNone", "Chưa có gói")}
              <button
                type="button"
                onClick={() =>
                  setAdvFilters({ ...advFilters, packageStatus: "all" })
                }
                className="ml-0.5 rounded-full p-0.5 hover:bg-brand-orange/20 cursor-pointer"
              >
                <X className="size-2.5" />
              </button>
            </span>
          )}
          {advFilters.hasWebsite !== "all" && (
            <span className="inline-flex items-center gap-1 rounded-full border border-brand-orange/30 bg-brand-orange/10 px-2.5 py-0.5 text-[11px] font-medium text-brand-orange">
              {t("workspace.list.websiteAvailable", "Có Website")}
              <button
                type="button"
                onClick={() =>
                  setAdvFilters({ ...advFilters, hasWebsite: "all" })
                }
                className="ml-0.5 rounded-full p-0.5 hover:bg-brand-orange/20 cursor-pointer"
              >
                <X className="size-2.5" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
