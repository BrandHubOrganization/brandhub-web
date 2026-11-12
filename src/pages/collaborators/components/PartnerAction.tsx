import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AlertTriangle, Trash2, PowerOff } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DirectoryPartner } from "../types";
import { getAvatarPalette, getInitials } from "../contactHelpers";

export interface DirectoryAction {
  partner: DirectoryPartner;
  kind: "delete" | "deactivate";
}

interface PartnerActionProps {
  action: DirectoryAction | null;
  busy: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function PartnerAction({
  action,
  busy,
  onClose,
  onConfirm,
}: PartnerActionProps) {
  const { t } = useTranslation();
  const isDelete = action?.kind === "delete";
  const partner = action?.partner;
  const palette = partner ? getAvatarPalette(partner.partnerName) : { bg: "" };
  const initials = partner ? getInitials(partner.partnerName) : "";

  return (
    <Dialog
      open={!!action}
      onOpenChange={(open) => {
        if (!open && !busy) onClose();
      }}
    >
      {action && partner && (
        <DialogContent className="border-border/80 rounded-2xl border p-6 shadow-xl sm:max-w-md">
          <DialogHeader className="items-center space-y-2 text-center">
            {/* Circular alert icon */}
            <div
              className={cn(
                "flex size-14 items-center justify-center rounded-full border shadow-2xs transition-transform select-none",
                isDelete
                  ? "bg-destructive/10 text-destructive border-destructive/20 dark:bg-destructive/20"
                  : "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
              )}
              aria-hidden="true"
            >
              {isDelete ? (
                <Trash2 className="size-7" />
              ) : (
                <PowerOff className="size-7" />
              )}
            </div>

            <DialogTitle className="text-foreground text-lg font-bold">
              {t(`collaborators.${action.kind}`)}
            </DialogTitle>

            <DialogDescription className="text-muted-foreground max-w-sm text-xs">
              {isDelete
                ? t("collaborators.confirm.deleteDesc")
                : t("collaborators.confirm.deactivateDesc")}
            </DialogDescription>
          </DialogHeader>

          {/* Highlighted Partner Box */}
          <div className="border-border/70 bg-muted/30 my-1 flex items-center justify-between gap-3 rounded-xl border p-3">
            <div className="flex min-w-0 items-center gap-3">
              <div
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-full border text-xs font-bold shadow-2xs select-none",
                  palette.bg,
                )}
                aria-hidden="true"
              >
                {initials}
              </div>
              <div className="min-w-0">
                <p
                  className="text-foreground truncate text-sm font-semibold"
                  title={partner.partnerName}
                >
                  {partner.partnerName}
                </p>
                <p className="text-muted-foreground truncate text-xs">
                  {t(`campaign.partners.types.${partner.partnerType}`)}
                </p>
              </div>
            </div>
            <Badge
              variant="secondary"
              className="h-6 shrink-0 px-2.5 text-xs font-normal"
            >
              {t(`campaign.partners.types.${partner.partnerType}`)}
            </Badge>
          </div>

          {/* Consequence Explanation Banner */}
          <div
            className={cn(
              "space-y-1.5 rounded-xl border p-3.5 text-xs",
              isDelete
                ? "bg-destructive/5 border-destructive/25 text-destructive dark:bg-destructive/10"
                : "border-amber-500/25 bg-amber-500/5 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
            )}
          >
            <div className="flex items-center gap-2 font-semibold">
              <AlertTriangle className="size-4 shrink-0" />
              <span>
                {isDelete
                  ? t("collaborators.confirm.deleteWarning")
                  : t("collaborators.confirm.deactivateWarning")}
              </span>
            </div>
            <p className="text-foreground/80 dark:text-foreground/90 pl-6 leading-relaxed opacity-90">
              {t(`collaborators.confirm.${action.kind}`, {
                name: partner.partnerName,
              })}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="border-border/40 flex items-center justify-end gap-2.5 border-t pt-3">
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={onClose}
            >
              {t("collaborators.close")}
            </Button>
            <Button
              type="button"
              variant={isDelete ? "destructive" : "orange"}
              loading={busy}
              disabled={busy}
              onClick={onConfirm}
              className="min-w-28 shadow-xs"
            >
              {!busy &&
                (isDelete ? (
                  <Trash2 className="mr-1.5 size-4" />
                ) : (
                  <PowerOff className="mr-1.5 size-4" />
                ))}
              {t(
                busy ? "collaborators.saving" : `collaborators.${action.kind}`,
              )}
            </Button>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}
