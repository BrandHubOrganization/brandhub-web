import { useTranslation } from "react-i18next";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { PlatformStat } from "../types/admin";

export interface PlatformStatsGridProps {
  stats: PlatformStat[];
}

export function PlatformStatsGrid({ stats }: PlatformStatsGridProps) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => {
        const isPositive = (stat.changePercent ?? 0) >= 0;
        const TrendIcon = isPositive ? TrendingUp : TrendingDown;
        return (
          <div
            key={stat.label}
            className="border-border bg-card border-l-brand-orange relative overflow-hidden rounded-xl border border-l-4 p-5 transition-all duration-200 hover:shadow-md"
          >
            <span className="text-muted-foreground text-xs font-medium">
              {t(`dashboard.admin.stats.labels.${stat.label}`, stat.label)}
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-foreground text-2xl font-bold tracking-tight">
                {stat.value.toLocaleString("vi-VN")}
              </span>
            </div>
            {stat.changePercent !== undefined && (
              <p
                className={`text-2xs mt-1 flex items-center gap-1 ${
                  isPositive
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              >
                <TrendIcon className="size-3" />
                {isPositive ? "+" : ""}
                {stat.changePercent}%
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default PlatformStatsGrid;
