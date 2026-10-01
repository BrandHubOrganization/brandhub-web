import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { workspaceService } from "@/services/workspaceService";
import { extractErrorMessage } from "@/utils/error";
import { MANAGE_ROLES } from "./useWorkspaceMembers";
import type { WorkspaceMember } from "@/types/workspace";

// Client cộng tác (role CLIENT, gán từ ClientProfile) — trang riêng, tách
// khỏi useWorkspaceMembers (thành viên nội bộ agency).
export function useWorkspaceClients() {
  const { t } = useTranslation();
  const { id: workspaceId } = useParams<{ id: string }>();
  const currentUserId = useAuthStore((s) => s.user?.id);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [reloadCount, setReloadCount] = useState(0);
  const [agencyId, setAgencyId] = useState<string | null>(null);
  const [addClientOpen, setAddClientOpen] = useState(false);
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

  useEffect(() => {
    if (!workspaceId) return;
    workspaceService
      .getById(workspaceId)
      .then(({ data }) => setAgencyId(data.data.agencyId));
  }, [workspaceId]);

  const clients = members.filter((m) => m.role === "CLIENT");
  const internalMember = members.find((m) => m.userId === currentUserId);
  const canManage = internalMember
    ? MANAGE_ROLES.includes(internalMember.role)
    : false;

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
    clients,
    loading,
    loadMembers,
    canManage,
    agencyId,
    addClientOpen,
    setAddClientOpen,
    removeTarget,
    setRemoveTarget,
    removing,
    handleRemove,
  };
}
