import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  invoiceHistoryService,
  type HistoryFilters,
} from "@/services/agencyBillingService";
import { InvoiceTable } from "@/pages/subscription/components/InvoiceTable";
import { InvoiceDetailDrawer } from "@/pages/subscription/components/InvoiceDetailDrawer";

export function InvoiceHistory({
  agencyId,
  userId,
  admin = false,
}: {
  agencyId: string;
  userId: string;
  admin?: boolean;
}) {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<HistoryFilters>({
    status: "",
    kind: "",
    from: "",
    to: "",
  });
  const [cursors, setCursors] = useState<Array<string | null>>([null]);
  const [selected, setSelected] = useState<string | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const cursor = cursors[cursors.length - 1];
  const invalidDates = Boolean(
    filters.from && filters.to && filters.from > filters.to,
  );
  const history = useQuery({
    queryKey: ["agency-invoices", admin, userId, agencyId, filters, cursor],
    queryFn: () => invoiceHistoryService.list(agencyId, cursor, filters, admin),
    retry: false,
    enabled: !invalidDates,
  });
  function change(key: keyof HistoryFilters, value: string) {
    setFilters((current) => ({ ...current, [key]: value }));
    setCursors([null]);
    setSelected(null);
  }
  const selectClass =
    "border-input bg-background text-foreground min-h-11 w-full rounded-lg border px-3 text-sm";
  return (
    <div className="space-y-5">
      <div className="border-border bg-card grid gap-3 rounded-xl border p-4 sm:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-1 text-sm">
          {t("subscription.invoices.status")}
          <select
            className={selectClass}
            value={filters.status}
            onChange={(e) => change("status", e.target.value)}
          >
            <option value="">{t("subscription.invoices.all")}</option>
            {[
              "PENDING_PAYMENT",
              "PAID",
              "FULFILLED",
              "EXPIRED",
              "CANCELLED",
              "REVIEW_REQUIRED",
            ].map((status) => (
              <option key={status} value={status}>
                {t(`subscription.invoices.statuses.${status}`)}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm">
          {t("subscription.invoices.kind")}
          <select
            className={selectClass}
            value={filters.kind}
            onChange={(e) => change("kind", e.target.value)}
          >
            <option value="">{t("subscription.invoices.all")}</option>
            {["SUBSCRIPTION", "CREDIT_TOPUP"].map((kind) => (
              <option key={kind} value={kind}>
                {t(`subscription.invoices.kinds.${kind}`)}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm">
          {t("subscription.invoices.from")}
          <Input
            type="date"
            value={filters.from}
            onChange={(e) => change("from", e.target.value)}
            className="min-h-11"
          />
        </label>
        <label className="space-y-1 text-sm">
          {t("subscription.invoices.to")}
          <Input
            type="date"
            value={filters.to}
            onChange={(e) => change("to", e.target.value)}
            className="min-h-11"
          />
        </label>
      </div>
      {invalidDates ? (
        <p role="alert" className="text-destructive">
          {t("subscription.invoices.invalidDates")}
        </p>
      ) : history.isPending ? (
        <Skeleton className="h-48 w-full rounded-xl" />
      ) : history.isError ? (
        <div role="alert" className="border-border rounded-xl border p-5">
          <p>{t("subscription.invoices.loadError")}</p>
          <Button
            variant="outline"
            className="mt-3"
            onClick={() => void history.refetch()}
          >
            {t("subscription.invoices.retry")}
          </Button>
        </div>
      ) : (
        <>
          {history.data.items.length ? (
            <InvoiceTable
              showAgency={admin}
              invoices={history.data.items}
              selectedId={selected}
              onSelect={(id) => {
                triggerRef.current =
                  document.activeElement instanceof HTMLElement
                    ? document.activeElement
                    : null;
                setSelected(id);
              }}
            />
          ) : (
            <p
              role="status"
              className="border-border text-muted-foreground rounded-xl border p-6"
            >
              {t("subscription.invoices.empty")}
            </p>
          )}
          <nav
            aria-label={t("subscription.invoices.pagination")}
            className="flex items-center justify-between gap-3"
          >
            <Button
              variant="outline"
              disabled={cursors.length === 1}
              onClick={() => {
                setCursors((current) => current.slice(0, -1));
                setSelected(null);
              }}
            >
              {t("subscription.invoices.previous")}
            </Button>
            <span className="text-muted-foreground text-sm">
              {t("subscription.invoices.page", { value: cursors.length })}
            </span>
            <Button
              variant="outline"
              disabled={!history.data.nextCursor}
              onClick={() => {
                setCursors((current) => [...current, history.data.nextCursor]);
                setSelected(null);
              }}
            >
              {t("subscription.invoices.next")}
            </Button>
          </nav>
        </>
      )}
      <InvoiceDetailDrawer
        orderId={invalidDates ? null : selected}
        agencyId={
          admin
            ? history.data?.items.find((item) => item.id === selected)
                ?.agencyId || agencyId
            : agencyId
        }
        userId={userId}
        admin={admin}
        triggerRef={triggerRef}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
