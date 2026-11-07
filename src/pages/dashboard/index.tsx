import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import {
  RefreshCw,
  Plus,
  Building2,
  FolderOpen,
  ArrowRight,
  Sparkles,
  FileBarChart,
} from "lucide-react";
import { KpiCardsSection } from "@/pages/dashboard/components/KpiCardsSection";
import {
  ActivityFeedSection,
  type UnifiedTimelineEvent,
} from "@/pages/dashboard/components/ActivityFeedSection";
import { TeamStatsSection } from "@/pages/dashboard/components/TeamStatsSection";
import { useDashboardData } from "./hooks/useDashboardData";
import { QuickTasksCard } from "./components/QuickTasksCard";
import { DashboardScopeFilter } from "./components/DashboardScopeFilter";
import { SmartPriorityRecommendation } from "./components/SmartPriorityRecommendation";
import { MyTasksSection } from "./components/MyTasksSection";
import { AgencyReportExportModal } from "./components/AgencyReportExportModal";
import { getTopPriorityRecommendations } from "./utils/smartPriorityAlgorithm";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useAgencyStore } from "@/store/agencyStore";
import { agencyService } from "@/services/agencyService";
import { workspaceService } from "@/services/workspaceService";
import { taskService } from "@/services/taskService";
import { ChannelPerformanceChart } from "@/pages/analytics/components/ChannelPerformanceChart";
import {
  AudienceGrowthAreaChart,
  ContentStatusDonutChart,
  PeakHoursBarChart,
} from "./components/DashboardAdvancedCharts";
import type { Agency } from "@/types/agency";
import type { Workspace } from "@/types/workspace";
import type { TaskListItem } from "@/types/task";

export function DashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    user,
    analytics,
    isAnalyticsLoading,
    isAnalyticsError,
    isRefreshing,
    loadAllData,
    fetchAnalytics,
  } = useDashboardData();

  const memberRole = useWorkspaceStore((s) => s.currentMemberRole);
  const currentWorkspace = useWorkspaceStore((s) => s.currentWorkspace);
  const setCurrentAgencyId = useAgencyStore((s) => s.setCurrentAgencyId);
  const setCurrentWorkspace = useWorkspaceStore((s) => s.setCurrentWorkspace);

  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loadingRealData, setLoadingRealData] = useState(true);

  // Scope filter state
  const [selectedAgencyIds, setSelectedAgencyIds] = useState<string[]>([]);
  const [selectedWorkspaceIds, setSelectedWorkspaceIds] = useState<string[]>([]);

  // Report export modal state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Aggregated tasks from selected workspaces
  const [aggregatedTasks, setAggregatedTasks] = useState<TaskListItem[]>([]);
  const [isTasksLoading, setIsTasksLoading] = useState(false);

  // Workspaces filtered by user selection
  const filteredWorkspaces = useMemo(() => {
    if (selectedWorkspaceIds.length > 0) {
      return workspaces.filter((ws) => selectedWorkspaceIds.includes(ws.id));
    }
    if (selectedAgencyIds.length > 0) {
      return workspaces.filter(
        (ws) => ws.agencyId && selectedAgencyIds.includes(ws.agencyId),
      );
    }
    return workspaces;
  }, [workspaces, selectedAgencyIds, selectedWorkspaceIds]);

  // Map workspace id -> name for fast lookup
  const workspaceNamesMap = useMemo(() => {
    const map: Record<string, string> = {};
    workspaces.forEach((w) => {
      map[w.id] = w.name;
    });
    return map;
  }, [workspaces]);

  // ROUTE_ACCESS chặn Owner khỏi Editor, nút tạo nội dung phải trỏ tới workspace vào được.
  const writableWorkspace =
    filteredWorkspaces.find((w) => w.myRole !== "OWNER") ||
    workspaces.find((w) => w.myRole !== "OWNER");

  // Fetch basic agencies and workspaces
  const loadRealOverview = async () => {
    setLoadingRealData(true);
    try {
      const [agenciesRes, workspacesRes] = await Promise.allSettled([
        agencyService.list(),
        workspaceService.list(),
      ]);

      if (agenciesRes.status === "fulfilled") {
        setAgencies(agenciesRes.value.data.data ?? []);
      }
      if (workspacesRes.status === "fulfilled") {
        setWorkspaces(workspacesRes.value.data.data ?? []);
      }
    } finally {
      setLoadingRealData(false);
    }
  };

  useEffect(() => {
    loadRealOverview();
  }, []);

  // Fetch tasks for the currently filtered workspaces
  const loadTasksForWorkspaces = useCallback(
    async (targetWorkspaces: Workspace[]) => {
      if (targetWorkspaces.length === 0) {
        setAggregatedTasks([]);
        return;
      }
      setIsTasksLoading(true);
      try {
        const results = await Promise.allSettled(
          targetWorkspaces.map((ws) =>
            taskService.getWorkspaceTasks(ws.id, { size: 50 }),
          ),
        );
        const tasks: TaskListItem[] = [];
        results.forEach((res) => {
          if (res.status === "fulfilled" && Array.isArray(res.value?.content)) {
            tasks.push(...res.value.content);
          }
        });
        setAggregatedTasks(tasks);
      } catch (error) {
        console.error("Failed to load workspace tasks:", error);
      } finally {
        setIsTasksLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadTasksForWorkspaces(filteredWorkspaces);
  }, [filteredWorkspaces, loadTasksForWorkspaces]);

  const handleRefresh = async () => {
    await Promise.all([
      loadAllData(),
      loadRealOverview(),
      loadTasksForWorkspaces(filteredWorkspaces),
    ]);
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

  const handleNavigateTask = (task: TaskListItem, action?: string) => {
    const targetWs = workspaces.find((w) => w.id === task.workspaceId);
    if (targetWs) {
      setCurrentWorkspace(targetWs);
      if (targetWs.agencyId) {
        setCurrentAgencyId(targetWs.agencyId);
      }
    }

    if (action === "edit") {
      navigate(`/workspaces/${task.workspaceId}/editor`);
    } else {
      // Mở trực tiếp Task Detail thông qua query param ?task=
      navigate(`/workspaces/${task.workspaceId}/tasks?task=${encodeURIComponent(task.id)}`);
    }
  };

  // Top 5 priority recommendations computed via SPS algorithm
  const topPriorityRecommendations = useMemo(() => {
    return getTopPriorityRecommendations(aggregatedTasks, user?.id, 5);
  }, [aggregatedTasks, user?.id]);

  // Unified activity timeline from tasks and analytics activities
  const unifiedActivityEvents = useMemo<UnifiedTimelineEvent[]>(() => {
    const events: UnifiedTimelineEvent[] = [];

    // 1. Task events from aggregated tasks
    aggregatedTasks.forEach((task) => {
      const wsName = workspaceNamesMap[task.workspaceId] || "";

      if (task.createdAt) {
        events.push({
          id: `task-created-${task.id}`,
          actorName: task.reporterName || null,
          actorAvatar: task.reporterAvatar || null,
          actionText: t(
            "dashboard.activityFeed.actions.TASK_CREATED",
            "đã tạo công việc",
          ),
          targetTitle: task.name,
          targetKey: task.key,
          workspaceName: wsName,
          timestamp: task.createdAt,
          category: "TASK",
          type: "TASK_CREATED",
        });
      }

      if (task.status === "IN_REVIEW" && task.updatedAt) {
        events.push({
          id: `task-review-${task.id}`,
          actorName: task.assigneeName || task.reporterName || null,
          actorAvatar: task.assigneeAvatar || task.reporterAvatar || null,
          actionText: t(
            "dashboard.activityFeed.actions.TASK_SUBMITTED",
            "đã nộp bài chờ phê duyệt",
          ),
          targetTitle: task.name,
          targetKey: task.key,
          workspaceName: wsName,
          timestamp: task.updatedAt,
          category: "REVIEW",
          type: "TASK_SUBMITTED",
        });
      } else if (task.status === "FINISHED" && task.updatedAt) {
        events.push({
          id: `task-finished-${task.id}`,
          actorName: task.reporterName || task.assigneeName || null,
          actorAvatar: task.reporterAvatar || task.assigneeAvatar || null,
          actionText: t(
            "dashboard.activityFeed.actions.TASK_APPROVED",
            "đã hoàn thành công việc",
          ),
          targetTitle: task.name,
          targetKey: task.key,
          workspaceName: wsName,
          timestamp: task.updatedAt,
          category: "REVIEW",
          type: "TASK_APPROVED",
        });
      }
    });

    // 2. Publication events from analytics
    (analytics?.activities ?? []).forEach((act) => {
      events.push({
        id: act.id,
        actorName: act.actorName,
        actorAvatar: act.actorAvatar,
        actionText:
          act.type === "POST_PUBLISHED"
            ? t(
                "dashboard.activityFeed.actions.POST_PUBLISHED",
                "đã xuất bản bài viết thành công",
              )
            : t(
                "dashboard.activityFeed.actions.POST_FAILED",
                "xuất bản bài viết thất bại",
              ),
        targetTitle: act.targetTitle,
        timestamp: act.timestamp,
        category: "PUBLISH",
        type: act.type,
      });
    });

    // Sort descending by timestamp
    events.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    return events;
  }, [aggregatedTasks, analytics?.activities, workspaceNamesMap, t]);

  return (
    <PageWrapper
      title={t("dashboard.page.title")}
      description={t("dashboard.page.description")}
      guideUrl="/help/guide#architecture"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer gap-1.5 text-xs"
            onClick={handleRefresh}
            disabled={isRefreshing || loadingRealData || isTasksLoading}
          >
            <RefreshCw
              className={`size-3.5 ${
                isRefreshing || loadingRealData || isTasksLoading
                  ? "text-brand-orange animate-spin"
                  : ""
              }`}
            />
            {t("dashboard.page.refresh")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsReportModalOpen(true)}
            className="hover:border-brand-orange/60 hover:text-brand-orange active:scale-95 cursor-pointer gap-1.5 text-xs transition-all"
          >
            <FileBarChart className="size-3.5" />
            {t("dashboard.page.exportReport", "Tải báo cáo")}
          </Button>
          {memberRole !== "OWNER" &&
            (currentWorkspace || !workspaces.length || writableWorkspace) && (
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  if (currentWorkspace) {
                    navigate(`/workspaces/${currentWorkspace.id}/editor`);
                  } else if (writableWorkspace) {
                    navigate(`/workspaces/${writableWorkspace.id}/editor`);
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
            )}
        </div>
      }
    >
      <div className="space-y-4">
        {/* Greeting Card */}
        <QuickTasksCard
          userName={user?.name || ""}
          userRole={memberRole ?? t("dashboard.global.roleMember")}
        />

        {/* 1. Multi-Select Scope Selector */}
        <DashboardScopeFilter
          agencies={agencies}
          workspaces={workspaces}
          selectedAgencyIds={selectedAgencyIds}
          selectedWorkspaceIds={selectedWorkspaceIds}
          onAgencyChange={setSelectedAgencyIds}
          onWorkspaceChange={setSelectedWorkspaceIds}
          onReset={() => {
            setSelectedAgencyIds([]);
            setSelectedWorkspaceIds([]);
          }}
        />

        {/* 2. Side-by-Side Tasks Grid: Smart Priority Recommendations (Left) & My Tasks (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          <div className="lg:col-span-5 flex flex-col">
            <SmartPriorityRecommendation
              recommendations={topPriorityRecommendations}
              workspaces={filteredWorkspaces}
              onNavigateTask={handleNavigateTask}
              isLoading={isTasksLoading}
              className="h-full"
            />
          </div>
          <div className="lg:col-span-7 flex flex-col">
            <MyTasksSection
              tasks={aggregatedTasks}
              currentUserId={user?.id}
              workspaceNames={workspaceNamesMap}
              onNavigateTask={handleNavigateTask}
              loading={isTasksLoading}
              className="h-full"
            />
          </div>
        </div>

        {/* 4. Global Analytics & Trends Section - Diversified Professional Charts */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="bg-muted text-muted-foreground text-2xs inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-medium">
                <Sparkles className="size-3" />
                {t("dashboard.global.campaignTrend")}
              </span>
            </div>
            <span className="text-muted-foreground text-3xs">
              {t(
                "dashboard.charts.lastUpdated",
                "Cập nhật tự động thời gian thực",
              )}
            </span>
          </div>

          {/* Row 1: Interactive Growth Area Chart + Content Status Donut Chart */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <AudienceGrowthAreaChart
                trend={analytics?.dailyTrend ?? []}
                reachGrowth={analytics?.reachGrowth ?? null}
                engagementGrowth={analytics?.engagementGrowth ?? null}
              />
            </div>
            <div>
              <ContentStatusDonutChart data={analytics?.statusCounts ?? {}} />
            </div>
          </div>

          {/* Row 2: Peak Hours Stacked Bar Chart */}
          <PeakHoursBarChart hours={analytics?.publishHours ?? []} />
        </div>

        {/* Channel Performance Chart */}
        {analytics?.channelStats && (
          <ChannelPerformanceChart channelStats={analytics.channelStats} />
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
              events={unifiedActivityEvents}
              isLoading={isAnalyticsLoading || isTasksLoading}
              isError={isAnalyticsError}
              onRetry={fetchAnalytics}
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

        {/* Recent Entities Quick-Cards: Agencies & Workspaces */}
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
                className="text-brand-orange hover:bg-brand-orange/10 h-7 cursor-pointer text-xs font-medium"
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
                  className="mt-3 h-8 cursor-pointer text-xs"
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
                      <div className="flex min-w-0 items-center gap-3">
                        {agency.logoUrl ? (
                          <img
                            src={agency.logoUrl}
                            alt={agency.name}
                            className="border-border size-8 shrink-0 rounded-md border object-cover"
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
                          <div className="text-muted-foreground text-3xs mt-0.5 flex items-center gap-2">
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

                      <div className="flex shrink-0 items-center gap-2">
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
                className="text-brand-orange hover:bg-brand-orange/10 h-7 cursor-pointer text-xs font-medium"
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
                    className="mt-3 h-8 cursor-pointer text-xs"
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
                      <div className="flex min-w-0 items-center gap-3">
                        {ws.logoUrl ? (
                          <img
                            src={ws.logoUrl}
                            alt={ws.name}
                            className="border-border size-8 shrink-0 rounded-md border object-cover"
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
                          <p className="text-muted-foreground text-3xs mt-0.5 truncate">
                            {parentAgency?.name ??
                              t(
                                "workspace.list.unassignedAgency",
                                "Chưa gán công ty",
                              )}
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
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
      </div>

      <AgencyReportExportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        agencies={agencies}
        defaultAgencyId={
          selectedAgencyIds[0] ||
          useAgencyStore.getState().currentAgencyId ||
          agencies[0]?.id
        }
      />
    </PageWrapper>
  );
}

export default DashboardPage;
