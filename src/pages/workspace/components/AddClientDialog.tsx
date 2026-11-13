import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useUserLookup } from "@/hooks/useUserLookup";
import { useDebounce } from "@/hooks/useDebounce";
import { agencyService } from "@/services/agencyService";
import { workspaceService } from "@/services/workspaceService";
import { extractErrorMessage } from "@/utils/error";
import type { InviteLookupResponse } from "@/types/agency";
import { InvitationMailPreview } from "@/components/shared/InvitationMailPreview";
import { Mail, UserCheck } from "lucide-react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  agencyId: string;
  workspaceName: string | null;
  agencyName: string | null;
  onInvited: () => void;
}

// Gmail-based: nhập email người đại diện, hệ thống gợi ý inline nếu email đã
// là CLIENT active ở workspace khác CÙNG agency (dùng chung ClientProfile
// luôn, không lộ chéo sang agency khác — bảo mật). Nếu chưa có tài khoản,
// gửi lời mời AgencyInvitation (role CLIENT) như luồng cũ.
export function AddClientDialog({
  open,
  onOpenChange,
  workspaceId,
  agencyId,
  workspaceName,
  agencyName,
  onInvited,
}: Props) {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [lookup, setLookup] = useState<InviteLookupResponse | null>(null);
  const debouncedEmail = useDebounce(email.trim().toLowerCase(), 400);
  const userMatch = useUserLookup(email);

  useEffect(() => {
    if (open) {
      setNote(
        t("workspace.members.addClientNoteTemplate", {
          agency:
            agencyName ?? t("workspace.members.addClientNoteFallbackAgency"),
          workspace:
            workspaceName ??
            t("workspace.members.addClientNoteFallbackWorkspace"),
        }),
      );
    } else {
      setEmail("");
      setNote("");
      setLookup(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, agencyName, workspaceName]);

  useEffect(() => {
    if (!EMAIL_RE.test(debouncedEmail)) {
      setLookup(null);
      return;
    }
    let cancelled = false;
    agencyService
      .inviteLookup(agencyId, debouncedEmail)
      .then(({ data }) => {
        if (!cancelled) setLookup(data.data);
      })
      .catch(() => {
        if (!cancelled) setLookup(null);
      });
    return () => {
      cancelled = true;
    };
  }, [agencyId, debouncedEmail]);

  const handleInvite = async () => {
    setSubmitting(true);
    try {
      await workspaceService.inviteMember(workspaceId, {
        email: email.trim(),
        role: "CLIENT",
        note: note.trim() || undefined,
      });
      toast.success(t("workspace.members.addClientSuccess"));
      onOpenChange(false);
      onInvited();
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, t("common.actionFailed")));
    } finally {
      setSubmitting(false);
    }
  };

  const isValid = EMAIL_RE.test(email.trim());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto">
        <DialogHeader className="border-b border-border/60 pb-3">
          <DialogTitle className="flex items-center gap-2 text-base">
            <UserCheck className="size-5 text-brand-orange" />
            <span>{t("workspace.members.addClientTitle")}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start py-2">
          <div className="space-y-4 lg:col-span-6">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold tracking-wide text-foreground">
                {t("workspace.members.emailLabel", "Email")} *
              </label>
              <Input
                type="email"
                placeholder={t("workspace.members.addClientEmailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />
            </div>

            {userMatch && (
              <div className="flex items-center gap-2 rounded-lg border border-brand-orange/30 bg-brand-orange/5 p-2.5 text-xs">
                {userMatch.avatarUrl ? (
                  <img
                    src={userMatch.avatarUrl}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="size-5 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span className="bg-brand-orange-soft text-brand-orange text-3xs flex size-5 shrink-0 items-center justify-center rounded-full font-bold">
                    {userMatch.fullName.charAt(0).toUpperCase()}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground truncate">
                    {userMatch.fullName}
                  </p>
                  <p className="text-3xs text-muted-foreground truncate">
                    {t("workspace.create.clientInviteUserMatch", {
                      name: userMatch.fullName,
                    })}
                  </p>
                </div>
              </div>
            )}

            {lookup?.isAlreadyClientInAgency && (
              <p className="bg-muted/80 rounded-lg p-2.5 text-xs text-muted-foreground leading-relaxed border border-border/60">
                {t("workspace.members.addClientRecommendHint", {
                  workspace: lookup.existingWorkspaces[0]?.workspaceName,
                })}
              </p>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold tracking-wide text-foreground">
                {t("workspace.members.noteLabel", "Lời nhắn (tuỳ chọn)")}
              </label>
              <Textarea
                placeholder={t("workspace.members.inviteNotePlaceholder")}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={5}
                className="text-xs leading-relaxed"
              />
            </div>

            <div className="pt-2">
              <Button
                variant="orange"
                loading={submitting}
                onClick={handleInvite}
                disabled={!isValid}
                className="w-full gap-2 cursor-pointer shadow-xs"
              >
                <Mail className="size-4" />
                {t("workspace.members.addClientSubmit")}
              </Button>
            </div>
          </div>

          <div className="lg:col-span-6">
            <InvitationMailPreview
              isClient={true}
              role="CLIENT"
              agencyName={agencyName}
              workspaceName={workspaceName}
              recipientEmail={email}
              inviteeName={userMatch?.fullName}
              note={note}
              fullHeight
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
