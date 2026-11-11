import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Building2,
  Users,
  FolderKanban,
  LogOut,
  BadgeCheck,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PageWrapper from "@/components/layout/PageWrapper";
import { PostDashboardView } from "@/pages/publish/dashboard";
import { SocialQuickSnapshot } from "./components/SocialQuickSnapshot";
import { LeaveWorkspaceDialog } from "./components/LeaveWorkspaceDialog";
import { useWorkspaceDashboard } from "./hooks/useWorkspaceDashboard";
import { DashboardTabSwitcher } from "./components/dashboard/DashboardTabSwitcher";
import { PackageStatusBanner } from "./components/dashboard/PackageStatusBanner";
import { WorkspaceKpiCards } from "./components/dashboard/WorkspaceKpiCards";
import { WorkspaceTasksSection } from "./components/dashboard/WorkspaceTasksSection";
import { WorkspaceQuickActions } from "./components/dashboard/WorkspaceQuickActions";
import { WorkspaceVisualAnalytics } from "./components/dashboard/WorkspaceVisualAnalytics";
import { useClearStoragePreview } from "./hooks/useClearStoragePreview";

export function WorkspaceDashboardPage() {
  useClearStoragePreview();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    workspaceId,
    activeTab,
    handleTabChange,
    dashboard,
    loading,

    tasks,
    tasksTotal,
    tasksLoading,
    taskStats,
    campaigns,
    campaignsLoading,
    campaignsError,
    setCampaignsAttempt,
    leaveOpen,
    setLeaveOpen,
    leaving,
    handleLeave,
    currentMemberRole,
    isClient,
    isManagerOrOwner,
    packageStatus,
    isPackageApproved,
    isPackageNegotiating,
  } = useWorkspaceDashboard();

  if (loading || !dashboard) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="border-brand-orange size-8 animate-spin rounded-full border-2 border-t-transparent" />
      </div>
    );
  }

  const workspace = dashboard.workspace;

  return (
    <PageWrapper
      title={
        workspace.name || t("workspace.dashboard.title", "Workspace Dashboard")
      }
      showWorkspaceBadge={false}
      avatar={
        <div
          className="flex size-14 shrink-0 items-center justify-center rounded-2xl text-xl font-bold shadow-xs select-none sm:size-16 sm:text-2xl"
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
      }
      badges={
        <>
          {currentMemberRole && (
            <Badge
              variant="outline"
              className="border-brand-orange/30 bg-brand-orange-soft/50 text-brand-orange text-2xs font-semibold"
            >
              {t("workspace.dashboard.roleInWorkspace")}:{" "}
              {t(`workspace.roles.${currentMemberRole}`, currentMemberRole ?? "")}
            </Badge>
          )}
          {isPackageApproved ? (
            <Badge className="text-2xs border-emerald-500/30 bg-emerald-500/15 text-emerald-600">
              <BadgeCheck className="mr-1 size-3" />
              {t("workspace.dashboard.packageApprovedTitle")}
            </Badge>
          ) : isPackageNegotiating ? (
            <Badge className="text-2xs border-amber-500/30 bg-amber-500/15 text-amber-600">
              <Clock className="mr-1 size-3" />
              {t(`mediaPackage.status.${packageStatus}`, packageStatus ?? "")}
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-2xs">
              {t("workspace.dashboard.noPackage")}
            </Badge>
          )}
        </>
      }
      description={
        workspace.tagline || workspace.industry || workspace.companySize ? (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
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
                {t(`agency.companySize.${workspace.companySize}`, workspace.companySize)}
              </span>
            )}
          </div>
        ) : (
          workspace.description ||
          t(
            "workspace.dashboard.description",
            "Tổng quan chiến dịch, tác vụ và phân tích không gian làm việc.",
          )
        )
      }
      actions={
        <>
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
      }
    >

      {/* ── Dashboard Segmented Tabs ── */}
      <DashboardTabSwitcher
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {activeTab === "publishing" ? (
        <PostDashboardView workspaceId={workspaceId} />
      ) : (
        <>
          {/* ── Package Status Banner (When not approved yet) ── */}
          <PackageStatusBanner
            workspaceId={workspaceId}
            isPackageApproved={isPackageApproved}
            isPackageNegotiating={isPackageNegotiating}
            isClient={isClient}
          />

          {/* ── Key Metrics KPI Cards ── */}
          <WorkspaceKpiCards
            workspaceId={workspaceId}
            tasksTotal={tasksTotal}
            tasksLength={tasks.length}
            taskStats={taskStats}
            campaigns={campaigns}
            campaignsLoading={campaignsLoading}
            campaignsError={campaignsError}
            dashboard={dashboard}
            packageStatus={packageStatus ?? undefined}
            isClient={isClient}
          />

          {/* ── Social Media Quick Snapshot Bridge ── */}
          <div className="mt-6">
            <SocialQuickSnapshot
              workspaceId={workspaceId}
              onNavigateToPublishing={() => handleTabChange("publishing")}
            />
          </div>

          {/* ── Main Workspace Content: Tasks & Campaigns ── */}
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <WorkspaceTasksSection
              workspaceId={workspaceId}
              tasks={tasks}
              tasksTotal={tasksTotal}
              tasksLoading={tasksLoading}
              campaigns={campaigns}
              campaignsLoading={campaignsLoading}
              campaignsError={campaignsError}
              isManagerOrOwner={isManagerOrOwner}
              onRetryCampaigns={() =>
                setCampaignsAttempt((attempt) => attempt + 1)
              }
            />

            <WorkspaceQuickActions
              workspaceId={workspaceId}
              isManagerOrOwner={isManagerOrOwner}
              isClient={isClient}
              membersByRole={dashboard.membersByRole}
            />
          </div>

          {/* ── Visual Analytics Section ── */}
          <WorkspaceVisualAnalytics workspaceId={workspaceId} />
        </>
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
