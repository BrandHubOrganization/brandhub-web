import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
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

  if (invitations.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">{t("invitations.empty")}</p>
    );
  }

  return (
    <div className="flex max-w-md flex-col gap-3">
      {invitations.map((inv) => (
        <div
          key={inv.id}
          className="border-border bg-card flex flex-col gap-3 rounded-lg border p-4"
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
              loading={busyToken === inv.token}
              onClick={() => onDecline(inv)}
            >
              {t("invitations.declineButton")}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
