import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  Download,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Sparkles,
  Coins,
  Loader2,
  RotateCcw,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { invoiceHistoryService } from "@/services/agencyBillingService";
import { InvoiceSePayLookup } from "@/pages/subscription/components/InvoiceSePayLookup";
import { cn } from "@/lib/utils";

interface InvoiceDetailProps {
  agencyId: string;
  orderId: string;
  userId: string;
  admin?: boolean;
}

export function InvoiceDetail({
  agencyId,
  orderId,
  userId,
  admin = false,
}: InvoiceDetailProps) {
  const { t, i18n } = useTranslation();
  const [downloading, setDownloading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const detail = useQuery({
    queryKey: ["agency-invoice", admin, userId, agencyId, orderId],
    queryFn: () => invoiceHistoryService.detail(agencyId, orderId, admin),
    retry: false,
  });

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      toast.success(t("subscription.invoices.copied"));
      setTimeout(() => {
        setCopiedKey((curr) => (curr === key ? null : curr));
      }, 2000);
    } catch {
      toast.error(t("subscription.invoices.loadError"));
    }
  };

  async function handleDownloadReceipt() {
    setDownloading(true);
    try {
      await invoiceHistoryService.downloadReceipt(agencyId, orderId, admin);
      toast.success(t("subscription.invoices.receipt"));
    } catch {
      toast.error(t("subscription.invoices.receiptError"));
    } finally {
      setDownloading(false);
    }
  }

  const formatDate = (value: string | null) => {
    if (!value) return "—";
    try {
      const date = new Date(value);
      const time = date.toLocaleTimeString(i18n.language, {
        hour: "2-digit",
        minute: "2-digit",
      });
      const day = date.toLocaleDateString(i18n.language, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      return `${time} · ${day}`;
    } catch {
      return value;
    }
  };

  const formatCurrency = (amount: string, currency: string) => {
    try {
      const formatted = new Intl.NumberFormat(i18n.language).format(
        BigInt(amount || "0"),
      );
      return currency === "VND" ? `${formatted} ₫` : `${formatted} ${currency}`;
    } catch {
      return `${amount} ${currency}`;
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "FULFILLED":
      case "PAID":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-3.5 shrink-0" />
            <span>{t(`subscription.invoices.statuses.${status}`)}</span>
          </span>
        );
      case "PENDING_PAYMENT":
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
            <Clock className="size-3.5 shrink-0" />
            <span>{t(`subscription.invoices.statuses.${status}`)}</span>
          </span>
        );
      case "REVIEW_REQUIRED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400">
            <AlertTriangle className="size-3.5 shrink-0" />
            <span>{t(`subscription.invoices.statuses.${status}`)}</span>
          </span>
        );
      case "EXPIRED":
      case "CANCELLED":
      default:
        return (
          <span className="bg-muted text-muted-foreground border-border inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold">
            <XCircle className="size-3.5 shrink-0" />
            <span>{t(`subscription.invoices.statuses.${status}`, status)}</span>
          </span>
        );
    }
  };

  if (detail.isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-44 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (detail.isError) {
    return (
      <div
        role="alert"
        className="border-border bg-card space-y-3 rounded-2xl border p-6 text-center"
      >
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-500">
          <AlertTriangle className="size-6" />
        </div>
        <p className="text-foreground text-sm font-semibold">
          {t("subscription.invoices.loadError")}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void detail.refetch()}
          className="rounded-lg"
        >
          <RotateCcw className="mr-1.5 size-3.5" />
          {t("subscription.invoices.retry")}
        </Button>
      </div>
    );
  }

  const { order, payments, reviewReasons } = detail.data;
  const isCredit = order.kind === "CREDIT_TOPUP";

  return (
    <section
      aria-label={t("subscription.invoices.detail")}
      data-testid="invoice-detail-drawer"
      className="space-y-5"
    >
      {/* 1. Header Card: Hero Receipt Card */}
      <div className="border-border from-card via-card to-muted/20 space-y-4 rounded-2xl border bg-gradient-to-br p-5 shadow-xs">
        <div className="flex items-center justify-between gap-3">
          <div className="bg-muted text-foreground inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium">
            {isCredit ? (
              <>
                <Coins className="size-3.5 text-amber-500" />
                <span>{t("subscription.invoices.kinds.CREDIT_TOPUP")}</span>
              </>
            ) : (
              <>
                <Sparkles className="text-brand-orange size-3.5" />
                <span>
                  {order.planCode ||
                    t("subscription.invoices.kinds.SUBSCRIPTION")}
                </span>
              </>
            )}
          </div>
          {renderStatusBadge(order.status)}
        </div>

        <div className="space-y-1">
          <p className="text-foreground text-xs font-semibold">
            {t("subscription.invoices.amount")}
          </p>
          <p className="text-foreground font-mono text-3xl font-extrabold tracking-tight tabular-nums">
            {formatCurrency(order.amount, order.currency)}
          </p>
        </div>
      </div>

      {/* 2. Order Information Card */}
      <div className="border-border bg-card space-y-4 rounded-xl border p-4">
        <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          {/* Order ID */}
          <div className="space-y-1">
            <span className="text-foreground block text-xs font-semibold">
              {t("subscription.invoices.number")}
            </span>
            <div className="flex min-w-0 items-center gap-1.5">
              <span className="text-muted-foreground truncate font-mono text-xs font-normal select-all">
                {order.id}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleCopy(order.id, "order-id")}
                className="text-muted-foreground hover:text-foreground size-5 shrink-0 rounded"
                title={t("subscription.invoices.copyCode")}
              >
                {copiedKey === "order-id" ? (
                  <Check className="size-3 text-emerald-500" />
                ) : (
                  <Copy className="size-3" />
                )}
              </Button>
            </div>
          </div>

          {/* Transfer Content */}
          <div className="space-y-1">
            <span className="text-foreground block text-xs font-semibold">
              {t("subscription.invoices.transferContent")}
            </span>
            <div className="flex min-w-0 items-center gap-1.5">
              <span className="text-muted-foreground truncate font-mono text-xs font-normal select-all">
                {order.transferContent || "—"}
              </span>
              {order.transferContent && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    handleCopy(order.transferContent!, "transfer-content")
                  }
                  className="text-muted-foreground hover:text-foreground size-5 shrink-0 rounded"
                  title={t("subscription.invoices.copyCode")}
                >
                  {copiedKey === "transfer-content" ? (
                    <Check className="size-3 text-emerald-500" />
                  ) : (
                    <Copy className="size-3" />
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Agency */}
          <div className="space-y-1">
            <span className="text-foreground block text-xs font-semibold">
              {t("subscription.invoices.agency")}
            </span>
            <div className="flex min-w-0 items-center gap-1.5">
              <span
                className="text-muted-foreground truncate font-mono text-xs font-normal select-all"
                title={order.agencyName || order.agencyId}
              >
                {order.agencyName || order.agencyId}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleCopy(order.agencyId, "agency-id")}
                className="text-muted-foreground hover:text-foreground size-5 shrink-0 rounded"
                title={t("subscription.invoices.copyCode")}
              >
                {copiedKey === "agency-id" ? (
                  <Check className="size-3 text-emerald-500" />
                ) : (
                  <Copy className="size-3" />
                )}
              </Button>
            </div>
          </div>

          {/* Payer User */}
          <div className="space-y-1">
            <span className="text-foreground block text-xs font-semibold">
              {t("subscription.invoices.payer")}
            </span>
            <div className="flex min-w-0 items-center gap-1.5">
              {order.payerUserId ? (
                <Link
                  to={`/admin?view=users&search=${encodeURIComponent(order.payerUserId)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-brand-orange group inline-flex items-center gap-1 truncate font-mono text-xs font-normal hover:underline"
                  title={`${t("subscription.invoices.payer")}: ${order.payerUserId}`}
                >
                  <span className="truncate">{order.payerUserId}</span>
                  <ExternalLink className="text-muted-foreground group-hover:text-brand-orange size-3 shrink-0 transition-transform group-hover:translate-x-0.5" />
                </Link>
              ) : (
                <span className="text-muted-foreground font-mono text-xs font-normal">
                  —
                </span>
              )}
              {order.payerUserId && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleCopy(order.payerUserId, "payer-id")}
                  className="text-muted-foreground hover:text-foreground size-5 shrink-0 rounded"
                  title={t("subscription.invoices.copyCode")}
                >
                  {copiedKey === "payer-id" ? (
                    <Check className="size-3 text-emerald-500" />
                  ) : (
                    <Copy className="size-3" />
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Tier / Plan */}
          <div className="space-y-1">
            <span className="text-foreground block text-xs font-semibold">
              {t("subscription.invoices.tier")}
            </span>
            <p className="text-muted-foreground text-xs font-normal uppercase">
              {order.planCode ||
                (isCredit
                  ? t("subscription.invoices.kinds.CREDIT_TOPUP")
                  : t("subscription.invoices.kinds.SUBSCRIPTION"))}
            </p>
          </div>

          {/* Status */}
          <div className="space-y-1">
            <span className="text-foreground block text-xs font-semibold">
              {t("subscription.invoices.status")}
            </span>
            <div>{renderStatusBadge(order.status)}</div>
          </div>

          {/* Paid At */}
          <div className="space-y-1">
            <span className="text-foreground block text-xs font-semibold">
              {t("subscription.invoices.paidAt")}
            </span>
            <p className="text-muted-foreground text-xs font-normal">
              {formatDate(order.paidAt)}
            </p>
          </div>

          {/* Fulfilled At */}
          <div className="space-y-1">
            <span className="text-foreground block text-xs font-semibold">
              {t("subscription.invoices.fulfilledAt")}
            </span>
            <p className="text-muted-foreground text-xs font-normal">
              {formatDate(order.fulfilledAt)}
            </p>
          </div>

          {/* Service Period */}
          <div className="border-border/40 space-y-1 border-t pt-2 sm:col-span-2">
            <span className="text-foreground block text-xs font-semibold">
              {t("subscription.invoices.period")}
            </span>
            <p className="text-muted-foreground text-xs font-normal">
              {order.periodStart || order.periodEnd
                ? `${formatDate(order.periodStart)} – ${formatDate(order.periodEnd)}`
                : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Recorded Payments List */}
      <div className="border-border bg-card space-y-3 rounded-xl border p-4">
        <div className="border-border/60 flex items-center justify-between border-b pb-2.5">
          <h3 className="text-foreground text-xs font-semibold tracking-wider uppercase">
            {t("subscription.invoices.payments")}
          </h3>
          <span className="text-muted-foreground font-mono text-[11px]">
            ({payments.length})
          </span>
        </div>

        {payments.length > 0 ? (
          <ul className="space-y-2">
            {payments.map((payment) => (
              <li
                key={payment.id}
                className="border-border/70 bg-muted/30 space-y-2 rounded-lg border p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-foreground font-mono text-sm font-semibold">
                    {formatCurrency(payment.amount, payment.currency)}
                  </span>
                  <span
                    className={cn(
                      "rounded border px-2 py-0.5 text-[11px] font-medium",
                      payment.verificationState === "VERIFIED"
                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400",
                    )}
                  >
                    {t(
                      `subscription.invoices.verification.${payment.verificationState}`,
                      payment.verificationState,
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-foreground font-semibold">
                    {t("subscription.invoices.reference")}
                  </span>
                  <span className="text-muted-foreground font-mono font-normal select-all">
                    {payment.providerReference}
                  </span>
                </div>

                <div className="border-border/40 flex items-center justify-between border-t pt-1.5 text-xs">
                  <span className="text-foreground font-semibold">
                    {t("subscription.invoices.paidAt")}
                  </span>
                  <span className="text-muted-foreground font-normal">
                    {formatDate(payment.paidAt)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground py-2 text-center text-xs">
            {t("subscription.invoices.noPayments")}
          </p>
        )}
      </div>

      {/* Review Warnings if any */}
      {reviewReasons.length > 0 && (
        <div
          role="status"
          className="space-y-1 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs"
        >
          <div className="flex items-center gap-1.5 font-semibold text-rose-600 dark:text-rose-400">
            <AlertTriangle className="size-4" />
            <span>{t("subscription.invoices.review")}</span>
          </div>
          <p className="pl-5.5 text-rose-600/90 dark:text-rose-400/90">
            {reviewReasons.join(", ")}
          </p>
        </div>
      )}

      {/* 4. Download Receipt Button */}
      {order.receiptAvailable && (
        <div className="border-border bg-card space-y-2 rounded-xl border p-4">
          <Button
            variant="outline"
            className="hover:border-brand-orange/40 hover:text-brand-orange h-10 w-full rounded-lg text-xs font-semibold"
            disabled={downloading}
            onClick={() => void handleDownloadReceipt()}
          >
            {downloading ? (
              <>
                <Loader2 className="text-brand-orange mr-2 size-4 animate-spin" />
                <span>{t("subscription.invoices.receiptDownloading")}</span>
              </>
            ) : (
              <>
                <Download className="text-brand-orange mr-2 size-4" />
                <span>{t("subscription.invoices.receipt")}</span>
              </>
            )}
          </Button>
          <p className="text-muted-foreground text-center text-[11px]">
            {t("subscription.invoices.notTaxInvoice")}
          </p>
        </div>
      )}

      {/* 6. SePay Lookup Section */}
      <InvoiceSePayLookup
        agencyId={agencyId}
        orderId={orderId}
        userId={userId}
        admin={admin}
      />
    </section>
  );
}

export default InvoiceDetail;
