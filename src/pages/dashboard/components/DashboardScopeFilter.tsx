import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Building2,
  FolderOpen,
  RotateCcw,
  SlidersHorizontal,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Agency } from "@/types/agency";
import type { Workspace } from "@/types/workspace";

export interface DashboardScopeFilterProps {
  agencies: Agency[];
  workspaces: Workspace[];
  selectedAgencyIds: string[];
  selectedWorkspaceIds: string[];
  onAgencyChange: (ids: string[]) => void;
  onWorkspaceChange: (ids: string[]) => void;
  onReset: () => void;
  className?: string;
}

export function DashboardScopeFilter({
  agencies,
  workspaces,
  selectedAgencyIds,
  selectedWorkspaceIds,
  onAgencyChange,
  onWorkspaceChange,
  onReset,
  className,
}: DashboardScopeFilterProps) {
  const { t } = useTranslation();

  // Map nhanh id -> Agency
  const agencyMap = useMemo(() => {
    return new Map(agencies.map((a) => [a.id, a]));
  }, [agencies]);

  // Đếm số workspace thuộc từng agency
  const wsCountByAgency = useMemo(() => {
    const counts: Record<string, number> = {};
    workspaces.forEach((ws) => {
      if (ws.agencyId) {
        counts[ws.agencyId] = (counts[ws.agencyId] || 0) + 1;
      }
    });
    return counts;
  }, [workspaces]);

  // Danh sách workspace hiển thị:
  // Nếu có chọn Agency, chỉ hiển thị các workspace thuộc Agency đó. Nếu không chọn Agency nào, hiển thị tất cả workspace.
  const relevantWorkspaces = useMemo(() => {
    if (selectedAgencyIds.length === 0) return workspaces;
    return workspaces.filter(
      (ws) => ws.agencyId && selectedAgencyIds.includes(ws.agencyId)
    );
  }, [workspaces, selectedAgencyIds]);

  const hasFilter =
    selectedAgencyIds.length > 0 || selectedWorkspaceIds.length > 0;

  // Xử lý toggle Agency
  const handleToggleAgency = (agencyId: string) => {
    if (selectedAgencyIds.includes(agencyId)) {
      const nextAgencyIds = selectedAgencyIds.filter((id) => id !== agencyId);
      // Loại bỏ workspace thuộc agency vừa bỏ chọn
      const nextWsIds = selectedWorkspaceIds.filter((wsId) => {
        const ws = workspaces.find((w) => w.id === wsId);
        return ws?.agencyId !== agencyId;
      });
      onAgencyChange(nextAgencyIds);
      if (nextWsIds.length !== selectedWorkspaceIds.length) {
        onWorkspaceChange(nextWsIds);
      }
    } else {
      onAgencyChange([...selectedAgencyIds, agencyId]);
    }
  };

  // Xử lý toggle Workspace
  const handleToggleWorkspace = (workspaceId: string) => {
    if (selectedWorkspaceIds.includes(workspaceId)) {
      onWorkspaceChange(selectedWorkspaceIds.filter((id) => id !== workspaceId));
    } else {
      onWorkspaceChange([...selectedWorkspaceIds, workspaceId]);
    }
  };

  // Số lượng đang tổng hợp để hiển thị trong Pill
  const displayedAgencyCount =
    selectedAgencyIds.length > 0 ? selectedAgencyIds.length : agencies.length;

  const displayedWorkspaceCount =
    selectedWorkspaceIds.length > 0
      ? selectedWorkspaceIds.length
      : relevantWorkspaces.length;

  return (
    <div
      className={cn(
        "rounded-xl border border-border/80 bg-card p-4 sm:p-5 shadow-2xs space-y-3.5",
        className
      )}
    >
      {/* Header & Scope Summary Pill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-muted/60 text-foreground">
            <SlidersHorizontal className="size-3.5 text-brand-orange" />
          </div>
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
            {t("dashboard.scopeFilter.title", "Phạm vi hoạt động")}
          </span>
          <span className="text-muted-foreground/60 text-xs">|</span>
          <span className="text-xs text-muted-foreground">
            {t("dashboard.scopeFilter.summarizing", {
              agencyCount: displayedAgencyCount,
              workspaceCount: displayedWorkspaceCount,
              defaultValue: `Đang tổng hợp: ${displayedAgencyCount} Công ty · ${displayedWorkspaceCount} Không gian làm việc`,
            })}
          </span>
        </div>

        {hasFilter && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-7 px-2.5 text-xs text-muted-foreground hover:text-brand-orange hover:bg-brand-orange/5 transition-colors self-start sm:self-auto gap-1.5"
          >
            <RotateCcw className="size-3" />
            <span>
              {t("dashboard.scopeFilter.resetAll", "Đặt lại về Tất cả")}
            </span>
          </Button>
        )}
      </div>

      {/* Hàng 1: Filter theo Công ty (Agency) */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-2">
        <div className="flex items-center gap-1.5 shrink-0 sm:w-28 text-muted-foreground text-xs font-medium sm:pt-1">
          <Building2 className="size-3.5 text-muted-foreground/80" />
          <span>{t("dashboard.scopeFilter.agencyLabel", "Công ty:")}</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 flex-1 max-h-24 overflow-y-auto pr-1 custom-scrollbar">
          {/* Nút "Tất cả Công ty" */}
          <button
            type="button"
            onClick={() => onAgencyChange([])}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-all border cursor-pointer",
              selectedAgencyIds.length === 0
                ? "bg-brand-orange text-white border-brand-orange shadow-sm shadow-brand-orange/25 font-semibold"
                : "bg-muted/40 hover:bg-muted/70 text-muted-foreground border-border/60"
            )}
          >
            <span>{t("dashboard.scopeFilter.allAgencies", "Tất cả Công ty")}</span>
            <span
              className={cn(
                "text-2xs rounded-full px-1.5 py-0.2",
                selectedAgencyIds.length === 0
                  ? "bg-white/25 text-white"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {agencies.length}
            </span>
          </button>

          {/* Danh sách Agency chips */}
          {agencies.map((agency) => {
            const isSelected = selectedAgencyIds.includes(agency.id);
            const wsCount = wsCountByAgency[agency.id] || 0;
            return (
              <button
                key={agency.id}
                type="button"
                onClick={() => handleToggleAgency(agency.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-all border cursor-pointer",
                  isSelected
                    ? "bg-brand-orange/10 text-brand-orange border-brand-orange font-medium shadow-2xs"
                    : "bg-muted/40 hover:bg-muted/70 text-muted-foreground border-border/60"
                )}
              >
                {isSelected ? (
                  <Check className="size-3 text-brand-orange shrink-0 stroke-[2.5]" />
                ) : (
                  <span className="size-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
                )}
                <span className="truncate max-w-[140px] sm:max-w-[200px]">
                  {agency.name}
                </span>
                {wsCount > 0 && (
                  <span
                    className={cn(
                      "text-2xs rounded-full px-1.5 py-0.2",
                      isSelected
                        ? "bg-brand-orange/20 text-brand-orange font-semibold"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {wsCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Hàng 2: Filter theo Không gian làm việc (Workspace) */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-2 pt-1 border-t border-border/30">
        <div className="flex items-center gap-1.5 shrink-0 sm:w-28 text-muted-foreground text-xs font-medium sm:pt-1">
          <FolderOpen className="size-3.5 text-muted-foreground/80" />
          <span>{t("dashboard.scopeFilter.workspaceLabel", "Workspace:")}</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 flex-1 max-h-28 overflow-y-auto pr-1 custom-scrollbar">
          {/* Nút "Tất cả Workspace" */}
          <button
            type="button"
            onClick={() => onWorkspaceChange([])}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-all border cursor-pointer",
              selectedWorkspaceIds.length === 0
                ? "bg-brand-orange text-white border-brand-orange shadow-sm shadow-brand-orange/25 font-semibold"
                : "bg-muted/40 hover:bg-muted/70 text-muted-foreground border-border/60"
            )}
          >
            <span>
              {t("dashboard.scopeFilter.allWorkspaces", "Tất cả Workspace")}
            </span>
            <span
              className={cn(
                "text-2xs rounded-full px-1.5 py-0.2",
                selectedWorkspaceIds.length === 0
                  ? "bg-white/25 text-white"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {relevantWorkspaces.length}
            </span>
          </button>

          {/* Danh sách Workspace chips */}
          {relevantWorkspaces.map((ws) => {
            const isSelected = selectedWorkspaceIds.includes(ws.id);
            const parentAgency = ws.agencyId ? agencyMap.get(ws.agencyId) : null;

            return (
              <button
                key={ws.id}
                type="button"
                onClick={() => handleToggleWorkspace(ws.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-all border cursor-pointer",
                  isSelected
                    ? "bg-brand-orange/10 text-brand-orange border-brand-orange font-medium shadow-2xs"
                    : "bg-muted/40 hover:bg-muted/70 text-muted-foreground border-border/60"
                )}
              >
                {isSelected ? (
                  <Check className="size-3 text-brand-orange shrink-0 stroke-[2.5]" />
                ) : (
                  <span className="size-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
                )}
                <span className="truncate max-w-[120px] sm:max-w-[180px]">
                  {ws.name}
                </span>
                {parentAgency && (
                  <span className={cn(
                    "text-2xs border-l pl-1",
                    isSelected
                      ? "text-brand-orange/70 border-brand-orange/30"
                      : "text-muted-foreground/70 border-border/60"
                  )}>
                    {parentAgency.name}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
