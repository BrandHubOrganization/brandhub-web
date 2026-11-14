import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Check,
  Clock,
  AlertTriangle,
  Copy,
  ChevronRight,
  Building2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { BillingHistoryItem } from "@/services/agencyBillingService";
import { cn } from "@/lib/utils";

interface InvoiceTableProps {
  invoices: BillingHistoryItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  showAgency?: boolean;
}

export function InvoiceTable({
  invoices,
  selectedId,
  onSelect,
  showAgency = false,
}: InvoiceTableProps) {
  const { t, i18n } = useTranslation();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (text: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast.success(t("subscription.invoices.copied"));
      setTimeout(() => {
        setCopiedId((current) => (current === id ? null : current));
      }, 2000);
    } catch {
      toast.error(t("subscription.invoices.loadError"));
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

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    try {
      const date = new Date(dateStr);
      const time = date.toLocaleTimeString(i18n.language, {
        hour: "2-digit",
        minute: "2-digit",
      });
      const dayMonthYear = date.toLocaleDateString(i18n.language, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      return `${time} · ${dayMonthYear}`;
    } catch {
      return dateStr;
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "FULFILLED":
      case "PAID":
        return (
          <span className="text-foreground inline-flex items-center gap-2 text-xs font-medium">
            <span
              className="size-1.5 shrink-0 rounded-full bg-emerald-500"
              aria-hidden="true"
            />
            <span>{t(`subscription.invoices.statuses.${status}`)}</span>
          </span>
        );
      case "PENDING_PAYMENT":
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/25 bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300">
            <Clock className="size-3 shrink-0" />
            <span>{t(`subscription.invoices.statuses.${status}`)}</span>
          </span>
        );
      case "REVIEW_REQUIRED":
        return (
          <span className="border-destructive/25 bg-destructive/10 text-destructive inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium">
            <AlertTriangle className="size-3 shrink-0" />
            <span>{t(`subscription.invoices.statuses.${status}`)}</span>
          </span>
        );
      case "EXPIRED":
      case "CANCELLED":
      case "FAILED":
      default:
        return (
          <span className="text-muted-foreground inline-flex items-center gap-2 text-xs font-medium">
            <span
              className="bg-muted-foreground/50 size-1.5 shrink-0 rounded-full"
              aria-hidden="true"
            />
            <span>{t(`subscription.invoices.statuses.${status}`, status)}</span>
          </span>
        );
    }
  };

  const renderKindBadge = (invoice: BillingHistoryItem) => {
    if (invoice.kind === "CREDIT_TOPUP") {
      return (
        <span className="text-muted-foreground text-xs font-medium">
          {t("subscription.invoices.kinds.CREDIT_TOPUP")}
        </span>
      );
    }
    return (
      <span className="bg-muted/70 text-foreground inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium">
        {invoice.planCode || t("subscription.invoices.kinds.SUBSCRIPTION")}
      </span>
    );
  };

  return (
    <div className="border-border bg-card overflow-hidden rounded-2xl border shadow-xs">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40 border-border border-b">
              {showAgency && (
                <TableHead className="text-muted-foreground px-4 py-3 text-xs font-medium tracking-wider uppercase">
                  {t("subscription.invoices.agency")}
                </TableHead>
              )}
              <TableHead className="text-muted-foreground px-4 py-3 text-xs font-medium tracking-wider uppercase">
                {t("subscription.invoices.number")}
              </TableHead>
              <TableHead className="text-muted-foreground px-4 py-3 text-xs font-medium tracking-wider uppercase">
                {t("subscription.invoices.tier")}
              </TableHead>
              <TableHead className="text-muted-foreground px-4 py-3 text-right text-xs font-medium tracking-wider uppercase">
                {t("subscription.invoices.amount")}
              </TableHead>
              <TableHead className="text-muted-foreground px-4 py-3 text-xs font-medium tracking-wider uppercase">
                {t("subscription.invoices.status")}
              </TableHead>
              <TableHead className="text-muted-foreground px-4 py-3 text-xs font-medium tracking-wider uppercase">
                {t("subscription.invoices.issuedAt")}
              </TableHead>
              <TableHead className="text-muted-foreground px-4 py-3 text-right text-xs font-medium tracking-wider uppercase">
                {t("subscription.invoices.detail")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => {
              const codeToCopy = invoice.transferContent || invoice.id;
              const isCopied = copiedId === invoice.id;
              const isSelected = selectedId === invoice.id;

              return (
                <TableRow
                  key={invoice.id}
                  onClick={() => onSelect(invoice.id)}
                  data-state={isSelected ? "selected" : undefined}
                  className={cn(
                    "group border-border/60 hover:bg-muted/30 cursor-pointer border-b transition-colors",
                    isSelected && "bg-brand-orange/5 hover:bg-brand-orange/10",
                  )}
                >
                  {showAgency && (
                    <TableCell className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="bg-muted/60 text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded-lg">
                          <Building2 className="size-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-foreground max-w-48 truncate text-sm font-medium">
                            {invoice.agencyName || invoice.agencyId}
                          </p>
                          {invoice.agencyName && (
                            <div className="flex items-center gap-1">
                              <p className="text-muted-foreground max-w-40 truncate font-mono text-[11px]">
                                {invoice.agencyId}
                              </p>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={(e) =>
                                  handleCopy(
                                    invoice.agencyId,
                                    `agency-${invoice.id}`,
                                    e,
                                  )
                                }
                                title={t("subscription.invoices.copyCode")}
                                className="text-muted-foreground hover:text-foreground hover:bg-muted size-5 rounded"
                              >
                                {copiedId === `agency-${invoice.id}` ? (
                                  <Check className="size-3 text-emerald-500" />
                                ) : (
                                  <Copy className="size-3 opacity-50 transition-opacity group-hover:opacity-100" />
                                )}
                                <span className="sr-only">
                                  {t("subscription.invoices.copyCode")}
                                </span>
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                  )}

                  <TableCell className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-foreground/90 font-mono text-xs font-medium tracking-tight">
                        {codeToCopy}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleCopy(codeToCopy, invoice.id, e)}
                        title={t("subscription.invoices.copyCode")}
                        className="text-muted-foreground hover:text-foreground hover:bg-muted size-7 rounded-md"
                      >
                        {isCopied ? (
                          <Check className="size-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="size-3.5 opacity-60 transition-opacity group-hover:opacity-100" />
                        )}
                        <span className="sr-only">
                          {t("subscription.invoices.copyCode")}
                        </span>
                      </Button>
                    </div>
                  </TableCell>

                  <TableCell className="px-4 py-3.5 whitespace-nowrap">
                    {renderKindBadge(invoice)}
                  </TableCell>

                  <TableCell className="text-foreground px-4 py-3.5 text-right font-mono text-sm font-medium whitespace-nowrap tabular-nums">
                    {formatCurrency(invoice.amount, invoice.currency)}
                  </TableCell>

                  <TableCell className="px-4 py-3.5 whitespace-nowrap">
                    {renderStatusBadge(invoice.status)}
                  </TableCell>

                  <TableCell className="text-muted-foreground px-4 py-3.5 text-xs whitespace-nowrap tabular-nums">
                    {formatDate(invoice.createdAt)}
                  </TableCell>

                  <TableCell className="px-4 py-3.5 text-right whitespace-nowrap">
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-expanded={isSelected}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(invoice.id);
                      }}
                      className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg text-xs font-medium transition-all group-hover:translate-x-0.5"
                    >
                      <ChevronRight className="ml-1 size-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default InvoiceTable;
