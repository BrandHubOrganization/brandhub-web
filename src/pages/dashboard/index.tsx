import { useNavigate } from "react-router-dom";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { RefreshCw, Plus, KeyRound, LogOut } from "lucide-react";
import { KpiCardsSection } from "@/components/dashboard/KpiCardsSection";
import { ActivityFeedSection } from "@/components/dashboard/ActivityFeedSection";
import { TeamStatsSection } from "@/components/dashboard/TeamStatsSection";
import { useDashboardData } from "./hooks/useDashboardData";
import { QuickTasksCard } from "./components/QuickTasksCard";

export function DashboardPage() {
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

  return (
    <PageWrapper
      title="Dashboard"
      description="Tổng quan chỉ số hoạt động, nhật ký sự kiện và tiến độ nhóm."
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
              className={`size-3.5 ${isRefreshing ? "animate-spin text-[#f05a28]" : ""}`}
            />
            Làm mới
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer gap-1.5 text-xs"
            onClick={() => navigate("/change-password")}
          >
            <KeyRound className="size-3.5" />
            Đổi mật khẩu
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer gap-1.5 text-xs"
            onClick={handleLogout}
          >
            <LogOut className="size-3.5" />
            Đăng xuất
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => navigate("/editor")}
            className="cursor-pointer gap-1.5 bg-[#f05a28] text-xs font-medium text-white hover:bg-[#f05a28]/90"
          >
            <Plus className="size-3.5" />
            Tạo Nội Dung Mới
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <QuickTasksCard userName={user?.name || ""} userRole={user?.role} />

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
              userRole={user?.role}
              isLoading={isAnalyticsLoading}
            />
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

export default DashboardPage;
