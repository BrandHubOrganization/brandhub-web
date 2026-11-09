import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  Search,
  RefreshCw,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Database,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { invoiceHistoryService } from "@/services/agencyBillingService";
import { cn } from "@/lib/utils";

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

  const formatCurrency = (amount: string) => {
    try {
      return (
        new Intl.NumberFormat(i18n.language).format(BigInt(amount || "0")) +
        " ₫"
      );
    } catch {
      return `${amount} VND`;
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return (
        date.toLocaleTimeString(i18n.language, {
          hour: "2-digit",
          minute: "2-digit",
        }) +
        " · " +
        date.toLocaleDateString(i18n.language, {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      );
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3.5">
      <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
        <div className="flex items-center gap-2">
          <Database className="size-4 text-brand-orange" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t("subscription.invoices.lookup")}
          </h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={lookup.isFetching}
          onClick={() => {
            if (!enabled) setEnabled(true);
            else void lookup.refetch();
          }}
          className="h-8 px-2.5 text-xs rounded-lg hover:border-brand-orange/40 hover:text-brand-orange"
        >
          {lookup.isFetching ? (
            <>
              <RefreshCw className="size-3.5 mr-1.5 animate-spin text-brand-orange" />
              <span>{t("subscription.invoices.lookingUp")}</span>
            </>
          ) : (
            <>
              <Search className="size-3.5 mr-1.5 text-muted-foreground" />
              <span>{t("subscription.invoices.lookup")}</span>
            </>
          )}
        </Button>
      </div>

      <p className="text-muted-foreground text-[11px] leading-relaxed">
        {t("subscription.invoices.providerNote")}
      </p>

      {enabled && lookup.isError && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive flex items-start gap-2"
        >
          <AlertTriangle className="size-4 shrink-0 mt-0.5" />
          <span>{t(`subscription.invoices.${errorKey}`)}</span>
        </div>
      )}

      {enabled && lookup.data && (
        <div className="space-y-3 pt-1">
          {!lookup.data.transactions.length ? (
            <p
              role="status"
              className="text-muted-foreground text-xs text-center py-3 bg-muted/20 rounded-lg border border-border/40"
            >
              {t("subscription.invoices.providerEmpty")}
            </p>
          ) : (
            <ul className="space-y-2">
              {lookup.data.transactions.map((tx) => (
                <li
                  key={tx.id}
                  className="rounded-lg border border-border/70 bg-muted/20 p-3 space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-foreground">
                      {formatCurrency(tx.amount)}
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border",
                        tx.webhookSuccess === 1
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                          : tx.webhookSuccess === 0
                            ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                            : "bg-muted text-muted-foreground border-border",
                      )}
                    >
                      {tx.webhookSuccess === 1 ? (
                        <CheckCircle2 className="size-3" />
                      ) : tx.webhookSuccess === 0 ? (
                        <XCircle className="size-3" />
                      ) : (
                        <HelpCircle className="size-3" />
                      )}
                      <span>
                        {t(
                          `subscription.invoices.webhookStates.${tx.webhookSuccess === 1 ? "sent" : tx.webhookSuccess === 0 ? "notSent" : "unknown"}`,
                        )}
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                    <span>{t("subscription.invoices.reference")}</span>
                    <span className="font-mono text-foreground">
                      {tx.referenceNumber || "—"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-muted-foreground text-[11px] pt-1 border-t border-border/40">
                    <span>{formatDate(tx.transactionDate)}</span>
                    <span className="font-mono text-[10px]">ID: {tx.id}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Pagination for SePay results */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <Button
              variant="ghost"
              size="sm"
              disabled={page === 1 || lookup.isFetching}
              onClick={() => setPage((value) => value - 1)}
              className="h-7 px-2 text-xs"
            >
              <ChevronLeft className="size-3.5 mr-1" />
              <span>{t("subscription.invoices.previous")}</span>
            </Button>

            <span className="text-[11px] text-muted-foreground font-mono">
              Trang {page}
            </span>

            <Button
              variant="ghost"
              size="sm"
              disabled={!lookup.data.hasMore || lookup.isFetching}
              onClick={() => setPage((value) => value + 1)}
              className="h-7 px-2 text-xs"
            >
              <span>{t("subscription.invoices.next")}</span>
              <ChevronRight className="size-3.5 ml-1" />
            </Button>
          </div>

          {lookup.data.hasMore && (
            <p className="text-muted-foreground text-[11px] text-center">
              {t("subscription.invoices.providerMore")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default InvoiceSePayLookup;
