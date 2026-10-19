import { useTranslation } from "react-i18next";
import type { ReactNode } from "react";
import { InlineWorkArea } from "@/components/shared/InlineWorkArea";
import { OfferingSummary } from "./OfferingSummary";
import { PackageFacts } from "@/pages/media-package/components/PackageFacts";
import type { MediaPackage } from "../types/mediaPackage";

export function MediaPackageDetail({
  mediaPackage,
  onClose,
  actions,
}: {
  mediaPackage: MediaPackage;
  onClose: () => void;
  actions?: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <InlineWorkArea
      title={mediaPackage.name}
      backLabel={t("mediaPackage.ui.backToPackages")}
      onBack={onClose}
      returnFocusTo={`[data-package-details="${CSS.escape(mediaPackage.id)}"]`}
    >
      <PackageFacts mediaPackage={mediaPackage} />
      {mediaPackage.scopeDescription && (
        <section className="space-y-2">
          <h3 className="text-sm font-semibold">
            {t("mediaPackage.selected.scopeTitle")}
          </h3>
          <p className="text-muted-foreground text-sm leading-6 break-words whitespace-pre-line">
            {mediaPackage.scopeDescription ||
              t("mediaPackage.catalog.noDescription")}
          </p>
        </section>
      )}
      <OfferingSummary value={mediaPackage} />
      {actions && (
        <footer className="border-border flex flex-wrap gap-3 border-t pt-5">
          {actions}
        </footer>
      )}
    </InlineWorkArea>
  );
}
