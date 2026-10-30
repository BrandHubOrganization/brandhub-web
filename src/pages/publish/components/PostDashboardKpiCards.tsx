import { useTranslation } from "react-i18next";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PostKpiStats } from "../types/dashboard";

interface PostDashboardKpiCardsProps {
  kpis: PostKpiStats;
}

interface MetricBadgeProps {
  text: string;
  isNegative?: boolean;
}

function MetricBadge({ text, isNegative = false }: MetricBadgeProps) {
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
      {text}
    </span>
  );
}

export function PostDashboardKpiCards({ kpis }: PostDashboardKpiCardsProps) {
  const { t } = useTranslation();

  const reachGrowth = kpis.reachGrowth ?? 12.4;
  const engagementsGrowth = kpis.engagementsGrowth ?? 8.2;
  const postsGrowth = kpis.totalPostsGrowth ?? 0;
  const rateGrowth = kpis.successRateGrowth ?? 1.5;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. LƯỢT TIẾP CẬN */}
      <div className="bg-card border-border rounded-xl border p-5">
        <p className="text-muted-foreground font-mono text-2xs font-semibold uppercase tracking-wider">
          {t("publish.dashboard.kpi.reach", "LƯỢT TIẾP CẬN")}
        </p>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-foreground font-mono text-2xl font-bold tracking-tight">
            {(kpis.totalReach ?? 0).toLocaleString()}
          </span>
          <MetricBadge
            text={`${reachGrowth >= 0 ? "+" : ""}${reachGrowth}%`}
            isNegative={reachGrowth < 0}
          />
        </div>
        <p className="text-muted-foreground text-2xs mt-1">
          {t("publish.dashboard.kpi.vsLastMonth", "So với tháng trước")}
        </p>
      </div>

      {/* 2. TƯƠNG TÁC */}
      <div className="bg-card border-border rounded-xl border p-5">
        <p className="text-muted-foreground font-mono text-2xs font-semibold uppercase tracking-wider">
          {t("publish.dashboard.kpi.engagements", "TƯƠNG TÁC")}
        </p>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-foreground font-mono text-2xl font-bold tracking-tight">
            {(kpis.totalEngagements ?? 0).toLocaleString()}
          </span>
          <MetricBadge
            text={`${engagementsGrowth >= 0 ? "+" : ""}${engagementsGrowth}%`}
            isNegative={engagementsGrowth < 0}
          />
        </div>
        <p className="text-muted-foreground text-2xs mt-1">
          {t("publish.dashboard.kpi.vsLastMonth", "So với tháng trước")}
        </p>
      </div>

      {/* 3. BÀI ĐĂNG */}
      <div className="bg-card border-border rounded-xl border p-5">
        <p className="text-muted-foreground font-mono text-2xs font-semibold uppercase tracking-wider">
          {t("publish.dashboard.kpi.posts", "BÀI ĐĂNG")}
        </p>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-foreground font-mono text-2xl font-bold tracking-tight">
            {(kpis.totalPosts ?? 0).toLocaleString()}
          </span>
          <MetricBadge
            text={`${postsGrowth >= 0 ? "+" : ""}${postsGrowth}%`}
            isNegative={postsGrowth < 0}
          />
        </div>
        <p className="text-muted-foreground text-2xs mt-1">
          {t("publish.dashboard.kpi.sameAsLastMonth", "Bằng với tháng trước")}
        </p>
      </div>

      {/* 4. TỶ LỆ PHẢN HỒI */}
      <div className="bg-card border-border rounded-xl border p-5">
        <p className="text-muted-foreground font-mono text-2xs font-semibold uppercase tracking-wider">
          {t("publish.dashboard.kpi.responseRate", "TỶ LỆ PHẢN HỒI")}
        </p>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-foreground font-mono text-2xl font-bold tracking-tight">
            {kpis.successRate}%
          </span>
          <MetricBadge
            text={`${rateGrowth >= 0 ? "+" : ""}${rateGrowth}%`}
            isNegative={rateGrowth < 0}
          />
        </div>
        <p className="text-muted-foreground text-2xs mt-1">
          {t("publish.dashboard.kpi.goodImprovement", "Cải thiện tốt")}
        </p>
      </div>
    </div>
  );
}
