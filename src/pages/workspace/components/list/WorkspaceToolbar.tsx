import { useTranslation } from "react-i18next";
import { Search, X, Building2, Filter, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { WORKSPACE_INDUSTRIES } from "@/pages/workspace/constants";
import type { Agency } from "@/types/agency";
import type { RoleFilter, SortOption } from "../../hooks/useWorkspaceList";

interface WorkspaceToolbarProps {
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
  agencies: Agency[];
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
  agencies,
  filteredCount,
  totalCount,
  hasActiveFilters,
  onClearFilters,
}: WorkspaceToolbarProps) {
  const { t } = useTranslation();

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-3">
      {/* Search Box */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t(
              "workspace.list.searchPlaceholder",
              "Tìm kiếm workspace theo tên, công ty, ngành nghề...",
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
          {/* Agency/Company Filter */}
          <div className="flex items-center gap-1.5">
            <Building2 className="size-3.5 text-muted-foreground shrink-0" />
            <Select
              value={agencyFilter}
              onChange={(e) => onAgencyChange(e.target.value)}
              className="h-8 text-xs py-0 pr-7"
              wrapperClassName="w-[150px] sm:w-[170px]"
            >
              <option value="">
                {t("workspace.list.filterAgency", "Tất cả công ty")}
              </option>
              {agencies.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </Select>
          </div>

          {/* Role Filter */}
          <Select
            value={roleFilter}
            onChange={(e) => onRoleChange(e.target.value as RoleFilter)}
            className="h-8 text-xs py-0 pr-7"
            wrapperClassName="w-[130px] sm:w-[145px]"
          >
            <option value="all">
              {t("workspace.list.filterRole", "Tất cả vai trò")}
            </option>
            <option value="OWNER">{t("workspace.roles.OWNER", "Chủ sở hữu")}</option>
            <option value="MANAGER">{t("workspace.roles.MANAGER", "Quản lý")}</option>
            <option value="CREATOR">{t("workspace.roles.CREATOR", "Sáng tạo")}</option>
            <option value="CLIENT">{t("workspace.roles.CLIENT", "Khách hàng")}</option>
          </Select>

          {/* Industry Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="size-3.5 text-muted-foreground shrink-0" />
            <Select
              value={industryFilter}
              onChange={(e) => onIndustryChange(e.target.value)}
              className="h-8 text-xs py-0 pr-7"
              wrapperClassName="w-[150px] sm:w-[170px]"
            >
              <option value="">
                {t("workspace.list.filterIndustry", "Tất cả ngành nghề")}
              </option>
              {WORKSPACE_INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>
                  {t(`workspace.industry.${ind}`, ind)}
                </option>
              ))}
            </Select>
          </div>

          {/* Sort Option */}
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="size-3.5 text-muted-foreground shrink-0" />
            <Select
              value={sortOption}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="h-8 text-xs py-0 pr-7"
              wrapperClassName="w-[155px] sm:w-[175px]"
            >
              <option value="newest">
                {t("workspace.list.sortNewest", "Mới nhất")}
              </option>
              <option value="oldest">
                {t("workspace.list.sortOldest", "Cũ nhất")}
              </option>
              <option value="name_asc">
                {t("workspace.list.sortNameAsc", "Tên A → Z")}
              </option>
              <option value="name_desc">
                {t("workspace.list.sortNameDesc", "Tên Z → A")}
              </option>
              <option value="role">
                {t("workspace.list.sortRole", "Ưu tiên Owner")}
              </option>
            </Select>
          </div>
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
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="text-brand-orange hover:underline cursor-pointer font-medium text-xs ml-1"
            >
              {t("workspace.list.clearFilter", "Xóa bộ lọc")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
