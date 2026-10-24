import { useTranslation } from "react-i18next";
import {
  Calendar,
  CheckCircle2,
  FileText,
  Layers,
  Newspaper,
  Radio,
  Share2,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { HelpHint } from "@/components/shared/HelpHint";
import type { OfferingFields, PackageServiceType } from "../types/mediaPackage";

function getServiceIcon(serviceType: PackageServiceType | string) {
  switch (serviceType) {
    case "SOCIAL_POST":
      return <Share2 className="size-4" aria-hidden="true" />;
    case "EVENT_PLANNING":
      return <Calendar className="size-4" aria-hidden="true" />;
    case "LIVESTREAM_PREPARATION":
      return <Radio className="size-4" aria-hidden="true" />;
    case "PRESS_RECOMMENDATION":
      return <Newspaper className="size-4" aria-hidden="true" />;
    case "WORKSHOP_SUPPORT":
      return <Users className="size-4" aria-hidden="true" />;
    default:
      return <Layers className="size-4" aria-hidden="true" />;
  }
}

export function OfferingSummary({ value }: { value: OfferingFields }) {
  const { t } = useTranslation();
  if (!value.offeringDetails) return null;

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <h3 className="text-foreground text-sm font-semibold tracking-tight">
            {t("mediaPackage.ui.deliverables")}
          </h3>
          <HelpHint label={t("mediaPackage.ui.deliverables")}>
            {t("mediaPackage.ui.totalQuantity")}
          </HelpHint>
        </div>
        {value.offeringDetails.maxChanges != null && (
          <Badge variant="outline" className="text-xs font-normal">
            {t("mediaPackage.offering.revisions")}:{" "}
            <span className="ml-1 font-semibold">
              {value.offeringDetails.maxChanges}
            </span>
          </Badge>
        )}
      </div>

      <ul className="space-y-2.5">
        {value.offeringDetails.deliverables.map((item) => (
          <li
            key={item.id}
            className="border-border/70 bg-card hover:border-border/90 flex flex-col gap-3 rounded-xl border p-4 transition-colors"
          >
            {/* Header: Service icon + Name & Service type | Quantity */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <div className="bg-brand-orange/10 text-brand-orange mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg">
                  {getServiceIcon(item.serviceType)}
                </div>
                <div className="min-w-0">
                  <h4 className="text-foreground text-sm font-semibold break-words">
                    {item.name}
                  </h4>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    {t(`mediaPackage.offering.services.${item.serviceType}`, {
                      defaultValue: item.serviceType,
                    })}
                  </p>
                </div>
              </div>
              <span className="bg-brand-orange/10 text-brand-orange shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold">
                {item.quantity} {item.unit}
              </span>
            </div>

            {/* Flat details section without nested boxes */}
            {(item.description || item.acceptanceCriteria) && (
              <div className="border-border/50 mt-0.5 grid gap-3 border-t pt-3 text-xs sm:grid-cols-2">
                {item.description && (
                  <div className="min-w-0">
                    <div className="text-muted-foreground mb-1 flex items-center gap-1.5 font-medium">
                      <FileText className="size-3.5 shrink-0" aria-hidden="true" />
                      <span>{t("mediaPackage.compact.requirements")}</span>
                    </div>
                    <p className="text-foreground/85 leading-relaxed break-words whitespace-pre-line">
                      {item.description}
                    </p>
                  </div>
                )}
                {item.acceptanceCriteria && (
                  <div className="min-w-0">
                    <div className="text-muted-foreground mb-1 flex items-center gap-1.5 font-medium">
                      <CheckCircle2
                        className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400"
                        aria-hidden="true"
                      />
                      <span>{t("mediaPackage.offering.acceptance")}</span>
                    </div>
                    <p className="text-foreground/85 leading-relaxed break-words whitespace-pre-line">
                      {item.acceptanceCriteria}
                    </p>
                  </div>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
