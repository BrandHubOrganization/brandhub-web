import { useCallback, useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { workspaceService } from "@/services/workspaceService";
import { agencyService } from "@/services/agencyService";
import { extractErrorMessage } from "@/utils/error";
import { MANAGE_ROLES } from "./useWorkspaceMembers";
import type { MemberRole, WorkspaceMember } from "@/types/workspace";

// Client cộng tác (role CLIENT, gán từ ClientProfile) — trang riêng, tách
// khỏi useWorkspaceMembers (thành viên nội bộ agency).
export function useWorkspaceClients() {
  const { t } = useTranslation();
  const { id: workspaceId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const urlInvite = searchParams.get("invite");
  const urlTemplateId = searchParams.get("templateId");

  const currentUserId = useAuthStore((s) => s.user?.id);
  const currentMemberRole = useWorkspaceStore((s) => s.currentMemberRole);
  const workspaceInStore = useWorkspaceStore((s) =>
    s.workspaceList.find((w) => w.id === workspaceId),
  );
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [workspaceMyRole, setWorkspaceMyRole] = useState<MemberRole | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [reloadCount, setReloadCount] = useState(0);
  const [agencyId, setAgencyId] = useState<string | null>(null);
  const [workspaceName, setWorkspaceName] = useState<string | null>(null);
  const [agencyName, setAgencyName] = useState<string | null>(null);
  const [addClientOpen, setAddClientOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<WorkspaceMember | null>(
    null,
  );
  const [removing, setRemoving] = useState(false);
  const [viewingClient, setViewingClient] = useState<WorkspaceMember | null>(
    null,
  );

  useEffect(() => {
    if (urlInvite === "true" || urlTemplateId) {
      setAddClientOpen(true);
    }
  }, [urlInvite, urlTemplateId]);

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
    workspaceService.getById(workspaceId).then(({ data }) => {
      setAgencyId(data.data.agencyId);
      setWorkspaceName(data.data.name);
      setWorkspaceMyRole(data.data.myRole);
    });
  }, [workspaceId]);

  useEffect(() => {
    if (!agencyId) return;
    agencyService
      .getById(agencyId)
      .then(({ data }) => setAgencyName(data.data.name))
      .catch(() => setAgencyName(null));
  }, [agencyId]);

  const clients = members.filter((m) => m.role === "CLIENT");
  const internalMember = members.find((m) => m.userId === currentUserId);
  const effectiveRole =
    internalMember?.role ??
    workspaceMyRole ??
    workspaceInStore?.myRole ??
    currentMemberRole;
  const canManage = effectiveRole
    ? MANAGE_ROLES.includes(effectiveRole)
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
    workspaceName,
    agencyName,
    addClientOpen,
    setAddClientOpen,
    removeTarget,
    setRemoveTarget,
    removing,
    handleRemove,
    viewingClient,
    setViewingClient,
    urlTemplateId,
  };
}
