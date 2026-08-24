import { useTranslation } from "react-i18next";
import type { AnalyticsPlatform, ChannelStat } from "@/types/analytics";

interface ChannelPerformanceChartProps {
  channelStats: ChannelStat[];
}

const PLATFORM_BAR_COLOR: Record<AnalyticsPlatform, string> = {
  FACEBOOK: "bg-blue-500",
  INSTAGRAM: "bg-pink-500",
  TIKTOK: "bg-slate-900 dark:bg-slate-100",
  THREADS: "bg-purple-500",
  YOUTUBE: "bg-red-500",
};

const PLATFORM_LABEL: Record<AnalyticsPlatform, string> = {
  FACEBOOK: "Facebook",
  INSTAGRAM: "Instagram",
  TIKTOK: "TikTok",
  THREADS: "Threads",
  YOUTUBE: "Youtube",
};

export function ChannelPerformanceChart({
  channelStats,
}: ChannelPerformanceChartProps) {
  const { t } = useTranslation();
  const maxReach = Math.max(...channelStats.map((stat) => stat.reach), 1);

  return (
    <div className="border-border bg-card mt-6 space-y-4 rounded-xl border p-6">
      <div>
        <h2 className="text-foreground text-sm font-bold">
          {t("analytics.channelPerformance.title")}
        </h2>
        <p className="text-muted-foreground text-2xs mt-1">
          {t("analytics.channelPerformance.subtitle")}
        </p>
      </div>

      <div className="space-y-3">
        {channelStats.map((stat) => (
          <div key={stat.platform} className="flex items-center gap-3">
            <span className="text-foreground w-20 shrink-0 text-xs font-medium">
              {PLATFORM_LABEL[stat.platform]}
            </span>
            <div className="bg-muted h-6 flex-1 overflow-hidden rounded-md">
              <div
                className={`h-full rounded-md ${PLATFORM_BAR_COLOR[stat.platform]}`}
                style={{ width: `${(stat.reach / maxReach) * 100}%` }}
              />
            </div>
            <span className="text-muted-foreground w-16 shrink-0 text-right font-mono text-xs">
              {stat.reach.toLocaleString("vi-VN")}
            </span>
          </div>
        ))}
      </div>

      <div className="border-border grid grid-cols-3 gap-4 border-t pt-4 text-center">
        <div>
          <p className="text-muted-foreground text-3xs uppercase">
            {t("analytics.channelPerformance.totalPosts")}
          </p>
          <p className="text-foreground mt-1 font-mono text-lg font-bold">
            {channelStats.reduce((sum, stat) => sum + stat.postCount, 0)}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground text-3xs uppercase">
            {t("analytics.channelPerformance.totalReach")}
          </p>
          <p className="text-foreground mt-1 font-mono text-lg font-bold">
            {channelStats
              .reduce((sum, stat) => sum + stat.reach, 0)
              .toLocaleString("vi-VN")}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground text-3xs uppercase">
            {t("analytics.channelPerformance.totalEngagement")}
          </p>
          <p className="text-foreground mt-1 font-mono text-lg font-bold">
            {channelStats
              .reduce((sum, stat) => sum + stat.engagement, 0)
              .toLocaleString("vi-VN")}
          </p>
        </div>
      </div>
    </div>
  );
}
