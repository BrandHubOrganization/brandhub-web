import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { MembersTable } from "./MembersTable";
import { InviteMemberDialog } from "./InviteMemberDialog";
import { RemoveMemberDialog } from "./RemoveMemberDialog";
import type { useWorkspaceMembers } from "../hooks/useWorkspaceMembers";

type WorkspaceMembersState = ReturnType<typeof useWorkspaceMembers>;

interface Props extends WorkspaceMembersState {
  internalMembers: WorkspaceMembersState["members"];
}

export function InternalMembersSection({
  internalMembers,
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
}: Props) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {canManage && (
          <Button variant="orange" onClick={() => setInviteOpen(true)}>
            {t("workspace.members.inviteButton")}
          </Button>
        )}
      </div>

      <MembersTable
        members={internalMembers}
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
    </div>
  );
}
