import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { invoiceHistoryService } from "@/services/agencyBillingService";
import { InvoiceSePayLookup } from "@/pages/subscription/components/InvoiceSePayLookup";

export function InvoiceDetail({
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
  const [downloading, setDownloading] = useState(false);
  const detail = useQuery({
    queryKey: ["agency-invoice", admin, userId, agencyId, orderId],
    queryFn: () => invoiceHistoryService.detail(agencyId, orderId, admin),
    retry: false,
  });
  async function download() {
    setDownloading(true);
    try {
      await invoiceHistoryService.downloadReceipt(agencyId, orderId, admin);
    } catch {
      toast.error(t("subscription.invoices.receiptError"));
    } finally {
      setDownloading(false);
    }
  }
  const date = (value: string | null) =>
    value ? new Date(value).toLocaleString(i18n.language) : "—";
  return (
    <section
      aria-label={t("subscription.invoices.detail")}
      className="min-w-0 space-y-4"
    >
      {detail.isPending ? (
        <Skeleton className="h-40" />
      ) : detail.isError ? (
        <div role="alert">
          <p>{t("subscription.invoices.loadError")}</p>
          <Button variant="outline" onClick={() => void detail.refetch()}>
            {t("subscription.invoices.retry")}
          </Button>
        </div>
      ) : (
        <>
          <dl className="grid gap-4 text-sm">
            {[
              ["number", detail.data.order.id],
              ["agency", detail.data.order.agencyId],
              ["payer", detail.data.order.payerUserId],
              [
                "tier",
                detail.data.order.planCode ||
                  t(`subscription.invoices.kinds.${detail.data.order.kind}`),
              ],
              [
                "status",
                t(`subscription.invoices.statuses.${detail.data.order.status}`),
              ],
              ["paidAt", date(detail.data.order.paidAt)],
              ["fulfilledAt", date(detail.data.order.fulfilledAt)],
              [
                "period",
                `${date(detail.data.order.periodStart)} – ${date(detail.data.order.periodEnd)}`,
              ],
              ["transferContent", detail.data.order.transferContent || "—"],
            ].map(([key, value]) => (
              <div key={key}>
                <dt className="text-muted-foreground">
                  {t(`subscription.invoices.${key}`)}
                </dt>
                <dd className="mt-1 font-medium break-all">{value}</dd>
              </div>
            ))}
          </dl>
          <h3 className="text-sm font-semibold">
            {t("subscription.invoices.payments")}
          </h3>
          {detail.data.payments.length ? (
            <ul className="space-y-2 text-sm">
              {detail.data.payments.map((payment) => (
                <li
                  key={payment.id}
                  className="bg-muted rounded-lg p-3 break-all"
                >
                  <p className="font-mono">
                    {new Intl.NumberFormat(i18n.language).format(
                      BigInt(payment.amount),
                    )}{" "}
                    {payment.currency}
                  </p>
                  <p>
                    {t("subscription.invoices.reference")}:{" "}
                    {payment.providerReference}
                  </p>
                  <p>
                    {t(
                      `subscription.invoices.verification.${payment.verificationState}`,
                    )}{" "}
                    · {date(payment.paidAt)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm">
              {t("subscription.invoices.noPayments")}
            </p>
          )}
          {detail.data.reviewReasons.length > 0 && (
            <p role="status" className="text-destructive text-sm break-all">
              {t("subscription.invoices.review")}:{" "}
              {detail.data.reviewReasons.join(", ")}
            </p>
          )}
          {detail.data.order.receiptAvailable && (
            <div>
              <Button
                variant="outline"
                disabled={downloading}
                onClick={() => void download()}
              >
                {t("subscription.invoices.receipt")}
              </Button>
              <p className="text-muted-foreground mt-2 text-xs">
                {t("subscription.invoices.notTaxInvoice")}
              </p>
            </div>
          )}
          <InvoiceSePayLookup
            agencyId={agencyId}
            orderId={orderId}
            userId={userId}
            admin={admin}
          />
        </>
      )}
    </section>
  );
}
