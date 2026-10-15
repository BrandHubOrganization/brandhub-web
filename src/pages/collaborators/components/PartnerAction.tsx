import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import type { DirectoryPartner } from "../types";
export interface DirectoryAction { partner: DirectoryPartner; kind: "delete" | "deactivate" }
export function PartnerAction({ action, busy, onClose, onConfirm }: {
  action: DirectoryAction | null; busy: boolean; onClose: () => void; onConfirm: () => void;
}) {
  const { t } = useTranslation();
  return <Dialog open={!!action} onOpenChange={open => { if (!open && !busy) onClose(); }}>
    <DialogContent><DialogHeader><DialogTitle>{t(`collaborators.${action?.kind ?? "delete"}`)}</DialogTitle>
      <DialogDescription>{t(`collaborators.confirm.${action?.kind ?? "delete"}`, { name: action?.partner.partnerName })}</DialogDescription>
    </DialogHeader><div className="flex justify-end gap-2"><Button variant="outline" disabled={busy}
      onClick={onClose}>{t("collaborators.close")}</Button><Button disabled={busy}
      variant={action?.kind === "delete" ? "destructive" : "default"} onClick={onConfirm}>
      {t(busy ? "collaborators.saving" : `collaborators.${action?.kind ?? "delete"}`)}</Button></div></DialogContent>
  </Dialog>;
}
