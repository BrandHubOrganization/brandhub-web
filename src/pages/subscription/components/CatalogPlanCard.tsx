import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type {
  AgencySubscription,
  BillingPlan,
} from "@/services/agencyBillingService";

interface CatalogPlanCardProps {
  plan: BillingPlan;
  subscription: AgencySubscription | undefined;
  onUpgrade: () => void;
}

function formatStorage(bytes: string, locale: string) {
  const amount = BigInt(bytes);
  const units = [
    { label: "TB", scale: 1_000_000_000_000n },
    { label: "GB", scale: 1_000_000_000n },
    { label: "MB", scale: 1_000_000n },
    { label: "KB", scale: 1_000n },
    { label: "B", scale: 1n },
  ];
  const unit =
    units.find((candidate) => amount >= candidate.scale) ??
    units[units.length - 1];
  const value =
    Number(amount / unit.scale) +
    Number(((amount % unit.scale) * 100n) / unit.scale) / 100;
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value)} ${unit.label}`;
}

export function CatalogPlanCard({
  plan,
  subscription,
  onUpgrade,
}: CatalogPlanCardProps) {
  const { t, i18n } = useTranslation();
  const isAgency = plan.billingScope === "AGENCY";
  const isCurrent =
    isAgency &&
    subscription?.status === "ACTIVE" &&
    subscription.planCode === plan.code;
  const canUpgrade =
    isAgency &&
    plan.isSellable &&
    plan.checkoutEnabled &&
    subscription?.planCode === "BASIC" &&
    subscription.status === "ACTIVE" &&
    !isCurrent;
  const number = (value: number | string) =>
    new Intl.NumberFormat(i18n.language).format(BigInt(value));
  const feature = (key: string, value: number | string) =>
    t(`subscription.catalog.${key}`, { value: number(value) });
  const benefits = [
    ...(isAgency
      ? [
          feature("workspaces", plan.maxActiveWorkspaces),
          feature("members", plan.maxInternalMembers),
          feature("clients", plan.maxClients),
        ]
      : plan.maxPersonalSpaces !== null
        ? [feature("personalSpaces", plan.maxPersonalSpaces)]
        : []),
    t("subscription.catalog.storage", {
      value: formatStorage(plan.storageLimitBytes, i18n.language),
    }),
    feature("credits", plan.monthlyAiCredits),
    feature("concurrency", plan.maxConcurrentAiJobs),
    feature("activityHistory", plan.activityRetentionDays),
    feature("versionHistory", plan.versionRetentionDays),
    feature("trashHistory", plan.trashRetentionDays),
  ];
  const isFree = plan.priceMonthly !== null && BigInt(plan.priceMonthly) === 0n;
  const price =
    plan.priceMonthly === null
      ? t("subscription.catalog.pricePending")
      : isFree
        ? t("subscription.catalog.free")
        : new Intl.NumberFormat(i18n.language, {
            style: "currency",
            currency: plan.currency,
            maximumFractionDigits: 0,
          }).format(BigInt(plan.priceMonthly));
  const canRenew =
    plan.code === "PLUS" &&
    subscription?.planCode === "PLUS" &&
    subscription.status !== "SUSPENDED" &&
    !subscription.renewalScheduled &&
    plan.isSellable &&
    plan.checkoutEnabled;
  const action =
    subscription?.renewalScheduled && plan.code === "PLUS"
      ? "renewalScheduled"
      : canRenew
        ? "renew"
        : isCurrent
          ? "currentPlan"
          : !plan.isSellable
            ? "notOnSale"
            : isFree
              ? "free"
              : !subscription
                ? "subscriptionPending"
                : !plan.checkoutEnabled
                  ? "checkoutUnavailable"
                  : !canUpgrade
                    ? "changeUnavailable"
                    : "upgrade";

  return (
    <section
      aria-labelledby={`plan-${plan.id}`}
      data-testid={`plan-${plan.code}`}
      className="border-border bg-card text-card-foreground flex h-full min-w-0 flex-col rounded-xl border p-5"
    >
      <div className="mb-3 flex min-h-6 flex-wrap items-center justify-between gap-2">
        <span className="text-muted-foreground font-mono text-xs tracking-wide uppercase">
          {t(
            `subscription.catalog.${isAgency ? "agencyScope" : "personalScope"}`,
          )}
        </span>
        {isCurrent && (
          <Badge variant="secondary">
            {t("subscription.catalog.currentPlan")}
          </Badge>
        )}
      </div>
      <h2
        id={`plan-${plan.id}`}
        className="text-xl font-semibold tracking-tight"
      >
        {plan.displayName}
      </h2>
      <p className="text-muted-foreground mt-2 text-sm">
        {t(
          `subscription.catalog.${isAgency ? "agencyDescription" : "personalDescription"}`,
        )}
      </p>
      <div className="border-border my-5 flex min-h-24 flex-col justify-center border-y py-4">
        <p
          className={cn(
            "font-semibold tracking-tight break-words",
            plan.priceMonthly !== null && !isFree
              ? "font-mono text-2xl"
              : "text-lg",
          )}
          data-testid="plan-price"
        >
          {price}
        </p>
        {plan.priceMonthly !== null && !isFree && (
          <p className="text-muted-foreground mt-1 text-xs">
            {t("subscription.catalog.perMonth")}
          </p>
        )}
      </div>
      <ul className="mb-6 flex-1 space-y-3 text-sm">
        {benefits.map((benefit, index) => (
          <li key={index} className="flex items-start gap-2">
            <Check
              className="text-muted-foreground mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            <span>{benefit}</span>
          </li>
        ))}
      </ul>
      <Button
        className="disabled:border-border disabled:bg-muted disabled:text-muted-foreground min-h-11 w-full rounded-lg disabled:opacity-100"
        variant={canUpgrade || canRenew ? "orange" : "outline"}
        disabled={!canUpgrade && !canRenew}
        onClick={onUpgrade}
      >
        {t(`subscription.catalog.${action}`)}
      </Button>
    </section>
  );
}
