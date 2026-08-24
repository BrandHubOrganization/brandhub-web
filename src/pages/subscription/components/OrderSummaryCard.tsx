import { useTranslation } from "react-i18next";
import type { BillingCycle, Plan } from "../types/subscription";

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

export interface OrderSummaryCardProps {
  plan: Plan;
  cycle: BillingCycle;
  amount: number;
}

export function OrderSummaryCard({ plan, cycle, amount }: OrderSummaryCardProps) {
  const { t } = useTranslation();

  return (
    <div className="border-border bg-card space-y-3 rounded-xl border p-5">
      <h3 className="text-foreground text-sm font-semibold">
        {t("subscription.checkout.orderSummary")}
      </h3>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {t("subscription.checkout.plan")}
        </span>
        <span className="text-foreground font-medium">{plan.name}</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {t("subscription.checkout.cycle")}
        </span>
        <span className="text-foreground font-medium">
          {cycle === "MONTHLY"
            ? t("subscription.plans.monthly")
            : t("subscription.plans.yearly")}
        </span>
      </div>
      <div className="border-border flex items-center justify-between border-t pt-3 text-sm">
        <span className="text-muted-foreground">
          {t("subscription.checkout.amount")}
        </span>
        <span className="text-foreground text-lg font-bold">
          {currency.format(amount)}
        </span>
      </div>
    </div>
  );
}

export default OrderSummaryCard;
