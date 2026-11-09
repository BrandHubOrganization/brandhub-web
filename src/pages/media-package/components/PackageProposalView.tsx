import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ExpandablePackageText } from "@/pages/media-package/components/ExpandablePackageText";
import { usePackageDisclosure } from "@/pages/media-package/hooks/usePackageDisclosure";
import { PackageDeliverableRow } from "@/pages/media-package/components/PackageDeliverableRow";
import type { MediaPackage } from "@/pages/media-package/types/mediaPackage";

type ProposalPackage = Pick<
  MediaPackage,
  | "name"
  | "budgetAmount"
  | "durationWeeks"
  | "scopeDescription"
  | "offeringDetails"
> & { agencyName?: string };
export function PackageProposalView({
  mediaPackage,
  titleAs = "h2",
  actions,
}: {
  mediaPackage: ProposalPackage;
  titleAs?: "h1" | "h2";
  actions?: ReactNode;
}) {
  const { t, i18n } = useTranslation();
  const Title = titleAs;
  const SectionTitle = titleAs === "h1" ? "h2" : "h3";
  const items = mediaPackage.offeringDetails?.deliverables ?? [];
  const { proposalRef, isOpen, toggle } = usePackageDisclosure(
    JSON.stringify([
      items,
      mediaPackage.scopeDescription,
      i18n.resolvedLanguage,
    ]),
  );
  const budget =
    mediaPackage.budgetAmount == null
      ? t("mediaPackage.guest.toBeAgreed")
      : new Intl.NumberFormat(i18n.resolvedLanguage ?? i18n.language, {
          style: "currency",
          currency: "VND",
          maximumFractionDigits: 0,
        }).format(mediaPackage.budgetAmount);
  return (
    <article
      ref={proposalRef}
      data-package-proposal
      className="border-border bg-card text-card-foreground w-full min-w-0 overflow-hidden rounded-xl border"
    >
      <header className="border-border border-l-brand-orange bg-muted space-y-2 border-b border-l-4 px-4 py-4 sm:px-5">
        {mediaPackage.agencyName && (
          <p className="text-muted-foreground text-xs font-medium [overflow-wrap:anywhere]">
            {mediaPackage.agencyName}
          </p>
        )}
        <div className="flex flex-wrap items-start justify-between gap-2">
          <Title className="min-w-0 flex-1 basis-full text-lg leading-7 font-semibold [overflow-wrap:anywhere] sm:basis-0">
            {mediaPackage.name}
          </Title>
          {actions && (
            <div className="ml-auto flex shrink-0 flex-wrap items-start gap-2">
              {actions}
            </div>
          )}
        </div>
        <dl className="flex flex-wrap gap-x-5 gap-y-1 text-sm leading-6">
          <div className="flex min-w-0 flex-wrap gap-x-1.5">
            <dt className="text-muted-foreground">
              {t("mediaPackage.guest.budget")}:
            </dt>
            <dd className="font-medium [overflow-wrap:anywhere] tabular-nums">
              {budget}
            </dd>
          </div>
          <div className="flex min-w-0 flex-wrap gap-x-1.5">
            <dt className="text-muted-foreground">
              {t("mediaPackage.guest.duration")}:
            </dt>
            <dd className="font-medium">
              {mediaPackage.durationWeeks == null
                ? t("mediaPackage.guest.toBeAgreed")
                : t("mediaPackage.values.duration", {
                    count: mediaPackage.durationWeeks,
                  })}
            </dd>
          </div>
        </dl>
      </header>
      <div className="space-y-4 p-4 sm:p-5">
        {mediaPackage.scopeDescription?.trim() && (
          <section className="text-muted-foreground space-y-1">
            <SectionTitle className="text-foreground text-sm font-semibold">
              {t("mediaPackage.proposal.packageDescription")}
            </SectionTitle>
            <ExpandablePackageText
              key={mediaPackage.scopeDescription}
              text={mediaPackage.scopeDescription}
            />
          </section>
        )}
        {items.length > 0 && (
          <section className="min-w-0 space-y-2">
            <SectionTitle className="text-sm font-semibold">
              {t("mediaPackage.proposal.deliverables")}
            </SectionTitle>
            <div className="border-border overflow-hidden rounded-lg border">
              <table className="w-full table-fixed border-collapse text-left">
                <caption className="sr-only">
                  {t("mediaPackage.proposal.deliverables")}
                </caption>
                <thead className="bg-brand-orange-soft text-foreground">
                  <tr className="border-border border-y text-xs">
                    <th scope="col" className="w-24 px-2 py-2 sm:w-28 sm:px-3">
                      {t("mediaPackage.offering.quantity")}
                    </th>
                    <th scope="col" className="px-2 py-2 sm:px-3">
                      {t("mediaPackage.proposal.item")}
                    </th>
                    <th
                      scope="col"
                      className="w-20 px-1 py-2 text-right sm:w-24 sm:px-2"
                    >
                      {t("mediaPackage.proposal.itemDetails")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <PackageDeliverableRow
                      key={item.id}
                      item={item}
                      open={isOpen(item.id)}
                      onToggle={() => toggle(item.id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
