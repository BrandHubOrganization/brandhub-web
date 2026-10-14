import { useId } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";
import { AdminStrikeSummary } from "@/pages/admin/components/AdminOverviewSummary";
import type { AdminStatistics } from "@/services/adminStatisticsService";
import type { AccountStatus } from "@/services/adminAccountService";

const STATUS_COLORS: Record<AccountStatus, string> = {
  ACTIVE: "var(--color-success)",
  FLAGGED: "var(--color-brand-orange)",
  PENDING_VERIFICATION: "var(--color-warning)",
  DEACTIVATED: "var(--color-destructive)",
  SUSPENDED: "var(--color-foreground)",
  DELETED: "var(--color-muted-foreground)",
};

// Cumulative totals sampled every `step` days, ending on the last day, so each
// period shows about six points like the dashboard reference.
function growthSeries(data: AdminStatistics) {
  const step = data.days === 7 ? 1 : data.days === 30 ? 5 : 15;
  const agencyDays = data.agencyRegistrations ?? [];
  let users = data.totalUsers - data.newUsersInPeriod;
  let agencies =
    data.totalAgencies - agencyDays.reduce((sum, day) => sum + day.count, 0);
  const daily = data.registrations.map((day, i) => {
    users += day.count;
    agencies += agencyDays[i]?.count ?? 0;
    return { date: day.date, users, agencies };
  });
  return daily.filter((_, i) => (daily.length - 1 - i) % step === 0);
}

export function AdminRegistrationChart({
  data,
  days,
  onDaysChange,
}: {
  data: AdminStatistics;
  days: number;
  onDaysChange: (days: number) => void;
}) {
  const { t, i18n } = useTranslation();
  const gradientId = useId();
  const number = new Intl.NumberFormat(i18n.language);
  const series = growthSeries(data);
  const dateLabel = (value: string) =>
    `${value.slice(8, 10)}/${value.slice(5, 7)}`;
  const tick = {
    fontSize: 11,
    fontFamily: "var(--font-mono)",
    fill: "var(--color-muted-foreground)",
  };
  return (
    <section
      className="bg-card border-border flex min-w-0 flex-col rounded-xl border p-5 lg:p-6"
      aria-label={t("admin.overview.growth")}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">
            {t("admin.overview.growth")}
          </h2>
          <p className="text-muted-foreground mt-1 text-xs leading-5">
            {t("admin.overview.growthHint", { count: data.newUsersInPeriod })}
          </p>
        </div>
        <div
          role="group"
          aria-label={t("admin.overview.period")}
          className="bg-muted/60 border-border flex rounded-lg border p-1"
        >
          {[7, 30, 90].map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={days === value}
              onClick={() => onDaysChange(value)}
              className={cn(
                "focus-visible:outline-ring rounded-md px-3 py-1.5 text-xs transition-colors focus-visible:outline-2",
                days === value
                  ? "bg-card text-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t("admin.overview.daysShort", { count: value })}
            </button>
          ))}
        </div>
      </div>
      <div className="text-muted-foreground mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs">
        <span className="flex items-center gap-2">
          <span
            className="border-brand-orange bg-brand-orange/15 h-2.5 w-8 border-2"
            aria-hidden="true"
          />
          {t("admin.overview.growthUsers")}
        </span>
        <span className="flex items-center gap-2">
          <span
            className="border-foreground h-2.5 w-8 border-2"
            aria-hidden="true"
          />
          {t("admin.overview.growthAgencies")}
        </span>
      </div>
      <div
        className="mt-3 h-72 min-w-0 flex-1"
        role="img"
        aria-label={t("admin.overview.chartSummary", {
          count: data.newUsersInPeriod,
          days: data.days,
        })}
      >
        <ResponsiveContainer width="100%" height="100%" minHeight={240}>
          <AreaChart
            data={series}
            margin={{ top: 10, right: 12, left: -12, bottom: 4 }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--color-brand-orange)"
                  stopOpacity={0.14}
                />
                <stop
                  offset="100%"
                  stopColor="var(--color-brand-orange)"
                  stopOpacity={0.05}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--color-border)" />
            <XAxis
              dataKey="date"
              tickFormatter={dateLabel}
              interval={0}
              padding={{ left: 12, right: 20 }}
              axisLine={false}
              tickLine={false}
              tick={tick}
              dy={8}
            />
            <YAxis
              allowDecimals={false}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => number.format(value)}
              tick={tick}
              width={52}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                fontSize: 12,
                background: "var(--color-card)",
                border: "1px solid var(--color-border)",
                color: "var(--color-foreground)",
              }}
              labelFormatter={(value) => dateLabel(String(value))}
              formatter={(value) => number.format(Number(value))}
            />
            <Area
              type="monotone"
              dataKey="users"
              name={t("admin.overview.growthUsers")}
              stroke="var(--color-brand-orange)"
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              dot={{ r: 4, fill: "var(--color-brand-orange)", strokeWidth: 0 }}
              activeDot={{ r: 6 }}
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="agencies"
              name={t("admin.overview.growthAgencies")}
              stroke="var(--color-foreground)"
              strokeWidth={2}
              fill="none"
              dot={{
                r: 3.5,
                fill: "var(--color-card)",
                stroke: "var(--color-foreground)",
                strokeWidth: 2,
              }}
              activeDot={{ r: 5 }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {data.newUsersInPeriod === 0 && (
        <p className="text-muted-foreground mt-2 text-xs leading-5">
          {t("admin.overview.emptyGrowth")}
        </p>
      )}
    </section>
  );
}

export function AdminAccountDistribution({ data }: { data: AdminStatistics }) {
  const { t, i18n } = useTranslation();
  const number = new Intl.NumberFormat(i18n.language);
  const pct = (count: number) =>
    data.totalUsers ? (count / data.totalUsers) * 100 : 0;
  const visible = data.accountStatuses.filter((s) => s.count > 0);
  const segments = visible.map((status, i) => {
    const start = visible.slice(0, i).reduce((sum, s) => sum + pct(s.count), 0);
    return `${STATUS_COLORS[status.status]} ${start}% ${start + pct(status.count)}%`;
  });
  return (
    <section className="bg-card border-border min-w-0 rounded-xl border p-5 lg:p-6">
      <h2 className="text-sm font-semibold">
        {t("admin.overview.statusTitle")}
      </h2>
      <p className="text-muted-foreground mt-1 text-xs leading-5">
        {t("admin.overview.statusHint")}
      </p>
      <div className="my-6 flex flex-col items-center gap-6 sm:flex-row xl:flex-col 2xl:flex-row">
        <div
          className="bg-muted grid size-36 shrink-0 place-items-center rounded-full"
          style={
            segments.length
              ? { background: `conic-gradient(${segments.join(",")})` }
              : undefined
          }
        >
          <div className="bg-card flex size-28 flex-col items-center justify-center rounded-full">
            <span className="font-mono text-2xl font-semibold tabular-nums">
              {number.format(data.totalUsers)}
            </span>
            <span className="text-muted-foreground text-2xs mt-1">
              {t("admin.navigation.users")}
            </span>
          </div>
        </div>
        <div className="w-full min-w-0 space-y-3">
          {data.accountStatuses.map((status) => (
            <Link
              key={status.status}
              to={`/admin?view=users&status=${status.status}`}
              className={cn(
                "hover:bg-muted/50 focus-visible:outline-ring -mx-1 flex items-center gap-2 rounded-md px-1 py-0.5 text-xs focus-visible:outline-2",
              )}
            >
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ background: STATUS_COLORS[status.status] }}
                aria-hidden="true"
              />
              <span className="flex-1">
                {t(`admin.status.${status.status}`)}
              </span>
              <span className="font-mono tabular-nums">
                {number.format(status.count)}
              </span>
              <span className="text-muted-foreground w-10 text-right font-mono tabular-nums">
                {data.totalUsers
                  ? Math.round((status.count / data.totalUsers) * 100)
                  : 0}
                %
              </span>
            </Link>
          ))}
        </div>
      </div>
      {data.totalUsers === 0 && (
        <p className="text-muted-foreground mb-4 text-xs">
          {t("admin.overview.emptyStatus")}
        </p>
      )}
      <AdminStrikeSummary data={data} />
    </section>
  );
}
