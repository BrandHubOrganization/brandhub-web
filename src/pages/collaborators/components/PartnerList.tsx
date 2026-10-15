import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { DirectoryPartner } from "../types";
interface Props {
  partners: DirectoryPartner[];
  busy: boolean;
  onDetail: (partner: DirectoryPartner) => void;
  onEdit: (partner: DirectoryPartner) => void;
  onAction: (partner: DirectoryPartner, action: "delete" | "deactivate") => void;
}
export function PartnerList({ partners, busy, onDetail, onEdit, onAction }: Props) {
  const { t } = useTranslation();
  if (!partners.length) return <p className="py-10 text-muted-foreground">{t("collaborators.empty")}</p>;
  return <ul aria-label={t("collaborators.title")} className="divide-y rounded-xl border bg-card">
    {partners.map(partner => <li key={partner.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 space-y-2"><button type="button" onClick={() => onDetail(partner)}
        className="cursor-pointer break-words text-left font-semibold underline-offset-4 hover:underline focus-visible:outline-ring">
        {partner.partnerName}</button>
        <div className="flex flex-wrap items-center gap-2"><span className="text-sm text-muted-foreground">
          {t(`campaign.partners.types.${partner.partnerType}`)}</span><Badge variant="outline">
          {t(partner.isActive ? "collaborators.active" : "collaborators.inactive")}</Badge></div>
        {partner.deleteBlockedReason && <p className="max-w-xl text-sm text-muted-foreground">
          {t(`collaborators.blocked.${partner.deleteBlockedReason}`)}</p>}</div>
      <div className="flex shrink-0 flex-wrap gap-2"><Button variant="outline" disabled={busy} onClick={() => onEdit(partner)}>
        {t("collaborators.edit")}</Button>
        {partner.isActive && <Button variant="outline" disabled={busy} onClick={() => onAction(partner, "deactivate")}>
          {t("collaborators.deactivate")}</Button>}
        {partner.canDelete && <Button variant="destructive" disabled={busy} onClick={() => onAction(partner, "delete")}>
          {t("collaborators.delete")}</Button>}</div>
    </li>)}
  </ul>;
}
