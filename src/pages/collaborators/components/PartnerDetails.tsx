import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { DirectoryPartner } from "../types";
export function PartnerDetails({ partner, onClose }: { partner: DirectoryPartner; onClose: () => void }) {
  const { t } = useTranslation();
  return <Dialog open onOpenChange={open => { if (!open) onClose(); }}>
    <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
      <DialogHeader><DialogTitle className="break-words">{partner.partnerName}</DialogTitle>
        <DialogDescription>{t(`campaign.partners.types.${partner.partnerType}`)} · {t(partner.isActive
          ? "collaborators.active" : "collaborators.inactive")}</DialogDescription></DialogHeader>
      <dl className="space-y-3">{Object.entries(partner.contactInfo).map(([key, value]) => <div key={key}>
        <dt className="text-sm text-muted-foreground">{t(`collaborators.${key}`, { defaultValue: key })}</dt>
        <dd className="break-words whitespace-pre-wrap">{typeof value === "string" ? value : JSON.stringify(value)}</dd>
      </div>)}<div><dt className="text-sm text-muted-foreground">{t("collaborators.notes")}</dt>
        <dd className="break-words whitespace-pre-wrap">{partner.notes || t("collaborators.noNotes")}</dd></div></dl>
      {partner.deleteBlockedReason && <p className="text-sm text-muted-foreground">
        {t(`collaborators.blocked.${partner.deleteBlockedReason}`)}</p>}
    </DialogContent>
  </Dialog>;
}
