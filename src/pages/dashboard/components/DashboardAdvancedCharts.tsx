import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { TrendingUp, Calendar, Layers } from "lucide-react";
import type { DailyPoint, HourBucket } from "@/types/analytics";

const BRAND_ORANGE_HEX = "#f05a28";
const NEUTRAL_SLATE = "#64748b";

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "#94a3b8",
  PENDING_APPROVAL: "#f59e0b",
  APPROVED: "#3b82f6",
  SCHEDULED: "#8b5cf6",
  IN_PROGRESS: "#0d9488",
  PUBLISHING: "#0d9488",
  PUBLISHED: BRAND_ORANGE_HEX,
  FAILED: "#e11d48",
  REJECTED: "#be123c",
};

interface TooltipPayloadItem {
  name?: string;
  value?: number | string;
  color?: string;
  fill?: string;
}

interface MinimalTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

function MinimalTooltip({ active, payload, label }: MinimalTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="border-border bg-card/95 backdrop-blur-md rounded-lg border p-2.5 shadow-lg text-xs">
      <p className="text-foreground font-semibold mb-1">{label}</p>
      {payload.map((entry, index) => (
        <div key={`tip-${index}`} className="flex items-center gap-2 justify-between min-w-28 text-2xs py-0.5">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: entry.color || entry.fill }}
            />
            {entry.name}:
          </span>
          <span className="font-mono font-medium text-foreground">
            {typeof entry.value === "number" ? entry.value.toLocaleString() : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function EmptyChart({ className }: { className: string }) {
  const { t } = useTranslation();
  return (
    <div className={`text-muted-foreground flex items-center justify-center text-xs ${className}`}>
      {t("dashboard.charts.empty")}
    </div>
  );
}

export function AudienceGrowthAreaChart({
  trend,
  reachGrowth,
  engagementGrowth,
}: {
  trend: DailyPoint[];
  reachGrowth: number | null;
  engagementGrowth: number | null;
}) {
  const { t, i18n } = useTranslation();
  const [metric, setMetric] = useState<"reach" | "engagement">("reach");
  const growth = metric === "reach" ? reachGrowth : engagementGrowth;
  const total = trend.reduce((sum, point) => sum + point[metric], 0);
  const metricLabel = t(`dashboard.charts.${metric}`);
  const data = trend.map((point) => ({
    ...point,
    // The API sends the viewer's local date; parsing it bare would read it as UTC.
    day: new Date(`${point.date}T00:00:00`).toLocaleDateString(i18n.language, { weekday: "short" }),
  }));

  return (
    <div className="border-border bg-card rounded-xl border p-5 shadow-xs flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="size-4 text-foreground" />
            <h3 className="text-foreground text-sm font-bold">
              {t("dashboard.charts.audienceTrendTitle")}
            </h3>
          </div>
          <p className="text-muted-foreground text-2xs mt-0.5">
            {t("dashboard.charts.audienceTrendSubtitle")}
          </p>
        </div>

        {/* Metric Switcher */}
        <div className="bg-muted inline-flex rounded-lg p-0.5 text-xs">
          {(["reach", "engagement"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setMetric(option)}
              className={`cursor-pointer rounded-md px-2.5 py-1 text-2xs font-medium transition-all ${
                metric === option
                  ? "bg-card text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t(`dashboard.charts.${option}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="brandOrangeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={BRAND_ORANGE_HEX} stopOpacity={0.25} />
                <stop offset="95%" stopColor={BRAND_ORANGE_HEX} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
            <Tooltip content={<MinimalTooltip />} />
            <Area
              type="monotone"
              dataKey={metric}
              name={metricLabel}
              stroke={BRAND_ORANGE_HEX}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#brandOrangeGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="border-border/60 mt-4 flex items-center justify-between gap-3 border-t pt-3 text-2xs text-muted-foreground">
        <span>
          {growth === null
            ? t("dashboard.charts.noPreviousWeek")
            : t("dashboard.charts.growthStat", { value: `${growth > 0 ? "+" : ""}${growth}` })}
        </span>
        <span className="font-mono text-foreground font-semibold">
          {total.toLocaleString()} {metricLabel}
        </span>
      </div>
    </div>
  );
}

export function ContentStatusDonutChart({ data }: { data: Record<string, number> }) {
  const { t } = useTranslation();
  const chartData = Object.entries(data).map(([key, value]) => ({
    name: t(`workspace.dashboard.status.${key}`, key),
    statusKey: key,
    value,
  }));
  const total = chartData.reduce((acc, cur) => acc + cur.value, 0);

  return (
    <div className="border-border bg-card rounded-xl border p-5 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2">
          <Layers className="size-4 text-foreground" />
          <h3 className="text-foreground text-sm font-bold">
            {t("dashboard.charts.contentStatusTitle")}
          </h3>
        </div>
        <p className="text-muted-foreground text-2xs mt-0.5">
          {t("dashboard.charts.contentStatusSubtitle")}
        </p>
      </div>

      {total === 0 ? (
        <EmptyChart className="my-2 h-52" />
      ) : (
        <>
          <div className="relative my-2 flex h-52 items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  innerRadius={58}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {chartData.map((entry) => (
                    <Cell
                      key={`cell-${entry.statusKey}`}
                      fill={STATUS_COLORS[entry.statusKey] || NEUTRAL_SLATE}
                    />
                  ))}
                </Pie>
                <Tooltip content={<MinimalTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Total Label in Center */}
            <div className="pointer-events-none absolute flex flex-col items-center justify-center">
              <span className="text-muted-foreground text-3xs uppercase tracking-wider">
                {t("dashboard.charts.total")}
              </span>
              <span className="text-foreground text-2xl font-bold font-mono">{total}</span>
              <span className="text-muted-foreground text-3xs">{t("dashboard.charts.postsUnit")}</span>
            </div>
          </div>

          {/* Modern Compact Legend */}
          <div className="grid grid-cols-2 gap-2 text-2xs pt-2 border-t border-border/60">
            {chartData.map((item) => (
              <div key={item.statusKey} className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-muted-foreground truncate">
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: STATUS_COLORS[item.statusKey] || NEUTRAL_SLATE }}
                  />
                  <span className="truncate">{item.name}</span>
                </span>
                <span className="font-mono font-medium text-foreground ml-2">
                  {item.value} ({Math.round((item.value / total) * 100)}%)
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const PLATFORM_BARS = [
  { key: "facebook", name: "Facebook", color: "#3b82f6" },
  { key: "instagram", name: "Instagram", color: "#ec4899" },
  { key: "tiktok", name: "TikTok", color: BRAND_ORANGE_HEX },
  { key: "threads", name: "Threads", color: NEUTRAL_SLATE },
] as const;

export function PeakHoursBarChart({ hours }: { hours: HourBucket[] }) {
  const { t } = useTranslation();
  const data = hours.map((bucket) => ({
    ...bucket,
    label: `${String(bucket.hour).padStart(2, "0")}:00`,
  }));

  return (
    <div className="border-border bg-card rounded-xl border p-5 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2">
          <Calendar className="size-4 text-foreground" />
          <h3 className="text-foreground text-sm font-bold">
            {t("dashboard.charts.peakHoursTitle")}
          </h3>
        </div>
        <p className="text-muted-foreground text-2xs mt-0.5">
          {t("dashboard.charts.peakHoursSubtitle")}
        </p>
      </div>

      {data.length === 0 ? (
        <EmptyChart className="my-2 h-56" />
      ) : (
        <>
          <div className="h-56 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                <Tooltip content={<MinimalTooltip />} />
                {PLATFORM_BARS.map((bar) => (
                  <Bar key={bar.key} dataKey={bar.key} name={bar.name} stackId="a" fill={bar.color} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap items-center justify-around gap-2 border-t border-border/60 pt-3 text-2xs text-muted-foreground">
            {PLATFORM_BARS.map((bar) => (
              <span key={bar.key} className="flex items-center gap-1.5">
                <span className="size-2 rounded-full" style={{ backgroundColor: bar.color }} /> {bar.name}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
