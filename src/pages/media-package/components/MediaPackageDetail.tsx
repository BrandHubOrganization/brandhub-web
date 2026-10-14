import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OfferingSummary } from "./OfferingSummary";
import {
  formatPackageType,
  formatPackageValue,
} from "../lib/formatMediaPackage";
import type { MediaPackage } from "../types/mediaPackage";

export function MediaPackageDetail({
  mediaPackage,
  open,
  onOpenChange,
}: {
  mediaPackage: MediaPackage;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t, i18n } = useTranslation();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto overscroll-contain sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="pr-6 text-xl break-words">
            {mediaPackage.name}
          </DialogTitle>
          <DialogDescription>
            {formatPackageType(mediaPackage.type, t)}
          </DialogDescription>
        </DialogHeader>
        <div className="bg-muted/50 rounded-xl p-4">
          <p className="text-2xl font-semibold tracking-tight">
            {formatPackageValue(mediaPackage, i18n.language, t)}
          </p>
          {mediaPackage.durationWeeks != null && (
            <p className="text-muted-foreground mt-1 text-sm">
              {t("mediaPackage.values.duration", {
                count: mediaPackage.durationWeeks,
              })}
            </p>
          )}
        </div>
        <section className="space-y-2">
          <h3 className="text-sm font-semibold">
            {t("mediaPackage.selected.scopeTitle")}
          </h3>
          <p className="text-muted-foreground text-sm leading-6 break-words whitespace-pre-line">
            {mediaPackage.scopeDescription ||
              t("mediaPackage.catalog.noDescription")}
          </p>
        </section>
        <OfferingSummary value={mediaPackage} />
      </DialogContent>
    </Dialog>
  );
}
