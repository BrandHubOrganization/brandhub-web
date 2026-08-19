import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { workspaceService } from "@/services/workspaceService";
import { extractErrorMessage } from "@/utils/error";
import type { MemberRole, WorkspaceMember } from "@/types/workspace";

export const MANAGE_ROLES: MemberRole[] = ["OWNER", "ACCOUNT"];
export const ALL_ROLES: MemberRole[] = [
  "OWNER",
  "CREATOR",
  "VIEWER",
  "CLIENT",
  "ACCOUNT",
];

export function useWorkspaceMembers() {
  const { t } = useTranslation();
  const { id: workspaceId } = useParams<{ id: string }>();
  const currentUserId = useAuthStore((s) => s.user?.id);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [reloadCount, setReloadCount] = useState(0);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<MemberRole>("CREATOR");
  const [inviting, setInviting] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<WorkspaceMember | null>(
    null,
  );
  const [removing, setRemoving] = useState(false);

  const loadMembers = useCallback(() => setReloadCount((c) => c + 1), []);

  useEffect(() => {
    if (!workspaceId) return;
    workspaceService
      .listMembers(workspaceId)
      .then(({ data }) => setMembers(data.data))
      .catch((err: unknown) =>
        toast.error(extractErrorMessage(err, t("common.loadFailed"))),
      )
      .finally(() => setLoading(false));
  }, [workspaceId, reloadCount, t]);

  const currentMember = members.find((m) => m.userId === currentUserId);
  const canManage = currentMember
    ? MANAGE_ROLES.includes(currentMember.role)
    : false;

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceId) return;
    setInviting(true);
    try {
      await workspaceService.inviteMember(workspaceId, {
        email: inviteEmail.trim(),
        role: inviteRole,
      });
      toast.success(t("workspace.members.inviteSuccess"));
      setInviteOpen(false);
      setInviteEmail("");
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, t("common.actionFailed")));
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async () => {
    if (!workspaceId || !removeTarget) return;
    setRemoving(true);
    try {
      await workspaceService.removeMember(workspaceId, removeTarget.id);
      toast.success(t("workspace.members.removeSuccess"));
      setRemoveTarget(null);
      loadMembers();
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, t("common.actionFailed")));
    } finally {
      setRemoving(false);
    }
  };

  return {
    workspaceId,
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
  };
}
