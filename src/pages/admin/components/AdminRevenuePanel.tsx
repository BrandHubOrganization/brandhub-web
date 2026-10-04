import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Download, RefreshCw } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import {
  adminRevenueService,
  describeTransaction,
  errorCode,
  presetRange,
  type AdminRevenue,
} from "@/services/adminRevenueService";
import { AdminReportDialog } from "@/pages/admin/components/AdminReportExport";

type Preset = "month" | "quarter" | "year" | "custom";
type Grain = "byDay" | "byWeek" | "byMonth";
const field =
  "border-input bg-card text-foreground focus-visible:outline-ring h-9 rounded-lg border px-3 text-xs focus-visible:outline-2";

/** Groups daily receipts into weeks (from the period start) or calendar months. */
function bucket(daily: AdminRevenue["daily"], grain: Grain) {
  const groups = new Map<
    string,
    { label: string; subscription: number; aiCredit: number }
  >();
  daily.forEach((day, i) => {
    const key =
      grain === "byDay"
        ? day.date
        : grain === "byMonth"
          ? day.date.slice(0, 7)
          : daily[i - (i % 7)].date;
    const label =
      grain === "byMonth"
        ? `${key.slice(5, 7)}/${key.slice(0, 4)}`
        : `${key.slice(8, 10)}/${key.slice(5, 7)}`;
    const group = groups.get(key) ?? { label, subscription: 0, aiCredit: 0 };
    group.subscription += day.subscription;
    group.aiCredit += day.aiCredit;
    groups.set(key, group);
  });
  return [...groups.values()];
}

export function AdminRevenuePanel() {
  const { t, i18n } = useTranslation();
  const actor = useAuthStore((s) => s.user?.id);
  const [timezone, setTimezone] = useState("Asia/Ho_Chi_Minh");
  const [preset, setPreset] = useState<Preset>("month");
  const [range, setRange] = useState(() =>
    presetRange("month", "Asia/Ho_Chi_Minh"),
  );
  const [plan, setPlan] = useState("");
  const [grain, setGrain] = useState<Grain | null>(null);
  const [exporting, setExporting] = useState(false);
  const filter = { ...range, timezone, plan };
  const result = useQuery({
    queryKey: ["admin-revenue", actor, filter],
    queryFn: () => adminRevenueService.overview(filter),
    retry: false,
    placeholderData: (previous) => previous,
  });
  const data = result.data;
  const choosePreset = (value: Preset) => {
    setPreset(value);
    if (value !== "custom") setRange(presetRange(value, timezone));
  };
  const days = data?.daily.length ?? 0;
  const activeGrain: Grain =
    grain ?? (days > 62 ? "byMonth" : days > 14 ? "byWeek" : "byDay");
  const money = (value: number, currency = "VND") =>
    new Intl.NumberFormat(i18n.language, {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "VND" ? 0 : 2,
    }).format(value);
  const compact = new Intl.NumberFormat(i18n.language, { notation: "compact" });
  const count = new Intl.NumberFormat(i18n.language);
  const primary = data?.totals.find((x) => x.currency === "VND");
  const others = data?.totals.filter((x) => x.currency !== "VND") ?? [];

  return (
    <div className="space-y-5">
      <section className="bg-card border-border flex flex-wrap items-center gap-3 rounded-xl border p-3">
        <div
          role="group"
          aria-label={t("admin.revenue.period")}
          className="bg-muted/60 border-border flex rounded-lg border p-1"
        >
          {(["month", "quarter", "year", "custom"] as const).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={preset === value}
              onClick={() => choosePreset(value)}
              className={cn(
                "focus-visible:outline-ring rounded-md px-3 py-1.5 text-xs transition-colors focus-visible:outline-2",
                preset === value
                  ? "bg-card text-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t(`admin.revenue.${value}`)}
            </button>
          ))}
        </div>
        {preset === "custom" && (
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              aria-label={t("admin.revenue.from")}
              value={range.from}
              max={range.to}
              onChange={(e) =>
                e.target.value &&
                setRange((r) => ({ ...r, from: e.target.value }))
              }
              className={field}
            />
            <input
              type="date"
              aria-label={t("admin.revenue.to")}
              value={range.to}
              min={range.from}
              onChange={(e) =>
                e.target.value &&
                setRange((r) => ({ ...r, to: e.target.value }))
              }
              className={field}
            />
          </div>
        )}
        <select
          aria-label={t("admin.revenue.plan")}
          value={plan}
          onChange={(e) => setPlan(e.target.value)}
          className={field}
        >
          <option value="">{t("admin.revenue.allPlans")}</option>
          {(data?.plans ?? []).map((p) => (
            <option key={p.plan} value={p.plan}>
              {p.displayName}
            </option>
          ))}
        </select>
        <select
          aria-label={t("admin.overview.timezone")}
          value={timezone}
          onChange={(e) => {
            setTimezone(e.target.value);
            if (preset !== "custom")
              setRange(presetRange(preset, e.target.value));
          }}
          className={field}
        >
          <option value="Asia/Ho_Chi_Minh">
            {t("admin.overview.vietnamTime")}
          </option>
          <option value="UTC">UTC</option>
        </select>
        <div className="ml-auto flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="h-9"
            disabled={result.isFetching}
            onClick={() => void result.refetch()}
          >
            <RefreshCw
              className={cn(
                "size-3.5",
                result.isFetching && "motion-safe:animate-spin",
              )}
            />
            {t("admin.revenue.refresh")}
          </Button>
          <Button
            variant="outline"
            className="h-9"
            onClick={() => setExporting(true)}
          >
            <Download className="size-3.5" />
            {t("admin.revenue.export")}
          </Button>
        </div>
      </section>

      {result.isError && (
        <div
          role="alert"
          className="border-destructive/25 bg-destructive/5 flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4 text-sm"
        >
          <p>
            {t(
              errorCode(result.error) === "INVALID_DATE_RANGE"
                ? "admin.revenue.invalidRange"
                : "admin.revenue.error",
            )}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void result.refetch()}
          >
            {t("admin.overview.retry")}
          </Button>
        </div>
      )}

      {result.isPending && (
        <div
          role="status"
          aria-label={t("admin.loading")}
          className="space-y-5"
        >
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
            {[0, 1, 2, 3, 4, 5].map((x) => (
              <Skeleton key={x} className="h-32 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-96 rounded-xl" />
        </div>
      )}

      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
            <Kpi
              label={t("admin.revenue.mrr")}
              value={money(data.mrr)}
              hint={t("admin.revenue.mrrHint", {
                count: data.activeSubscriptions,
              })}
              accent
            />
            <Kpi
              label={t("admin.revenue.arr")}
              value={money(data.arr)}
              hint={t("admin.revenue.arrHint")}
            />
            <Kpi
              label={t("admin.revenue.gross")}
              value={money(primary?.gross ?? 0)}
              hint={t("admin.revenue.grossHint", {
                subscription: compact.format(primary?.subscription ?? 0),
                credit: compact.format(primary?.aiCredit ?? 0),
              })}
            />
            <Kpi
              label={t("admin.revenue.refunds")}
              value={money(primary?.refunds ?? 0)}
              hint={t("admin.revenue.refundsHint")}
            />
            <Kpi
              label={t("admin.revenue.net")}
              value={money(primary?.net ?? 0)}
              hint={t("admin.revenue.netHint")}
            />
            <Kpi
              label={t("admin.revenue.count")}
              value={count.format(primary?.successfulTransactions ?? 0)}
              hint={t("admin.revenue.countHint")}
            />
          </div>
          {others.map((x) => (
            <p key={x.currency} className="text-muted-foreground text-xs">
              {t("admin.revenue.otherCurrency", {
                currency: x.currency,
                amount: money(x.net, x.currency),
              })}
            </p>
          ))}

          <div className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
            <section className="bg-card border-border min-w-0 rounded-xl border p-5 lg:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold">
                    {t("admin.revenue.chartTitle")}
                  </h2>
                  <p className="text-muted-foreground mt-1 text-xs leading-5">
                    {t("admin.revenue.chartHint", { currency: "VND" })}
                  </p>
                </div>
                <div
                  role="group"
                  aria-label={t("admin.revenue.chartTitle")}
                  className="bg-muted/60 border-border flex rounded-lg border p-1"
                >
                  {(["byDay", "byWeek", "byMonth"] as const).map((value) => (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={activeGrain === value}
                      onClick={() => setGrain(value)}
                      className={cn(
                        "focus-visible:outline-ring rounded-md px-3 py-1.5 text-xs transition-colors focus-visible:outline-2",
                        activeGrain === value
                          ? "bg-card text-foreground font-semibold shadow-xs"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {t(`admin.revenue.${value}`)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="text-muted-foreground mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs">
                <span className="flex items-center gap-2">
                  <span
                    className="bg-foreground h-2.5 w-8"
                    aria-hidden="true"
                  />
                  {t("admin.revenue.subscription")}
                </span>
                <span className="flex items-center gap-2">
                  <span
                    className="bg-brand-orange h-2.5 w-8"
                    aria-hidden="true"
                  />
                  {t("admin.revenue.aiCredit")}
                </span>
              </div>
              <div
                className="mt-3 h-72"
                role="img"
                aria-label={t("admin.revenue.chartTitle")}
              >
                <ResponsiveContainer width="100%" height="100%" minHeight={240}>
                  <BarChart
                    data={bucket(data.daily, activeGrain)}
                    margin={{ top: 10, right: 8, left: -4, bottom: 4 }}
                  >
                    <CartesianGrid
                      vertical={false}
                      stroke="var(--color-border)"
                    />
                    <XAxis
                      dataKey="label"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fontSize: 11,
                        fontFamily: "var(--font-mono)",
                        fill: "var(--color-muted-foreground)",
                      }}
                      dy={8}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      width={56}
                      tickFormatter={(v) => compact.format(v)}
                      tick={{
                        fontSize: 11,
                        fontFamily: "var(--font-mono)",
                        fill: "var(--color-muted-foreground)",
                      }}
                    />
                    <Tooltip
                      cursor={{ fill: "var(--color-muted)", opacity: 0.4 }}
                      contentStyle={{
                        borderRadius: 12,
                        fontSize: 12,
                        background: "var(--color-card)",
                        border: "1px solid var(--color-border)",
                        color: "var(--color-foreground)",
                      }}
                      formatter={(value) => money(Number(value))}
                    />
                    <Bar
                      dataKey="subscription"
                      name={t("admin.revenue.subscription")}
                      stackId="r"
                      fill="var(--color-foreground)"
                      isAnimationActive={false}
                    />
                    <Bar
                      dataKey="aiCredit"
                      name={t("admin.revenue.aiCredit")}
                      stackId="r"
                      fill="var(--color-brand-orange)"
                      radius={[4, 4, 0, 0]}
                      isAnimationActive={false}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {!primary?.successfulTransactions && (
                <p className="text-muted-foreground mt-2 text-xs">
                  {t("admin.revenue.empty")}
                </p>
              )}
            </section>

            <section className="bg-card border-border min-w-0 rounded-xl border p-5 lg:p-6">
              <h2 className="text-base font-semibold">
                {t("admin.revenue.plansTitle")}
              </h2>
              <p className="text-muted-foreground mt-1 text-xs leading-5">
                {t("admin.revenue.plansHint")}
              </p>
              <ul className="mt-5 space-y-4">
                {data.plans.map((p) => (
                  <li key={p.plan}>
                    <div className="flex items-baseline justify-between gap-3 text-sm">
                      <span className="font-semibold">{p.displayName}</span>
                      <span className="font-mono text-sm font-semibold tabular-nums">
                        {money(p.mrr)}
                      </span>
                    </div>
                    <div className="bg-muted mt-2 h-2 overflow-hidden rounded-full">
                      <div
                        className="bg-brand-orange h-full rounded-full"
                        style={{
                          width: `${data.mrr ? (p.mrr / data.mrr) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <p className="text-muted-foreground mt-1.5 text-xs">
                      {t("admin.revenue.subscribers", { count: p.subscribers })}
                      , {money(p.priceMonthly)}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <section className="bg-card border-border min-w-0 rounded-xl border p-5 lg:p-6">
            <h2 className="text-base font-semibold">
              {t("admin.revenue.transactionsTitle")}
            </h2>
            <p className="text-muted-foreground mt-1 text-xs leading-5">
              {t("admin.revenue.transactionsHint")}
            </p>
            {data.transactions.length === 0 ? (
              <p className="text-muted-foreground mt-6 text-sm">
                {t("admin.revenue.empty")}
              </p>
            ) : (
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-muted/60 text-muted-foreground text-xs">
                    <tr>
                      {(
                        [
                          "customer",
                          "type",
                          "amount",
                          "status",
                          "payosRef",
                          "time",
                        ] as const
                      ).map((key) => (
                        <th
                          key={key}
                          scope="col"
                          className="px-4 py-3 font-semibold"
                        >
                          {t(`admin.revenue.${key}`)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.transactions.map((tx) => {
                      const d = describeTransaction(tx);
                      return (
                        <tr
                          key={tx.id}
                          className="border-border border-b last:border-0"
                        >
                          <td className="px-4 py-3">
                            <p className="font-medium">{tx.customerName}</p>
                            <p className="text-muted-foreground text-xs">
                              {tx.customerEmail}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            {d.kind === "plan"
                              ? t("admin.revenue.planTx", { plan: d.value })
                              : t("admin.revenue.creditTx", {
                                  formatted: count.format(d.value),
                                })}
                          </td>
                          <td className="px-4 py-3 font-mono font-semibold tabular-nums">
                            {money(tx.amount, tx.currency)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={cn(
                                "rounded-full px-2 py-0.5 font-mono text-[11px] font-semibold",
                                tx.status === "COMPLETED"
                                  ? "bg-success/15 text-success"
                                  : "bg-muted text-muted-foreground",
                              )}
                            >
                              {t(
                                tx.status === "COMPLETED"
                                  ? "admin.revenue.completed"
                                  : "admin.revenue.refunded",
                              )}
                            </span>
                          </td>
                          <td className="text-muted-foreground px-4 py-3 font-mono text-xs">
                            {tx.payosTxId ?? "—"}
                          </td>
                          <td className="text-muted-foreground px-4 py-3 font-mono text-xs">
                            {new Intl.DateTimeFormat(i18n.language, {
                              dateStyle: "short",
                              timeStyle: "short",
                              timeZone: data.timezone,
                            }).format(new Date(tx.paidAt))}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <div className="text-muted-foreground border-border flex flex-wrap justify-between gap-2 border-t pt-4 text-xs">
            <span>
              {t("admin.revenue.asOf", {
                time: new Intl.DateTimeFormat(i18n.language, {
                  dateStyle: "medium",
                  timeStyle: "short",
                  timeZone: data.timezone,
                }).format(new Date(data.asOf)),
                timezone: data.timezone,
              })}
            </span>
            <span>{t("admin.revenue.security")}</span>
          </div>
        </>
      )}
      {exporting && (
        <AdminReportDialog
          defaults={{
            type: "REVENUE",
            from: range.from,
            to: range.to,
            timezone,
          }}
          onClose={() => setExporting(false)}
        />
      )}
    </div>
  );
}

function Kpi({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint: string;
  accent?: boolean;
}) {
  return (
    <section
      aria-label={label}
      className="bg-card border-border flex min-w-0 flex-col rounded-xl border p-5"
    >
      <h2 className="text-muted-foreground text-2xs font-mono leading-4 font-medium tracking-wider uppercase">
        {label}
      </h2>
      <p
        className={cn(
          "mt-3 truncate font-mono text-[22px] leading-none font-semibold tracking-tight tabular-nums",
          accent && "text-brand-orange",
        )}
        title={value}
      >
        {value}
      </p>
      <p className="text-muted-foreground mt-3 text-xs leading-5">{hint}</p>
    </section>
  );
}
