import { useTranslation } from "react-i18next";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Invoice } from "../types/subscription";

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const STATUS_VARIANT: Record<
  Invoice["status"],
  "PUBLISHED" | "PENDING_REVIEW" | "FAILED"
> = {
  PAID: "PUBLISHED",
  PENDING: "PENDING_REVIEW",
  FAILED: "FAILED",
};

export interface InvoiceTableProps {
  invoices: Invoice[];
}

export function InvoiceTable({ invoices }: InvoiceTableProps) {
  const { t } = useTranslation();

  return (
    <div className="border-border overflow-x-auto rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("subscription.invoices.number")}</TableHead>
            <TableHead>{t("subscription.invoices.tier")}</TableHead>
            <TableHead>{t("subscription.invoices.amount")}</TableHead>
            <TableHead>{t("subscription.invoices.status")}</TableHead>
            <TableHead>{t("subscription.invoices.issuedAt")}</TableHead>
            <TableHead className="text-right">
              {t("subscription.invoices.download")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell className="font-medium">
                {invoice.invoiceNumber}
              </TableCell>
              <TableCell>{invoice.tier}</TableCell>
              <TableCell>{currency.format(invoice.amount)}</TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[invoice.status]}>
                  {t(`subscription.invoices.statuses.${invoice.status}`)}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(invoice.issuedAt).toLocaleDateString("vi-VN")}
              </TableCell>
              <TableCell className="text-right">
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-xs"
                  onClick={() =>
                    toast.info(t("subscription.invoices.downloadUnavailable"))
                  }
                >
                  <Download className="size-3.5" />
                  {t("subscription.invoices.download")}
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default InvoiceTable;
