import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Clock, Wallet, PackageCheck } from "lucide-react";
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
      className="border-border/80 bg-card text-card-foreground relative w-full min-w-0 overflow-hidden rounded-2xl border shadow-sm"
    >
      <header className="border-border/80 bg-card space-y-4 border-b px-5 py-5 sm:px-6 sm:py-6">
        {mediaPackage.agencyName && (
          <p className="text-brand-orange text-xs font-semibold tracking-wide uppercase [overflow-wrap:anywhere]">
            {mediaPackage.agencyName}
          </p>
        )}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <Title className="text-foreground min-w-0 flex-1 basis-full text-2xl leading-tight font-extrabold tracking-tight [overflow-wrap:anywhere] sm:basis-0 sm:text-3xl">
            {mediaPackage.name}
          </Title>
          {actions && (
            <div className="ml-auto flex shrink-0 flex-wrap items-start gap-2">
              {actions}
            </div>
          )}
        </div>
        <dl className="flex flex-wrap gap-3 text-sm">
          <div className="border-border/70 bg-background/85 inline-flex min-w-0 items-center gap-2 rounded-xl border px-3.5 py-2 shadow-2xs">
            <Wallet className="text-brand-orange size-4 shrink-0" aria-hidden="true" />
            <dt className="text-muted-foreground text-xs font-medium">
              {t("mediaPackage.guest.budget")}:
            </dt>
            <dd className="text-foreground text-base font-bold [overflow-wrap:anywhere] tabular-nums">
              {budget}
            </dd>
          </div>
          <div className="border-border/70 bg-background/85 inline-flex min-w-0 items-center gap-2 rounded-xl border px-3.5 py-2 shadow-2xs">
            <Clock className="text-brand-orange size-4 shrink-0" aria-hidden="true" />
            <dt className="text-muted-foreground text-xs font-medium">
              {t("mediaPackage.guest.duration")}:
            </dt>
            <dd className="text-foreground text-base font-bold">
              {mediaPackage.durationWeeks == null
                ? t("mediaPackage.guest.toBeAgreed")
                : t("mediaPackage.values.duration", {
                    count: mediaPackage.durationWeeks,
                  })}
            </dd>
          </div>
        </dl>
      </header>
      <div className="space-y-6 p-5 sm:p-6">
        {mediaPackage.scopeDescription?.trim() && (
          <section className="border-border/60 bg-muted/25 space-y-2 rounded-xl border p-4">
            <SectionTitle className="text-foreground text-sm font-bold tracking-wide">
              {t("mediaPackage.proposal.packageDescription")}
            </SectionTitle>
            <ExpandablePackageText
              key={mediaPackage.scopeDescription}
              text={mediaPackage.scopeDescription}
            />
          </section>
        )}
        {items.length > 0 && (
          <section className="min-w-0 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <SectionTitle className="text-foreground flex items-center gap-2 text-sm font-bold tracking-wide">
                <PackageCheck className="text-brand-orange size-4" aria-hidden="true" />
                <span>{t("mediaPackage.proposal.deliverables")}</span>
              </SectionTitle>
              <span className="bg-muted text-muted-foreground rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums">
                {items.length}
              </span>
            </div>
            <div className="border-border/80 overflow-hidden rounded-xl border shadow-2xs">
              <table className="w-full table-fixed border-collapse text-left">
                <caption className="sr-only">
                  {t("mediaPackage.proposal.deliverables")}
                </caption>
                <thead className="bg-brand-orange-soft text-foreground">
                  <tr className="border-border border-b text-xs font-semibold">
                    <th scope="col" className="w-24 px-3 py-2.5 sm:w-28 sm:px-4">
                      {t("mediaPackage.offering.quantity")}
                    </th>
                    <th scope="col" className="px-3 py-2.5 sm:px-4">
                      {t("mediaPackage.proposal.item")}
                    </th>
                    <th
                      scope="col"
                      className="w-20 px-2 py-2.5 text-right sm:w-24 sm:px-4"
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
