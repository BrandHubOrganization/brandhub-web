import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Building2, Calendar, Check, X, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { agencyService } from "@/services/agencyService";
import { extractErrorMessage, isNotFoundError } from "@/utils/error";
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
      .then(({ data }) => {
        // Lời mời vào công ty (loại trừ role CLIENT nếu có — role CLIENT thuộc trang Lời mời thành khách hàng)
        const agencyInvs = (data.data ?? []).filter(
          (inv) => inv.role !== "CLIENT",
        );
        setInvitations(agencyInvs);
      })
      .catch((err: unknown) => {
        if (isNotFoundError(err)) {
          setInvitations([]);
          return;
        }
        toast.error(
          extractErrorMessage(err, t("agency.errors.invitationsLoadFailed")),
        );
      })
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
      // Điều hướng về danh sách công ty sau khi tham gia thành công
      navigate("/agency");
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
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center bg-card/40">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-orange/10 text-brand-orange">
            <Building2 className="size-7" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {t("agency.invitations.empty")}
            </p>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              Khi một công ty hoặc agency gửi lời mời gia nhập nội bộ cho bạn, lời mời sẽ hiển thị tại đây.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {invitations.map((inv) => (
            <div
              key={inv.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-xs hover:border-brand-orange/40 transition-colors"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-orange/10 text-brand-orange">
                  <Building2 className="size-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-foreground truncate">
                      {inv.agencyName || t("agency.invitations.unknownAgency")}
                    </h4>
                    {inv.role && (
                      <span className="rounded-full bg-brand-orange/10 px-2 py-0.5 text-[10px] font-semibold text-brand-orange uppercase tracking-wider">
                        {inv.role}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3" />
                      {t("agency.invitations.expires", {
                        date: new Date(inv.expiresAt).toLocaleDateString(),
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <Button
                  size="sm"
                  loading={busy === inv.token}
                  onClick={() => handleAccept(inv)}
                  className="bg-brand-orange hover:bg-brand-orange/90 cursor-pointer text-white gap-1.5 shadow-xs text-xs font-medium"
                >
                  <Check className="size-3.5" />
                  {t("agency.invitations.accept")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={busy === inv.token}
                  onClick={() => handleDecline(inv)}
                  className="cursor-pointer text-xs gap-1.5 text-muted-foreground hover:text-destructive"
                >
                  <X className="size-3.5" />
                  {t("agency.invitations.decline")}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="pt-4">
        <Button
          variant="ghost"
          size="sm"
          className="cursor-pointer gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => navigate("/agency")}
        >
          <ArrowLeft className="size-3.5" />
          {t("agency.invitations.back")}
        </Button>
      </div>
    </PageWrapper>
  );
}

export default AgencyInvitationsPage;
