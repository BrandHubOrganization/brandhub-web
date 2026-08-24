import { useTranslation } from "react-i18next";
import { Check, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { BillingCycle, Plan } from "../types/subscription";

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

export interface PlanCardProps {
  plan: Plan;
  billingCycle: BillingCycle;
  onSelect: (tier: Plan["tier"]) => void;
  isCurrentTierHigher: boolean;
}

export function PlanCard({
  plan,
  billingCycle,
  onSelect,
  isCurrentTierHigher,
}: PlanCardProps) {
  const { t } = useTranslation();
  const price =
    billingCycle === "MONTHLY" ? plan.priceMonthly : plan.priceYearly;

  return (
    <div
      className={cn(
        "border-border bg-card relative flex flex-col gap-4 rounded-xl border p-5",
        plan.isPopular && "border-brand-orange ring-brand-orange/30 ring-1",
      )}
    >
      {plan.isPopular && (
        <Badge className="bg-brand-orange absolute -top-3 left-4 gap-1 border-transparent text-white">
          <Sparkles className="size-3" /> {t("subscription.plans.popular")}
        </Badge>
      )}
      {plan.isCurrent && (
        <Badge variant="secondary" className="absolute -top-3 right-4">
          {t("subscription.plans.currentPlan")}
        </Badge>
      )}

      <div>
        <h3 className="text-foreground text-lg font-semibold">{plan.name}</h3>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-foreground text-2xl font-bold">
            {currency.format(price)}
          </span>
          <span className="text-muted-foreground text-xs">
            /
            {billingCycle === "MONTHLY"
              ? t("subscription.plans.perMonth")
              : t("subscription.plans.perYear")}
          </span>
        </div>
      </div>

      <ul className="flex flex-1 flex-col gap-2">
        {plan.features.map((feature) => (
          <li key={feature.label} className="flex items-center gap-2 text-sm">
            {feature.included ? (
              <Check className="text-brand-orange size-4 shrink-0" />
            ) : (
              <X className="text-muted-foreground size-4 shrink-0" />
            )}
            <span className={cn(!feature.included && "text-muted-foreground")}>
              {feature.label}
            </span>
          </li>
        ))}
      </ul>

      <Button
        variant={plan.isCurrent ? "outline" : "orange"}
        disabled={plan.isCurrent}
        onClick={() => onSelect(plan.tier)}
        className="w-full"
      >
        {plan.isCurrent
          ? t("subscription.plans.currentPlan")
          : isCurrentTierHigher
            ? t("subscription.plans.downgrade")
            : t("subscription.plans.upgrade")}
      </Button>
    </div>
  );
}

export default PlanCard;
