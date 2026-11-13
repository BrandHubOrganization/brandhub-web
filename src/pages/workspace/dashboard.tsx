import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import PageWrapper from "@/components/layout/PageWrapper";
import { PostDashboardView } from "@/pages/publish/dashboard";
import { LeaveWorkspaceDialog } from "./components/LeaveWorkspaceDialog";
import { useWorkspaceDashboard } from "./hooks/useWorkspaceDashboard";
import { WorkspaceDashboardHeader } from "./components/dashboard/WorkspaceDashboardHeader";
import { DashboardTabSwitcher } from "./components/dashboard/DashboardTabSwitcher";
import { RoleWorkspaceOverview } from "@/pages/workspace/components/dashboard/RoleWorkspaceOverview";
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
    dashboardError,
    retryDashboard,

    leaveOpen,
    setLeaveOpen,
    leaving,
    handleLeave,
    currentMemberRole,
    packageStatus,
    isPackageApproved,
    isPackageNegotiating,
  } = useWorkspaceDashboard(false);

  if (dashboardError)
    return (
      <div role="alert" className="space-y-3 p-6">
        <p>{t("workspace.dashboard.overview.loadError")}</p>
        <Button onClick={retryDashboard}>
          {t("workspace.dashboard.overview.retry")}
        </Button>
      </div>
    );
  if (loading || !dashboard) {
    return (
      <div
        className="space-y-4 p-6"
        aria-label={t("workspace.dashboard.overview.loading")}
      >
        <Skeleton className="h-24 w-full" />
        <div className="grid gap-3 sm:grid-cols-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  const workspace = dashboard.workspace;

  return (
    <PageWrapper
      title={
        workspace.name || t("workspace.dashboard.title", "Workspace Dashboard")
      }
      hideHeader
    >
      {activeTab === "publishing" && (
        <>
          <WorkspaceDashboardHeader
            workspace={workspace}
            workspaceId={workspaceId}
            currentMemberRole={currentMemberRole}
            isPackageApproved={isPackageApproved}
            isPackageNegotiating={isPackageNegotiating}
            packageStatus={packageStatus ?? undefined}
            onOpenLeaveDialog={() => setLeaveOpen(true)}
          />
          <DashboardTabSwitcher
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </>
      )}
      {/* ── Tab Content: Publishing Deep Dive OR Role-Specific Views ── */}
      {activeTab === "publishing" ? (
        <PostDashboardView workspaceId={workspaceId} />
      ) : (
        <RoleWorkspaceOverview
          key={`${workspaceId}:${currentMemberRole}`}
          workspaceId={workspaceId}
          role={currentMemberRole ?? ""}
        />
      )}

      {activeTab === "overview" && (
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleTabChange("publishing")}
          >
            {t("workspace.dashboard.tabs.publishing")}
          </Button>
          {currentMemberRole && currentMemberRole !== "OWNER" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLeaveOpen(true)}
            >
              {t("workspace.members.leaveButton")}
            </Button>
          )}
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
