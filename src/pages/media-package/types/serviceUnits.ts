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
    deliverables: (details?.deliverables ?? []).map((item) => ({
      ...item,
      unit: SERVICE_UNITS[item.serviceType],
    })),
  };
}
