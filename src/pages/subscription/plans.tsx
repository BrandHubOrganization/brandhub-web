import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AlertCircle, RefreshCw } from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getCurrentSubscription,
  getPlans,
} from "@/services/mock/mockSubscriptionService";
import type {
  BillingCycle,
  CurrentSubscription,
  Plan,
  SubscriptionTier,
} from "./types/subscription";
import { PlanCard } from "./components/PlanCard";
import { BillingCycleToggle } from "./components/BillingCycleToggle";
import { CurrentPlanSummary } from "./components/CurrentPlanSummary";

const TIER_ORDER: SubscriptionTier[] = ["FREE", "BASIC", "PRO", "ENTERPRISE"];

export function SubscriptionPlansPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<CurrentSubscription | null>(
    null,
  );
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("MONTHLY");
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setIsError(false);
      try {
        const [plansData, subData] = await Promise.all([
          getPlans(),
          getCurrentSubscription(),
        ]);
        if (!cancelled) {
          setPlans(plansData);
          setSubscription(subData);
        }
      } catch (err) {
        console.error("Failed to load subscription data:", err);
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

  function handleSelectPlan(tier: SubscriptionTier) {
    const plan = plans.find((p) => p.tier === tier);
    if (!plan) return;
    const isDowngrade =
      subscription &&
      TIER_ORDER.indexOf(tier) < TIER_ORDER.indexOf(subscription.tier);
    const confirmMessage = isDowngrade
      ? t("subscription.plans.downgradeConfirm", { plan: plan.name })
      : t("subscription.plans.upgradeConfirm", { plan: plan.name });
    if (!window.confirm(confirmMessage)) return;

    navigate(`/subscription/checkout?tier=${tier}&cycle=${billingCycle}`);
  }

  return (
    <PageWrapper
      title={t("subscription.plans.title")}
      description={t("subscription.plans.description")}
    >
      {isLoading && (
        <div className="space-y-6">
          <Skeleton className="h-28 rounded-xl" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-96 rounded-xl" />
            ))}
          </div>
        </div>
      )}

      {isError && !isLoading && (
        <div className="border-destructive/30 bg-destructive/5 flex flex-col items-center justify-center gap-3 rounded-xl border p-6 text-center">
          <div className="text-destructive flex items-center gap-2 text-sm font-medium">
            <AlertCircle className="size-4" />
            <span>{t("subscription.plans.loadError")}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="gap-2 text-xs"
          >
            <RefreshCw className="size-3.5" /> {t("subscription.plans.retry")}
          </Button>
        </div>
      )}

      {!isLoading && !isError && subscription && (
        <div className="space-y-6">
          <CurrentPlanSummary subscription={subscription} />

          <div className="flex justify-center">
            <BillingCycleToggle
              value={billingCycle}
              onChange={setBillingCycle}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan) => (
              <PlanCard
                key={plan.tier}
                plan={plan}
                billingCycle={billingCycle}
                onSelect={handleSelectPlan}
                isCurrentTierHigher={
                  TIER_ORDER.indexOf(plan.tier) <
                  TIER_ORDER.indexOf(subscription.tier)
                }
              />
            ))}
          </div>
        </div>
      )}
    </PageWrapper>
  );
}

export default SubscriptionPlansPage;
