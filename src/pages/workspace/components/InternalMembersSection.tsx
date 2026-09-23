import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MembersTable } from "./MembersTable";
import { InviteMemberDialog } from "./InviteMemberDialog";
import { RemoveMemberDialog } from "./RemoveMemberDialog";
import { LeaveWorkspaceDialog } from "./LeaveWorkspaceDialog";
import { AssignMemberPicker } from "./AssignMemberPicker";
import { AddClientDialog } from "./AddClientDialog";
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
  inviteNote,
  setInviteNote,
  inviting,
  handleInvite,
  removeTarget,
  setRemoveTarget,
  removing,
  handleRemove,
  agencyId,
  assignOpen,
  setAssignOpen,
  assignValues,
  setAssignValues,
  assigning,
  handleAssign,
  addClientOpen,
  setAddClientOpen,
  addClientId,
  setAddClientId,
  addingClient,
  handleAddClient,
  members,
  updatingRole,
  handleUpdateRole,
  leaving,
  handleLeave,
  leaveOpen,
  setLeaveOpen,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        {canManage && agencyId && (
          <Button variant="outline" onClick={() => setAssignOpen(true)}>
            {t("workspace.members.assignButton")}
          </Button>
        )}
        {canManage && agencyId && (
          <Button variant="outline" onClick={() => setAddClientOpen(true)}>
            {t("workspace.members.addClientButton")}
          </Button>
        )}
        {canManage && (
          <Button variant="orange" onClick={() => setInviteOpen(true)}>
            {t("workspace.members.inviteButton")}
          </Button>
        )}
        <Button
          variant="destructive"
          loading={leaving}
          onClick={() => setLeaveOpen(true)}
        >
          {t("workspace.members.leaveButton")}
        </Button>
      </div>

      <MembersTable
        members={internalMembers}
        canManage={canManage}
        onRemove={setRemoveTarget}
        onUpdateRole={handleUpdateRole}
        updatingRole={updatingRole}
      />

      <InviteMemberDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        email={inviteEmail}
        onEmailChange={setInviteEmail}
        role={inviteRole}
        onRoleChange={setInviteRole}
        note={inviteNote}
        onNoteChange={setInviteNote}
        submitting={inviting}
        onSubmit={handleInvite}
      />

      <RemoveMemberDialog
        open={!!removeTarget}
        onOpenChange={(open) => !open && setRemoveTarget(null)}
        submitting={removing}
        onSubmit={handleRemove}
      />

      <LeaveWorkspaceDialog
        open={leaveOpen}
        onOpenChange={setLeaveOpen}
        submitting={leaving}
        onSubmit={handleLeave}
      />

      {agencyId && (
        <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {t("workspace.members.assignDialogTitle")}
              </DialogTitle>
            </DialogHeader>
            <AssignMemberPicker
              agencyId={agencyId}
              value={assignValues}
              onChange={setAssignValues}
            />
            <DialogFooter>
              <Button
                variant="orange"
                loading={assigning}
                onClick={handleAssign}
                disabled={assignValues.length === 0}
              >
                {t("workspace.members.assignButton")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {agencyId && (
        <AddClientDialog
          open={addClientOpen}
          onOpenChange={setAddClientOpen}
          agencyId={agencyId}
          existingMembers={members}
          value={addClientId}
          onChange={setAddClientId}
          submitting={addingClient}
          onSubmit={handleAddClient}
        />
      )}
    </div>
  );
}
