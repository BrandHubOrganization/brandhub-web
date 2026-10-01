import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUserLookup } from "@/hooks/useUserLookup";
import { useDebounce } from "@/hooks/useDebounce";
import { agencyService } from "@/services/agencyService";
import { workspaceService } from "@/services/workspaceService";
import { extractErrorMessage } from "@/utils/error";
import type { InviteLookupResponse } from "@/types/agency";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  agencyId: string;
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
    if (!open) {
      setEmail("");
      setNote("");
      setLookup(null);
    }
  }, [open]);

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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("workspace.members.addClientTitle")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <Input
            type="email"
            placeholder={t("workspace.members.addClientEmailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {userMatch && (
            <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
              {userMatch.avatarUrl ? (
                <img
                  src={userMatch.avatarUrl}
                  alt=""
                  className="size-4 shrink-0 rounded-full object-cover"
                />
              ) : (
                <span className="bg-brand-orange-soft text-brand-orange text-3xs flex size-4 shrink-0 items-center justify-center rounded-full font-bold">
                  {userMatch.fullName.charAt(0).toUpperCase()}
                </span>
              )}
              {t("workspace.create.clientInviteUserMatch", {
                name: userMatch.fullName,
              })}
            </p>
          )}

          {lookup?.isAlreadyClientInAgency && (
            <p className="bg-muted rounded-lg p-2 text-xs">
              {t("workspace.members.addClientRecommendHint", {
                workspace: lookup.existingWorkspaces[0]?.workspaceName,
              })}
            </p>
          )}

          <Input
            placeholder={t("workspace.members.inviteNotePlaceholder")}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button
            variant="orange"
            loading={submitting}
            onClick={handleInvite}
            disabled={!isValid}
          >
            {t("workspace.members.addClientSubmit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
