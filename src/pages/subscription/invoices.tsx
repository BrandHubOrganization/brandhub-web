import { useTranslation } from "react-i18next";
import PageWrapper from "@/components/layout/PageWrapper";
import { useAgencyStore } from "@/store/agencyStore";
import { useAuthStore } from "@/store/authStore";
import { InvoiceHistory } from "@/pages/subscription/components/InvoiceHistory";

export function SubscriptionInvoicesPage() {
  const { t } = useTranslation();
  const userId = useAuthStore((state) => state.user?.id);
  const agencyId = useAgencyStore((state) => state.currentAgencyId);
  const agency = useAgencyStore((state) =>
    state.agencyList.find((item) => item.id === state.currentAgencyId),
  );
  return (
    <PageWrapper
      title={t("subscription.invoices.title")}
      description={t("subscription.invoices.description")}
    >
      {agencyId && agency?.myRole === "OWNER" && userId ? (
        <InvoiceHistory
          key={`${userId}:${agencyId}`}
          agencyId={agencyId}
          userId={userId}
        />
      ) : (
        <p role="alert" className="text-muted-foreground">
          {t("subscription.plans.ownerOnly")}
        </p>
      )}
    </PageWrapper>
  );
}
export default SubscriptionInvoicesPage;
