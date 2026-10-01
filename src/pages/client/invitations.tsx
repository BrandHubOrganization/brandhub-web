import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { UserCheck, Calendar, Check, X, ArrowLeft, MessageSquare, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { workspaceService } from "@/services/workspaceService";
import { agencyService } from "@/services/agencyService";
import { extractErrorMessage, isNotFoundError } from "@/utils/error";

export interface ClientInvitationItem {
  id: string;
  token: string;
  source: "WORKSPACE" | "AGENCY";
  title: string;
  note?: string | null;
  role: string | null;
  expiresAt: string;
}

export function ClientInvitationsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [invitations, setInvitations] = useState<ClientInvitationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      workspaceService.listMyPendingInvitations().catch((err: unknown) => {
        if (isNotFoundError(err)) return { data: { data: [] } };
        throw err;
      }),
      agencyService.listMyPendingInvitations().catch((err: unknown) => {
        if (isNotFoundError(err)) return { data: { data: [] } };
        throw err;
      }),
    ])
      .then(([workspaceRes, agencyRes]) => {
        // 1. Lời mời tham gia Workspace với tư cách CLIENT
        const wsInvs: ClientInvitationItem[] = (workspaceRes.data.data ?? []).map(
          (inv) => ({
            id: inv.id,
            token: inv.token,
            source: "WORKSPACE",
            title: inv.workspaceName || t("client.invitations.unknownWorkspace"),
            note: null,
            role: inv.role ?? "CLIENT",
            expiresAt: inv.expiresAt,
          }),
        );

        // 2. Lời mời từ Agency nhưng có role là CLIENT
        const agencyClientInvs: ClientInvitationItem[] = (
          agencyRes.data.data ?? []
        )
          .filter((inv) => inv.role === "CLIENT")
          .map((inv) => ({
            id: inv.id,
            token: inv.token,
            source: "AGENCY",
            title: inv.agencyName || t("client.invitations.unknownWorkspace"),
            note: null,
            role: "CLIENT",
            expiresAt: inv.expiresAt,
          }));

        setInvitations([...wsInvs, ...agencyClientInvs]);
      })
      .catch((err: unknown) => {
        toast.error(extractErrorMessage(err, t("common.loadFailed")));
      })
      .finally(() => setLoading(false));
  }, [t]);

  const handleAccept = (inv: ClientInvitationItem) => {
    // Luồng khách hàng: điều hướng tới trang chọn/tạo Hồ sơ thương hiệu (ClientProfile)
    // trước khi hoàn tất gia nhập workspace
    navigate(`/invitations/accept?token=${inv.token}`);
  };

  const handleDecline = async (inv: ClientInvitationItem) => {
    setBusy(inv.token);
    try {
      if (inv.source === "AGENCY") {
        await agencyService.declineInvitation(inv.token);
      } else {
        await workspaceService.declineInvitation(inv.token);
      }
      setInvitations((prev) => prev.filter((i) => i.id !== inv.id));
      toast.success(t("client.invitations.declineSuccess"));
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, t("common.actionFailed")));
    } finally {
      setBusy(null);
    }
  };

  if (loading) return null;

  return (
    <PageWrapper
      title={t("client.invitations.title")}
      description={t("client.invitations.description")}
    >
      {invitations.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center bg-card/40">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <UserCheck className="size-7" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {t("client.invitations.empty")}
            </p>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              Khi một công ty hoặc không gian làm việc mời bạn tham gia với tư cách khách hàng (Client), lời mời sẽ hiển thị tại đây.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {invitations.map((inv) => (
            <div
              key={inv.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-xs hover:border-blue-500/40 transition-colors"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Briefcase className="size-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-foreground truncate">
                      {inv.title}
                    </h4>
                    <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                      {t("client.invitations.role")}
                    </span>
                  </div>
                  {inv.note && (
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5 italic">
                      <MessageSquare className="size-3 shrink-0" />
                      <span className="truncate">{inv.note}</span>
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3" />
                      {t("client.invitations.expires", {
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
                  {t("client.invitations.accept")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={busy === inv.token}
                  onClick={() => handleDecline(inv)}
                  className="cursor-pointer text-xs gap-1.5 text-muted-foreground hover:text-destructive"
                >
                  <X className="size-3.5" />
                  {t("client.invitations.decline")}
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
          {t("client.invitations.back")}
        </Button>
      </div>
    </PageWrapper>
  );
}

export default ClientInvitationsPage;
