import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import type { Campaign, Timeline } from "../types";

export function CampaignDetail({ campaign }: { campaign: Campaign }) {
  const { t, i18n } = useTranslation();
  const timeline = JSON.parse(campaign.timeline || "{}") as Timeline;
  const date = (value?: string) =>
    value
      ? new Intl.DateTimeFormat(i18n.language, { dateStyle: "medium" }).format(
          new Date(value),
        )
      : t("campaign.notSet");
  return (
    <article
      id="campaign-plan"
      className="border-border bg-card min-w-0 scroll-mt-6 space-y-6 rounded-xl border p-4 sm:p-6"
    >
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">
            {t(`campaign.status.${campaign.status}`)}
          </Badge>
          <span className="text-muted-foreground text-xs">
            {t("campaign.version", {
              version: campaign.contentVersion,
              packageVersion: campaign.packageTermsVersion,
            })}
          </span>
        </div>
        <h3 className="text-2xl font-semibold tracking-tight break-words">
          {campaign.name}
        </h3>
      </header>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-2">
          <h4 className="text-sm font-semibold">{t("campaign.strategy")}</h4>
          <p className="text-muted-foreground text-sm leading-7 break-words whitespace-pre-wrap">
            {campaign.strategyDetail || t("campaign.notSet")}
          </p>
        </section>
        <section className="space-y-2">
          <h4 className="text-sm font-semibold">{t("campaign.brand")}</h4>
          <p className="text-muted-foreground text-sm leading-7 break-words whitespace-pre-wrap">
            {campaign.brandGuideline || t("campaign.notSet")}
          </p>
        </section>
      </div>
      <div className="border-border grid gap-6 border-t pt-6 lg:grid-cols-2">
        <section className="space-y-4">
          <div className="bg-muted/40 grid grid-cols-2 gap-4 rounded-lg p-4">
            <div>
              <p className="text-muted-foreground text-xs">
                {t("campaign.startDate")}
              </p>
              <p className="mt-1 text-sm font-medium">
                {date(timeline.startDate)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">
                {t("campaign.endDate")}
              </p>
              <p className="mt-1 text-sm font-medium">
                {date(timeline.endDate)}
              </p>
            </div>
          </div>
          <h4 className="text-sm font-semibold">{t("campaign.milestones")}</h4>
          {!timeline.milestones?.length && (
            <p className="text-muted-foreground text-sm">
              {t("campaign.notSet")}
            </p>
          )}
          <ol className="border-border ml-2 space-y-4 border-l">
            {timeline.milestones?.map((milestone, index) => (
              <li key={index} className="relative pl-5">
                <span
                  className="bg-brand-orange absolute top-1.5 -left-1 size-2 rounded-full"
                  aria-hidden="true"
                />
                <p className="text-muted-foreground text-xs">
                  {date(milestone.date)}
                </p>
                <p className="mt-1 text-sm font-medium break-words">
                  {milestone.name}
                </p>
              </li>
            ))}
          </ol>
        </section>
        <section className="space-y-3">
          <h4 className="text-sm font-semibold">
            {t("campaign.totalDeliverables")}
          </h4>
          <p className="text-muted-foreground text-xs leading-5">
            {t("campaign.ui.totalQuantity")}
          </p>
          <ul className="divide-border border-border divide-y rounded-lg border px-4">
            {campaign.deliverablePlan.map((item) => (
              <li
                key={item.id}
                className="flex items-start justify-between gap-3 py-3 text-sm"
              >
                <span className="min-w-0 break-words">{item.name}</span>
                <span className="max-w-[45%] text-right font-medium break-words">
                  {item.quantity} {item.unit}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <section className="border-border space-y-3 border-t pt-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-semibold">{t("campaign.workItems")}</h4>
          <Badge variant="secondary">{campaign.workItems.length}</Badge>
        </div>
        {!campaign.workItems.length && (
          <p className="text-muted-foreground text-sm">
            {t("campaign.noWorkItems")}
          </p>
        )}
        <ul className="grid gap-3 md:grid-cols-2">
          {campaign.workItems.map((item) => (
            <li
              key={item.id}
              className="border-border min-w-0 rounded-lg border p-4"
            >
              <p className="text-sm font-medium break-words">{item.name}</p>
              <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-2 text-xs">
                <Badge variant="outline">
                  {t(`campaign.types.${item.type}`)}
                </Badge>
                <span>
                  {t("campaign.dueDate")}:{" "}
                  {new Intl.DateTimeFormat(i18n.language, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(item.dueDate))}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
