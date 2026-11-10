import { useState } from "react";
import { Link } from "react-router-dom";
import { SelectMenu } from "@/components/ui/select-menu";
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
  errorCode,
  presetRange,
  type AdminRevenue,
} from "@/services/adminRevenueService";
import { AdminReportDialog } from "@/pages/admin/components/AdminReportExport";
import { AdminDateRangePicker } from "@/pages/admin/components/AdminDateRangePicker";

type Preset = "month" | "quarter" | "year" | "custom";
type Grain = "byDay" | "byWeek" | "byMonth";

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
  const [exporting, setExporting] = useState(false);
  const filter = { ...range, timezone, plan };
  const result = useQuery({
    queryKey: ["admin-revenue-sepay", actor, filter],
    queryFn: () => adminRevenueService.overview(filter),
    retry: false,
    placeholderData: (previous) => previous,
  });
  const data = result.data;
  const choosePreset = (value: Preset) => {
    setPreset(value);
    if (value !== "custom") setRange(presetRange(value, timezone));
  };
  const diffDays =
    range.from && range.to
      ? Math.max(
          1,
          Math.round(
            (new Date(range.to).getTime() - new Date(range.from).getTime()) /
              (1000 * 60 * 60 * 24),
          ) + 1,
        )
      : (data?.daily.length ?? 0);
  const activeGrain: Grain =
    preset === "month"
      ? "byDay"
      : preset === "quarter"
        ? "byWeek"
        : preset === "year"
          ? "byMonth"
          : diffDays <= 31
            ? "byDay"
            : diffDays <= 120
              ? "byWeek"
              : "byMonth";
  const money = (value: number, currency = "VND") =>
    new Intl.NumberFormat(i18n.language, {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "VND" ? 0 : 2,
    }).format(value);
  const compact = new Intl.NumberFormat(i18n.language, { notation: "compact" });
  const count = new Intl.NumberFormat(i18n.language);
  const primary = data?.totals.find((x) => x.currency === "VND");
  const planReceipts = data?.plans ?? [];
  const planTotal = planReceipts.reduce(
    (total, item) => total + item.revenue,
    0,
  );
  const others = data?.totals.filter((x) => x.currency !== "VND") ?? [];

  return (
    <div className="w-full min-w-0 space-y-5">
      <section className="bg-card border-border flex w-full min-w-0 flex-wrap items-center gap-3 rounded-xl border p-3">
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
          <AdminDateRangePicker
            from={range.from}
            to={range.to}
            onChange={(from, to) => setRange({ from, to })}
          />
        )}
        <SelectMenu
          ariaLabel={t("admin.revenue.plan")}
          value={plan}
          onChange={setPlan}
          options={[
            { value: "", label: t("admin.revenue.allPlans") },
            ...(data?.plans ?? []).map((p) => ({
              value: p.plan,
              label: p.displayName,
            })),
          ]}
        />
        <SelectMenu
          ariaLabel={t("admin.overview.timezone")}
          value={timezone}
          onChange={(value) => {
            setTimezone(value);
            if (preset !== "custom") setRange(presetRange(preset, value));
          }}
          options={[
            {
              value: "Asia/Ho_Chi_Minh",
              label: t("admin.overview.vietnamTime"),
            },
            { value: "UTC", label: "UTC" },
          ]}
        />
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
          <div className="grid w-full min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
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

          <div className="grid w-full min-w-0 gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
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
                <div className="bg-muted/50 border-border text-muted-foreground inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium">
                  <span className="size-1.5 rounded-full bg-brand-orange" />
                  <span>
                    {t("admin.revenue.grouping", "Hiển thị")}:{" "}
                    <strong className="text-foreground font-semibold">
                      {t(`admin.revenue.${activeGrain}`)}
                    </strong>
                  </span>
                </div>
              </div>
              <div className="text-muted-foreground mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs">
                <span className="flex items-center gap-2">
                  <span
                    className="bg-brand-orange h-2.5 w-8 rounded-sm"
                    aria-hidden="true"
                  />
                  {t("admin.revenue.subscription")}
                </span>
                <span className="flex items-center gap-2">
                  <span
                    className="bg-foreground h-2.5 w-8 rounded-sm"
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
                    barSize={28}
                    barCategoryGap="25%"
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
                        fontSize: 12,
                        fontFamily: "var(--font-sans)",
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
                        fontSize: 12,
                        fontFamily: "var(--font-sans)",
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
                      labelStyle={{ color: "var(--color-foreground)" }}
                      itemStyle={{ color: "var(--color-foreground)" }}
                      formatter={(value) => money(Number(value))}
                    />
                    <Bar
                      dataKey="subscription"
                      name={t("admin.revenue.subscription")}
                      stackId="r"
                      fill="var(--color-brand-orange)"
                      maxBarSize={40}
                      radius={[4, 4, 0, 0]}
                      isAnimationActive={false}
                    />
                    <Bar
                      dataKey="aiCredit"
                      name={t("admin.revenue.aiCredit")}
                      stackId="r"
                      fill="var(--color-foreground)"
                      maxBarSize={40}
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
              <ul className="mt-5 space-y-2">
                {planReceipts.map((p) => {
                  const isSelected = plan === p.plan;
                  return (
                    <li
                      key={p.plan}
                      role="button"
                      tabIndex={0}
                      aria-pressed={isSelected}
                      onClick={() => setPlan(isSelected ? "" : p.plan)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setPlan(isSelected ? "" : p.plan);
                        }
                      }}
                      className={cn(
                        "group -mx-2.5 cursor-pointer rounded-xl p-2.5 transition-all outline-none",
                        isSelected
                          ? "border-brand-orange/40 bg-brand-orange/10 dark:bg-brand-orange/15 shadow-xs border"
                          : "hover:bg-muted/60 border border-transparent",
                      )}
                    >
                      <div className="flex items-baseline justify-between gap-3 text-sm">
                        <span
                          className={cn(
                            "font-semibold transition-colors",
                            isSelected
                              ? "text-brand-orange font-bold"
                              : "text-foreground group-hover:text-foreground",
                          )}
                        >
                          {p.displayName}
                        </span>
                        <span className="font-sans text-sm font-semibold tabular-nums">
                          {money(p.revenue)}
                        </span>
                      </div>
                      <div className="bg-muted mt-2 h-2 overflow-hidden rounded-full">
                        <div
                          className="bg-brand-orange h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${planTotal ? (p.revenue / planTotal) * 100 : 0}%`,
                          }}
                        />
                      </div>
                      <div className="text-muted-foreground mt-1.5 flex items-center justify-between text-xs">
                        <span>
                          {t("admin.revenue.planPayments", {
                            count: p.paidTransactions,
                          })}
                          {" · "}
                          {t("admin.revenue.planShare", {
                            percent: planTotal
                              ? Math.round((p.revenue / planTotal) * 100)
                              : 0,
                          })}
                        </span>
                        {isSelected && (
                          <span className="text-brand-orange text-[11px] font-medium">
                            {t("admin.revenue.filtering", "Đang lọc")}
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>

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
      <div className="bg-card border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border p-4">
        <div>
          <h4 className="text-foreground text-sm font-semibold">
            {t("admin.revenue.invoicesCtaTitle", "Tra cứu lịch sử thanh toán toàn hệ thống")}
          </h4>
          <p className="text-muted-foreground text-xs">
            {t("admin.revenue.invoicesCtaDesc", "Xem danh sách chi tiết các hóa đơn, giao dịch PayOS/SePay và trạng thái thanh toán.")}
          </p>
        </div>
        <Button variant="outline" size="sm" asChild className="shrink-0">
          <Link to="/admin?view=invoices">
            {t("admin.revenue.viewInvoices", "Xem lịch sử thanh toán")} →
          </Link>
        </Button>
      </div>
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
      <h2 className="text-muted-foreground font-sans text-xs leading-4 font-medium tracking-wider uppercase">
        {label}
      </h2>
      <p
        className={cn(
          "mt-3 truncate font-sans text-2xl leading-none font-semibold tracking-tight tabular-nums",
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
