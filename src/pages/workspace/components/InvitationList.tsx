import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { WorkspaceInvitation } from "@/types/workspace";

interface Props {
  invitations: WorkspaceInvitation[];
  busyToken: string | null;
  onAccept: (invitation: WorkspaceInvitation) => void;
  onDecline: (invitation: WorkspaceInvitation) => void;
}

export function InvitationList({
  invitations,
  busyToken,
  onAccept,
  onDecline,
}: Props) {
  const { t } = useTranslation();
  const [declineTarget, setDeclineTarget] = useState<WorkspaceInvitation | null>(
    null,
  );

  if (invitations.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">{t("invitations.empty")}</p>
    );
  }

  return (
    <>
      <div className="flex max-w-md flex-col gap-3">
        {invitations.map((inv) => (
          <div
            key={inv.id}
            className="border-border bg-card flex flex-col gap-3 rounded-xl border p-4"
          >
            <div>
              <p className="text-foreground text-sm font-semibold">
                {inv.workspaceName ?? "—"}
              </p>
              <p className="text-muted-foreground text-xs">
                {t("invitations.roleLabel")}: {t(`workspace.roles.${inv.role}`)}
              </p>
              {inv.invitedByName && (
                <p className="text-muted-foreground text-xs">
                  {t("invitations.invitedByLabel")}: {inv.invitedByName}
                </p>
              )}
              <p className="text-muted-foreground text-xs">
                {t("invitations.expiresLabel")}:{" "}
                {new Date(inv.expiresAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="orange"
                type="button"
                loading={busyToken === inv.token}
                onClick={() => onAccept(inv)}
              >
                {t("invitations.acceptButton")}
              </Button>
              <Button
                variant="outline"
                type="button"
                disabled={busyToken === inv.token}
                onClick={() => setDeclineTarget(inv)}
              >
                {t("invitations.declineButton")}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Dialog: Decline Workspace Invitation */}
      <Dialog
        open={Boolean(declineTarget)}
        onOpenChange={(open) => !open && setDeclineTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-zinc-900 dark:text-zinc-100">
              {t("invitations.declineConfirmTitle", "Từ chối lời mời tham gia?")}
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400">
              {declineTarget &&
                t(
                  "invitations.declineConfirmDesc",
                  "Bạn có chắc chắn muốn từ chối lời mời tham gia {{name}}? Sau khi từ chối, lời mời này sẽ bị hủy bỏ.",
                  { name: declineTarget.workspaceName || "không gian này" },
                )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              variant="outline"
              size="sm"
              disabled={Boolean(busyToken)}
              onClick={() => setDeclineTarget(null)}
            >
              {t("common.cancel", "Hủy")}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              loading={busyToken === declineTarget?.token}
              onClick={() => {
                if (declineTarget) {
                  onDecline(declineTarget);
                  setDeclineTarget(null);
                }
              }}
            >
              {t("invitations.confirmDeclineBtn", "Từ chối")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
