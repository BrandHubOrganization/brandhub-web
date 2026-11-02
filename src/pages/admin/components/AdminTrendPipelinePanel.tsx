import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  RefreshCw,
  LayoutDashboard,
  Settings2,
  KeyRound,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AdminTrendPipelineControl } from "@/pages/admin/components/AdminTrendPipelineControl";
import { AdminTrendSettings } from "@/pages/admin/components/AdminTrendSettings";
import { CrawlerHealthPanel } from "@/pages/admin/components/CrawlerHealthPanel";
import { CrawlerCredentialsPanel } from "@/pages/admin/components/CrawlerCredentialsPanel";
import { CrawlerRunLauncher } from "@/pages/admin/components/CrawlerRunLauncher";
import { CrawlerRunHistory } from "@/pages/admin/components/CrawlerRunHistory";
import { trendPipelineService } from "@/pages/admin/services/trendPipelineService";

// Safe wrapper for CrawlerHealthPanel to support hideRefresh prop without TS errors
const HealthPanel = CrawlerHealthPanel as React.ComponentType<{
  hideRefresh?: boolean;
}>;

export function AdminTrendPipelinePanel() {
  const { t } = useTranslation();
  const client = useQueryClient();
  const [params, setParams] = useSearchParams();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const requested = params.get("crawlerTab") ?? "overview";
  const section = ["overview", "settings", "credentials", "history"].includes(
    requested,
  )
    ? requested
    : "overview";

  const setSection = (value: string) =>
    setParams((previous) => {
      const next = new URLSearchParams(previous);
      next.set("crawlerTab", value);
      return next;
    });

  // Keep the overview visible for the latest run, including finished runs.
  const runsQuery = useQuery({
    queryKey: ["admin", "ai", "trend-pipeline-runs"],
    queryFn: ({ signal }) => trendPipelineService.runs(signal),
    staleTime: 5_000,
    refetchInterval: (q) => (q.state.data?.running ? 3_000 : 15_000),
    retry: false,
  });

  const hasRuns = Boolean(
    runsQuery.data?.running || runsQuery.data?.history?.length,
  );

  const handleGlobalRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        client.invalidateQueries({ queryKey: ["admin", "crawler-health"] }),
        client.invalidateQueries({
          queryKey: ["admin", "ai", "trend-pipeline"],
        }),
        client.invalidateQueries({
          queryKey: ["admin", "ai", "trend-pipeline-runs"],
        }),
      ]);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const navItems = [
    { key: "overview", icon: LayoutDashboard },
    { key: "settings", icon: Settings2 },
    { key: "credentials", icon: KeyRound },
    { key: "history", icon: History },
  ] as const;

  return (
    <div className="max-w-full min-w-0 space-y-5">
      {/* Top Bar: Segmented Pills Navigation & Global Refresh */}
      <div className="border-border/60 flex flex-wrap items-center justify-between gap-3 border-b pb-3">
        <nav
          className="border-border/60 bg-muted/50 inline-flex flex-wrap items-center gap-1 rounded-xl border p-1"
          aria-label={t("admin.crawler.navigation")}
          role="tablist"
        >
          {navItems.map(({ key, icon: Icon }) => {
            const isActive = section === key;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setSection(key)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs transition-all",
                  isActive
                    ? "bg-card text-foreground ring-border/50 font-semibold shadow-xs ring-1"
                    : "text-muted-foreground hover:bg-background/50 hover:text-foreground font-medium",
                )}
              >
                <Icon
                  className={cn(
                    "size-3.5",
                    isActive ? "text-brand-orange" : "opacity-70",
                  )}
                />
                <span>{t(`admin.crawler.sections.${key}`)}</span>
              </button>
            );
          })}
        </nav>

        {/* Global Refresh Button */}
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
            {t("admin.trends.refresh", { defaultValue: "Làm mới toàn bộ" })}
          </span>
        </Button>
      </div>

      {/* Tab Panels */}
      {section === "overview" && (
        <div className="space-y-5">
          {hasRuns && (
            <div className="border-brand-orange/30 bg-brand-orange/5 rounded-xl border p-1 shadow-xs">
              <AdminTrendPipelineControl managed />
            </div>
          )}

          {/* 2-Column Balanced Cockpit Layout on Desktop */}
          <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <CrawlerRunLauncher />
            </div>
            <div className="lg:col-span-7">
              <HealthPanel hideRefresh />
            </div>
          </div>
        </div>
      )}

      {section === "settings" && <AdminTrendSettings />}
      {section === "credentials" && <CrawlerCredentialsPanel />}
      {section === "history" && <CrawlerRunHistory />}
    </div>
  );
}
