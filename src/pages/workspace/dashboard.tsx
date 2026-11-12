import { useTranslation } from "react-i18next";
import PageWrapper from "@/components/layout/PageWrapper";
import { PostDashboardView } from "@/pages/publish/dashboard";
import { LeaveWorkspaceDialog } from "./components/LeaveWorkspaceDialog";
import { useWorkspaceDashboard } from "./hooks/useWorkspaceDashboard";
import { WorkspaceDashboardHeader } from "./components/dashboard/WorkspaceDashboardHeader";
import { DashboardTabSwitcher } from "./components/dashboard/DashboardTabSwitcher";
import { ClientWorkspaceDashboardView } from "./components/dashboard/ClientWorkspaceDashboardView";
import { CreatorWorkspaceDashboardView } from "./components/dashboard/CreatorWorkspaceDashboardView";
import { ManagerWorkspaceDashboardView } from "./components/dashboard/ManagerWorkspaceDashboardView";
import { OwnerWorkspaceDashboardView } from "./components/dashboard/OwnerWorkspaceDashboardView";
import { useClearStoragePreview } from "./hooks/useClearStoragePreview";

export function WorkspaceDashboardPage() {
  useClearStoragePreview();
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
      hideBanner
    >
      {/* ── Top Workspace Header (No redundant role badge) ── */}
      <WorkspaceDashboardHeader
        workspace={workspace}
        workspaceId={workspaceId}
        currentMemberRole={currentMemberRole}
        isPackageApproved={isPackageApproved}
        isPackageNegotiating={isPackageNegotiating}
        packageStatus={packageStatus ?? undefined}
        onOpenLeaveDialog={() => setLeaveOpen(true)}
      />

      {/* ── Dashboard Segmented Tabs ── */}
      <DashboardTabSwitcher
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* ── Tab Content: Publishing Deep Dive OR Role-Specific Views ── */}
      {activeTab === "publishing" ? (
        <PostDashboardView workspaceId={workspaceId} />
      ) : currentMemberRole === "CLIENT" ? (
        <ClientWorkspaceDashboardView
          workspaceId={workspaceId}
          workspace={workspace}
          dashboard={dashboard}
          packageStatus={packageStatus ?? undefined}
          isPackageApproved={isPackageApproved}
          onNavigateToPublishing={() => handleTabChange("publishing")}
        />
      ) : currentMemberRole === "CREATOR" ? (
        <CreatorWorkspaceDashboardView
          workspaceId={workspaceId}
          workspace={workspace}
          dashboard={dashboard}
          tasks={tasks}
          tasksTotal={tasksTotal}
          tasksLoading={tasksLoading}
        />
      ) : currentMemberRole === "OWNER" ? (
        <OwnerWorkspaceDashboardView
          workspaceId={workspaceId}
          workspace={workspace}
          dashboard={dashboard}
          packageStatus={packageStatus ?? undefined}
          isPackageApproved={isPackageApproved}
          isPackageNegotiating={isPackageNegotiating}
          onNavigateToPublishing={() => handleTabChange("publishing")}
        />
      ) : (
        /* MANAGER or unassigned default role */
        <ManagerWorkspaceDashboardView
          workspaceId={workspaceId}
          workspace={workspace}
          dashboard={dashboard}
          tasks={tasks}
          tasksTotal={tasksTotal}
          tasksLoading={tasksLoading}
          taskStats={taskStats}
          campaigns={campaigns}
          campaignsLoading={campaignsLoading}
          campaignsError={campaignsError}
          packageStatus={packageStatus ?? undefined}
          isPackageApproved={isPackageApproved}
          isPackageNegotiating={isPackageNegotiating}
          onRetryCampaigns={() => setCampaignsAttempt((attempt) => attempt + 1)}
          onNavigateToPublishing={() => handleTabChange("publishing")}
        />
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
