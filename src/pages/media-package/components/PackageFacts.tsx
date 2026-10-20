import { useTranslation } from "react-i18next";
import type { MediaPackage } from "@/pages/media-package/types/mediaPackage";

export function PackageFacts({ mediaPackage }: { mediaPackage: MediaPackage }) {
  const { t, i18n } = useTranslation();
  const budget =
    mediaPackage.budgetAmount == null
      ? t("mediaPackage.compact.agreeLater")
      : new Intl.NumberFormat(i18n.language, {
          style: "currency",
          currency: "VND",
          maximumFractionDigits: 0,
        }).format(mediaPackage.budgetAmount);
  return (
    <dl className="bg-muted/20 grid grid-cols-1 gap-3 rounded-xl border p-3 sm:grid-cols-2">
      <div className="min-w-0">
        <dt className="text-muted-foreground text-xs">
          {t("mediaPackage.form.budgetLabel")}
        </dt>
        <dd className="mt-1 font-semibold break-words">{budget}</dd>
      </div>
      <div className="min-w-0 sm:border-l sm:pl-4">
        <dt className="text-muted-foreground text-xs">
          {t("mediaPackage.compact.duration")}
        </dt>
        <dd className="mt-1 font-semibold">
          {mediaPackage.durationWeeks == null
            ? t("mediaPackage.compact.agreeLater")
            : t("mediaPackage.values.duration", {
                count: mediaPackage.durationWeeks,
              })}
        </dd>
      </div>
    </dl>
  );
}
