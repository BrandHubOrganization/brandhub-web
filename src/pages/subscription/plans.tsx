import { Link } from "react-router-dom";
import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AgencyPaymentPanel } from "@/pages/subscription/components/AgencyPaymentPanel";
import { useAuthStore } from "@/store/authStore";
import { useAgencyStore } from "@/store/agencyStore";
import { useTranslation } from "react-i18next";
import { AlertCircle, RefreshCw } from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CatalogPlanCard } from "@/pages/subscription/components/CatalogPlanCard";
import { useSubscriptionCatalog } from "@/pages/subscription/hooks/useSubscriptionCatalog";

export function SubscriptionPlansPage() {
  const { t, i18n } = useTranslation();
  const userId = useAuthStore((state) => state.user?.id);
  const agencyId = useAgencyStore((state) => state.currentAgencyId);
  const scope = `${userId}:${agencyId}:PLUS`;
  const [paymentScope, setPaymentScope] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const refreshSubscription = useCallback(() => {
    void queryClient.invalidateQueries({
      queryKey: ["ai-credit-balance", userId, agencyId],
    });
    void queryClient.invalidateQueries({
      queryKey: ["agency-subscription", userId, agencyId],
    });
  }, [queryClient, userId, agencyId]);
  const { isOwner, catalog, subscription } = useSubscriptionCatalog();

  const checkoutAction =
    subscription.data?.planCode === "PLUS" ? "RENEWAL" : "UPGRADE";
  const checkoutScope = `${scope}:${checkoutAction}:${subscription.data?.currentPeriodEnd || "initial"}`;
  const paymentOpen = Boolean(isOwner && paymentScope?.startsWith(`${scope}:`));

  return (
    <PageWrapper
      title={t("subscription.plans.title")}
      description={t("subscription.plans.description")}
    >
      {isOwner && (
        <div className="mb-5 flex justify-end">
          <Button variant="outline" asChild>
            <Link to="/subscription/invoices">
              {t("subscription.invoices.title")}
            </Link>
          </Button>
        </div>
      )}
      {!isOwner ? (
        <div
          role="alert"
          className="border-border bg-card text-muted-foreground rounded-xl border p-6 text-sm"
        >
          {t("subscription.plans.ownerOnly")}
        </div>
      ) : catalog.isPending ? (
        <div
          role="status"
          aria-label={t("subscription.catalog.loading")}
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4"
        >
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-96 rounded-xl" />
          ))}
        </div>
      ) : catalog.isError ? (
        <div
          role="alert"
          className="border-border bg-card rounded-xl border p-6"
        >
          <div className="flex items-center gap-2 font-medium">
            <AlertCircle
              className="text-destructive size-4"
              aria-hidden="true"
            />
            {t("subscription.catalog.errorTitle")}
          </div>
          <p className="text-muted-foreground mt-2 text-sm">
            {t("subscription.catalog.errorDescription")}
          </p>
          <Button
            variant="outline"
            className="mt-4 min-h-11 rounded-lg"
            onClick={() => void catalog.refetch()}
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            {t("subscription.catalog.retry")}
          </Button>
        </div>
      ) : !catalog.data.length ? (
        <div
          role="status"
          className="border-border bg-card rounded-xl border p-6"
        >
          <h2 className="font-semibold">
            {t("subscription.catalog.emptyTitle")}
          </h2>
          <p className="text-muted-foreground mt-2 text-sm">
            {t("subscription.catalog.emptyDescription")}
          </p>
        </div>
      ) : (
        <>
          {subscription.data?.planCode === "PLUS" &&
            subscription.data.currentPeriodEnd && (
              <div
                role="status"
                className="border-border bg-card mb-5 space-y-1 rounded-xl border p-4 text-sm"
              >
                <p>
                  {t(
                    subscription.data.status === "EXPIRED"
                      ? "subscription.catalog.expiredAt"
                      : "subscription.catalog.expiresAt",
                    {
                      date: new Date(
                        subscription.data.currentPeriodEnd!,
                      ).toLocaleString(i18n.language),
                    },
                  )}
                </p>
                {subscription.data.renewalScheduled && (
                  <p className="text-muted-foreground">
                    {t("subscription.catalog.paidThrough", {
                      date: new Date(
                        subscription.data.paidThrough!,
                      ).toLocaleString(i18n.language),
                    })}
                  </p>
                )}
              </div>
            )}
          {subscription.isPending && (
            <p role="status" className="text-muted-foreground mb-5 text-sm">
              {t("subscription.plans.loadingAgencyPlan")}
            </p>
          )}
          {subscription.isError && (
            <div
              role="alert"
              className="border-border bg-card mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4"
            >
              <p className="text-muted-foreground text-sm">
                {t("subscription.plans.subscriptionNotReady")}
              </p>
              <Button
                variant="outline"
                className="min-h-11 rounded-lg"
                onClick={() => void subscription.refetch()}
              >
                {t("subscription.catalog.retry")}
              </Button>
            </div>
          )}
          <div
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4"
            data-testid="agency-plan-list"
          >
            {catalog.data.map((plan) => (
              <CatalogPlanCard
                key={plan.id}
                plan={plan}
                subscription={subscription.data}
                onUpgrade={() => setPaymentScope(checkoutScope)}
              />
            ))}
          </div>
        </>
      )}
      <Dialog
        open={paymentOpen}
        onOpenChange={(open) => {
          if (!open) setPaymentScope(null);
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {t(
                paymentScope?.includes(":RENEWAL:")
                  ? "subscription.checkout.renewAgency"
                  : "subscription.checkout.plusAgency",
              )}
            </DialogTitle>
            <DialogDescription>
              {t("subscription.checkout.description")}
            </DialogDescription>
          </DialogHeader>
          {paymentOpen && paymentScope && (
            <AgencyPaymentPanel
              key={paymentScope}
              scope={paymentScope}
              action={
                paymentScope.includes(":RENEWAL:") ? "RENEWAL" : "UPGRADE"
              }
              onFulfilled={refreshSubscription}
            />
          )}
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}

export default SubscriptionPlansPage;
