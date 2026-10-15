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
import type { PlatformMetric, PublishingTrendPoint } from "../types/dashboard";
import { PLATFORM_META } from "@/pages/social-accounts/lib/platformMeta";

interface PostDistributionChartsProps {
  platformBreakdown: PlatformMetric[];
  publishingTrends: PublishingTrendPoint[];
}

const PLATFORM_COLORS: Record<string, string> = {
  FACEBOOK: "#1877F2",
  INSTAGRAM: "#E4405F",
  TIKTOK: "#000000",
  THREADS: "#7856FF",
};

export function PostDistributionCharts({
  platformBreakdown,
  publishingTrends,
}: PostDistributionChartsProps) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* 1. Publishing Trends Chart (2 cols) */}
      <div className="bg-card border-border lg:col-span-2 rounded-xl border p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-foreground text-sm font-bold">
              {t("publish.dashboard.trends.title", "Xu hướng đăng bài theo thời gian")}
            </h2>
            <p className="text-muted-foreground text-2xs mt-0.5">
              {t("publish.dashboard.trends.subtitle", "Thống kê số lượng bài đăng thành công và lên lịch")}
            </p>
          </div>
          <div className="flex items-center gap-4 text-2xs">
            <div className="flex items-center gap-1.5">
              <span className="bg-brand-orange size-2.5 rounded-full" />
              <span className="text-muted-foreground">Đã xuất bản</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="bg-primary/40 size-2.5 rounded-full" />
              <span className="text-muted-foreground">Lên lịch</span>
            </div>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={publishingTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPublished" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f05a28" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f05a28" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorScheduled" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#64748b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#64748b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Area
                type="monotone"
                dataKey="published"
                name="Đã xuất bản"
                stroke="#f05a28"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorPublished)"
              />
              <Area
                type="monotone"
                dataKey="scheduled"
                name="Lên lịch"
                stroke="#94a3b8"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorScheduled)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Platform Breakdown Chart (1 col) */}
      <div className="bg-card border-border rounded-xl border p-5">
        <div className="mb-4">
          <h2 className="text-foreground text-sm font-bold">
            {t("publish.dashboard.platforms.title", "Phân bổ theo nền tảng")}
          </h2>
          <p className="text-muted-foreground text-2xs mt-0.5">
            {t("publish.dashboard.platforms.subtitle", "Tỷ trọng phân phối nội dung")}
          </p>
        </div>

        <div className="space-y-4">
          {platformBreakdown.map((item) => {
            const meta = PLATFORM_META[item.platform];
            return (
              <div key={item.platform} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="flex size-5 items-center justify-center">
                      {meta?.icon}
                    </span>
                    <span className="text-foreground font-medium">{meta?.label || item.platform}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground font-mono">{item.count} bài</span>
                    <span className="text-foreground font-semibold">({item.percentage}%)</span>
                  </div>
                </div>

                <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: PLATFORM_COLORS[item.platform] || "#f05a28",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-border bg-muted/40 mt-6 rounded-lg border p-3">
          <p className="text-muted-foreground text-2xs text-center">
            Facebook và Instagram đang chiếm trên 75% lượng nội dung phân phối.
          </p>
        </div>
      </div>
    </div>
  );
}
