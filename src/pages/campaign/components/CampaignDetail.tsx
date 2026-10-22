import { useTranslation } from "react-i18next";
import {
  Calendar,
  Target,
  Sparkles,
  Clock,
  Layers,
  ListChecks,
  ArrowRight,
} from "lucide-react";
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

  const totalDeliverableQuantity = campaign.deliverablePlan.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0),
    0,
  );
  const totalWorkItems = campaign.workItems.length;

  return (
    <article
      id="campaign-plan"
      className="border-border bg-card min-w-0 scroll-mt-6 space-y-6 rounded-2xl border p-4 sm:p-6 shadow-xs"
    >
      {/* Header */}
      <header className="space-y-3 border-border/60 border-b pb-5">
        <div className="flex flex-wrap items-center gap-2.5">
          <Badge
            variant={
              campaign.status === "APPROVED" || campaign.status === "COMPLETED"
                ? "APPROVED"
                : campaign.status === "IN_PROGRESS"
                  ? "SCHEDULED"
                  : "outline"
            }
            className="font-medium"
          >
            {t(`campaign.status.${campaign.status}`)}
          </Badge>
          <span className="text-muted-foreground/80 text-xs">
            {t("campaign.version", {
              version: campaign.contentVersion,
              packageVersion: campaign.packageTermsVersion,
            })}
          </span>
        </div>
        <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground break-words">
          {campaign.name}
        </h3>
      </header>

      {/* Bento Grid Top Section: Strategy (Col 7) + Timeline (Col 5) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Bento: Strategy & Brand Guidelines */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <section className="bg-muted/15 border-border/70 flex-1 rounded-xl border p-4.5 sm:p-5 space-y-3 transition-colors">
            <div className="flex items-center gap-2 text-foreground">
              <div className="bg-brand-orange-soft text-brand-orange flex size-7 items-center justify-center rounded-lg">
                <Target className="size-4" />
              </div>
              <h4 className="text-sm font-semibold tracking-tight">
                {t("campaign.strategy")}
              </h4>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed break-words whitespace-pre-wrap pl-9">
              {campaign.strategyDetail || t("campaign.notSet")}
            </p>
          </section>

          <section className="bg-muted/15 border-border/70 flex-1 rounded-xl border p-4.5 sm:p-5 space-y-3 transition-colors">
            <div className="flex items-center gap-2 text-foreground">
              <div className="bg-amber-500/10 text-amber-600 dark:text-amber-400 flex size-7 items-center justify-center rounded-lg">
                <Sparkles className="size-4" />
              </div>
              <h4 className="text-sm font-semibold tracking-tight">
                {t("campaign.brand")}
              </h4>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed break-words whitespace-pre-wrap pl-9">
              {campaign.brandGuideline || t("campaign.notSet")}
            </p>
          </section>
        </div>

        {/* Right Bento: Timeline & Vertical Milestone Track */}
        <div className="lg:col-span-5 flex flex-col">
          <section className="bg-muted/15 border-border/70 h-full rounded-xl border p-4.5 sm:p-5 space-y-4">
            <div className="flex items-center gap-2 text-foreground">
              <div className="bg-sky-500/10 text-sky-600 dark:text-sky-400 flex size-7 items-center justify-center rounded-lg">
                <Calendar className="size-4" />
              </div>
              <h4 className="text-sm font-semibold tracking-tight">
                {t("campaign.milestones")}
              </h4>
            </div>

            {/* Date Span Banner */}
            <div className="bg-card border-border/80 flex items-center justify-between gap-3 rounded-lg border px-3.5 py-2.5 text-xs">
              <div className="min-w-0">
                <span className="text-muted-foreground block text-2xs uppercase tracking-wider font-semibold">
                  {t("campaign.startDate")}
                </span>
                <span className="mt-0.5 font-medium text-foreground block truncate">
                  {date(timeline.startDate)}
                </span>
              </div>
              <ArrowRight className="size-3.5 text-muted-foreground shrink-0" />
              <div className="min-w-0 text-right">
                <span className="text-muted-foreground block text-2xs uppercase tracking-wider font-semibold">
                  {t("campaign.endDate")}
                </span>
                <span className="mt-0.5 font-medium text-foreground block truncate">
                  {date(timeline.endDate)}
                </span>
              </div>
            </div>

            {/* Vertical Milestone Track */}
            <div className="pt-2">
              {!timeline.milestones?.length ? (
                <p className="text-muted-foreground text-xs italic pl-2">
                  {t("campaign.notSet")}
                </p>
              ) : (
                <ol className="relative ml-2 space-y-4 border-l-2 border-brand-orange/30 pl-4">
                  {timeline.milestones.map((milestone, index) => (
                    <li key={index} className="relative group">
                      <span
                        className="bg-brand-orange ring-background absolute -left-[21px] top-1.5 size-2.5 rounded-full ring-4 shadow-xs"
                        aria-hidden="true"
                      />
                      <time className="text-muted-foreground text-2xs font-semibold uppercase tracking-wider">
                        {date(milestone.date)}
                      </time>
                      <p className="text-sm font-medium text-foreground break-words mt-0.5">
                        {milestone.name}
                      </p>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Bento Grid Bottom Section: Deliverables Plan (Col 6) + Work Items Summary (Col 6) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 border-border/60 border-t pt-5">
        {/* Deliverables Card with Progress Tracker */}
        <section className="lg:col-span-6 bg-muted/15 border-border/70 rounded-xl border p-4.5 sm:p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex size-7 items-center justify-center rounded-lg">
                <Layers className="size-4" />
              </div>
              <h4 className="text-sm font-semibold tracking-tight">
                {t("campaign.totalDeliverables")}
              </h4>
            </div>
            <Badge variant="outline" className="font-semibold text-xs">
              {totalDeliverableQuantity} {t("campaign.ui.totalQuantity")}
            </Badge>
          </div>

          <div className="space-y-3">
            {campaign.deliverablePlan.map((item) => {
              const allocatedWorkItems = campaign.workItems.filter(
                (w) => w.deliverableId === item.id,
              ).length;
              const target = Number(item.quantity) || 1;
              const percentage = Math.min(
                100,
                Math.round((allocatedWorkItems / target) * 100),
              );

              return (
                <div
                  key={item.id}
                  className="bg-card border-border/70 rounded-lg border p-3 space-y-2 transition-shadow hover:shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-2 text-xs sm:text-sm">
                    <span className="font-medium text-foreground break-words min-w-0">
                      {item.name}
                    </span>
                    <span className="shrink-0 font-semibold text-brand-orange">
                      {item.quantity} {item.unit}
                    </span>
                  </div>

                  {/* Progress bar representing work item assignment */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-2xs text-muted-foreground">
                      <span>{t("campaign.workItems")}</span>
                      <span>
                        {allocatedWorkItems} / {item.quantity} ({percentage}%)
                      </span>
                    </div>
                    <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
                      <div
                        className="bg-brand-orange h-full rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Work Items Summary */}
        <section className="lg:col-span-6 bg-muted/15 border-border/70 rounded-xl border p-4.5 sm:p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="bg-brand-orange-soft text-brand-orange flex size-7 items-center justify-center rounded-lg">
                <ListChecks className="size-4" />
              </div>
              <h4 className="text-sm font-semibold tracking-tight">
                {t("campaign.workItems")}
              </h4>
            </div>
            <Badge variant="secondary" className="font-semibold text-xs">
              {totalWorkItems}
            </Badge>
          </div>

          {!campaign.workItems.length ? (
            <p className="text-muted-foreground text-xs italic py-4">
              {t("campaign.noWorkItems")}
            </p>
          ) : (
            <ul className="grid gap-2.5 sm:grid-cols-2 max-h-[360px] overflow-y-auto no-scrollbar pr-1">
              {campaign.workItems.map((item) => (
                <li
                  key={item.id}
                  className="bg-card border-border/70 rounded-lg border p-3 flex flex-col justify-between gap-2 shadow-2xs hover:border-brand-orange/40 transition-colors"
                >
                  <p className="text-xs sm:text-sm font-medium text-foreground break-words line-clamp-2">
                    {item.name}
                  </p>
                  <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1 border-border/40 border-t">
                    <Badge variant="outline" className="text-2xs py-0">
                      {t(`campaign.types.${item.type}`)}
                    </Badge>
                    <span className="text-muted-foreground inline-flex items-center gap-1 text-2xs">
                      <Clock className="size-3" />
                      {new Intl.DateTimeFormat(i18n.language, {
                        dateStyle: "short",
                        timeStyle: "short",
                      }).format(new Date(item.dueDate))}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </article>
  );
}
