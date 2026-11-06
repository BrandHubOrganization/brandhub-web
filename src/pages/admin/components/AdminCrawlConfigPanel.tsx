import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Activity, Play, RefreshCw, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CrawlLiveCard } from "./AdminCrawlRunLog";
import { AdminTrendPipelineControl } from "./AdminTrendPipelineControl";
import { AdminTrendSettings } from "./AdminTrendSettings";
import { CrawlerHealthPanel } from "./CrawlerHealthPanel";
import { CrawlerCredentialsPanel } from "./CrawlerCredentialsPanel";
import { CrawlerRunLauncher } from "./CrawlerRunLauncher";
import { CrawlerRunHistory } from "./CrawlerRunHistory";
import { trendPipelineService } from "@/pages/admin/services/trendPipelineService";
import { adminCrawlConfigService } from "@/services/adminCrawlConfigService";

const HealthPanel = CrawlerHealthPanel as React.ComponentType<{
  hideRefresh?: boolean;
}>;

type ConsoleTab = "settings" | "runs" | "monitoring";

function normalizeTab(raw: string | null): ConsoleTab {
  if (raw === "runs" || raw === "history") return "runs";
  if (raw === "settings") return "settings";
  return "monitoring";
}

/**
 * Unified Crawler Console combining Overview & Sessions (monitoring),
 * Configuration (settings), and Run History (runs).
 */
export function AdminCrawlConfigPanel() {
  const { t } = useTranslation();
  const client = useQueryClient();
  const [params, setParams] = useSearchParams();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const activeTab = normalizeTab(params.get("crawlerTab"));

  const setTab = (tab: ConsoleTab) =>
    setParams((previous) => {
      const next = new URLSearchParams(previous);
      if (tab === "monitoring") {
        next.delete("crawlerTab");
      } else {
        next.set("crawlerTab", tab);
      }
      return next;
    });

  const crawlRuns = useQuery({
    queryKey: ["admin-crawl-runs"],
    queryFn: adminCrawlConfigService.runs,
    retry: false,
  });

  const pipelineRuns = useQuery({
    queryKey: ["admin", "ai", "trend-pipeline-runs"],
    queryFn: ({ signal }) => trendPipelineService.runs(signal),
    staleTime: 5_000,
    refetchInterval: (q) => (q.state.data?.running ? 3_000 : 15_000),
    retry: false,
  });

  const runCount =
    (crawlRuns.data?.history?.length ?? 0) ||
    (pipelineRuns.data?.history?.length ?? 0);

  const hasPipelineRuns = Boolean(
    pipelineRuns.data?.running || pipelineRuns.data?.history?.length,
  );

  const handleGlobalRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        client.invalidateQueries({ queryKey: ["admin-crawl-config"] }),
        client.invalidateQueries({ queryKey: ["admin-crawl-runs"] }),
        client.invalidateQueries({ queryKey: ["admin", "crawler-health"] }),
        client.invalidateQueries({
          queryKey: ["admin", "ai", "trend-pipeline"],
        }),
        client.invalidateQueries({
          queryKey: ["admin", "ai", "trend-pipeline-runs"],
        }),
      ]);
    } finally {
      setTimeout(() => setIsRefreshing(false), 400);
    }
  };

  const tabs: Array<{
    key: ConsoleTab;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    badge?: number;
  }> = [
    {
      key: "monitoring",
      icon: Activity,
      label: t("admin.crawler.sections.overview", {
        defaultValue: "Tổng quan",
      }),
    },
    {
      key: "settings",
      icon: Settings2,
      label: t("admin.crawler.sections.settings", {
        defaultValue: "Cấu hình",
      }),
    },
    {
      key: "runs",
      icon: Play,
      label: t("admin.crawler.sections.history", { defaultValue: "Lịch sử" }),
      badge: runCount,
    },
  ];

  return (
    <div className="w-full min-w-0 space-y-5">
      {/* Top Tab Bar */}
      <div className="border-border/70 flex flex-wrap items-center justify-between gap-3 border-b pb-3">
        <nav
          className="flex flex-wrap items-center gap-1.5"
          aria-label={t("admin.crawler.navigation", {
            defaultValue: "Crawler tabs",
          })}
          role="tablist"
        >
          {tabs.map(({ key, icon: Icon, label, badge }) => {
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setTab(key)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
                  isActive
                    ? "border-border bg-card text-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground border-transparent",
                )}
              >
                <Icon
                  className={cn(
                    "size-3.5",
                    isActive ? "text-brand-orange" : "opacity-75",
                  )}
                />
                <span>{label}</span>
                {typeof badge === "number" && (
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.2 text-[11px] tabular-nums",
                      isActive
                        ? "bg-brand-orange/15 text-brand-orange font-semibold"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <Button
          variant="outline"
          size="sm"
          disabled={isRefreshing}
          onClick={() => void handleGlobalRefresh()}
          className="ml-auto inline-flex items-center gap-2 text-xs font-medium"
        >
          <RefreshCw
            className={cn("size-3.5", isRefreshing && "animate-spin")}
          />
          <span>
            {t("admin.trends.refresh", { defaultValue: "Làm mới" })}
          </span>
        </Button>
      </div>

      {/* Tab 1: Cấu hình (Settings) */}
      {activeTab === "settings" && (
        <div className="space-y-6">
          <AdminTrendSettings />
        </div>
      )}

      {/* Tab 2: Lịch sử (Run History) */}
      {activeTab === "runs" && (
        <div className="space-y-6">
          <CrawlerRunHistory />
        </div>
      )}

      {/* Tab 3: Tổng quan (Pipeline Launcher, Health, Live Crawl Progress & Sessions) */}
      {activeTab === "monitoring" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
            <div className="flex flex-col gap-4 lg:col-span-8">
              {hasPipelineRuns && (
                <div className="border-brand-orange/30 bg-brand-orange/5 rounded-xl border p-1 shadow-xs">
                  <AdminTrendPipelineControl managed />
                </div>
              )}
              <div className="flex-1">
                <CrawlerRunLauncher />
              </div>
            </div>
            <div className="flex flex-col lg:col-span-4">
              <CrawlLiveCard />
            </div>
          </div>

          <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
            <div className="flex flex-col lg:col-span-8">
              <HealthPanel hideRefresh />
            </div>
            <div className="lg:col-span-4">
              <CrawlerCredentialsPanel
                filter="session"
                hideHeader
                columns={1}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
