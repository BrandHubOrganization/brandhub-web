import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  ChevronDown,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  Flame,
  ShieldAlert,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminTrendDetail } from "@/pages/admin/components/AdminTrendDetail";
import type { PublishedTrend } from "@/pages/admin/types/trendView";

type SortKey = "rank" | "score" | "anomaly" | "virality" | "engagement";

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span
        className="flex size-7 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold text-white shadow-xs"
        style={{ backgroundColor: "#f59e0b" }}
        title="Top 1 Gold"
      >
        #1
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span
        className="flex size-7 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold text-white shadow-xs"
        style={{ backgroundColor: "#94a3b8" }}
        title="Top 2 Silver"
      >
        #2
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span
        className="flex size-7 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold text-white shadow-xs"
        style={{ backgroundColor: "#d97706" }}
        title="Top 3 Bronze"
      >
        #3
      </span>
    );
  }
  return (
    <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-muted/30 font-mono text-xs font-semibold text-muted-foreground tabular-nums">
      #{rank}
    </span>
  );
}

function StatusBadge({ status, label }: { status?: string; label: string }) {
  if (!status) return null;
  const s = status.toLowerCase();
  if (s === "new") {
    return (
      <Badge
        variant="outline"
        className="border-blue-500/40 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium text-[11px]"
      >
        <span className="mr-1 size-1.5 rounded-full bg-blue-500 inline-block" />
        {label}
      </Badge>
    );
  }
  if (s === "rising") {
    return (
      <Badge
        variant="outline"
        className="border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium text-[11px]"
      >
        <TrendingUp className="mr-1 size-3 inline-block" />
        {label}
      </Badge>
    );
  }
  if (s === "peaking") {
    return (
      <Badge
        variant="outline"
        className="border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-medium text-[11px]"
      >
        <Flame className="mr-1 size-3 inline-block" />
        {label}
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="text-[11px]">
      {label}
    </Badge>
  );
}

function BrandRiskBadge({ risk, label }: { risk?: string; label: string }) {
  if (!risk) return null;
  const r = risk.toLowerCase();
  let colorClass = "border-border bg-muted/40 text-muted-foreground";
  if (r === "low") {
    colorClass = "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
  } else if (r === "medium") {
    colorClass = "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400";
  } else if (r === "high") {
    colorClass = "border-destructive/30 bg-destructive/10 text-destructive";
  }

  return (
    <Badge variant="outline" className={`text-[11px] font-medium ${colorClass}`}>
      <ShieldAlert className="mr-1 size-3 inline-block" />
      {label}
    </Badge>
  );
}

export function AdminTrendList({ trends }: { trends: PublishedTrend[] }) {
  const { t, i18n } = useTranslation();
  const [sortBy, setSortBy] = useState<SortKey>("rank");
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  const number = useMemo(
    () =>
      new Intl.NumberFormat(i18n.language, {
        maximumFractionDigits: 3,
      }),
    [i18n.language],
  );

  const handleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortAsc((prev) => !prev);
    } else {
      setSortBy(key);
      setSortAsc(key === "rank");
    }
  };

  const sortedTrends = useMemo(() => {
    return [...trends].sort((a, b) => {
      let diff = 0;
      if (sortBy === "rank") {
        diff = (a.rank ?? 0) - (b.rank ?? 0);
      } else if (sortBy === "score") {
        const scoreA = a.weekly_final_score ?? a.final_score ?? 0;
        const scoreB = b.weekly_final_score ?? b.final_score ?? 0;
        diff = scoreB - scoreA;
      } else if (sortBy === "anomaly") {
        diff = (b.anomaly_score ?? 0) - (a.anomaly_score ?? 0);
      } else if (sortBy === "virality") {
        diff = (b.virality_score ?? 0) - (a.virality_score ?? 0);
      } else if (sortBy === "engagement") {
        diff = (b.engagement_score ?? 0) - (a.engagement_score ?? 0);
      }
      return sortAsc ? diff : -diff;
    });
  }, [trends, sortBy, sortAsc]);

  const sortButtons: Array<{ key: SortKey; label: string }> = [
    {
      key: "rank",
      label: t("admin.trends.sorter.rank", { defaultValue: "Thứ hạng (Rank)" }),
    },
    {
      key: "score",
      label: t("admin.trends.sorter.score", { defaultValue: "Điểm số (Score)" }),
    },
    {
      key: "anomaly",
      label: t("admin.trends.anomaly", { defaultValue: "Anomaly" }),
    },
    {
      key: "virality",
      label: t("admin.trends.virality", { defaultValue: "Virality" }),
    },
    {
      key: "engagement",
      label: t("admin.trends.engagement", { defaultValue: "Engagement" }),
    },
  ];

  return (
    <div className="space-y-3">
      {/* Sorter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/70 bg-card/50 p-2.5 px-3.5 shadow-2xs">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
          <ArrowUpDown className="size-3.5" />
          <span>
            {t("admin.trends.sorter.label", { defaultValue: "Sắp xếp:" })}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1">
          {sortButtons.map((btn) => {
            const isActive = sortBy === btn.key;
            return (
              <Button
                key={btn.key}
                variant={isActive ? "secondary" : "ghost"}
                size="sm"
                className={`h-7 px-2.5 text-xs font-medium gap-1 rounded-lg ${
                  isActive
                    ? "bg-primary/10 text-primary hover:bg-primary/15"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => handleSort(btn.key)}
              >
                <span>{btn.label}</span>
                {isActive && (
                  sortAsc ? (
                    <ArrowUp className="size-3" />
                  ) : (
                    <ArrowDown className="size-3" />
                  )
                )}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Trend Candidate List (Each MUST be details > summary for Playwright QA) */}
      <div className="space-y-3">
        {sortedTrends.map((trend, index) => {
          const statusText = trend.status
            ? t(`admin.trends.status.${trend.status}`, {
                defaultValue: trend.status,
              })
            : "";
          const riskText = trend.brand_risk
            ? `${t("admin.trends.risk")}: ${t(`admin.trends.riskLevel.${trend.brand_risk}`, {
                defaultValue: trend.brand_risk,
              })}`
            : "";

          return (
            <details
              key={trend.trend_id || `${trend.keyword}-${index}`}
              name="trend-candidate"
              className="group bg-card border-border rounded-xl border transition-all hover:border-border/80 shadow-2xs overflow-hidden"
            >
              <summary className="focus-visible:outline-ring flex cursor-pointer list-none items-center gap-3 rounded-xl p-3.5 sm:p-4 focus-visible:outline-2 [&::-webkit-details-marker]:hidden select-none">
                <RankBadge rank={trend.rank} />

                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold [overflow-wrap:anywhere] leading-snug tracking-tight">
                      {trend.keyword}
                    </h2>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {trend.topic && (
                      <Badge variant="outline" className="font-normal text-[11px]">
                        {trend.topic}
                      </Badge>
                    )}
                    {trend.status && (
                      <StatusBadge status={trend.status} label={statusText} />
                    )}
                    {trend.brand_risk && (
                      <BrandRiskBadge risk={trend.brand_risk} label={riskText} />
                    )}
                  </div>
                </div>

                <div className="shrink-0 text-right pl-2">
                  <p className="font-mono text-base sm:text-lg font-bold tabular-nums text-foreground tracking-tight">
                    {number.format(trend.weekly_final_score ?? trend.final_score)}
                  </p>
                  <p className="text-muted-foreground text-[11px]">
                    {t("admin.trends.score")}
                  </p>
                </div>

                <ChevronDown
                  aria-hidden="true"
                  className="text-muted-foreground size-4 shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none"
                />
              </summary>
              <AdminTrendDetail trend={trend} />
            </details>
          );
        })}
      </div>
    </div>
  );
}
