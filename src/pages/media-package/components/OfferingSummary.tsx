import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { HelpHint } from "@/components/shared/HelpHint";
import type { OfferingFields } from "../types/mediaPackage";

export function OfferingSummary({ value }: { value: OfferingFields }) {
  const { t } = useTranslation();
  if (!value.offeringDetails) return null;
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-1">
          <h3 className="font-semibold">{t("mediaPackage.ui.deliverables")}</h3>
          <HelpHint label={t("mediaPackage.ui.deliverables")}>
            {t("mediaPackage.ui.totalQuantity")}
          </HelpHint>
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
      <ul className="space-y-3">
        {value.offeringDetails.deliverables.map((item) => (
          <li key={item.id} className="overflow-hidden rounded-xl border">
            <div className="bg-muted/30 border-b p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold break-words">
                    {item.name}
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {t(`mediaPackage.offering.services.${item.serviceType}`)}
                  </p>
                </div>
                <span className="bg-brand-orange-soft text-foreground shrink-0 rounded-md border px-2.5 py-1 text-sm font-semibold">
                  {item.quantity} {item.unit}
                </span>
              </div>
            </div>
            {(item.description || item.acceptanceCriteria) && (
              <dl className="grid gap-3 p-3 text-sm sm:grid-cols-2">
                {item.description && (
                  <div className="min-w-0">
                    <dt className="text-muted-foreground mb-1 text-xs font-medium">
                      {t("mediaPackage.compact.requirements")}
                    </dt>
                    <dd className="leading-6 break-words whitespace-pre-line">
                      {item.description}
                    </dd>
                  </div>
                )}
                {item.acceptanceCriteria && (
                  <div className="bg-muted/30 min-w-0 rounded-lg p-2.5">
                    <dt className="mb-1 text-xs font-semibold">
                      {t("mediaPackage.offering.acceptance")}
                    </dt>
                    <dd className="leading-6 break-words whitespace-pre-line">
                      {item.acceptanceCriteria}
                    </dd>
                  </div>
                )}
              </dl>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
