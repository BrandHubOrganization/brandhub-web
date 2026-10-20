import { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  CalendarClock,
  PackageOpen,
  Sparkles,
  FolderKanban,
  MessageCircleMore,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
  Users,
  Settings,
  FileEdit,
  Layers,
  Building2,
  Calendar,
  ChevronRight,
  BarChart3,
  BadgeCheck,
  LogOut,
} from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { workspaceService } from "@/services/workspaceService";
import { taskService } from "@/services/taskService";
import { campaignService } from "@/pages/campaign/services/campaignService";
import { requireApiData } from "@/lib/apiData";
import { WorkspaceCampaignSummary } from "@/pages/workspace/components/WorkspaceCampaignSummary";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { extractErrorMessage } from "@/utils/error";
import type { WorkspaceDashboard } from "@/types/workspace";
import type { TaskListItem } from "@/types/task";
import type { Campaign } from "@/pages/campaign/types";
import { STATUS_CONFIG } from "@/pages/tasks/constants";
import { canonicalTaskStatus } from "@/pages/tasks/taskStatus";
import { LineStatChart, PieStatChart } from "@/components/charts/StatCharts";
import { LeaveWorkspaceDialog } from "./components/LeaveWorkspaceDialog";
import {
  MOCK_CAMPAIGN_TREND,
  MOCK_CONTENT_BY_STATUS,
  MOCK_RECENT_ACTIVITY,
  MOCK_UPCOMING_CONTENT,
} from "./mockDashboardData";
import { getAnalyticsSummary } from "@/services/mock/mockAnalyticsService";
import type { AnalyticsSummary } from "@/types/analytics";
import { StatCards } from "@/pages/analytics/components/StatCards";
import { ChannelPerformanceChart } from "@/pages/analytics/components/ChannelPerformanceChart";

function StatCard({
  label,
  value,
  icon: Icon,
  sublabel,
  badgeText,
  badgeVariant = "secondary",
  colorClass = "text-brand-orange",
  bgIconClass = "bg-brand-orange-soft",
  onClick,
}: {
  label: string;
  value: string | number;
  icon?: React.ComponentType<{ className?: string }>;
  sublabel?: string;
  badgeText?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  colorClass?: string;
  bgIconClass?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`border-border bg-card rounded-2xl border p-5 shadow-xs transition-all hover:border-brand-orange/40 hover:shadow-sm ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
          {label}
        </span>
        {Icon && (
          <div className={`flex size-9 items-center justify-center rounded-xl ${bgIconClass} ${colorClass}`}>
            <Icon className="size-4.5" />
          </div>
        )}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
          {value}
        </span>
        {badgeText && (
          <Badge variant={badgeVariant} className="text-2xs font-semibold">
            {badgeText}
          </Badge>
        )}
      </div>
      {sublabel && (
        <p className="text-muted-foreground mt-1.5 text-xs truncate">
          {sublabel}
        </p>
      )}
    </div>
  );
}

export function WorkspaceDashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id: workspaceId } = useParams<{ id: string }>();
  const currentMemberRole = useWorkspaceStore((s) => s.currentMemberRole);
  const isClient = currentMemberRole === "CLIENT";
  const isManagerOrOwner =
    currentMemberRole === "MANAGER" || currentMemberRole === "OWNER";

  const [dashboard, setDashboard] = useState<WorkspaceDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const loadedWorkspaceIdRef = useRef<string | null>(null);

  // Real data for Tasks & Campaigns
  const [tasks, setTasks] = useState<TaskListItem[]>([]);
  const [tasksTotal, setTasksTotal] = useState<number>(0);
  const [tasksLoading, setTasksLoading] = useState(true);

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(true);
  const [campaignsError, setCampaignsError] = useState(false);
  const [campaignsAttempt, setCampaignsAttempt] = useState(0);

  // Leave Workspace Dialog State
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const handleLeave = async () => {
    if (!workspaceId) return;
    setLeaving(true);
    try {
      await workspaceService.leaveWorkspace(workspaceId);
      toast.success(t("workspace.members.leaveSuccess", "Bạn đã rời workspace thành công"));
      setLeaveOpen(false);
      useWorkspaceStore.getState().setCurrentWorkspace(null);
      await useWorkspaceStore.getState().fetchWorkspaces();
      navigate("/workspace", { replace: true });
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, t("common.actionFailed")));
    } finally {
      setLeaving(false);
    }
  };

  // Load Workspace Dashboard
  useEffect(() => {
    if (!workspaceId) return;
    if (loadedWorkspaceIdRef.current === workspaceId) return;
    loadedWorkspaceIdRef.current = workspaceId;
    setLoading(true);

    workspaceService
      .getDashboard(workspaceId)
      .then(({ data }) => setDashboard(data.data))
      .catch((err: unknown) =>
        toast.error(
          extractErrorMessage(err, t("workspace.dashboard.loadError")),
        ),
      )
      .finally(() => setLoading(false));
  }, [workspaceId, t]);

  // Load Tasks
  useEffect(() => {
    if (!workspaceId) return;
    setTasksLoading(true);
    taskService
      .getWorkspaceTasks(workspaceId, {
        size: 5,
        sort: "createdAt",
        direction: "desc",
      })
      .then((res) => {
        setTasks(res.content || []);
        setTasksTotal(res.totalElements || 0);
      })
      .catch((err) => {
        console.warn("Failed to load workspace tasks:", err);
      })
      .finally(() => setTasksLoading(false));
  }, [workspaceId]);

  // Load Campaigns
  useEffect(() => {
    if (!workspaceId) return;
    let disposed = false;
    setCampaignsLoading(true);
    setCampaignsError(false);
    setCampaigns([]);
    campaignService
      .list(workspaceId)
      .then((res) => {
        if (!disposed) setCampaigns(requireApiData<Campaign[]>(res.data));
      })
      .catch((err) => {
        console.warn("Failed to load workspace campaigns:", err);
        if (!disposed) setCampaignsError(true);
      })
      .finally(() => {
        if (!disposed) setCampaignsLoading(false);
      });
    return () => {
      disposed = true;
    };
  }, [workspaceId, campaignsAttempt]);

  // Load Analytics Mock
  useEffect(() => {
    getAnalyticsSummary().then(setAnalytics);
  }, []);

  // Compute Task Counts by status groups
  const taskStats = useMemo(() => {
    let todoCount = 0;
    let inProgressCount = 0;
    let reviewCount = 0;
    let completedCount = 0;

    tasks.forEach((item) => {
      const status = canonicalTaskStatus(item.status);
      if (status === "TODO") {
        todoCount++;
      } else if (status === "IN_PROGRESS") {
        inProgressCount++;
      } else if (status === "IN_REVIEW") {
        reviewCount++;
      } else if (status === "FINISHED") {
        completedCount++;
      }
    });

    return { todoCount, inProgressCount, reviewCount, completedCount };
  }, [tasks]);

  if (loading || !dashboard) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="border-brand-orange size-8 animate-spin rounded-full border-2 border-t-transparent" />
      </div>
    );
  }

  const workspace = dashboard.workspace;
  const packageStatus = dashboard.packageNegotiationStatus;
  const isPackageApproved = packageStatus === "APPROVED";
  const isPackageNegotiating =
    packageStatus === "DRAFT" || packageStatus === "NEGOTIATING";

  return (
    <PageWrapper title={workspace.name}>
      {/* ── Top Workspace Header ── */}
      <div className="border-border bg-card relative mb-6 overflow-hidden rounded-2xl border p-6 shadow-xs">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div
              className="flex size-14 shrink-0 items-center justify-center rounded-2xl text-xl font-bold shadow-xs select-none"
              style={{
                backgroundColor: workspace.brandColor
                  ? `${workspace.brandColor}20`
                  : "var(--brand-orange-soft)",
                color: workspace.brandColor || "var(--brand-orange)",
                border: `1.5px solid ${
                  workspace.brandColor
                    ? `${workspace.brandColor}40`
                    : "var(--brand-orange)"
                }`,
              }}
            >
              {workspace.logoUrl ? (
                <img
                  src={workspace.logoUrl}
                  alt={workspace.name}
                  className="size-full rounded-2xl object-cover"
                />
              ) : (
                <span>{workspace.name?.charAt(0)?.toUpperCase() || "W"}</span>
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-foreground text-xl font-bold sm:text-2xl">
                  {workspace.name}
                </h1>
                {currentMemberRole && (
                  <Badge
                    variant="outline"
                    className="border-brand-orange/30 bg-brand-orange-soft/50 text-brand-orange text-2xs font-semibold"
                  >
                    {t("workspace.dashboard.roleInWorkspace")}: {currentMemberRole}
                  </Badge>
                )}
                {isPackageApproved ? (
                  <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-2xs">
                    <BadgeCheck className="mr-1 size-3" />
                    {t("workspace.dashboard.packageApprovedTitle")}
                  </Badge>
                ) : isPackageNegotiating ? (
                  <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 text-2xs">
                    <Clock className="mr-1 size-3" />
                    {packageStatus}
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-2xs">
                    {t("workspace.dashboard.noPackage")}
                  </Badge>
                )}
              </div>

              <div className="text-muted-foreground mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                {workspace.tagline && (
                  <span className="italic">"{workspace.tagline}"</span>
                )}
                {workspace.industry && (
                  <span className="flex items-center gap-1">
                    <Building2 className="size-3.5" />
                    {t(`workspace.industry.${workspace.industry}`, {
                      defaultValue: workspace.industry,
                    })}
                  </span>
                )}
                {workspace.companySize && (
                  <span className="flex items-center gap-1">
                    <Users className="size-3.5" />
                    {workspace.companySize}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex flex-wrap items-center gap-2 sm:self-center">
            {workspaceId && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => navigate(`/workspaces/${workspaceId}/chat`)}
                >
                  <MessageCircleMore className="size-4" />
                  <span>{t("workspace.dashboard.chatWorkspace")}</span>
                </Button>
                {isManagerOrOwner && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => navigate(`/workspaces/${workspaceId}/settings`)}
                  >
                    <Settings className="size-4" />
                    <span className="hidden sm:inline">
                      {t("workspace.dashboard.workspaceSettings")}
                    </span>
                  </Button>
                )}
                <Button
                  variant="orange"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => navigate(`/workspaces/${workspaceId}/tasks`)}
                >
                  <FolderKanban className="size-4" />
                  <span>{t("workspace.dashboard.tasksOverview")}</span>
                </Button>

                {currentMemberRole && currentMemberRole !== "OWNER" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-900/50 dark:hover:bg-rose-950/40"
                    onClick={() => setLeaveOpen(true)}
                  >
                    <LogOut className="size-4" />
                    <span>{t("workspace.members.leaveButton", "Rời workspace")}</span>
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Package Status Banner (When not approved yet) ── */}
      {!isPackageApproved && (
        <section
          className={`mb-6 flex flex-col gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center sm:justify-between shadow-xs ${
            isPackageNegotiating
              ? "border-amber-500/30 bg-amber-500/10 dark:bg-amber-500/15"
              : "border-brand-orange/30 bg-brand-orange-soft/60"
          }`}
        >
          <div className="flex items-start gap-3.5">
            <div
              className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${
                isPackageNegotiating
                  ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                  : "bg-brand-orange/20 text-brand-orange"
              }`}
            >
              <PackageOpen className="size-5.5" />
            </div>
            <div>
              <h2 className="text-foreground font-semibold">
                {isPackageNegotiating
                  ? t("workspace.dashboard.packageNegotiatingTitle")
                  : t("workspace.dashboard.packageRequiredTitle")}
              </h2>
              <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                {isPackageNegotiating
                  ? t("workspace.dashboard.packageNegotiatingDescription")
                  : t(
                      isClient
                        ? "workspace.dashboard.packageRequiredClientDescription"
                        : "workspace.dashboard.packageRequiredAgencyDescription",
                    )}
              </p>
            </div>
          </div>
          {workspaceId && (
            <Button
              variant="orange"
              className="w-full shrink-0 sm:w-auto"
              onClick={() =>
                navigate(`/workspaces/${workspaceId}/media-package`)
              }
            >
              {isPackageNegotiating
                ? t("workspace.dashboard.viewPackage")
                : t("workspace.dashboard.selectPackage")}
              <ArrowRight className="ml-1.5 size-4" />
            </Button>
          )}
        </section>
      )}

      {/* ── Key Metrics KPI Cards ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Workspace Tasks */}
        <StatCard
          label={t("workspace.dashboard.tasksOverview")}
          value={tasksTotal || tasks.length}
          icon={FolderKanban}
          sublabel={
            tasksTotal > 0
              ? `${taskStats.inProgressCount} ${t("workspace.dashboard.tasksByStatus.inProgress")}, ${taskStats.reviewCount} ${t("workspace.dashboard.tasksByStatus.review")}`
              : t("workspace.dashboard.noTasks")
          }
          colorClass="text-blue-500"
          bgIconClass="bg-blue-500/10"
          onClick={() => workspaceId && navigate(`/workspaces/${workspaceId}/tasks`)}
        />

        {/* Card 2: Campaigns */}
        <StatCard
          label={t("workspace.dashboard.campaignsOverview")}
          value={
            campaignsLoading || campaignsError || campaigns.length > 1
              ? "—"
              : campaigns.length
          }
          icon={Layers}
          sublabel={
            !campaignsLoading && !campaignsError && campaigns.length === 1
              ? t(`campaign.status.${campaigns[0].status}`)
              : undefined
          }
          colorClass="text-brand-orange"
          bgIconClass="bg-brand-orange-soft"
          onClick={() =>
            workspaceId && navigate(`/workspaces/${workspaceId}/campaigns`)
          }
        />

        {/* Card 3: Active Members */}
        {!isClient && (
          <StatCard
            label={t("workspace.dashboard.activeMembers")}
            value={dashboard.totalActiveMembers}
            icon={Users}
            sublabel={
              dashboard.membersByRole
                ? Object.entries(dashboard.membersByRole)
                    .map(([role, count]) => `${count} ${role}`)
                    .join(", ")
                : undefined
            }
            colorClass="text-emerald-500"
            bgIconClass="bg-emerald-500/10"
            onClick={() =>
              workspaceId && navigate(`/workspaces/${workspaceId}/members`)
            }
          />
        )}

        {/* Card 4: Media Package / AI Credits */}
        {!isClient ? (
          <StatCard
            label={t("workspace.dashboard.agencyAiCredits", {
              month: dashboard.aiCreditMonth,
            })}
            value={dashboard.agencyAiCreditsUsedThisMonth}
            icon={Sparkles}
            sublabel={t("workspace.dashboard.packageStatus") + ": " + (packageStatus || t("workspace.dashboard.noPackage"))}
            colorClass="text-purple-500"
            bgIconClass="bg-purple-500/10"
          />
        ) : (
          <StatCard
            label={t("workspace.dashboard.packageStatus")}
            value={packageStatus || t("workspace.dashboard.noPackage")}
            icon={PackageOpen}
            colorClass="text-purple-500"
            bgIconClass="bg-purple-500/10"
            onClick={() =>
              workspaceId && navigate(`/workspaces/${workspaceId}/media-package`)
            }
          />
        )}
      </div>

      {/* ── Main Workspace Content: Tasks & Campaigns ── */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column (2 spans): Recent Tasks & Campaigns */}
        <div className="space-y-6 lg:col-span-2">
          {/* Recent Tasks Card */}
          <div className="border-border bg-card rounded-2xl border p-5 shadow-xs">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderKanban className="text-brand-orange size-5" />
                <h3 className="text-foreground font-semibold">
                  {t("workspace.dashboard.recentTasks")}
                </h3>
                <span className="border-border bg-muted text-muted-foreground rounded-full border px-2 py-0.5 text-xs font-medium">
                  {tasksTotal}
                </span>
              </div>
              {workspaceId && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-brand-orange hover:text-brand-orange/80 gap-1 text-xs"
                  onClick={() => navigate(`/workspaces/${workspaceId}/tasks`)}
                >
                  <span>{t("workspace.dashboard.viewAllTasks")}</span>
                  <ChevronRight className="size-3.5" />
                </Button>
              )}
            </div>

            {tasksLoading ? (
              <div className="flex h-32 items-center justify-center">
                <div className="border-brand-orange size-6 animate-spin rounded-full border-2 border-t-transparent" />
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-muted-foreground flex flex-col items-center justify-center py-8 text-center">
                <FolderKanban className="mb-2 size-8 opacity-40" />
                <p className="text-sm font-medium">
                  {t("workspace.dashboard.noTasks")}
                </p>
                {isManagerOrOwner && workspaceId && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 gap-1.5"
                    onClick={() => navigate(`/workspaces/${workspaceId}/tasks`)}
                  >
                    <Plus className="size-4" />
                    <span>{t("workspace.dashboard.createTask")}</span>
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2.5">
                {tasks.map((task) => {
                  const statusInfo =
                    STATUS_CONFIG[canonicalTaskStatus(task.status)];
                  return (
                    <div
                      key={task.id}
                      onClick={() =>
                        workspaceId &&
                        navigate(`/workspaces/${workspaceId}/tasks`)
                      }
                      className="border-border hover:border-brand-orange/40 hover:bg-muted/40 group flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-3 transition-colors"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="bg-brand-orange-soft text-brand-orange flex size-8 shrink-0 items-center justify-center rounded-lg">
                          <FileEdit className="size-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-foreground group-hover:text-brand-orange truncate text-sm font-medium transition-colors">
                            {task.name}
                          </p>
                          <div className="text-muted-foreground mt-0.5 flex items-center gap-2 text-2xs">
                            <span className="font-semibold uppercase tracking-wider">
                              {task.type}
                            </span>
                            {task.dueDate && (
                              <span className="flex items-center gap-1">
                                <Calendar className="size-3" />
                                {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                            )}
                            {task.assigneeName && (
                              <span>• {task.assigneeName}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-2xs font-semibold ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}
                        >
                          <span
                            className={`size-1.5 rounded-full ${statusInfo.dot}`}
                          />
                          {statusInfo.defaultLabel}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <WorkspaceCampaignSummary
            workspaceId={workspaceId}
            campaigns={campaigns}
            loading={campaignsLoading}
            failed={campaignsError}
            canPlan={isManagerOrOwner}
            onRetry={() => setCampaignsAttempt((attempt) => attempt + 1)}
          />
        </div>

        {/* Right Column (1 span): Quick Actions & Workspace Info */}
        <div className="space-y-6">
          {/* Quick Shortcuts */}
          <div className="border-border bg-card rounded-2xl border p-5 shadow-xs">
            <h3 className="text-foreground mb-4 font-semibold">
              {t("workspace.dashboard.quickActions")}
            </h3>
            <div className="grid grid-cols-1 gap-2.5">
              {workspaceId && (
                <>
                  <button
                    type="button"
                    onClick={() => navigate(`/workspaces/${workspaceId}/chat`)}
                    className="border-border hover:border-brand-orange/40 hover:bg-muted/40 flex items-center justify-between rounded-xl border p-3 text-left transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-500/10 text-blue-600 flex size-8 items-center justify-center rounded-lg">
                        <MessageCircleMore className="size-4" />
                      </div>
                      <div>
                        <p className="text-foreground text-sm font-medium">
                          {t("workspace.dashboard.chatWorkspace")}
                        </p>
                        <p className="text-muted-foreground text-2xs">
                          Trao đổi công việc nội bộ và Client
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="text-muted-foreground size-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate(`/workspaces/${workspaceId}/tasks`)}
                    className="border-border hover:border-brand-orange/40 hover:bg-muted/40 flex items-center justify-between rounded-xl border p-3 text-left transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-brand-orange-soft text-brand-orange flex size-8 items-center justify-center rounded-lg">
                        <FolderKanban className="size-4" />
                      </div>
                      <div>
                        <p className="text-foreground text-sm font-medium">
                          {t("workspace.dashboard.tasksOverview")}
                        </p>
                        <p className="text-muted-foreground text-2xs">
                          Quản lý tiến độ công việc và phân công
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="text-muted-foreground size-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/workspaces/${workspaceId}/media-package`)
                    }
                    className="border-border hover:border-brand-orange/40 hover:bg-muted/40 flex items-center justify-between rounded-xl border p-3 text-left transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-purple-500/10 text-purple-600 flex size-8 items-center justify-center rounded-lg">
                        <PackageOpen className="size-4" />
                      </div>
                      <div>
                        <p className="text-foreground text-sm font-medium">
                          {t("nav.mediaPackages")}
                        </p>
                        <p className="text-muted-foreground text-2xs">
                          Điều khoản gói và phê duyệt hai bên
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="text-muted-foreground size-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/workspaces/${workspaceId}/content-writing`)
                    }
                    className="border-border hover:border-brand-orange/40 hover:bg-muted/40 flex items-center justify-between rounded-xl border p-3 text-left transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-emerald-500/10 text-emerald-600 flex size-8 items-center justify-center rounded-lg">
                        <FileEdit className="size-4" />
                      </div>
                      <div>
                        <p className="text-foreground text-sm font-medium">
                          {t("workspace.dashboard.contentEditor")}
                        </p>
                        <p className="text-muted-foreground text-2xs">
                          Soạn thảo và cộng tác nội dung thời gian thực
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="text-muted-foreground size-4" />
                  </button>

                  {isManagerOrOwner && (
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/workspaces/${workspaceId}/settings`)
                      }
                      className="border-border hover:border-brand-orange/40 hover:bg-muted/40 flex items-center justify-between rounded-xl border p-3 text-left transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-500/10 text-slate-600 flex size-8 items-center justify-center rounded-lg">
                          <Settings className="size-4" />
                        </div>
                        <div>
                          <p className="text-foreground text-sm font-medium">
                            {t("workspace.dashboard.workspaceSettings")}
                          </p>
                          <p className="text-muted-foreground text-2xs">
                            Cấu hình nhận diện, múi giờ và thành viên
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="text-muted-foreground size-4" />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Members by Role Breakdown */}
          {!isClient && (
            <div className="border-border bg-card rounded-2xl border p-5 shadow-xs">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-foreground font-semibold">
                  {t("workspace.dashboard.membersByRole")}
                </h3>
                {workspaceId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-brand-orange h-auto p-0 text-xs hover:underline"
                    onClick={() =>
                      navigate(`/workspaces/${workspaceId}/members`)
                    }
                  >
                    Quản lý
                  </Button>
                )}
              </div>
              <ul className="space-y-2">
                {Object.entries(dashboard.membersByRole || {}).map(
                  ([role, count]) => (
                    <li
                      key={role}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-muted-foreground flex items-center gap-2">
                        <span className="bg-brand-orange size-1.5 rounded-full" />
                        {role}
                      </span>
                      <span className="text-foreground font-semibold">
                        {count}
                      </span>
                    </li>
                  ),
                )}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* ── Visual Analytics Section ── */}
      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="text-brand-orange size-5" />
            <h3 className="text-foreground text-lg font-bold">
              {t("nav.analytics")} &amp; {t("workspace.dashboard.campaignTrend")}
            </h3>
          </div>
          <span className="bg-brand-orange-soft text-brand-orange text-2xs inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-semibold">
            <Sparkles className="size-3" />
            {t("workspace.dashboard.mockBadge")}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <LineStatChart
            title={t("workspace.dashboard.campaignTrend")}
            data={MOCK_CAMPAIGN_TREND}
          />
          <PieStatChart
            title={t("workspace.dashboard.contentByStatus")}
            data={MOCK_CONTENT_BY_STATUS}
          />
        </div>
      </div>

      {/* ── Content Schedule & Recent Activity ── */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="border-border bg-card rounded-2xl border p-5 shadow-xs">
          <p className="text-foreground mb-3 text-sm font-semibold">
            {t("workspace.dashboard.upcomingContent")}
          </p>
          {MOCK_UPCOMING_CONTENT.length === 0 ? (
            <p className="text-muted-foreground text-xs">
              {t("workspace.dashboard.upcomingContentEmpty")}
            </p>
          ) : (
            <ul className="space-y-3">
              {MOCK_UPCOMING_CONTENT.map((item) => (
                <li key={item.id} className="flex items-start gap-2.5 text-sm">
                  <CalendarClock className="text-brand-orange mt-0.5 size-4.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-foreground truncate font-medium">
                      {item.title}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {item.platform} ·{" "}
                      {new Date(item.scheduledAt).toLocaleDateString()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-border bg-card rounded-2xl border p-5 shadow-xs">
          <p className="text-foreground mb-3 text-sm font-semibold">
            {t("workspace.dashboard.recentActivity")}
          </p>
          {MOCK_RECENT_ACTIVITY.length === 0 ? (
            <p className="text-muted-foreground text-xs">
              {t("workspace.dashboard.recentActivityEmpty")}
            </p>
          ) : (
            <ul className="space-y-3">
              {MOCK_RECENT_ACTIVITY.map((item) => (
                <li key={item.id} className="flex items-start gap-2.5 text-sm">
                  <CheckCircle2 className="text-emerald-500 mt-0.5 size-4.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-foreground">
                      <span className="font-semibold">{item.actor}</span>{" "}
                      {item.action}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {new Date(item.at).toLocaleString()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {analytics && (
        <div className="mt-6">
          <StatCards cards={analytics.cards} />
          <div className="mt-4">
            <ChannelPerformanceChart channelStats={analytics.channelStats} />
          </div>
        </div>
      )}

      {/* Leave Workspace Confirmation Dialog */}
      <LeaveWorkspaceDialog
        open={leaveOpen}
        onOpenChange={setLeaveOpen}
        submitting={leaving}
        onSubmit={handleLeave}
        isLastManager={Boolean(
          currentMemberRole === "MANAGER" &&
            dashboard.membersByRole &&
            (dashboard.membersByRole["MANAGER"] ?? 0) <= 1,
        )}
      />
    </PageWrapper>
  );
}

export default WorkspaceDashboardPage;
