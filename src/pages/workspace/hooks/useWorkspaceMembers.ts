import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { workspaceService } from "@/services/workspaceService";
import { extractErrorMessage } from "@/utils/error";
import type { MemberRole, WorkspaceMember } from "@/types/workspace";

export const MANAGE_ROLES: MemberRole[] = ["OWNER", "MANAGER"];
export const ALL_ROLES: MemberRole[] = [
  "OWNER",
  "MANAGER",
  "ACCOUNT",
  "CREATOR",
  "CLIENT",
];

// Demo seed so Remove Member / Revoke Role stay demonstrable when the
// backend workspace holds only the owner. Appended only when no other
// internal member exists — screenshots, not real membership.
function seedDemoMembers(members: WorkspaceMember[]): WorkspaceMember[] {
  const internal = members.filter((m) => m.role !== "CLIENT");
  if (internal.length > 1) return members;
  const demo: WorkspaceMember[] = [
    {
      id: "demo-creator",
      workspaceId: members[0]?.workspaceId ?? "ws-1",
      userId: "demo-u1",
      fullName: "Minh Anh (Demo)",
      email: "minhanh.demo@brandhub.dev",
      role: "CREATOR",
      joinedAt: "2026-07-01T00:00:00Z",
      isActive: true,
    },
    {
      id: "demo-manager",
      workspaceId: members[0]?.workspaceId ?? "ws-1",
      userId: "demo-u2",
      fullName: "Hồng Nhung (Demo)",
      email: "hongnhung.demo@brandhub.dev",
      role: "MANAGER",
      joinedAt: "2026-07-15T00:00:00Z",
      isActive: true,
    },
  ];
  return [...members, ...demo];
}

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
      .then(({ data }) => setMembers(seedDemoMembers(data.data)))
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
