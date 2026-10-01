import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Inbox } from "lucide-react";
import { toast } from "sonner";
import { agencyService } from "@/services/agencyService";
import { workspaceService } from "@/services/workspaceService";
import { extractErrorMessage, isNotFoundError } from "@/utils/error";

// Gộp 2 nguồn lời mời (agency_invitations cho MANAGER/CREATOR,
// workspace_invitations cho CLIENT — xem useWorkspaceClients/AddClientDialog)
// vào cùng 1 tab, nếu không client được mời sẽ không bao giờ thấy lời mời của mình.
type UnifiedInvitation = {
  id: string;
  token: string;
  source: "AGENCY" | "WORKSPACE";
  role: string | null;
  agencyName: string | null;
  expiresAt: string;
};

export function AgencyInvitationsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [invitations, setInvitations] = useState<UnifiedInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      agencyService.listMyPendingInvitations().catch((err: unknown) => {
        if (isNotFoundError(err)) return { data: { data: [] } };
        throw err;
      }),
      workspaceService.listMyPendingInvitations().catch((err: unknown) => {
        if (isNotFoundError(err)) return { data: { data: [] } };
        throw err;
      }),
    ])
      .then(([agencyRes, workspaceRes]) => {
        const agencyInvs: UnifiedInvitation[] = (agencyRes.data.data ?? []).map(
          (inv) => ({
            id: inv.id,
            token: inv.token,
            source: "AGENCY" as const,
            role: inv.role,
            agencyName: inv.agencyName,
            expiresAt: inv.expiresAt,
          }),
        );
        const workspaceInvs: UnifiedInvitation[] = (
          workspaceRes.data.data ?? []
        ).map((inv) => ({
          id: inv.id,
          token: inv.token,
          source: "WORKSPACE" as const,
          role: inv.role,
          agencyName: inv.workspaceName,
          expiresAt: inv.expiresAt,
        }));
        setInvitations([...agencyInvs, ...workspaceInvs]);
      })
      .catch((err: unknown) => {
        toast.error(
          extractErrorMessage(err, t("agency.errors.invitationsLoadFailed")),
        );
      })
      .finally(() => setLoading(false));
  }, [t]);

  const handleAccept = (inv: UnifiedInvitation) => {
    // Role CLIENT bắt chọn/tạo ClientProfile trước khi accept — dùng lại
    // trang picker có sẵn thay vì accept thẳng (xem /agency/accept).
    if (inv.role === "CLIENT") {
      navigate(`/invitations/accept?token=${inv.token}`);
      return;
    }
    acceptDirectly(inv);
  };

  const acceptDirectly = async (inv: UnifiedInvitation) => {
    setBusy(inv.token);
    try {
      await agencyService.acceptInvitation(inv.token);
      setInvitations((prev) => prev.filter((i) => i.id !== inv.id));
      toast.success(
        t("agency.invitations.acceptSuccess", {
          agency: inv.agencyName || t("agency.invitations.unknownAgency"),
        }),
      );
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, t("agency.errors.acceptFailed")));
    } finally {
      setBusy(null);
    }
  };

  const handleDecline = async (inv: UnifiedInvitation) => {
    setBusy(inv.token);
    try {
      if (inv.source === "AGENCY") {
        await agencyService.declineInvitation(inv.token);
      } else {
        await workspaceService.declineInvitation(inv.token);
      }
      setInvitations((prev) => prev.filter((i) => i.id !== inv.id));
      toast.success(t("agency.invitations.declineSuccess"));
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, t("agency.errors.declineFailed")));
    } finally {
      setBusy(null);
    }
  };

  if (loading) return null;

  return (
    <PageWrapper
      title={t("agency.invitations.title")}
      description={t("agency.invitations.description")}
    >
      {invitations.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-14 text-center">
          <Inbox className="text-muted-foreground size-10" />
          <p className="text-muted-foreground text-sm">
            {t("agency.invitations.empty")}
          </p>
        </div>
      ) : (
        <div className="divide-y rounded-xl border">
          {invitations.map((inv) => (
            <div
              key={inv.id}
              className="flex items-center justify-between gap-3 p-4"
            >
              <div>
                <p className="text-sm font-medium">
                  {inv.agencyName || t("agency.invitations.unknownAgency")}
                </p>
                <p className="text-muted-foreground text-xs">
                  {t("agency.invitations.expires", {
                    date: new Date(inv.expiresAt).toLocaleDateString(),
                  })}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  loading={busy === inv.token}
                  onClick={() => handleAccept(inv)}
                  className="bg-brand-orange hover:bg-brand-orange/90 cursor-pointer text-white"
                >
                  {t("agency.invitations.accept")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={busy === inv.token}
                  onClick={() => handleDecline(inv)}
                  className="cursor-pointer"
                >
                  {t("agency.invitations.decline")}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Button
        variant="ghost"
        size="sm"
        className="mt-4 cursor-pointer"
        onClick={() => navigate("/agency")}
      >
        {t("agency.invitations.back")}
      </Button>
    </PageWrapper>
  );
}

export default AgencyInvitationsPage;
