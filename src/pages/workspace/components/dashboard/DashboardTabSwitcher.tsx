import { useTranslation } from "react-i18next";
import { LayoutDashboard, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DashboardTabType } from "../../types/dashboard";

interface DashboardTabSwitcherProps {
  activeTab: DashboardTabType;
  onTabChange: (tab: DashboardTabType) => void;
}

export function DashboardTabSwitcher({
  activeTab,
  onTabChange,
}: DashboardTabSwitcherProps) {
  const { t } = useTranslation();

  return (
    <div className="mb-6 flex flex-col gap-3 border-b border-border/80 pb-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="bg-muted/40 border-border/60 dark:bg-muted/20 inline-flex items-center gap-1 rounded-xl border p-1 shadow-2xs">
        <Button
          variant={activeTab === "overview" ? "orange" : "ghost"}
          size="sm"
          onClick={() => onTabChange("overview")}
          className="h-8 gap-2 rounded-lg px-3.5 text-xs font-semibold"
        >
          <LayoutDashboard className="size-3.5" />
          <span>{t("workspace.dashboard.tabs.overview", "Tổng quan Workspace")}</span>
        </Button>

        <Button
          variant={activeTab === "publishing" ? "orange" : "ghost"}
          size="sm"
          onClick={() => onTabChange("publishing")}
          className="h-8 gap-2 rounded-lg px-3.5 text-xs font-semibold"
        >
          <Share2 className="size-3.5" />
          <span>{t("workspace.dashboard.tabs.publishing", "Xuất bản & Mạng xã hội")}</span>
        </Button>
      </div>

      <p className="text-muted-foreground text-2xs italic sm:text-right">
        {activeTab === "overview"
          ? t(
              "workspace.dashboard.tabs.overviewHint",
              "Tiến độ công việc, chiến dịch và tổng quan tài nguyên",
            )
          : t(
              "workspace.dashboard.tabs.publishingHint",
              "Hiệu suất đăng bài, tương tác và thị phần đa kênh",
            )}
      </p>
    </div>
  );
}
