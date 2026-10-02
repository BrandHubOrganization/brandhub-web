import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import {
  RefreshCw,
  Plus,
  KeyRound,
  LogOut,
  Building2,
  FolderOpen,
  Mail,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { KpiCardsSection } from "@/pages/dashboard/components/KpiCardsSection";
import { ActivityFeedSection } from "@/pages/dashboard/components/ActivityFeedSection";
import { TeamStatsSection } from "@/pages/dashboard/components/TeamStatsSection";
import { useDashboardData } from "./hooks/useDashboardData";
import { QuickTasksCard } from "./components/QuickTasksCard";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useAgencyStore } from "@/store/agencyStore";
import { agencyService } from "@/services/agencyService";
import { workspaceService } from "@/services/workspaceService";
import { ChannelPerformanceChart } from "@/pages/analytics/components/ChannelPerformanceChart";
import {
  AudienceGrowthAreaChart,
  ContentStatusDonutChart,
  PeakHoursBarChart,
  GoalsProgressChart,
} from "./components/DashboardAdvancedCharts";
import { getAnalyticsSummary } from "@/services/mock/mockAnalyticsService";
import type { AnalyticsSummary } from "@/types/analytics";
import type { Agency } from "@/types/agency";
import type { Workspace } from "@/types/workspace";

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
  const currentWorkspace = useWorkspaceStore((s) => s.currentWorkspace);
  const setCurrentAgencyId = useAgencyStore((s) => s.setCurrentAgencyId);
  const setCurrentWorkspace = useWorkspaceStore((s) => s.setCurrentWorkspace);

  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [pendingAgencyInvites, setPendingAgencyInvites] = useState<number>(0);
  const [pendingWsInvites, setPendingWsInvites] = useState<number>(0);
  const [analyticsSummary, setAnalyticsSummary] =
    useState<AnalyticsSummary | null>(null);
  const [loadingRealData, setLoadingRealData] = useState(true);

  const loadRealOverview = async () => {
    setLoadingRealData(true);
    try {
      const [agenciesRes, workspacesRes, agencyInvRes, wsInvRes, analyticsRes] =
        await Promise.allSettled([
          agencyService.list(),
          workspaceService.list(),
          agencyService.listMyPendingInvitations(),
          workspaceService.listMyPendingInvitations(),
          getAnalyticsSummary(),
        ]);

      if (agenciesRes.status === "fulfilled") {
        setAgencies(agenciesRes.value.data.data ?? []);
      }
      if (workspacesRes.status === "fulfilled") {
        setWorkspaces(workspacesRes.value.data.data ?? []);
      }
      if (agencyInvRes.status === "fulfilled") {
        setPendingAgencyInvites(agencyInvRes.value.data.data?.length ?? 0);
      }
      if (wsInvRes.status === "fulfilled") {
        setPendingWsInvites(wsInvRes.value.data.data?.length ?? 0);
      }
      if (analyticsRes.status === "fulfilled") {
        setAnalyticsSummary(analyticsRes.value);
      }
    } finally {
      setLoadingRealData(false);
    }
  };

  useEffect(() => {
    loadRealOverview();
  }, []);

  const handleRefresh = async () => {
    await Promise.all([loadAllData(), loadRealOverview()]);
  };

  const handleEnterAgency = (agencyId: string) => {
    setCurrentAgencyId(agencyId);
    setCurrentWorkspace(null);
    navigate(`/agency/${agencyId}`);
  };

  const handleEnterWorkspace = (ws: Workspace) => {
    if (ws.agencyId) setCurrentAgencyId(ws.agencyId);
    setCurrentWorkspace(ws);
    navigate(`/workspaces/${ws.id}/dashboard`);
  };

  const totalInvites = pendingAgencyInvites + pendingWsInvites;

  return (
    <PageWrapper
      title={t("dashboard.page.title")}
      description={t("dashboard.page.description")}
      introSummary="Bảng điều khiển trung tâm (Hub Dashboard) tổng hợp toàn bộ các Công ty, Không gian làm việc và thống kê hiệu suất nội dung của bạn. Chọn một Không gian làm việc bất kỳ để bắt đầu lên kế hoạch và sản xuất bài viết."
      guideUrl="/help/guide#architecture"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer gap-1.5 text-xs"
            onClick={handleRefresh}
            disabled={isRefreshing || loadingRealData}
          >
            <RefreshCw
              className={`size-3.5 ${
                isRefreshing || loadingRealData
                  ? "text-brand-orange animate-spin"
                  : ""
              }`}
            />
            {t("dashboard.page.refresh")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer gap-1.5 text-xs"
            onClick={() => navigate("/settings/security")}
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
            onClick={() => {
              if (currentWorkspace) {
                navigate(`/workspaces/${currentWorkspace.id}/editor`);
              } else if (workspaces.length > 0) {
                navigate(`/workspaces/${workspaces[0].id}/editor`);
              } else if (agencies.length > 0) {
                navigate(`/workspaces/create?agencyId=${agencies[0].id}`);
              } else {
                navigate("/agency/create");
              }
            }}
            className="bg-brand-orange hover:bg-brand-orange/90 cursor-pointer gap-1.5 text-xs font-medium text-white"
          >
            <Plus className="size-3.5" />
            {t("dashboard.page.createContent")}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Real Summary Metrics Bar */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Total Agencies */}
          <div
            onClick={() => navigate("/agency")}
            className="border-border bg-card hover:border-border hover:bg-muted/30 group cursor-pointer rounded-xl border p-4.5 transition-all shadow-xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs font-medium">
                {t("dashboard.global.totalAgencies")}
              </span>
              <div className="bg-muted text-foreground group-hover:bg-brand-orange/10 group-hover:text-brand-orange rounded-lg p-2 transition-colors">
                <Building2 className="size-4.5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-foreground text-2xl font-bold tracking-tight">
                {agencies.length}
              </span>
              <span className="text-muted-foreground group-hover:text-foreground text-3xs flex items-center gap-1 font-medium transition-colors">
                {t("dashboard.global.goToAgencies")} <ArrowRight className="size-3" />
              </span>
            </div>
          </div>

          {/* Card 2: Total Workspaces */}
          <div
            onClick={() => navigate("/workspace")}
            className="border-border bg-card hover:border-border hover:bg-muted/30 group cursor-pointer rounded-xl border p-4.5 transition-all shadow-xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs font-medium">
                {t("dashboard.global.totalWorkspaces")}
              </span>
              <div className="bg-muted text-foreground group-hover:bg-brand-orange/10 group-hover:text-brand-orange rounded-lg p-2 transition-colors">
                <FolderOpen className="size-4.5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-foreground text-2xl font-bold tracking-tight">
                {workspaces.length}
              </span>
              <span className="text-muted-foreground group-hover:text-foreground text-3xs flex items-center gap-1 font-medium transition-colors">
                {t("dashboard.global.goToWorkspaces")} <ArrowRight className="size-3" />
              </span>
            </div>
          </div>

          {/* Card 3: Pending Invitations */}
          <div
            onClick={() => navigate("/agency/invitations")}
            className="border-border bg-card hover:border-border hover:bg-muted/30 group cursor-pointer rounded-xl border p-4.5 transition-all shadow-xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs font-medium">
                {t("dashboard.global.totalPendingInvites")}
              </span>
              <div className="bg-muted text-foreground group-hover:bg-brand-orange/10 group-hover:text-brand-orange rounded-lg p-2 transition-colors">
                <Mail className="size-4.5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-foreground text-2xl font-bold tracking-tight">
                {totalInvites}
              </span>
              <span className="text-muted-foreground group-hover:text-foreground text-3xs flex items-center gap-1 font-medium transition-colors">
                {pendingAgencyInvites} Agency · {pendingWsInvites} WS
              </span>
            </div>
          </div>

          {/* Card 4: Quick Action Hub */}
          <div className="border-border bg-card rounded-xl border p-4.5 shadow-xs">
            <span className="text-muted-foreground text-xs font-medium">
              {t("dashboard.global.quickNavigation")}
            </span>
            <div className="mt-2.5 flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/agency/create")}
                className="hover:border-brand-orange hover:text-brand-orange h-7 text-3xs cursor-pointer gap-1 px-2.5"
              >
                <Plus className="size-3" /> {t("dashboard.global.createAgency")}
              </Button>
              {agencies.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    navigate(`/workspaces/create?agencyId=${agencies[0].id}`)
                  }
                  className="hover:border-brand-orange hover:text-brand-orange h-7 text-3xs cursor-pointer gap-1 px-2.5"
                >
                  <Plus className="size-3" />{" "}
                  {t("dashboard.global.createWorkspace")}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Greeting & Priority Tasks */}
        <QuickTasksCard
          userName={user?.name || ""}
          userRole={memberRole ?? t("dashboard.global.roleMember")}
        />

        {/* Real Entities Quick-Cards: Agencies & Workspaces */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Agencies */}
          <div className="border-border bg-card space-y-3.5 rounded-xl border p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="text-brand-orange size-4" />
                <h3 className="text-foreground text-sm font-bold">
                  {t("dashboard.global.recentAgencies")}
                </h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/agency")}
                className="text-brand-orange hover:bg-brand-orange/10 h-7 text-xs font-medium cursor-pointer"
              >
                {t("dashboard.global.viewAll")} ({agencies.length})
              </Button>
            </div>

            {agencies.length === 0 ? (
              <div className="border-border/60 flex flex-col items-center justify-center rounded-lg border border-dashed py-8 text-center">
                <p className="text-muted-foreground text-xs">
                  {t("dashboard.global.emptyAgencies")}
                </p>
                <Button
                  variant="orange"
                  size="sm"
                  onClick={() => navigate("/agency/create")}
                  className="mt-3 h-8 text-xs cursor-pointer"
                >
                  <Plus className="mr-1.5 size-3.5" />
                  {t("dashboard.global.createAgency")}
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {agencies.slice(0, 4).map((agency) => {
                  const wsCount = workspaces.filter(
                    (w) => w.agencyId === agency.id,
                  ).length;
                  return (
                    <div
                      key={agency.id}
                      onClick={() => handleEnterAgency(agency.id)}
                      className="border-border/70 hover:border-brand-orange/40 hover:bg-muted/40 flex cursor-pointer items-center justify-between gap-3 rounded-lg border p-3 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {agency.logoUrl ? (
                          <img
                            src={agency.logoUrl}
                            alt={agency.name}
                            className="size-8 shrink-0 rounded-md object-cover border border-border"
                          />
                        ) : (
                          <div
                            className="flex size-8 shrink-0 items-center justify-center rounded-md text-xs font-bold"
                            style={{
                              background: agency.brandColor
                                ? `${agency.brandColor}20`
                                : "hsl(var(--brand-orange-soft))",
                              color:
                                agency.brandColor ?? "hsl(var(--brand-orange))",
                            }}
                          >
                            {agency.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-foreground truncate text-xs font-semibold">
                            {agency.name}
                          </p>
                          <div className="text-muted-foreground flex items-center gap-2 text-3xs mt-0.5">
                            {agency.category && (
                              <span>
                                {t(`agency.category.${agency.category}`)}
                              </span>
                            )}
                            <span>·</span>
                            <span>{wsCount} workspace</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {agency.ownerId === user?.id && (
                          <span className="text-brand-orange bg-brand-orange-soft text-3xs rounded px-1.5 py-0.5 font-semibold">
                            {t("dashboard.global.roleOwner")}
                          </span>
                        )}
                        <ArrowRight className="text-muted-foreground size-3.5" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Workspaces */}
          <div className="border-border bg-card space-y-3.5 rounded-xl border p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderOpen className="text-brand-orange size-4" />
                <h3 className="text-foreground text-sm font-bold">
                  {t("dashboard.global.recentWorkspaces")}
                </h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/workspace")}
                className="text-brand-orange hover:bg-brand-orange/10 h-7 text-xs font-medium cursor-pointer"
              >
                {t("dashboard.global.viewAll")} ({workspaces.length})
              </Button>
            </div>

            {workspaces.length === 0 ? (
              <div className="border-border/60 flex flex-col items-center justify-center rounded-lg border border-dashed py-8 text-center">
                <p className="text-muted-foreground text-xs">
                  {t("dashboard.global.emptyWorkspaces")}
                </p>
                {agencies.length > 0 && (
                  <Button
                    variant="orange"
                    size="sm"
                    onClick={() =>
                      navigate(`/workspaces/create?agencyId=${agencies[0].id}`)
                    }
                    className="mt-3 h-8 text-xs cursor-pointer"
                  >
                    <Plus className="mr-1.5 size-3.5" />
                    {t("dashboard.global.createWorkspace")}
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {workspaces.slice(0, 4).map((ws) => {
                  const parentAgency = agencies.find(
                    (a) => a.id === ws.agencyId,
                  );
                  return (
                    <div
                      key={ws.id}
                      onClick={() => handleEnterWorkspace(ws)}
                      className="border-border/70 hover:border-brand-orange/40 hover:bg-muted/40 flex cursor-pointer items-center justify-between gap-3 rounded-lg border p-3 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {ws.logoUrl ? (
                          <img
                            src={ws.logoUrl}
                            alt={ws.name}
                            className="size-8 shrink-0 rounded-md object-cover border border-border"
                          />
                        ) : (
                          <div className="bg-brand-orange/10 text-brand-orange flex size-8 shrink-0 items-center justify-center rounded-md text-xs font-bold">
                            {ws.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-foreground truncate text-xs font-semibold">
                            {ws.name}
                          </p>
                          <p className="text-muted-foreground truncate text-3xs mt-0.5">
                            {parentAgency?.name ??
                              t("workspace.list.unassignedAgency", "Chưa gán công ty")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {ws.myRole && (
                          <span className="text-muted-foreground bg-muted text-3xs rounded px-1.5 py-0.5 font-medium">
                            {t(`workspace.roles.${ws.myRole}`)}
                          </span>
                        )}
                        <ArrowRight className="text-muted-foreground size-3.5" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Global Analytics & Trends Section - Diversified Professional Charts */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="bg-muted text-muted-foreground text-2xs inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-medium">
                <Sparkles className="size-3" />
                {t("dashboard.global.campaignTrend")}
              </span>
            </div>
            <span className="text-muted-foreground text-3xs">
              {t("dashboard.charts.lastUpdated", "Cập nhật tự động thời gian thực")}
            </span>
          </div>

          {/* Row 1: Interactive Growth Area Chart + Content Status Donut Chart */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <AudienceGrowthAreaChart />
            </div>
            <div>
              <ContentStatusDonutChart />
            </div>
          </div>

          {/* Row 2: Peak Hours Stacked Bar Chart + Goals Progress Card */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <PeakHoursBarChart />
            <GoalsProgressChart />
          </div>
        </div>

        {/* Channel Performance Chart */}
        {analyticsSummary?.channelStats && (
          <ChannelPerformanceChart
            channelStats={analyticsSummary.channelStats}
          />
        )}

        {/* KPI Summary Cards */}
        <KpiCardsSection
          data={analytics}
          isLoading={isAnalyticsLoading}
          isError={isAnalyticsError}
          onRetry={fetchAnalytics}
        />

        {/* Activity Feed & Team Stats */}
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
              userRole={memberRole ?? "MANAGER"}
              isLoading={isAnalyticsLoading}
            />
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

export default DashboardPage;
