import { useTranslation } from "react-i18next";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { useWorkspaceClients } from "./hooks/useWorkspaceClients";
import { ClientsTable } from "./components/ClientsTable";
import { AddClientDialog } from "./components/AddClientDialog";
import { RemoveMemberDialog } from "./components/RemoveMemberDialog";

// Client cộng tác (role CLIENT, gán từ ClientProfile) — trang riêng, tách
// khỏi WorkspaceMembersPage (thành viên nội bộ agency).
export function WorkspaceClientsPage() {
  const { t } = useTranslation();
  const state = useWorkspaceClients();

  if (state.loading) return null;

  return (
    <PageWrapper
      title={t("workspace.members.clientsPageTitle")}
      description={t("workspace.members.clientsPageDescription")}
    >
      <div className="space-y-4">
        <div className="flex justify-end">
          {state.canManage && state.agencyId && (
            <Button
              variant="orange"
              onClick={() => state.setAddClientOpen(true)}
            >
              {t("workspace.members.addClientButton")}
            </Button>
          )}
        </div>

        <ClientsTable
          clients={state.clients}
          canManage={state.canManage}
          onRemove={state.setRemoveTarget}
        />

        {state.agencyId && state.workspaceId && (
          <AddClientDialog
            open={state.addClientOpen}
            onOpenChange={state.setAddClientOpen}
            workspaceId={state.workspaceId}
            agencyId={state.agencyId}
            workspaceName={state.workspaceName}
            agencyName={state.agencyName}
            onInvited={state.loadMembers}
          />
        )}

        <RemoveMemberDialog
          open={!!state.removeTarget}
          onOpenChange={(open) => !open && state.setRemoveTarget(null)}
          submitting={state.removing}
          onSubmit={state.handleRemove}
          target={state.removeTarget}
          isLastManager={false}
        />
      </div>
    </PageWrapper>
  );
}

export default WorkspaceClientsPage;
