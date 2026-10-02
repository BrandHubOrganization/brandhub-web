import { useTranslation } from "react-i18next";
import PageWrapper from "@/components/layout/PageWrapper";
import { useWorkspaceMembers } from "./hooks/useWorkspaceMembers";
import { InternalMembersSection } from "./components/InternalMembersSection";
import { WorkspacePermissionsPanel } from "./components/WorkspacePermissionsPanel";

// Chỉ thành viên nội bộ agency (OWNER/MANAGER/CREATOR). Client cộng tác
// (role CLIENT, gán từ ClientProfile) có trang riêng: WorkspaceClientsPage.
export function WorkspaceMembersPage() {
  const { t } = useTranslation();
  const membersState = useWorkspaceMembers();

  if (membersState.loading) return null;

  const internalMembers = membersState.members.filter(
    (m) => m.role !== "CLIENT",
  );

  return (
    <PageWrapper
      title={t("workspace.members.title")}
      description={t("workspace.members.description")}
    >
      <div className="space-y-4">
        <InternalMembersSection
          {...membersState}
          internalMembers={internalMembers}
        />

        <WorkspacePermissionsPanel
          workspaceId={membersState.workspaceId}
          members={internalMembers}
          onChanged={membersState.loadMembers}
        />
      </div>
    </PageWrapper>
  );
}

export default WorkspaceMembersPage;
