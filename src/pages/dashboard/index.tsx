import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { RefreshCw, Plus, KeyRound, LogOut } from "lucide-react";
import { KpiCardsSection } from "@/pages/dashboard/components/KpiCardsSection";
import { ActivityFeedSection } from "@/pages/dashboard/components/ActivityFeedSection";
import { TeamStatsSection } from "@/pages/dashboard/components/TeamStatsSection";
import { useDashboardData } from "./hooks/useDashboardData";
import { QuickTasksCard } from "./components/QuickTasksCard";
import { useWorkspaceStore } from "@/store/workspaceStore";

export function DashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    user,
    analytics,
    isAnalyticsLoading,
    isAnalyticsError,
    activities,
    isActivitiesLoading,
    isActivitiesError,
    isRefreshing,
    loadAllData,
    fetchAnalytics,
    fetchActivities,
    handleLogout,
  } = useDashboardData();

  const memberRole = useWorkspaceStore((s) => s.currentMemberRole);

  return (
    <PageWrapper
      title={t("dashboard.page.title")}
      description={t("dashboard.page.description")}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer gap-1.5 text-xs"
            onClick={loadAllData}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`size-3.5 ${isRefreshing ? "text-brand-orange animate-spin" : ""}`}
            />
            {t("dashboard.page.refresh")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer gap-1.5 text-xs"
            onClick={() => navigate("/change-password")}
          >
            <KeyRound className="size-3.5" />
            {t("dashboard.page.changePassword")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer gap-1.5 text-xs"
            onClick={handleLogout}
          >
            <LogOut className="size-3.5" />
            {t("dashboard.page.logout")}
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => navigate("/editor")}
            className="bg-brand-orange hover:bg-brand-orange/90 cursor-pointer gap-1.5 text-xs font-medium text-white"
          >
            <Plus className="size-3.5" />
            {t("dashboard.page.createContent")}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <QuickTasksCard
          userName={user?.name || ""}
          userRole={memberRole ?? undefined}
        />

        <KpiCardsSection
          data={analytics}
          isLoading={isAnalyticsLoading}
          isError={isAnalyticsError}
          onRetry={fetchAnalytics}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <ActivityFeedSection
              events={activities}
              isLoading={isActivitiesLoading}
              isError={isActivitiesError}
              onRetry={fetchActivities}
            />
          </div>

          <div className="space-y-6">
            <TeamStatsSection
              stats={analytics?.teamStats}
              userRole={memberRole}
              isLoading={isAnalyticsLoading}
            />
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

export default DashboardPage;
