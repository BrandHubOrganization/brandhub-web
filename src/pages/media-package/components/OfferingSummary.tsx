import { useTranslation } from "react-i18next";
import type { OfferingFields } from "@/pages/media-package/types/mediaPackage";

export function OfferingSummary({ value }: { value: OfferingFields }) {
  const { t } = useTranslation();
  if (!value.offeringModel || !value.offeringDetails) return null;
  return <section className="space-y-2 rounded-xl border border-border p-3 text-sm">
    <h3 className="font-semibold">{t(`mediaPackage.offering.models.${value.offeringModel}`)}</h3>
    <p className="text-xs text-muted-foreground">{t(`mediaPackage.offering.hints.${value.offeringModel}`)}</p>
    {value.offeringDetails.maxChanges != null && <p>{t("mediaPackage.offering.revisions")}: {value.offeringDetails.maxChanges}</p>}
    <ul className="space-y-2">
      {value.offeringDetails.deliverables.map(item => <li key={item.id} className="border-t border-border pt-2">
        <p>{item.name} — {item.quantity} {item.unit}</p>
        <p className="text-xs text-muted-foreground">{t(`mediaPackage.offering.services.${item.serviceType}`)}</p>
        {item.description && <p className="whitespace-pre-line">{item.description}</p>}
        {item.acceptanceCriteria && <p>{t("mediaPackage.offering.acceptance")}: {item.acceptanceCriteria}</p>}
      </li>)}
    </ul>
  </section>;
}
