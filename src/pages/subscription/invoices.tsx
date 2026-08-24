import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertCircle, RefreshCw } from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getInvoices } from "@/services/mock/mockSubscriptionService";
import type { Invoice } from "./types/subscription";
import { InvoiceTable } from "./components/InvoiceTable";

export function SubscriptionInvoicesPage() {
  const { t } = useTranslation();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setIsError(false);
      try {
        const data = await getInvoices();
        if (!cancelled) setInvoices(data);
      } catch (err) {
        console.error("Failed to load invoices:", err);
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

  return (
    <PageWrapper
      title={t("subscription.invoices.title")}
      description={t("subscription.invoices.description")}
    >
      {isLoading && (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-12 rounded-lg" />
          ))}
        </div>
      )}

      {isError && !isLoading && (
        <div className="border-destructive/30 bg-destructive/5 flex flex-col items-center justify-center gap-3 rounded-xl border p-6 text-center">
          <div className="text-destructive flex items-center gap-2 text-sm font-medium">
            <AlertCircle className="size-4" />
            <span>{t("subscription.invoices.loadError")}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="gap-2 text-xs"
          >
            <RefreshCw className="size-3.5" />{" "}
            {t("subscription.invoices.retry")}
          </Button>
        </div>
      )}

      {!isLoading && !isError && <InvoiceTable invoices={invoices} />}
    </PageWrapper>
  );
}

export default SubscriptionInvoicesPage;
