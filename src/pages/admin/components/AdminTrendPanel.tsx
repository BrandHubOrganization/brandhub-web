import { useTranslation } from "react-i18next";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTrendView } from "@/pages/admin/hooks/useTrendView";
import { AdminTrendFilters } from "@/pages/admin/components/AdminTrendFilters";
import { AdminTrendList } from "@/pages/admin/components/AdminTrendList";
import { AdminTrendSummary } from "@/pages/admin/components/AdminTrendSummary";

export function AdminTrendPanel() {
  const { t } = useTranslation();
  const view = useTrendView();
  const trends = view.trends.data ?? [];
  const topics = [
    ...new Set(trends.flatMap((trend) => (trend.topic ? [trend.topic] : []))),
  ].sort();
  const search = view.search.trim().toLocaleLowerCase();
  const filtered = trends.filter(
    (trend) =>
      (!view.topic || trend.topic === view.topic) &&
      [trend.keyword, ...trend.keywords].some((keyword) =>
        keyword.toLocaleLowerCase().includes(search),
      ),
  );
  const refresh = (
    <Button
      variant="outline"
      size="sm"
      onClick={view.refresh}
      disabled={view.trends.isFetching || (view.source === "redis" && view.summary.isFetching)}
      loading={view.trends.isFetching}
      className="h-8 gap-1.5 text-xs font-medium shrink-0"
    >
      <RefreshCw aria-hidden="true" className="size-3.5" />
      {t("admin.trends.refresh")}
    </Button>
  );

  return (
    <div className="max-w-full min-w-0 space-y-4">
      {view.source === "redis" ? (
        <AdminTrendSummary query={view.summary} actions={refresh} />
      ) : (
        <div className="flex justify-end">{refresh}</div>
      )}

      {/* Filter Toolbar */}
      <AdminTrendFilters view={view} topics={topics} />

      {/* Loading Skeletons */}
      {view.trends.isPending && (
        <div
          role="status"
          className="space-y-3"
          aria-label={t("admin.loading")}
        >
          {[1, 2, 3].map((index) => (
            <Skeleton key={index} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      )}

      {/* Error Section */}
      {view.trends.isError && (
        <section
          role="alert"
          className="border-destructive/40 bg-card space-y-3 rounded-xl border p-5"
        >
          <h2 className="text-destructive text-base font-semibold">
            {t("admin.trends.errorTitle")}
          </h2>
          <p className="text-muted-foreground text-sm">
            {t("admin.trends.error")}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={view.refresh}
            disabled={view.trends.isFetching}
          >
            {t("admin.trends.retry")}
          </Button>
        </section>
      )}

      {/* Results Content */}
      {view.trends.isSuccess && (
        <>
          <p
            role="status"
            aria-live="polite"
            className="text-muted-foreground text-xs font-medium"
          >
            {t("admin.trends.count", {
              count: filtered.length,
              total: trends.length,
              limit: view.limit,
            })}
          </p>

          {!trends.length ? (
            <section className="bg-card border-border space-y-2 rounded-xl border p-6">
              <h2 className="font-semibold">{t("admin.trends.emptyTitle")}</h2>
              <p className="text-muted-foreground max-w-3xl text-sm leading-6">
                {t(view.source === "redis" ? "admin.trends.empty" : "admin.trends.graphEmpty")}
              </p>
            </section>
          ) : filtered.length ? (
            <AdminTrendList trends={filtered} />
          ) : (
            <section className="bg-card border-border space-y-3 rounded-xl border p-5">
              <p className="text-sm">{t("admin.trends.noMatches")}</p>
              <Button variant="outline" size="sm" onClick={view.clearFilters}>
                {t("admin.trends.clear")}
              </Button>
            </section>
          )}
        </>
      )}
    </div>
  );
}
