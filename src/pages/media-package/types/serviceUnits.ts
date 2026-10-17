import type {
  PackageServiceType,
  PackageOfferingDetails,
} from "@/pages/media-package/types/mediaPackage";

export const SERVICE_UNITS: Record<PackageServiceType, string> = {
  SOCIAL_POST: "bài",
  EVENT_PLANNING: "sự kiện",
  LIVESTREAM_PREPARATION: "buổi",
  PRESS_RECOMMENDATION: "danh sách đề xuất",
  WORKSHOP_SUPPORT: "buổi",
};

export function copyOfferingDetails(details?: PackageOfferingDetails | null) {
  return {
    maxChanges: details?.maxChanges ?? 2,
    deliverables: (details?.deliverables ?? []).map((item) => ({
      ...item,
      unit: SERVICE_UNITS[item.serviceType],
    })),
  };
}
