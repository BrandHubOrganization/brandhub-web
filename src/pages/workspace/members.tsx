import { useTranslation } from "react-i18next";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { useWorkspaceMembers } from "./hooks/useWorkspaceMembers";
import { MembersTable } from "./components/MembersTable";
import { InviteMemberDialog } from "./components/InviteMemberDialog";
import { RemoveMemberDialog } from "./components/RemoveMemberDialog";

export function WorkspaceMembersPage() {
  const { t } = useTranslation();
  const {
    members,
    loading,
    canManage,
    inviteOpen,
    setInviteOpen,
    inviteEmail,
    setInviteEmail,
    inviteRole,
    setInviteRole,
    inviting,
    handleInvite,
    removeTarget,
    setRemoveTarget,
    removing,
    handleRemove,
  } = useWorkspaceMembers();

  if (loading) return null;

  return (
    <PageWrapper
      title={t("workspace.members.title")}
      description={t("workspace.members.description")}
      actions={
        canManage && (
          <Button variant="orange" onClick={() => setInviteOpen(true)}>
            {t("workspace.members.inviteButton")}
          </Button>
        )
      }
    >
      <MembersTable
        members={members}
        canManage={canManage}
        onRemove={setRemoveTarget}
      />

      <InviteMemberDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        email={inviteEmail}
        onEmailChange={setInviteEmail}
        role={inviteRole}
        onRoleChange={setInviteRole}
        submitting={inviting}
        onSubmit={handleInvite}
      />

      <RemoveMemberDialog
        open={!!removeTarget}
        onOpenChange={(open) => !open && setRemoveTarget(null)}
        submitting={removing}
        onSubmit={handleRemove}
      />
    </PageWrapper>
  );
}

export default WorkspaceMembersPage;
