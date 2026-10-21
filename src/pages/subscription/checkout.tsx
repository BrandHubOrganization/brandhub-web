import { Navigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PageWrapper from "@/components/layout/PageWrapper";
import { AgencyPaymentPanel } from "@/pages/subscription/components/AgencyPaymentPanel";
import { useAgencyStore } from "@/store/agencyStore";
import { useAuthStore } from "@/store/authStore";

export function SubscriptionCheckoutPage() {
  const { t } = useTranslation();
  const agencyId = useAgencyStore((state) => state.currentAgencyId);
  const userId = useAuthStore((state) => state.user?.id);
  const [params] = useSearchParams();
  if (params.get("tier") !== "PLUS") return <Navigate to="/subscription/plans" replace />;
  const scope = `${userId}:${agencyId}:PLUS`;
  return (
    <PageWrapper title={t("subscription.checkout.title")} description={t("subscription.checkout.description")}>
      <div className="mx-auto max-w-2xl rounded-xl border border-border bg-card p-6">
        <AgencyPaymentPanel key={scope} scope={scope} />
      </div>
    </PageWrapper>
  );
}

export default SubscriptionCheckoutPage;
