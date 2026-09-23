import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import {
  workspaceService,
  type AssignEntry,
} from "@/services/workspaceService";
import { extractErrorMessage } from "@/utils/error";
import type { MemberRole, WorkspaceMember } from "@/types/workspace";

export const MANAGE_ROLES: MemberRole[] = ["OWNER", "MANAGER"];
export const ALL_ROLES: MemberRole[] = [
  "OWNER",
  "MANAGER",
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
      clientProfileId: null,
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
      clientProfileId: null,
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
  const [inviteNote, setInviteNote] = useState("");
  const [inviting, setInviting] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<WorkspaceMember | null>(
    null,
  );
  const [removing, setRemoving] = useState(false);
  const [agencyId, setAgencyId] = useState<string | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignValues, setAssignValues] = useState<AssignEntry[]>([]);
  const [assigning, setAssigning] = useState(false);
  const [addClientOpen, setAddClientOpen] = useState(false);
  const [addClientId, setAddClientId] = useState("");
  const [addingClient, setAddingClient] = useState(false);
  const [updatingRole, setUpdatingRole] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);

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

  useEffect(() => {
    if (!workspaceId) return;
    workspaceService
      .getById(workspaceId)
      .then(({ data }) => setAgencyId(data.data.agencyId));
  }, [workspaceId]);

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
        note: inviteNote.trim() || undefined,
      });
      toast.success(t("workspace.members.inviteSuccess"));
      setInviteOpen(false);
      setInviteEmail("");
      setInviteNote("");
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, t("common.actionFailed")));
    } finally {
      setInviting(false);
    }
  };

  const handleAssign = async () => {
    if (!workspaceId || assignValues.length === 0) return;
    setAssigning(true);
    try {
      await workspaceService.assignMembers(workspaceId, assignValues);
      toast.success(t("workspace.members.assignSuccess"));
      setAssignOpen(false);
      setAssignValues([]);
      loadMembers();
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, t("common.actionFailed")));
    } finally {
      setAssigning(false);
    }
  };

  const handleAddClient = async () => {
    if (!workspaceId || !addClientId) return;
    setAddingClient(true);
    try {
      await workspaceService.addClient(workspaceId, addClientId);
      toast.success(t("workspace.members.addClientSuccess"));
      setAddClientOpen(false);
      setAddClientId("");
      loadMembers();
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, t("common.actionFailed")));
    } finally {
      setAddingClient(false);
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

  const handleUpdateRole = async (memberId: string, role: MemberRole) => {
    if (!workspaceId) return;
    setUpdatingRole(true);
    try {
      await workspaceService.updateMemberRole(workspaceId, memberId, role);
      toast.success(t("workspace.members.roleUpdateSuccess"));
      loadMembers();
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, t("common.actionFailed")));
    } finally {
      setUpdatingRole(false);
    }
  };

  const handleLeave = async () => {
    if (!workspaceId) return;
    setLeaving(true);
    try {
      await workspaceService.leaveWorkspace(workspaceId);
      toast.success(t("workspace.members.leaveSuccess"));
      setLeaveOpen(false);
      loadMembers();
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, t("common.actionFailed")));
    } finally {
      setLeaving(false);
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
    updatingRole,
    handleUpdateRole,
    leaving,
    handleLeave,
    leaveOpen,
    setLeaveOpen,
  };
}
