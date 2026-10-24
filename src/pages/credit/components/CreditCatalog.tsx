import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreditQueryState } from "@/pages/credit/components/CreditQueryState";
import { useCreditPrices } from "@/pages/credit/hooks/useCreditConfiguration";
import { CREDIT_OPERATIONS } from "@/pages/credit/types/credit";
import { creditUnit } from "@/pages/credit/utils/creditInput";
import {
  formatCredits,
  validCreditAmounts,
} from "@/pages/credit/utils/creditFormat";

export function CreditCatalog() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  return (
    <details
      className="border-border bg-card rounded-xl border p-4"
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary className="cursor-pointer font-semibold focus-visible:outline focus-visible:outline-2">
        {t("credit.catalog.title")}
      </summary>
      {open ? <CatalogContent /> : null}
    </details>
  );
}

function CatalogContent() {
  const { t, i18n } = useTranslation();
  const { query } = useCreditPrices();
  if (query.isPending || query.isError)
    return (
      <CreditQueryState
        loading={query.isPending}
        error={query.error}
        retry={() => query.refetch()}
      />
    );
  return (
    <div className="mt-3 space-y-3">
      <p className="text-muted-foreground text-sm">
        {t("credit.catalog.description")}
      </p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-normal">
              {t("credit.price.operation")}
            </TableHead>
            <TableHead className="whitespace-normal">
              {t("credit.price.amount")}
            </TableHead>
            <TableHead className="whitespace-normal">
              {t("credit.price.status")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {CREDIT_OPERATIONS.map((operation) => {
            const price = query.data.find(
              (entry) => entry.operation === operation,
            );
            const amount =
              price && validCreditAmounts([price.unitCredits])
                ? formatCredits(price.unitCredits, i18n.language)
                : null;
            return (
              <TableRow key={operation}>
                <TableCell className="whitespace-normal">
                  {t(`credit.operations.${operation}`)}
                </TableCell>
                <TableCell className="whitespace-normal">
                  {!price
                    ? t("credit.catalog.unconfigured")
                    : amount === null
                      ? t("credit.errors.unsafe")
                      : t(`credit.unit.${creditUnit(operation)}`, { amount })}
                </TableCell>
                <TableCell className="whitespace-normal">
                  {price
                    ? t(
                        price.enabled
                          ? "credit.catalog.active"
                          : "credit.catalog.inactive",
                      )
                    : t("credit.catalog.unconfigured")}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
