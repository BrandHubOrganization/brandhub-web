import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  confirmPayment,
  getPlans,
  initiateCheckout,
} from "@/services/mock/mockSubscriptionService";
import type {
  BillingCycle,
  PaymentMethod,
  Plan,
  SubscriptionTier,
} from "./types/subscription";
import { PaymentMethodSelector } from "./components/PaymentMethodSelector";
import { OrderSummaryCard } from "./components/OrderSummaryCard";

export function SubscriptionCheckoutPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tier = (searchParams.get("tier") as SubscriptionTier) || "BASIC";
  const cycle = (searchParams.get("cycle") as BillingCycle) || "MONTHLY";

  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>();
  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setIsError(false);
      try {
        const data = await getPlans();
        if (!cancelled) setPlans(data);
      } catch (err) {
        console.error("Failed to load plans:", err);
        if (!cancelled) setIsError(true);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const plan = useMemo(() => plans.find((p) => p.tier === tier), [plans, tier]);
  const amount = plan
    ? cycle === "MONTHLY"
      ? plan.priceMonthly
      : plan.priceYearly
    : 0;

  async function handlePay() {
    if (!plan) return;
    setIsPaying(true);
    try {
      await initiateCheckout({
        planTier: tier,
        billingCycle: cycle,
        amount,
        paymentMethod,
      });
      await confirmPayment(tier);
      toast.success(t("subscription.checkout.paySuccess"));
      navigate("/subscription/plans");
    } catch (err) {
      console.error("Payment failed:", err);
      toast.error(t("subscription.checkout.payError"));
    } finally {
      setIsPaying(false);
    }
  }

  return (
    <PageWrapper
      title={t("subscription.checkout.title")}
      description={t("subscription.checkout.description")}
    >
      {isLoading && <Skeleton className="h-80 rounded-xl" />}

      {isError && !isLoading && (
        <div className="border-destructive/30 bg-destructive/5 flex items-center gap-2 rounded-xl border p-6 text-sm">
          <AlertCircle className="text-destructive size-4" />
          <span>{t("subscription.checkout.loadError")}</span>
        </div>
      )}

      {!isLoading && !isError && plan && (
        <div className="mx-auto max-w-lg space-y-6">
          <OrderSummaryCard plan={plan} cycle={cycle} amount={amount} />

          <div className="space-y-3">
            <h3 className="text-foreground text-sm font-semibold">
              {t("subscription.checkout.selectMethod")}
            </h3>
            <PaymentMethodSelector
              value={paymentMethod}
              onChange={setPaymentMethod}
            />
          </div>

          <Button
            variant="orange"
            className="w-full"
            disabled={!paymentMethod}
            loading={isPaying}
            onClick={handlePay}
          >
            {t("subscription.checkout.pay")}
          </Button>
        </div>
      )}
    </PageWrapper>
  );
}

export default SubscriptionCheckoutPage;
