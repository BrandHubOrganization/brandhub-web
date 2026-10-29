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
import type { Platform } from "@/types/post";
import type {
  PlatformMetric,
  PublishingTrendPoint,
  PostKpiStats,
} from "../types/dashboard";
import { PLATFORM_META } from "@/pages/social-accounts/lib/platformMeta";

interface PostDistributionChartsProps {
  platformBreakdown: PlatformMetric[];
  publishingTrends: PublishingTrendPoint[];
  kpis?: PostKpiStats;
}

const TRACKED_PLATFORMS: Platform[] = ["FACEBOOK", "INSTAGRAM", "TIKTOK", "THREADS"];

const PLATFORM_PROGRESS_CLASSES: Record<Platform, string> = {
  FACEBOOK: "bg-[#1877F2]",
  INSTAGRAM: "bg-[#E4405F]",
  TIKTOK: "bg-black dark:bg-slate-200",
  THREADS: "bg-[#7856FF]",
};

interface TooltipPayloadItem {
  name: string;
  value: number;
  color?: string;
  stroke?: string;
  dataKey?: string;
}

function PerformanceChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-card border-border rounded-lg border p-2.5 shadow-md">
      <p className="text-foreground mb-1.5 text-xs font-semibold">{label}</p>
      <div className="space-y-1">
        {payload.map((item) => (
          <div key={item.dataKey || item.name} className="text-2xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full" style={{ backgroundColor: item.color || item.stroke }} />
              <span className="text-muted-foreground">{item.name}:</span>
            </div>
            <span className="text-foreground font-mono font-medium">{Number(item.value || 0).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrendsAreaChartCard({ publishingTrends }: { publishingTrends: PublishingTrendPoint[] }) {
  const { t } = useTranslation();

  return (
    <div className="bg-card border-border rounded-xl border p-5 lg:col-span-2">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-foreground text-sm font-bold">
            {t("publish.dashboard.trends.performanceTitle", "Hiệu suất tương tác theo thời gian")}
          </h2>
          <p className="text-muted-foreground text-2xs mt-0.5">
            {t("publish.dashboard.trends.performanceSubtitle", "Tổng hợp lượt tương tác, hiển thị và lượt nhấp từ các bài đăng")}
          </p>
        </div>
        <div className="text-2xs flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-[#3b82f6]" />
            <span className="text-muted-foreground">{t("publish.dashboard.trends.impressions", "Lượt hiển thị")}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="bg-brand-orange size-2.5 rounded-full" />
            <span className="text-muted-foreground">{t("publish.dashboard.trends.engagements", "Lượt tương tác")}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-[#10b981]" />
            <span className="text-muted-foreground">{t("publish.dashboard.trends.clicks", "Lượt nhấp")}</span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={publishingTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorEngagements" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f05a28" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#f05a28" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
            <Tooltip content={<PerformanceChartTooltip />} />
            <Area
              type="monotone"
              dataKey="impressions"
              name={t("publish.dashboard.trends.impressions", "Lượt hiển thị")}
              stroke="#3b82f6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorImpressions)"
            />
            <Area
              type="monotone"
              dataKey="engagements"
              name={t("publish.dashboard.trends.engagements", "Lượt tương tác")}
              stroke="#f05a28"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorEngagements)"
            />
            <Area
              type="monotone"
              dataKey="clicks"
              name={t("publish.dashboard.trends.clicks", "Lượt nhấp")}
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorClicks)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ChannelEfficiencyCard({
  platformBreakdown,
  kpis,
}: {
  platformBreakdown: PlatformMetric[];
  kpis?: PostKpiStats;
}) {
  const { t } = useTranslation();

  const platformsToDisplay = TRACKED_PLATFORMS.map((platform) => {
    const existing = platformBreakdown.find((p) => p.platform === platform);
    return existing ?? { platform, count: 0, percentage: 0, reach: 0, engagements: 0, successCount: 0, failedCount: 0 };
  });

  return (
    <div className="bg-card border-border flex flex-col rounded-xl border p-5">
      <div className="mb-3">
        <h2 className="text-foreground text-sm font-bold">
          {t("publish.dashboard.platforms.performanceTitle", "Hiệu quả theo Kênh xuất bản")}
        </h2>
        <p className="text-muted-foreground text-2xs mt-0.5">
          {t("publish.dashboard.platforms.performanceSubtitle", "Lượt tiếp cận theo từng nền tảng trong 30 ngày qua")}
        </p>
      </div>

      <div className="my-auto py-2 space-y-4.5 sm:space-y-5">
        {platformsToDisplay.map((item) => {
          const meta = PLATFORM_META[item.platform];
          const reachCount = item.reach ?? item.count ?? 0;
          return (
            <div key={item.platform} className="flex items-center gap-2.5 sm:gap-3 text-xs">
              <div className="flex w-24 sm:w-28 shrink-0 items-center gap-2">
                <span className="flex size-4 shrink-0 items-center justify-center">{meta?.icon}</span>
                <span className="text-foreground truncate font-medium">{meta?.label || item.platform}</span>
              </div>

              <div className="bg-muted h-2 flex-1 overflow-hidden rounded-full">
                <div
                  className={cn("h-full rounded-full transition-all duration-500", PLATFORM_PROGRESS_CLASSES[item.platform])}
                  style={{ width: `${Math.min(Math.max(item.percentage, 0), 100)}%` }}
                />
              </div>

              <div className="w-16 sm:w-20 shrink-0 text-right font-mono font-semibold text-foreground">
                {reachCount.toLocaleString()}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3-column balanced footer */}
      <div className="border-border bg-muted/30 mt-auto grid grid-cols-3 divide-x divide-border rounded-lg border p-3 text-center">
        <div className="px-1">
          <p className="text-muted-foreground font-mono text-2xs uppercase tracking-wider">
            {t("publish.dashboard.platforms.totalPostsFooter", "TỔNG BÀI ĐĂNG")}
          </p>
          <p className="text-foreground font-mono text-sm font-bold mt-1">
            {(kpis?.totalPosts ?? 0).toLocaleString()}
          </p>
        </div>
        <div className="px-1">
          <p className="text-muted-foreground font-mono text-2xs uppercase tracking-wider">
            {t("publish.dashboard.platforms.totalReachFooter", "TỔNG TIẾP CẬN")}
          </p>
          <p className="text-foreground font-mono text-sm font-bold mt-1">
            {(kpis?.totalReach ?? 0).toLocaleString()}
          </p>
        </div>
        <div className="px-1">
          <p className="text-muted-foreground font-mono text-2xs uppercase tracking-wider">
            {t("publish.dashboard.platforms.totalEngagementsFooter", "TỔNG TƯƠNG TÁC")}
          </p>
          <p className="text-foreground font-mono text-sm font-bold mt-1">
            {(kpis?.totalEngagements ?? 0).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}

export function PostDistributionCharts({
  platformBreakdown,
  publishingTrends,
  kpis,
}: PostDistributionChartsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <TrendsAreaChartCard publishingTrends={publishingTrends} />
      <ChannelEfficiencyCard platformBreakdown={platformBreakdown} kpis={kpis} />
    </div>
  );
}
