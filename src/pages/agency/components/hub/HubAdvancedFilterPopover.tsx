import * as React from "react";
import { useTranslation } from "react-i18next";
import {
  Check,
  ChevronDown,
  Globe,
  Layers,
  Package,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { COMPANY_SIZES } from "@/pages/agency/constants";
import { cn } from "@/lib/utils";

export interface CustomFilterOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

export interface CustomFilterDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: CustomFilterOption[];
  icon?: React.ReactNode;
  defaultValue?: string;
  className?: string;
  contentClassName?: string;
  align?: "start" | "center" | "end";
  ariaLabel?: string;
}

export function CustomFilterDropdown({
  value,
  onChange,
  options,
  icon,
  defaultValue = "",
  className,
  contentClassName,
  align = "start",
  ariaLabel,
}: CustomFilterDropdownProps) {
  const selectedOption =
    options.find((opt) => opt.value === value) ?? options[0];
  const isFiltered = value !== defaultValue;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={ariaLabel}
          className={cn(
            "inline-flex h-8 items-center justify-between gap-2 rounded-lg border px-2.5 text-xs font-medium transition-colors cursor-pointer select-none outline-hidden focus-visible:ring-2 focus-visible:ring-brand-orange/30",
            isFiltered
              ? "border-brand-orange/40 bg-brand-orange/8 text-brand-orange hover:bg-brand-orange/12"
              : "border-border bg-background/80 text-foreground hover:border-border/90 hover:bg-muted/60",
            className,
          )}
        >
          <span className="flex items-center gap-1.5 min-w-0 truncate">
            {icon && (
              <span
                className={cn(
                  "shrink-0 transition-colors",
                  isFiltered ? "text-brand-orange" : "text-muted-foreground",
                )}
              >
                {icon}
              </span>
            )}
            <span className="truncate">{selectedOption?.label}</span>
          </span>
          <ChevronDown
            className={cn(
              "size-3.5 shrink-0 transition-transform duration-150",
              isFiltered ? "text-brand-orange" : "text-muted-foreground",
            )}
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        className={cn("min-w-[180px] max-h-72 p-1", contentClassName)}
      >
        {options.map((option) => {
          const isSelected = option.value === value;
          return (
            <DropdownMenuItem
              key={option.value || "__empty__"}
              onClick={() => onChange(option.value)}
              className={cn(
                "flex items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-xs cursor-pointer transition-colors",
                isSelected
                  ? "bg-brand-orange/10 text-brand-orange font-semibold focus:bg-brand-orange/15 focus:text-brand-orange"
                  : "text-foreground",
              )}
            >
              <span className="flex items-center gap-2 truncate">
                {option.icon && (
                  <span className="shrink-0 text-muted-foreground">
                    {option.icon}
                  </span>
                )}
                <span className="truncate">{option.label}</span>
              </span>
              {isSelected && (
                <Check className="size-3.5 shrink-0 text-brand-orange" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export type AgencyWorkspaceScaleFilter =
  | "all"
  | "has_workspaces"
  | "empty"
  | "3_plus";

export type AgencyCompletenessFilter = "all" | "with_website" | "verified_tax";

export interface AgencyAdvancedFilters {
  companySize: string;
  workspaceScale: AgencyWorkspaceScaleFilter;
  hasWebsite: AgencyCompletenessFilter;
}

export const DEFAULT_AGENCY_ADVANCED_FILTERS: AgencyAdvancedFilters = {
  companySize: "",
  workspaceScale: "all",
  hasWebsite: "all",
};

export type WorkspacePackageStatusFilter =
  | "all"
  | "APPROVED"
  | "NEGOTIATING"
  | "NONE";

export type WorkspaceWebsiteFilter = "all" | "with_website";

export interface WorkspaceAdvancedFilters {
  companySize: string;
  packageStatus: WorkspacePackageStatusFilter;
  hasWebsite: WorkspaceWebsiteFilter;
}

export const DEFAULT_WORKSPACE_ADVANCED_FILTERS: WorkspaceAdvancedFilters = {
  companySize: "",
  packageStatus: "all",
  hasWebsite: "all",
};

export function getAgencyAdvancedFilterCount(
  filters: AgencyAdvancedFilters,
): number {
  let count = 0;
  if (filters.companySize !== "") count += 1;
  if (filters.workspaceScale !== "all") count += 1;
  if (filters.hasWebsite !== "all") count += 1;
  return count;
}

export function getWorkspaceAdvancedFilterCount(
  filters: WorkspaceAdvancedFilters,
): number {
  let count = 0;
  if (filters.companySize !== "") count += 1;
  if (filters.packageStatus !== "all") count += 1;
  if (filters.hasWebsite !== "all") count += 1;
  return count;
}

type HubAdvancedFilterPopoverProps =
  | {
      mode: "agencies";
      filters: AgencyAdvancedFilters;
      onChange: (next: AgencyAdvancedFilters) => void;
      onReset: () => void;
      className?: string;
    }
  | {
      mode: "workspaces";
      filters: WorkspaceAdvancedFilters;
      onChange: (next: WorkspaceAdvancedFilters) => void;
      onReset: () => void;
      className?: string;
    };

export function HubAdvancedFilterPopover(props: HubAdvancedFilterPopoverProps) {
  const { t } = useTranslation();
  const { mode, onReset, className } = props;

  const activeCount =
    mode === "agencies"
      ? getAgencyAdvancedFilterCount(props.filters)
      : getWorkspaceAdvancedFilterCount(props.filters);

  const companySizeOptions = [
    {
      value: "",
      label:
        mode === "agencies"
          ? t("agency.list.filterAll", "Tất cả")
          : t("workspace.list.filterAll", "Tất cả"),
    },
    ...COMPANY_SIZES.map((size) => ({
      value: size,
      label: t(`agency.companySize.${size}`, size),
    })),
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-colors cursor-pointer select-none outline-hidden focus-visible:ring-2 focus-visible:ring-brand-orange/30",
            activeCount > 0
              ? "border-brand-orange/40 bg-brand-orange/8 text-brand-orange hover:bg-brand-orange/12"
              : "border-border bg-background/80 text-foreground hover:border-border/90 hover:bg-muted/60",
            className,
          )}
        >
          <SlidersHorizontal
            className={cn(
              "size-3.5 shrink-0",
              activeCount > 0 ? "text-brand-orange" : "text-muted-foreground",
            )}
          />
          <span>{t("agency.list.advancedFilter", "Bộ lọc nâng cao")}</span>
          {activeCount > 0 && (
            <span className="ml-0.5 inline-flex size-4 items-center justify-center rounded-full bg-brand-orange text-[10px] font-bold text-white">
              {activeCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-80 sm:w-88 rounded-xl border border-border bg-popover p-4 shadow-lg space-y-4"
      >
        <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="size-3.5 text-brand-orange" />
            <span className="text-xs font-semibold text-foreground">
              {t("agency.list.advancedFilterTitle", "Bộ lọc nâng cao")}
            </span>
          </div>
          {activeCount > 0 && (
            <span className="rounded-full bg-brand-orange/10 border border-brand-orange/25 px-2 py-0.5 text-[10px] font-semibold text-brand-orange">
              {t("agency.list.activeFiltersCount", {
                count: activeCount,
                defaultValue: "Đang bật {{count}}",
              })}
            </span>
          )}
        </div>

        {mode === "agencies" ? (
          <div className="space-y-3.5">
            {/* Company Size */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <Users className="size-3 text-brand-orange" />
                {t("agency.list.filterCompanySize", "Quy mô nhân sự")}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {companySizeOptions.map((opt) => {
                  const selected = props.filters.companySize === opt.value;
                  return (
                    <button
                      key={opt.value || "all"}
                      type="button"
                      onClick={() =>
                        props.onChange({
                          ...props.filters,
                          companySize: opt.value,
                        })
                      }
                      className={cn(
                        "rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer",
                        selected
                          ? "border-brand-orange bg-brand-orange/12 text-brand-orange font-semibold"
                          : "border-border/80 bg-muted/35 text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Workspace Scale */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <Layers className="size-3 text-brand-orange" />
                {t("agency.list.filterWorkspaceScale", "Quy mô Workspace")}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    {
                      value: "all",
                      label: t("agency.list.filterAll", "Tất cả"),
                    },
                    {
                      value: "has_workspaces",
                      label: t(
                        "agency.list.scaleHasWorkspaces",
                        "Có workspace (>0)",
                      ),
                    },
                    {
                      value: "empty",
                      label: t(
                        "agency.list.scaleEmpty",
                        "Chưa có workspace (0)",
                      ),
                    },
                    {
                      value: "3_plus",
                      label: t(
                        "agency.list.scaleThreePlus",
                        "Từ 3+ workspace",
                      ),
                    },
                  ] as { value: AgencyWorkspaceScaleFilter; label: string }[]
                ).map((opt) => {
                  const selected = props.filters.workspaceScale === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() =>
                        props.onChange({
                          ...props.filters,
                          workspaceScale: opt.value,
                        })
                      }
                      className={cn(
                        "rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer",
                        selected
                          ? "border-brand-orange bg-brand-orange/12 text-brand-orange font-semibold"
                          : "border-border/80 bg-muted/35 text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Information Completeness */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <ShieldCheck className="size-3 text-brand-orange" />
                {t(
                  "agency.list.filterCompleteness",
                  "Mức độ hoàn thiện hồ sơ",
                )}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    {
                      value: "all",
                      label: t("agency.list.filterAll", "Tất cả"),
                    },
                    {
                      value: "with_website",
                      label: t(
                        "agency.list.completenessWithWebsite",
                        "Có Website",
                      ),
                    },
                    {
                      value: "verified_tax",
                      label: t(
                        "agency.list.completenessVerifiedTax",
                        "Có MST / Liên hệ",
                      ),
                    },
                  ] as { value: AgencyCompletenessFilter; label: string }[]
                ).map((opt) => {
                  const selected = props.filters.hasWebsite === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() =>
                        props.onChange({
                          ...props.filters,
                          hasWebsite: opt.value,
                        })
                      }
                      className={cn(
                        "rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer",
                        selected
                          ? "border-brand-orange bg-brand-orange/12 text-brand-orange font-semibold"
                          : "border-border/80 bg-muted/35 text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3.5">
            {/* Company Size */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <Users className="size-3 text-brand-orange" />
                {t("workspace.list.filterCompanySize", "Quy mô nhân sự")}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {companySizeOptions.map((opt) => {
                  const selected = props.filters.companySize === opt.value;
                  return (
                    <button
                      key={opt.value || "all"}
                      type="button"
                      onClick={() =>
                        props.onChange({
                          ...props.filters,
                          companySize: opt.value,
                        })
                      }
                      className={cn(
                        "rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer",
                        selected
                          ? "border-brand-orange bg-brand-orange/12 text-brand-orange font-semibold"
                          : "border-border/80 bg-muted/35 text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Media Package Status */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <Package className="size-3 text-brand-orange" />
                {t(
                  "workspace.list.filterPackageStatus",
                  "Trạng thái gói dịch vụ",
                )}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    {
                      value: "all",
                      label: t("workspace.list.filterAll", "Tất cả"),
                    },
                    {
                      value: "APPROVED",
                      label: t(
                        "workspace.list.packageApproved",
                        "Đã duyệt gói",
                      ),
                    },
                    {
                      value: "NEGOTIATING",
                      label: t(
                        "workspace.list.packageNegotiating",
                        "Đang đàm phán",
                      ),
                    },
                    {
                      value: "NONE",
                      label: t("workspace.list.packageNone", "Chưa có gói"),
                    },
                  ] as { value: WorkspacePackageStatusFilter; label: string }[]
                ).map((opt) => {
                  const selected = props.filters.packageStatus === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() =>
                        props.onChange({
                          ...props.filters,
                          packageStatus: opt.value,
                        })
                      }
                      className={cn(
                        "rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer",
                        selected
                          ? "border-brand-orange bg-brand-orange/12 text-brand-orange font-semibold"
                          : "border-border/80 bg-muted/35 text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Website */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <Globe className="size-3 text-brand-orange" />
                {t("workspace.list.filterWebsite", "Thông tin Website")}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    {
                      value: "all",
                      label: t("workspace.list.filterAll", "Tất cả"),
                    },
                    {
                      value: "with_website",
                      label: t(
                        "workspace.list.websiteAvailable",
                        "Có Website",
                      ),
                    },
                  ] as { value: WorkspaceWebsiteFilter; label: string }[]
                ).map((opt) => {
                  const selected = props.filters.hasWebsite === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() =>
                        props.onChange({
                          ...props.filters,
                          hasWebsite: opt.value,
                        })
                      }
                      className={cn(
                        "rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer",
                        selected
                          ? "border-brand-orange bg-brand-orange/12 text-brand-orange font-semibold"
                          : "border-border/80 bg-muted/35 text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end border-t border-border/60 pt-2.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={activeCount === 0}
            onClick={onReset}
            className="h-7 gap-1.5 px-2.5 text-xs text-muted-foreground hover:text-brand-orange hover:bg-brand-orange/10 cursor-pointer"
          >
            <RotateCcw className="size-3" />
            {t("agency.list.resetFilters", "Đặt lại bộ lọc")}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default HubAdvancedFilterPopover;
