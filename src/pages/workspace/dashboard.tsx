import { useTranslation } from "react-i18next";
import PageWrapper from "@/components/layout/PageWrapper";
import { PostDashboardView } from "@/pages/publish/dashboard";
import { SocialQuickSnapshot } from "./components/SocialQuickSnapshot";
import { LeaveWorkspaceDialog } from "./components/LeaveWorkspaceDialog";
import { useWorkspaceDashboard } from "./hooks/useWorkspaceDashboard";
import { WorkspaceDashboardHeader } from "./components/dashboard/WorkspaceDashboardHeader";
import { DashboardTabSwitcher } from "./components/dashboard/DashboardTabSwitcher";
import { PackageStatusBanner } from "./components/dashboard/PackageStatusBanner";
import { WorkspaceKpiCards } from "./components/dashboard/WorkspaceKpiCards";
import { WorkspaceTasksSection } from "./components/dashboard/WorkspaceTasksSection";
import { WorkspaceQuickActions } from "./components/dashboard/WorkspaceQuickActions";
import { WorkspaceVisualAnalytics } from "./components/dashboard/WorkspaceVisualAnalytics";

export function WorkspaceDashboardPage() {
  const { t } = useTranslation();
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
      title={workspace.name || t("workspace.dashboard.title", "Workspace Dashboard")}
      hideBanner
    >
      {/* ── Top Workspace Header ── */}
      <WorkspaceDashboardHeader
        workspace={workspace}
        workspaceId={workspaceId}
        currentMemberRole={currentMemberRole}
        isPackageApproved={isPackageApproved}
        isPackageNegotiating={isPackageNegotiating}
        packageStatus={packageStatus ?? undefined}
        isManagerOrOwner={isManagerOrOwner}
        onOpenLeaveDialog={() => setLeaveOpen(true)}
      />

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
              onRetryCampaigns={() => setCampaignsAttempt((attempt) => attempt + 1)}
            />

            <WorkspaceQuickActions
              workspaceId={workspaceId}
              isManagerOrOwner={isManagerOrOwner}
              isClient={isClient}
              membersByRole={dashboard.membersByRole}
            />
          </div>

          {/* ── Visual Analytics Section ── */}
          <WorkspaceVisualAnalytics />
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
