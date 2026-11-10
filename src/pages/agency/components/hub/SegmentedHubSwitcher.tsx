import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { Building2, FolderKanban } from "lucide-react";
import { cn } from "@/lib/utils";

export type HubViewMode = "agencies" | "workspaces";

export interface SegmentedHubSwitcherProps {
  /** Tab đang active ("agencies" | "workspaces") */
  activeTab?: HubViewMode;
  /** Alias cho activeTab */
  value?: HubViewMode;
  /** Callback khi chuyển tab. Nếu không truyền sẽ tự động điều hướng route tương ứng */
  onChange?: (tab: HubViewMode) => void;
  /** Alias cho onChange */
  onTabChange?: (tab: HubViewMode) => void;
  /** Số lượng Công ty */
  agencyCount?: number;
  /** Alias cho agencyCount */
  agenciesCount?: number;
  /** Số lượng Không gian làm việc */
  workspaceCount?: number;
  /** Alias cho workspaceCount */
  workspacesCount?: number;
  className?: string;
}

export function SegmentedHubSwitcher({
  activeTab,
  value,
  onChange,
  onTabChange,
  agencyCount,
  agenciesCount,
  workspaceCount,
  workspacesCount,
  className,
}: SegmentedHubSwitcherProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentTab: HubViewMode = activeTab ?? value ?? "agencies";
  const resolvedAgencyCount = agencyCount ?? agenciesCount;
  const resolvedWorkspaceCount = workspaceCount ?? workspacesCount;

  const handleSelect = (tab: HubViewMode) => {
    if (tab === currentTab) return;
    const handler = onChange ?? onTabChange;
    if (handler) {
      handler(tab);
    } else {
      navigate(tab === "agencies" ? "/agency" : "/workspaces");
    }
  };

  const tabs: {
    id: HubViewMode;
    label: string;
    Icon: typeof Building2;
    count?: number;
  }[] = [
    {
      id: "agencies",
      label: t("agency.list.hubTabAgencies", "Công ty"),
      Icon: Building2,
      count: resolvedAgencyCount,
    },
    {
      id: "workspaces",
      label: t("agency.list.hubTabWorkspaces", "Không gian làm việc"),
      Icon: FolderKanban,
      count: resolvedWorkspaceCount,
    },
  ];

  return (
    <div
      role="tablist"
      aria-label={t(
        "agency.list.hubSwitcherAria",
        "Chuyển đổi chế độ xem Công ty và Không gian làm việc",
      )}
      className={cn(
        "inline-flex items-center rounded-xl border border-border bg-muted/50 p-1 shadow-2xs",
        className,
      )}
    >
      {tabs.map((tab) => {
        const isActive = currentTab === tab.id;
        const Icon = tab.Icon;

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => handleSelect(tab.id)}
            className={cn(
              "relative flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors cursor-pointer select-none",
              isActive
                ? "text-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {isActive && (
              <motion.div
                layoutId="hub-view-segment"
                transition={{
                  type: "spring",
                  stiffness: 420,
                  damping: 32,
                }}
                className="absolute inset-0 rounded-lg border border-brand-orange/30 bg-card shadow-xs"
              />
            )}

            <span className="relative z-10 flex items-center gap-1.5">
              <Icon
                className={cn(
                  "size-3.5 transition-colors",
                  isActive ? "text-brand-orange" : "text-muted-foreground",
                )}
              />
              <span>{tab.label}</span>
              {typeof tab.count === "number" && (
                <span
                  className={cn(
                    "ml-0.5 rounded-full px-1.5 py-0.2 text-[10px] font-bold transition-colors",
                    isActive
                      ? "bg-brand-orange/15 text-brand-orange border border-brand-orange/25"
                      : "bg-muted text-muted-foreground border border-border/60",
                  )}
                >
                  {tab.count}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default SegmentedHubSwitcher;
