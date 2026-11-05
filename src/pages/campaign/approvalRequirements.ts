import type { TFunction } from "i18next";
import type { Campaign, Timeline } from "@/pages/campaign/types";

export function missingApprovalFields(campaign: Campaign, t: TFunction) {
  if (campaign.status !== "DRAFT") return [];

  const timeline = JSON.parse(campaign.timeline || "{}") as Timeline;
  const missing: string[] = [];
  if (!campaign.strategyDetail?.trim()) missing.push(t("campaign.strategy"));
  if (!timeline.startDate) missing.push(t("campaign.startDate"));
  if (!timeline.endDate) missing.push(t("campaign.endDate"));
  if (!campaign.workItems.length) missing.push(t("campaign.workItems"));
  for (const item of campaign.workItems) {
    if (!item.dueDate) {
      missing.push(t("campaign.review.missingDeadline", { task: item.name }));
    }
  }
  return missing;
}
