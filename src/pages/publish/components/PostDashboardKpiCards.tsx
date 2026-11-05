import { useTranslation } from "react-i18next";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PostKpiStats } from "../types/dashboard";

interface PostDashboardKpiCardsProps {
  kpis: PostKpiStats;
}

function MetricBadge({ growth }: { growth: number }) {
  const isNegative = growth < 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-xs font-semibold",
        isNegative ? "text-destructive" : "text-success",
      )}
    >
      {isNegative ? (
        <TrendingDown className="size-3" />
      ) : (
        <TrendingUp className="size-3" />
      )}
      {`${growth >= 0 ? "+" : ""}${growth}%`}
    </span>
  );
}

export function PostDashboardKpiCards({ kpis }: PostDashboardKpiCardsProps) {
  const { t } = useTranslation();

  const cards = [
    {
      key: "reach",
      label: t("publish.dashboard.kpi.reach", "LƯỢT TIẾP CẬN"),
      value: kpis.totalReach.toLocaleString(),
      growth: kpis.reachGrowth,
    },
    {
      key: "engagements",
      label: t("publish.dashboard.kpi.engagements", "TƯƠNG TÁC"),
      value: kpis.totalEngagements.toLocaleString(),
      growth: kpis.engagementsGrowth,
    },
    {
      key: "posts",
      label: t("publish.dashboard.kpi.posts", "BÀI ĐĂNG"),
      value: kpis.totalPosts.toLocaleString(),
      growth: kpis.totalPostsGrowth,
    },
    {
      key: "successRate",
      label: t(
        "publish.dashboard.kpi.successRate",
        "Tỷ lệ xuất bản thành công",
      ),
      value: `${kpis.successRate}%`,
      growth: kpis.successRateGrowth,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.key}
          className="bg-card border-border rounded-xl border p-5"
        >
          <p className="text-muted-foreground text-2xs font-mono font-semibold tracking-wider uppercase">
            {card.label}
          </p>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-foreground font-mono text-2xl font-bold tracking-tight">
              {card.value}
            </span>
            {card.growth !== null && <MetricBadge growth={card.growth} />}
          </div>
          <p className="text-muted-foreground text-2xs mt-1">
            {card.growth !== null
              ? t("publish.dashboard.kpi.vsPreviousPeriod", "So với kỳ trước")
              : t(
                  "publish.dashboard.kpi.noPreviousPeriod",
                  "Chưa có dữ liệu kỳ trước",
                )}
          </p>
        </div>
      ))}
    </div>
  );
}
