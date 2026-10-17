import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import type { OfferingFields } from "../types/mediaPackage";

export function OfferingSummary({ value }: { value: OfferingFields }) {
  const { t } = useTranslation();
  if (!value.offeringDetails) return null;
  return (
    <section className="border-border space-y-4 rounded-xl border p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">{t("mediaPackage.ui.deliverables")}</h3>
        </div>
        {value.offeringDetails.maxChanges != null && (
          <Badge
            variant="outline"
            className="h-auto text-left whitespace-normal"
          >
            {t("mediaPackage.offering.revisions")}:{" "}
            {value.offeringDetails.maxChanges}
          </Badge>
        )}
      </div>
      <p className="text-muted-foreground text-xs leading-5">
        {t("mediaPackage.ui.totalQuantity")}
      </p>
      <ul className="divide-border divide-y">
        {value.offeringDetails.deliverables.map((item) => (
          <li key={item.id} className="space-y-2 py-4 first:pt-0 last:pb-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium break-words">{item.name}</p>
                <p className="text-muted-foreground mt-1 text-xs">
                  {t(`mediaPackage.offering.services.${item.serviceType}`)}
                </p>
              </div>
              <span className="bg-muted shrink-0 rounded-md px-2.5 py-1 text-sm font-medium">
                {item.quantity} {item.unit}
              </span>
            </div>
            {item.description && (
              <p className="text-muted-foreground text-sm leading-6 break-words whitespace-pre-line">
                {item.description}
              </p>
            )}
            {item.acceptanceCriteria && (
              <div className="bg-muted/50 rounded-lg p-3 text-sm leading-6">
                <p className="font-medium">
                  {t("mediaPackage.offering.acceptance")}
                </p>
                <p className="text-muted-foreground break-words whitespace-pre-line">
                  {item.acceptanceCriteria}
                </p>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
