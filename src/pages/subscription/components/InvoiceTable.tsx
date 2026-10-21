import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
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

export function InvoiceTable({
  invoices,
  selectedId,
  onSelect,
  showAgency = false,
}: {
  showAgency?: boolean;
  invoices: BillingHistoryItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const { t, i18n } = useTranslation();
  return (
    <div className="border-border overflow-x-auto rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            {showAgency && (
              <TableHead>{t("subscription.invoices.agency")}</TableHead>
            )}
            {["number", "tier", "amount", "status", "issuedAt", "detail"].map(
              (key) => (
                <TableHead key={key}>
                  {t(`subscription.invoices.${key}`)}
                </TableHead>
              ),
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow
              key={invoice.id}
              data-state={selectedId === invoice.id ? "selected" : undefined}
            >
              {showAgency && (
                <TableCell title={invoice.agencyId}>
                  {invoice.agencyName || invoice.agencyId}
                </TableCell>
              )}
              <TableCell
                className="max-w-44 truncate font-mono text-xs"
                title={invoice.id}
              >
                {invoice.transferContent || invoice.id}
              </TableCell>
              <TableCell>
                {invoice.planCode ||
                  t(`subscription.invoices.kinds.${invoice.kind}`)}
              </TableCell>
              <TableCell className="font-mono whitespace-nowrap tabular-nums">
                {new Intl.NumberFormat(i18n.language).format(
                  BigInt(invoice.amount),
                )}{" "}
                {invoice.currency}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    invoice.status === "FULFILLED"
                      ? "PUBLISHED"
                      : invoice.status === "REVIEW_REQUIRED"
                        ? "FAILED"
                        : "outline"
                  }
                >
                  {t(`subscription.invoices.statuses.${invoice.status}`)}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground whitespace-nowrap">
                {new Date(invoice.createdAt).toLocaleString(i18n.language)}
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  aria-expanded={selectedId === invoice.id}
                  onClick={() => onSelect(invoice.id)}
                >
                  {t("subscription.invoices.detail")}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
export default InvoiceTable;
