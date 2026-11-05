import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertCircle, RefreshCw } from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { analyticsService } from "@/services/analyticsService";
import type { AnalyticsOverview, StatSummaryCard } from "@/types/analytics";
import { StatCards } from "./components/StatCards";
import { ChannelPerformanceChart } from "./components/ChannelPerformanceChart";

function toCards(overview: AnalyticsOverview): StatSummaryCard[] {
  return [
    { key: "reach", value: overview.totalReach.toLocaleString(), deltaPercent: overview.reachGrowth },
    { key: "engagement", value: overview.totalEngagement.toLocaleString(), deltaPercent: overview.engagementGrowth },
    { key: "posts", value: overview.totalPosts.toLocaleString(), deltaPercent: null },
    { key: "successRate", value: `${overview.successRate}%`, deltaPercent: null },
  ];
}

export function AnalyticsPage() {
  const { t } = useTranslation();
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadSummary() {
      setIsLoading(true);
      setIsError(false);
      try {
        const summary = await analyticsService.getOverview();
        if (!cancelled) setData(summary);
      } catch (err) {
        console.error("Failed to load analytics summary:", err);
        if (!cancelled) setIsError(true);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadSummary();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <PageWrapper
      title={t("analytics.title")}
      description={t("analytics.description")}
    >
      {isLoading && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      )}

      {isError && !isLoading && (
        <div className="border-destructive/30 bg-destructive/5 flex flex-col items-center justify-center gap-3 rounded-xl border p-6 text-center">
          <div className="text-destructive flex items-center gap-2 text-sm font-medium">
            <AlertCircle className="size-4" />
            <span>{t("analytics.loadError")}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="gap-2 text-xs"
          >
            <RefreshCw className="size-3.5" /> {t("analytics.retry")}
          </Button>
        </div>
      )}

      {data && !isLoading && !isError && (
        <>
          <StatCards cards={toCards(data)} />
          <ChannelPerformanceChart channelStats={data.channelStats} />
        </>
      )}
    </PageWrapper>
  );
}

export default AnalyticsPage;
