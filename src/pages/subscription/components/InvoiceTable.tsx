import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Check,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Copy,
  ChevronRight,
  Sparkles,
  Coins,
  Building2,
  Calendar,
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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="size-3.5 shrink-0" />
            <span>{t(`subscription.invoices.statuses.${status}`)}</span>
          </span>
        );
      case "PENDING_PAYMENT":
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Clock className="size-3.5 shrink-0" />
            <span>{t(`subscription.invoices.statuses.${status}`)}</span>
          </span>
        );
      case "REVIEW_REQUIRED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <AlertTriangle className="size-3.5 shrink-0" />
            <span>{t(`subscription.invoices.statuses.${status}`)}</span>
          </span>
        );
      case "EXPIRED":
      case "CANCELLED":
      case "FAILED":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
            <XCircle className="size-3.5 shrink-0" />
            <span>{t(`subscription.invoices.statuses.${status}`, status)}</span>
          </span>
        );
    }
  };

  const renderKindBadge = (invoice: BillingHistoryItem) => {
    if (invoice.kind === "CREDIT_TOPUP") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
          <Coins className="size-3.5 text-amber-500 shrink-0" />
          <span>{t("subscription.invoices.kinds.CREDIT_TOPUP")}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-brand-orange-soft text-brand-orange border border-brand-orange/20">
        <Sparkles className="size-3.5 text-brand-orange shrink-0" />
        <span>{invoice.planCode || t("subscription.invoices.kinds.SUBSCRIPTION")}</span>
      </span>
    );
  };

  return (
    <div className="rounded-2xl border border-border overflow-hidden bg-card shadow-xs">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40 border-b border-border">
              {showAgency && (
                <TableHead className="py-3 px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {t("subscription.invoices.agency")}
                </TableHead>
              )}
              <TableHead className="py-3 px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {t("subscription.invoices.number")}
              </TableHead>
              <TableHead className="py-3 px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {t("subscription.invoices.tier")}
              </TableHead>
              <TableHead className="py-3 px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {t("subscription.invoices.amount")}
              </TableHead>
              <TableHead className="py-3 px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {t("subscription.invoices.status")}
              </TableHead>
              <TableHead className="py-3 px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {t("subscription.invoices.issuedAt")}
              </TableHead>
              <TableHead className="py-3 px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground text-right">
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
                    "cursor-pointer transition-colors group border-b border-border/60 hover:bg-muted/30",
                    isSelected && "bg-brand-orange/5 hover:bg-brand-orange/10",
                  )}
                >
                  {showAgency && (
                    <TableCell className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="size-8 rounded-lg bg-muted/60 flex items-center justify-center shrink-0 text-muted-foreground">
                          <Building2 className="size-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-foreground truncate max-w-48">
                            {invoice.agencyName || invoice.agencyId}
                          </p>
                          {invoice.agencyName && (
                            <p className="font-mono text-[11px] text-muted-foreground truncate max-w-44">
                              {invoice.agencyId}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                  )}

                  <TableCell className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-medium text-foreground/90 tracking-tight">
                        {codeToCopy}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleCopy(codeToCopy, invoice.id, e)}
                        title={t("subscription.invoices.copyCode")}
                        className="size-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
                      >
                        {isCopied ? (
                          <Check className="size-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="size-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                        )}
                        <span className="sr-only">{t("subscription.invoices.copyCode")}</span>
                      </Button>
                    </div>
                  </TableCell>

                  <TableCell className="py-3.5 px-4 whitespace-nowrap">
                    {renderKindBadge(invoice)}
                  </TableCell>

                  <TableCell className="py-3.5 px-4 whitespace-nowrap font-mono tabular-nums text-sm font-medium text-foreground">
                    {formatCurrency(invoice.amount, invoice.currency)}
                  </TableCell>

                  <TableCell className="py-3.5 px-4 whitespace-nowrap">
                    {renderStatusBadge(invoice.status)}
                  </TableCell>

                  <TableCell className="py-3.5 px-4 whitespace-nowrap text-muted-foreground text-xs">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="size-3.5 text-muted-foreground/70" />
                      <span>{formatDate(invoice.createdAt)}</span>
                    </div>
                  </TableCell>

                  <TableCell className="py-3.5 px-4 text-right whitespace-nowrap">
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-expanded={isSelected}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(invoice.id);
                      }}
                      className="rounded-lg text-xs font-medium text-muted-foreground hover:text-brand-orange hover:bg-brand-orange-soft/60 group-hover:translate-x-0.5 transition-all"
                    >
                      <span>{t("subscription.invoices.detail")}</span>
                      <ChevronRight className="size-3.5 ml-1" />
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
