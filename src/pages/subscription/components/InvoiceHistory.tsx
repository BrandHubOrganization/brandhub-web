import { useRef, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  Receipt,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  Search,
  X,
  Layers,
  Sparkles,
  Coins,
  ReceiptText,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { SelectMenu, type SelectMenuOption } from "@/components/ui/select-menu";
import {
  invoiceHistoryService,
  type HistoryFilters,
} from "@/services/agencyBillingService";
import { InvoiceTable } from "@/pages/subscription/components/InvoiceTable";
import { InvoiceDetailDrawer } from "@/pages/subscription/components/InvoiceDetailDrawer";

interface InvoiceHistoryProps {
  agencyId: string;
  userId: string;
  admin?: boolean;
}

export function InvoiceHistory({
  agencyId: initialAgencyId,
  userId,
  admin = false,
}: InvoiceHistoryProps) {
  const { t, i18n } = useTranslation();

  const [agencyIdFilter, setAgencyIdFilter] = useState<string>(
    initialAgencyId || "",
  );
  const [agencyInput, setAgencyInput] = useState<string>(initialAgencyId || "");

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

  const isAgencyValid =
    !agencyInput.trim() ||
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      agencyInput.trim(),
    );

  const invalidDates = Boolean(
    filters.from && filters.to && filters.from > filters.to,
  );

  const activeAgencyId = admin ? agencyIdFilter.trim() : initialAgencyId;

  const history = useQuery({
    queryKey: [
      "agency-invoices",
      admin,
      userId,
      activeAgencyId,
      filters,
      cursor,
    ],
    queryFn: () =>
      invoiceHistoryService.list(activeAgencyId, cursor, filters, admin),
    retry: false,
    enabled: !invalidDates && (!admin || isAgencyValid),
  });

  const handleFilterChange = (key: keyof HistoryFilters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setCursors([null]);
    setSelected(null);
  };

  const handleResetFilters = () => {
    setFilters({
      status: "",
      kind: "",
      from: "",
      to: "",
    });
    setAgencyInput("");
    setAgencyIdFilter("");
    setCursors([null]);
    setSelected(null);
  };

  const hasActiveFilters = Boolean(
    filters.status ||
    filters.kind ||
    filters.from ||
    filters.to ||
    (admin && agencyIdFilter),
  );

  // Status options for SelectMenu
  const statusOptions: SelectMenuOption[] = useMemo(
    () => [
      {
        value: "",
        label: t("subscription.invoices.all"),
        icon: <Layers className="size-3.5" />,
      },
      {
        value: "FULFILLED",
        label: t("subscription.invoices.statuses.FULFILLED"),
        icon: <CheckCircle2 className="size-3.5 text-emerald-500" />,
      },
      {
        value: "PAID",
        label: t("subscription.invoices.statuses.PAID"),
        icon: <CheckCircle2 className="size-3.5 text-emerald-500" />,
      },
      {
        value: "PENDING_PAYMENT",
        label: t("subscription.invoices.statuses.PENDING_PAYMENT"),
        icon: <Clock className="size-3.5 text-amber-500" />,
      },
      {
        value: "REVIEW_REQUIRED",
        label: t("subscription.invoices.statuses.REVIEW_REQUIRED"),
        icon: <AlertTriangle className="size-3.5 text-rose-500" />,
      },
      {
        value: "EXPIRED",
        label: t("subscription.invoices.statuses.EXPIRED"),
        icon: <XCircle className="text-muted-foreground size-3.5" />,
      },
      {
        value: "CANCELLED",
        label: t("subscription.invoices.statuses.CANCELLED"),
        icon: <XCircle className="text-muted-foreground size-3.5" />,
      },
    ],
    [t],
  );

  // Kind options for SelectMenu
  const kindOptions: SelectMenuOption[] = useMemo(
    () => [
      {
        value: "",
        label: t("subscription.invoices.all"),
        icon: <Layers className="size-3.5" />,
      },
      {
        value: "SUBSCRIPTION",
        label: t("subscription.invoices.kinds.SUBSCRIPTION"),
        icon: <Sparkles className="text-muted-foreground size-3.5" />,
      },
      {
        value: "CREDIT_TOPUP",
        label: t("subscription.invoices.kinds.CREDIT_TOPUP"),
        icon: <Coins className="text-muted-foreground size-3.5" />,
      },
    ],
    [t],
  );

  // KPI Calculations from current page items
  const items = history.data?.items ?? [];
  const totalCount = items.length;

  const fulfilledItems = useMemo(
    () => items.filter((i) => i.status === "FULFILLED" || i.status === "PAID"),
    [items],
  );

  const fulfilledCount = fulfilledItems.length;

  const fulfilledRevenue = useMemo(() => {
    try {
      const sum = fulfilledItems.reduce(
        (acc, curr) => acc + BigInt(curr.amount || "0"),
        0n,
      );
      return new Intl.NumberFormat(i18n.language).format(sum) + " ₫";
    } catch {
      return "0 ₫";
    }
  }, [fulfilledItems, i18n.language]);

  const pendingCount = useMemo(
    () =>
      items.filter(
        (i) => i.status === "PENDING_PAYMENT" || i.status === "PENDING",
      ).length,
    [items],
  );

  const reviewCount = useMemo(
    () =>
      items.filter(
        (i) =>
          i.status === "REVIEW_REQUIRED" ||
          i.status === "EXPIRED" ||
          i.status === "CANCELLED" ||
          i.status === "FAILED",
      ).length,
    [items],
  );

  return (
    <div className="space-y-6">
      {/* 1. Quiet Ledger KPI Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Invoices */}
        <div className="bg-card border-border flex items-center justify-between rounded-xl border p-4 shadow-xs transition-colors">
          <div className="min-w-0 space-y-1">
            <p className="text-muted-foreground text-xs font-medium">
              {t("subscription.invoices.kpi.total")}
            </p>
            <p className="text-foreground font-mono text-2xl font-semibold tracking-tight tabular-nums">
              {history.isPending ? "—" : totalCount}
            </p>
          </div>
          <div className="bg-muted/60 text-muted-foreground flex size-10 shrink-0 items-center justify-center rounded-xl">
            <Receipt className="size-5" />
          </div>
        </div>

        {/* Card 2: Paid & Fulfilled */}
        <div className="bg-card border-border flex items-center justify-between rounded-xl border p-4 shadow-xs transition-colors">
          <div className="min-w-0 space-y-1">
            <p className="text-muted-foreground text-xs font-medium">
              {t("subscription.invoices.kpi.fulfilled")}
            </p>
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="text-foreground font-mono text-2xl font-semibold tracking-tight tabular-nums">
                {history.isPending ? "—" : fulfilledCount}
              </span>
              {!history.isPending && fulfilledCount > 0 && (
                <span className="text-muted-foreground font-mono text-xs tabular-nums">
                  ({fulfilledRevenue})
                </span>
              )}
            </div>
          </div>
          <div className="bg-muted/60 text-muted-foreground flex size-10 shrink-0 items-center justify-center rounded-xl">
            <CheckCircle2 className="size-5" />
          </div>
        </div>

        {/* Card 3: Pending Payment */}
        <div className="bg-card border-border flex items-center justify-between rounded-xl border p-4 shadow-xs transition-colors">
          <div className="min-w-0 space-y-1">
            <p className="text-muted-foreground text-xs font-medium">
              {t("subscription.invoices.kpi.pending")}
            </p>
            <p
              className={
                !history.isPending && pendingCount > 0
                  ? "font-mono text-2xl font-semibold tracking-tight text-amber-600 tabular-nums dark:text-amber-400"
                  : "text-foreground font-mono text-2xl font-semibold tracking-tight tabular-nums"
              }
            >
              {history.isPending ? "—" : pendingCount}
            </p>
          </div>
          <div
            className={
              !history.isPending && pendingCount > 0
                ? "flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400"
                : "bg-muted/60 text-muted-foreground flex size-10 shrink-0 items-center justify-center rounded-xl"
            }
          >
            <Clock className="size-5" />
          </div>
        </div>

        {/* Card 4: Action Required */}
        <div className="bg-card border-border flex items-center justify-between rounded-xl border p-4 shadow-xs transition-colors">
          <div className="min-w-0 space-y-1">
            <p className="text-muted-foreground text-xs font-medium">
              {t("subscription.invoices.kpi.review")}
            </p>
            <p
              className={
                !history.isPending && reviewCount > 0
                  ? "text-destructive font-mono text-2xl font-semibold tracking-tight tabular-nums"
                  : "text-foreground font-mono text-2xl font-semibold tracking-tight tabular-nums"
              }
            >
              {history.isPending ? "—" : reviewCount}
            </p>
          </div>
          <div
            className={
              !history.isPending && reviewCount > 0
                ? "bg-destructive/10 text-destructive flex size-10 shrink-0 items-center justify-center rounded-xl"
                : "bg-muted/60 text-muted-foreground flex size-10 shrink-0 items-center justify-center rounded-xl"
            }
          >
            <AlertTriangle className="size-5" />
          </div>
        </div>
      </div>

      {/* 2. Unified Modern Filter Toolbar */}
      <div className="bg-card border-border space-y-3 rounded-2xl border p-4 shadow-xs">
        <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2.5">
            {/* Admin Agency Filter */}
            {admin && (
              <div className="relative min-w-56 flex-1 sm:flex-initial">
                <Search
                  className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2"
                  aria-hidden="true"
                />
                <Input
                  value={agencyInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    setAgencyInput(val);
                    if (
                      !val.trim() ||
                      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
                        val.trim(),
                      )
                    ) {
                      setAgencyIdFilter(val.trim());
                      setCursors([null]);
                      setSelected(null);
                    }
                  }}
                  placeholder={t(
                    "subscription.invoices.searchAgencyPlaceholder",
                  )}
                  aria-label={t(
                    "subscription.invoices.searchAgencyPlaceholder",
                  )}
                  aria-describedby={
                    !isAgencyValid ? "agency-uuid-error" : undefined
                  }
                  aria-invalid={!isAgencyValid}
                  className="h-9 rounded-lg pr-8 pl-8 text-xs"
                />
                {agencyInput && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setAgencyInput("");
                      setAgencyIdFilter("");
                      setCursors([null]);
                      setSelected(null);
                    }}
                    className="text-muted-foreground hover:text-foreground absolute top-1/2 right-1.5 size-7 -translate-y-1/2"
                    aria-label={t("subscription.invoices.resetFilters")}
                    title={t("subscription.invoices.resetFilters")}
                  >
                    <X className="size-3.5" />
                  </Button>
                )}
              </div>
            )}

            {/* Status SelectMenu */}
            <div className="w-44">
              <SelectMenu
                value={filters.status}
                onChange={(val) => handleFilterChange("status", val)}
                options={statusOptions}
                ariaLabel={t("subscription.invoices.status")}
                className="h-9 w-full"
              />
            </div>

            {/* Kind SelectMenu */}
            <div className="w-44">
              <SelectMenu
                value={filters.kind}
                onChange={(val) => handleFilterChange("kind", val)}
                options={kindOptions}
                ariaLabel={t("subscription.invoices.kind")}
                className="h-9 w-full"
              />
            </div>

            {/* Date Range Picker */}
            <div className="min-w-64 flex-1 sm:flex-initial">
              <DateRangePicker
                from={filters.from}
                to={filters.to}
                allowClear
                presets
                className="w-full"
                triggerClassName="h-9 w-full text-xs"
                onChange={(from, to) => {
                  setFilters((current) => ({ ...current, from, to }));
                  setCursors([null]);
                  setSelected(null);
                }}
              />
            </div>
          </div>

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              className="text-muted-foreground hover:text-foreground h-9 shrink-0 rounded-lg px-3 text-xs"
            >
              <RotateCcw className="mr-1.5 size-3.5" />
              <span>{t("subscription.invoices.resetFilters")}</span>
            </Button>
          )}
        </div>

        {/* Validation Warning for Agency UUID */}
        {admin && !isAgencyValid && (
          <p id="agency-uuid-error" className="text-destructive text-xs">
            {t("subscription.invoices.invalidAgencyId")}
          </p>
        )}
      </div>

      {/* 3. Main Data Area: Loading / Error / Table / Empty */}
      {invalidDates ? (
        <div
          role="alert"
          className="border-destructive/20 bg-destructive/10 text-destructive rounded-2xl border p-5 text-sm"
        >
          {t("subscription.invoices.invalidDates")}
        </div>
      ) : history.isPending ? (
        <div className="space-y-3">
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      ) : history.isError ? (
        <div
          role="alert"
          className="border-border bg-card space-y-3 rounded-2xl border p-6 text-center shadow-xs"
        >
          <div className="bg-destructive/10 text-destructive mx-auto flex size-12 items-center justify-center rounded-full">
            <AlertTriangle className="size-6" />
          </div>
          <div className="space-y-1">
            <p className="text-foreground font-semibold">
              {t("subscription.invoices.loadError")}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void history.refetch()}
            className="rounded-lg"
          >
            <RotateCcw className="mr-1.5 size-3.5" />
            {t("subscription.invoices.retry")}
          </Button>
        </div>
      ) : (
        <>
          {history.data.items.length > 0 ? (
            <div className="space-y-4">
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

              {/* 4. Reusable Pagination Controls */}
              <Pagination
                page={cursors.length}
                totalPages={
                  history.data.nextCursor ? cursors.length + 1 : cursors.length
                }
                isFetching={history.isFetching}
                onPageChange={(nextPage) => {
                  if (nextPage < cursors.length) {
                    setCursors((current) => current.slice(0, nextPage));
                    setSelected(null);
                  } else if (
                    nextPage === cursors.length + 1 &&
                    history.data?.nextCursor
                  ) {
                    setCursors((current) => [
                      ...current,
                      history.data.nextCursor,
                    ]);
                    setSelected(null);
                  }
                }}
              />
            </div>
          ) : (
            /* 4. Elegant Empty State */
            <div className="border-border bg-card/60 rounded-2xl border border-dashed p-12 text-center shadow-xs">
              <div className="bg-muted/70 text-muted-foreground mx-auto mb-4 flex size-14 items-center justify-center rounded-full">
                <ReceiptText className="size-7" />
              </div>
              <h3 className="text-foreground mb-1 text-base font-semibold">
                {t("subscription.invoices.emptyTitle")}
              </h3>
              <p className="text-muted-foreground mx-auto mb-5 max-w-sm text-sm">
                {hasActiveFilters
                  ? t("subscription.invoices.emptyDescription")
                  : t("subscription.invoices.empty")}
              </p>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetFilters}
                  className="rounded-lg"
                >
                  <RotateCcw className="mr-1.5 size-3.5" />
                  <span>{t("subscription.invoices.resetFilters")}</span>
                </Button>
              )}
            </div>
          )}
        </>
      )}

      {/* 5. Detail Drawer */}
      <InvoiceDetailDrawer
        orderId={invalidDates ? null : selected}
        agencyId={
          admin
            ? history.data?.items.find((item) => item.id === selected)
                ?.agencyId || activeAgencyId
            : activeAgencyId
        }
        userId={userId}
        admin={admin}
        triggerRef={triggerRef}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}

export default InvoiceHistory;
