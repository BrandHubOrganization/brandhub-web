import type { TFunction } from "i18next";
import type {
  MediaPackage,
  MediaPackageType,
  OfferingModel,
  PackageOfferingDetails,
} from "@/pages/media-package/types/mediaPackage";

const PACKAGE_TYPES: MediaPackageType[] = [
  "BY_DURATION",
  "BY_BUDGET",
  "FULL_DELEGATION",
];

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
  const termsType = terms.type;
  const type = PACKAGE_TYPES.includes(termsType as MediaPackageType)
    ? (termsType as MediaPackageType)
    : mediaPackage.type;
  return {
    ...mediaPackage,
    // New structured terms must come from the agreement, never the mutable catalogue.
    offeringModel: (terms.offeringModel as OfferingModel | null) ?? null,
    offeringDetails: (terms.offeringDetails as PackageOfferingDetails | null) ?? null,
    name: optionalString(terms.name, mediaPackage.name) ?? mediaPackage.name,
    type,
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

export function formatPackageType(type: MediaPackageType, t: TFunction) {
  return t(`mediaPackage.types.${type}`);
}

export function formatPackageValue(
  mediaPackage: MediaPackage,
  language: string,
  t: TFunction,
) {
  if (mediaPackage.type === "BY_DURATION") {
    return t("mediaPackage.values.duration", {
      count: mediaPackage.durationWeeks ?? 0,
    });
  }
  if (mediaPackage.type === "BY_BUDGET") {
    return new Intl.NumberFormat(language === "en" ? "en-US" : "vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(mediaPackage.budgetAmount ?? 0);
  }
  return t("mediaPackage.values.fullDelegation");
}
