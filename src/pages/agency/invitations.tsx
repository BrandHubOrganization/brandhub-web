import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Inbox } from "lucide-react";
import { toast } from "sonner";
import { agencyService } from "@/services/agencyService";
import { extractErrorMessage } from "@/utils/error";
import type { AgencyInvitation } from "@/types/agency";

export function AgencyInvitationsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [invitations, setInvitations] = useState<AgencyInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    agencyService
      .listMyPendingInvitations()
      .then(({ data }) => setInvitations(data.data))
      .catch((err: unknown) =>
        toast.error(
          extractErrorMessage(err, t("agency.errors.invitationsLoadFailed")),
        ),
      )
      .finally(() => setLoading(false));
  }, [t]);

  const handleAccept = async (inv: AgencyInvitation) => {
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

  const handleDecline = async (inv: AgencyInvitation) => {
    setBusy(inv.token);
    try {
      await agencyService.declineInvitation(inv.token);
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
