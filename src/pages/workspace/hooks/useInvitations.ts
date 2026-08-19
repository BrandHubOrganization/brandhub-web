import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { workspaceService } from "@/services/workspaceService";
import { extractErrorMessage } from "@/utils/error";
import type { WorkspaceInvitation } from "@/types/workspace";

export function useInvitations() {
  const { t } = useTranslation();
  const [invitations, setInvitations] = useState<WorkspaceInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyToken, setBusyToken] = useState<string | null>(null);

  useEffect(() => {
    workspaceService
      .listMyPendingInvitations()
      .then(({ data }) => setInvitations(data.data))
      .catch((err: unknown) =>
        toast.error(extractErrorMessage(err, t("common.loadFailed"))),
      )
      .finally(() => setLoading(false));
  }, [t]);

  const handleAccept = async (invitation: WorkspaceInvitation) => {
    setBusyToken(invitation.token);
    try {
      await workspaceService.acceptInvitation({ token: invitation.token });
      setInvitations((prev) => prev.filter((i) => i.id !== invitation.id));
      toast.success(t("invitations.acceptSuccess"));
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, t("common.actionFailed")));
    } finally {
      setBusyToken(null);
    }
  };

  const handleDecline = async (invitation: WorkspaceInvitation) => {
    setBusyToken(invitation.token);
    try {
      await workspaceService.declineInvitation(invitation.token);
      setInvitations((prev) => prev.filter((i) => i.id !== invitation.id));
      toast.success(t("invitations.declineSuccess"));
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, t("common.actionFailed")));
    } finally {
      setBusyToken(null);
    }
  };

  return { invitations, loading, busyToken, handleAccept, handleDecline };
}
