import type {
  PackageServiceType,
  PackageOfferingDetails,
} from "@/pages/media-package/types/mediaPackage";

export const SERVICE_UNITS: Record<PackageServiceType, string> = {
  SOCIAL_POST: "bài",
  EVENT_PLANNING: "sự kiện",
  LIVESTREAM_PREPARATION: "buổi",
  PRESS_RECOMMENDATION: "bài",
  WORKSHOP_SUPPORT: "buổi",
  SHORT_VIDEO: "video",
  KOL_BOOKING: "KOL",
  EMAIL_NEWSLETTER: "bản tin",
};

export function copyOfferingDetails(details?: PackageOfferingDetails | null) {
  return {
    // Custom packages can't include Livestream (backend rejects it on save);
    // drop it if the source template still carries one from before that rule.
    deliverables: (details?.deliverables ?? [])
      .filter((item) => item.serviceType !== "LIVESTREAM_PREPARATION")
      .map((item) => ({
        ...item,
        unit: SERVICE_UNITS[item.serviceType],
      })),
  };
}
