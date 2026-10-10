import { useTranslation } from "react-i18next";
import type { Campaign, Timeline } from "@/pages/campaign/types";

export function CampaignDetail({ campaign }: { campaign: Campaign }) {
  const { t, i18n } = useTranslation();
  const timeline = JSON.parse(campaign.timeline || "{}") as Timeline;
  return <article className="space-y-4 break-words">
    <h3 className="text-lg font-semibold">{campaign.name}</h3>
    <p className="text-sm text-muted-foreground">{t(`campaign.status.${campaign.status}`)} · {t("campaign.version", {
      version: campaign.contentVersion, packageVersion: campaign.packageTermsVersion,
    })}</p>
    <div><h4 className="font-medium">{t("campaign.strategy")}</h4>
      <p className="whitespace-pre-wrap">{campaign.strategyDetail || t("campaign.notSet")}</p></div>
    <div><h4 className="font-medium">{t("campaign.brand")}</h4>
      <p className="whitespace-pre-wrap">{campaign.brandGuideline || t("campaign.notSet")}</p></div>
    <p>{t("campaign.startDate")}: {timeline.startDate || t("campaign.notSet")} · {t("campaign.endDate")}: {timeline.endDate || t("campaign.notSet")}</p>
    <h4 className="font-medium">{t("campaign.milestones")}</h4>
    <ul>{timeline.milestones?.map((milestone, index) => <li key={index}>{milestone.date} · {milestone.name}</li>)}</ul>
    <h4 className="font-medium">{t("campaign.totalDeliverables")}</h4>
    <ul>{campaign.deliverablePlan.map(item => <li key={item.id}>{item.name} · {item.quantity} {item.unit}</li>)}</ul>
    <h4 className="font-medium">{t("campaign.workItems")}</h4>
    {!campaign.workItems.length && <p className="text-muted-foreground">{t("campaign.noWorkItems")}</p>}
    <ul className="space-y-2">{campaign.workItems.map(item => <li key={item.id} className="rounded-xl border p-3">
      <p>{item.name} · {t(`campaign.types.${item.type}`)}</p>
      <p className="text-sm text-muted-foreground">{t("campaign.dueDate")}: {new Date(item.dueDate).toLocaleString(i18n.language)}</p>
    </li>)}</ul>
  </article>;
}
