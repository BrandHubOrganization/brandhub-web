import { createElement, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Building2,
  Crown,
  FolderCheck,
  FolderMinus,
  Layers,
  Users,
} from "lucide-react";
import { getLogoIcon } from "@/pages/agency/logoIcons";
import { cn } from "@/lib/utils";
import type { Agency } from "@/types/agency";
import type { Workspace } from "@/types/workspace";

export type AgencyQuickFilterMode =
  | "all"
  | "owner"
  | "member"
  | "has_workspaces"
  | "empty";

export interface AgencyQuickFilterPillsProps {
  /** Danh sách các Công ty */
  agencies: Agency[];
  /** ID Công ty đang được chọn ("" nghĩa là Tất cả công ty) - dùng cho chế độ lọc theo từng công ty */
  selectedAgencyId?: string;
  /** Callback khi người dùng chọn một Công ty */
  onSelectAgency?: (agencyId: string) => void;
  /** Chế độ lọc nhanh theo thuộc tính Công ty (all | owner | member | has_workspaces | empty) */
  activeFilter?: AgencyQuickFilterMode;
  /** Callback khi người dùng chọn pill lọc nhanh theo thuộc tính Công ty */
  onFilterChange?: (filter: AgencyQuickFilterMode) => void;
  /** Số lượng tương ứng cho từng chế độ lọc nhanh Công ty */
  counts?: {
    all: number;
    owner: number;
    member: number;
    hasWorkspaces: number;
    empty: number;
  };
  /** Danh sách workspaces (tùy chọn) để tính số lượng workspace của từng Công ty */
  workspaces?: Workspace[];
  /** Map hoặc Record số lượng workspace theo agencyId (tùy chọn) */
  workspaceCountByAgency?: Map<string, number> | Record<string, number>;
  /** Tổng số lượng hiển thị ở pill Tất cả công ty (mặc định tính theo tổng workspace hoặc số công ty) */
  totalCount?: number;
  className?: string;
}

export function AgencyQuickFilterPills({
  agencies,
  selectedAgencyId = "",
  onSelectAgency,
  activeFilter,
  onFilterChange,
  counts,
  workspaces,
  workspaceCountByAgency,
  totalCount,
  className,
}: AgencyQuickFilterPillsProps) {
  const { t } = useTranslation();

  const countsMap = useMemo(() => {
    const map = new Map<string, number>();
    if (workspaceCountByAgency instanceof Map) {
      workspaceCountByAgency.forEach((v, k) => map.set(k, v));
    } else if (workspaceCountByAgency) {
      Object.entries(workspaceCountByAgency).forEach(([k, v]) => map.set(k, v));
    } else if (workspaces) {
      workspaces.forEach((ws) => {
        if (ws.agencyId) {
          map.set(ws.agencyId, (map.get(ws.agencyId) ?? 0) + 1);
        }
      });
    }
    return map;
  }, [workspaceCountByAgency, workspaces]);

  const hasWorkspaceCounts =
    Boolean(workspaceCountByAgency) || Boolean(workspaces);
  const allPillCount =
    totalCount ?? (workspaces ? workspaces.length : agencies.length);

  // Mode 1: Quick filter pills by company criteria (All, Owned by Me, Member, Has Workspaces, No Workspaces)
  if (onFilterChange && activeFilter) {
    const modePills: {
      id: AgencyQuickFilterMode;
      label: string;
      Icon: typeof Building2;
      count?: number;
    }[] = [
      {
        id: "all",
        label: t("agency.list.quickFilterAll", "Tất cả công ty"),
        Icon: Layers,
        count: counts?.all ?? agencies.length,
      },
      {
        id: "owner",
        label: t("agency.list.quickFilterOwner", "Tôi sở hữu"),
        Icon: Crown,
        count: counts?.owner,
      },
      {
        id: "member",
        label: t("agency.list.quickFilterMember", "Thành viên"),
        Icon: Users,
        count: counts?.member,
      },
      {
        id: "has_workspaces",
        label: t("agency.list.quickFilterHasWorkspaces", "Có Workspace"),
        Icon: FolderCheck,
        count: counts?.hasWorkspaces,
      },
      {
        id: "empty",
        label: t("agency.list.quickFilterEmpty", "Chưa có Workspace"),
        Icon: FolderMinus,
        count: counts?.empty,
      },
    ];

    return (
      <div
        role="group"
        aria-label={t("agency.list.quickFilterAll", "Tất cả công ty")}
        className={cn(
          "flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar",
          className,
        )}
      >
        {modePills.map((pill) => {
          const isActive = activeFilter === pill.id;
          const Icon = pill.Icon;
          return (
            <button
              key={pill.id}
              type="button"
              onClick={() => onFilterChange(pill.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-all cursor-pointer shrink-0 select-none",
                isActive
                  ? "border-brand-orange bg-brand-orange/10 text-brand-orange font-semibold shadow-2xs"
                  : "border-border bg-muted/35 text-muted-foreground hover:border-border hover:bg-muted/70 hover:text-foreground font-medium",
              )}
            >
              <Icon
                className={cn(
                  "size-3.5 shrink-0",
                  isActive ? "text-brand-orange" : "text-muted-foreground",
                )}
              />
              <span>{pill.label}</span>
              {typeof pill.count === "number" && (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.2 text-[10px] font-bold",
                    isActive
                      ? "bg-brand-orange/15 text-brand-orange"
                      : "bg-card text-muted-foreground border border-border/60",
                  )}
                >
                  {pill.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  if (agencies.length === 0) return null;

  const isAllSelected = !selectedAgencyId;

  return (
    <div
      role="group"
      aria-label={t("agency.list.quickFilterAll", "Tất cả công ty")}
      className={cn(
        "flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar",
        className,
      )}
    >
      {/* Pill: Tất cả công ty */}
      <button
        type="button"
        onClick={() => onSelectAgency?.("")}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-all cursor-pointer shrink-0 select-none",
          isAllSelected
            ? "border-brand-orange bg-brand-orange/10 text-brand-orange font-semibold shadow-2xs"
            : "border-border bg-muted/35 text-muted-foreground hover:border-border hover:bg-muted/70 hover:text-foreground font-medium",
        )}
      >
        <Building2
          className={cn(
            "size-3.5 shrink-0",
            isAllSelected ? "text-brand-orange" : "text-muted-foreground",
          )}
        />
        <span>{t("agency.list.quickFilterAll", "Tất cả công ty")}</span>
        <span
          className={cn(
            "rounded-full px-1.5 py-0.2 text-[10px] font-bold",
            isAllSelected
              ? "bg-brand-orange/15 text-brand-orange"
              : "bg-card text-muted-foreground border border-border/60",
          )}
        >
          {allPillCount}
        </span>
      </button>

      {/* Pills của từng Công ty */}
      {agencies.map((agency) => {
        const isActive = selectedAgencyId === agency.id;
        const wsCount = countsMap.get(agency.id) ?? 0;
        const brandColor = agency.brandColor || "#f05a28";

        return (
          <button
            key={agency.id}
            type="button"
            onClick={() => onSelectAgency?.(isActive ? "" : agency.id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border pl-1.5 pr-3 py-1 text-xs transition-all cursor-pointer shrink-0 select-none max-w-[240px]",
              isActive
                ? "border-brand-orange bg-brand-orange/10 text-brand-orange font-semibold shadow-2xs"
                : "border-border bg-card text-muted-foreground hover:border-brand-orange/35 hover:bg-muted/40 hover:text-foreground font-medium",
            )}
          >
            {/* Mini Avatar / Logo của Công ty */}
            {agency.logoUrl ? (
              <img
                src={agency.logoUrl}
                alt={agency.name}
                className="size-5 rounded-full object-cover shrink-0 border border-border/60 bg-card"
              />
            ) : (
              <span
                className="flex size-5 shrink-0 items-center justify-center rounded-full text-white shadow-2xs"
                style={{ backgroundColor: brandColor }}
              >
                {createElement(getLogoIcon(agency.logoIcon), {
                  className: "size-3 text-white",
                })}
              </span>
            )}

            <span className="truncate">{agency.name}</span>

            {hasWorkspaceCounts && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.2 text-[10px] font-bold shrink-0",
                  isActive
                    ? "bg-brand-orange/15 text-brand-orange"
                    : "bg-muted text-muted-foreground border border-border/60",
                )}
              >
                {wsCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default AgencyQuickFilterPills;
