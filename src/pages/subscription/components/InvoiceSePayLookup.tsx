import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { invoiceHistoryService } from "@/services/agencyBillingService";

export function InvoiceSePayLookup({
  agencyId,
  orderId,
  userId,
  admin = false,
}: {
  agencyId: string;
  orderId: string;
  userId: string;
  admin?: boolean;
}) {
  const { t, i18n } = useTranslation();
  const [enabled, setEnabled] = useState(false);
  const [page, setPage] = useState(1);
  const lookup = useQuery({
    queryKey: ["invoice-sepay", admin, userId, agencyId, orderId, page],
    queryFn: () =>
      invoiceHistoryService.provider(agencyId, orderId, page, admin),
    enabled,
    retry: false,
    staleTime: 30_000,
  });
  const code = (
    lookup.error as {
      response?: { data?: { error?: { code?: string } } };
    } | null
  )?.response?.data?.error?.code;
  const errorKey =
    code === "SEPAY_API_NOT_CONFIGURED"
      ? "providerNotConfigured"
      : code === "SEPAY_RATE_LIMITED"
        ? "providerRateLimited"
        : "providerError";
  return (
    <div className="border-border space-y-3 border-t pt-4">
      <p className="text-muted-foreground text-xs">
        {t("subscription.invoices.providerNote")}
      </p>
      <Button
        variant="outline"
        disabled={lookup.isFetching}
        onClick={() => {
          if (!enabled) setEnabled(true);
          else void lookup.refetch();
        }}
      >
        {lookup.isFetching
          ? t("subscription.invoices.lookingUp")
          : t("subscription.invoices.lookup")}
      </Button>
      {enabled && lookup.isError && (
        <p role="alert" className="text-destructive text-sm">
          {t(`subscription.invoices.${errorKey}`)}
        </p>
      )}
      {enabled && lookup.data && (
        <>
          {!lookup.data.transactions.length && (
            <p role="status" className="text-muted-foreground text-sm">
              {t("subscription.invoices.providerEmpty")}
            </p>
          )}
          <ul className="space-y-2 text-sm">
            {lookup.data.transactions.map((tx) => (
              <li
                key={tx.id}
                className="border-border rounded-lg border p-3 break-all"
              >
                <p className="font-mono">
                  {new Intl.NumberFormat(i18n.language).format(
                    BigInt(tx.amount),
                  )}{" "}
                  VND
                </p>
                <p>
                  {t("subscription.invoices.reference")}:{" "}
                  {tx.referenceNumber || "—"}
                </p>
                <p>
                  {new Date(tx.transactionDate).toLocaleString(i18n.language)}
                </p>
                <p>
                  {t("subscription.invoices.webhook")}:{" "}
                  {t(
                    `subscription.invoices.webhookStates.${tx.webhookSuccess === 1 ? "sent" : tx.webhookSuccess === 0 ? "notSent" : "unknown"}`,
                  )}
                </p>
              </li>
            ))}
          </ul>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              disabled={page === 1 || lookup.isFetching}
              onClick={() => setPage((value) => value - 1)}
            >
              {t("subscription.invoices.previous")}
            </Button>
            <Button
              variant="ghost"
              disabled={!lookup.data.hasMore || lookup.isFetching}
              onClick={() => setPage((value) => value + 1)}
            >
              {t("subscription.invoices.next")}
            </Button>
          </div>
          {lookup.data.hasMore && (
            <p className="text-muted-foreground text-xs">
              {t("subscription.invoices.providerMore")}
            </p>
          )}
        </>
      )}
    </div>
  );
}
