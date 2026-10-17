import type { TFunction } from "i18next";
import type {
  MediaPackage,
  OfferingModel,
  PackageOfferingDetails,
} from "@/pages/media-package/types/mediaPackage";

function optionalString(value: unknown, fallback: string | null) {
  if (value === null) return null;
  return typeof value === "string" ? value : fallback;
}

function optionalNumber(value: unknown, fallback: number | null) {
  if (value === null) return null;
  return typeof value === "number" ? value : fallback;
}

export function applyEffectiveTerms(
  mediaPackage: MediaPackage,
  terms: Record<string, unknown>,
): MediaPackage {
  return {
    ...mediaPackage,
    // New structured terms must come from the agreement, never the mutable catalogue.
    offeringModel: (terms.offeringModel as OfferingModel | null) ?? null,
    offeringDetails: (terms.offeringDetails as PackageOfferingDetails | null) ?? null,
    name: optionalString(terms.name, mediaPackage.name) ?? mediaPackage.name,
    durationWeeks: optionalNumber(
      terms.durationWeeks,
      mediaPackage.durationWeeks,
    ),
    budgetAmount: optionalNumber(terms.budgetAmount, mediaPackage.budgetAmount),
    scopeDescription: optionalString(
      terms.scopeDescription,
      mediaPackage.scopeDescription,
    ),
  };
}

export function formatPackageValue(
  mediaPackage: MediaPackage,
  language: string,
  t: TFunction,
) {
  if (mediaPackage.budgetAmount != null) {
    return new Intl.NumberFormat(language === "en" ? "en-US" : "vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(mediaPackage.budgetAmount ?? 0);
  }
  if (mediaPackage.durationWeeks != null) {
    return t("mediaPackage.values.duration", { count: mediaPackage.durationWeeks });
  }
  return t("mediaPackage.values.toBeAgreed");
}
