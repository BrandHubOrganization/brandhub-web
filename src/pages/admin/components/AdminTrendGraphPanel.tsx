import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import {
  ArrowLeft,
  Network,
  PanelLeftClose,
  PanelLeftOpen,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useTrendGraph } from "@/pages/admin/hooks/useTrendGraph";
import { TrendGraphSearch } from "@/pages/admin/components/TrendGraphSearch";
import { TrendGraphWorkspace } from "@/pages/admin/components/TrendGraphWorkspace";
import { trendGraphService } from "@/pages/admin/services/trendGraphService";
import type { GraphNode } from "@/pages/admin/types/trendGraph";
import { cn } from "@/lib/utils";

type View = ReturnType<typeof useTrendGraph>;

function GraphContent({
  view,
  customNodeId,
  customGraph,
}: {
  view: View;
  customNodeId: string | null;
  customGraph: ReturnType<
    typeof useQuery<Awaited<ReturnType<typeof trendGraphService.expandNode>>>
  >;
}) {
  const { t } = useTranslation();
  const activeId = customNodeId ?? view.trendId;
  const activeQuery = customNodeId ? customGraph : view.graph;

  if (!activeId)
    return (
      <div className="bg-card/95 border-border/80 rounded-2xl border p-6 text-sm shadow-xs">
        {t("admin.trendGraph.choose")}
      </div>
    );
  if (activeQuery.isPending)
    return (
      <Skeleton
        className="h-[540px] w-full rounded-2xl"
        aria-label={t("admin.loading")}
      />
    );
  if (activeQuery.isError) {
    const missing =
      isAxiosError(activeQuery.error) &&
      activeQuery.error.response?.data?.error?.code === "TREND_GRAPH_NOT_FOUND";
    return (
      <section
        role="alert"
        className="bg-card border-destructive/40 space-y-3 rounded-2xl border p-5"
      >
        <h2 className="font-semibold">
          {t(
            missing
              ? "admin.trendGraph.missing"
              : "admin.trendGraph.graphError",
          )}
        </h2>
        <p className="text-muted-foreground text-sm">
          {t("admin.trendGraph.errorHint")}
        </p>
        <Button
          variant="outline"
          onClick={() => void activeQuery.refetch()}
          disabled={activeQuery.isFetching}
        >
          {t("admin.trends.retry")}
        </Button>
      </section>
    );
  }
  return (
    <TrendGraphWorkspace
      key={`${activeQuery.dataUpdatedAt}:${activeId}:${view.depth}:${view.maxNodes}`}
      graph={activeQuery.data!}
    />
  );
}

export function AdminTrendGraphPanel() {
  const { t } = useTranslation();
  const view = useTrendGraph();
  const [searchCollapsed, setSearchCollapsed] = useState(false);
  const [customNodeId, setCustomNodeId] = useState<string | null>(null);

  const customGraph = useQuery({
    queryKey: [
      "admin-trend-graph-custom-root",
      customNodeId,
      view.depth,
      view.maxNodes,
    ],
    enabled: Boolean(customNodeId),
    queryFn: ({ signal }) =>
      trendGraphService.expandNode(
        {
          nodeId: customNodeId!,
          depth: view.depth,
          maxNodes: view.maxNodes,
        },
        signal,
      ),
    staleTime: 30000,
  });

  const activeQuery = customNodeId ? customGraph : view.graph;
  const hasSelection = Boolean(customNodeId || view.trendId);

  const handleSelectCustomRoot = (node: GraphNode | null) => {
    if (!node) {
      setCustomNodeId(null);
      return;
    }
    if (
      node.type === "Trend" &&
      node.businessId &&
      /^trend:[^\s]+$/u.test(node.businessId)
    ) {
      setCustomNodeId(null);
      view.change({ trendId: node.businessId });
      return;
    }
    setCustomNodeId(node.id);
  };

  return (
    <div className="min-w-0 space-y-4">
      <header className="bg-card/95 border-border/80 flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-3.5 shadow-sm">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-9 shrink-0"
            aria-label={t("admin.trendGraph.toggleSearchDrawer")}
            title={t("admin.trendGraph.toggleSearchDrawer")}
            aria-pressed={!searchCollapsed}
            onClick={() => setSearchCollapsed((prev) => !prev)}
          >
            {searchCollapsed ? (
              <PanelLeftOpen aria-hidden="true" className="size-4" />
            ) : (
              <PanelLeftClose aria-hidden="true" className="size-4" />
            )}
          </Button>
          <Link
            to="/admin?view=trends"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium underline focus-visible:outline-2"
          >
            <ArrowLeft aria-hidden="true" className="size-3.5" />
            {t("admin.navigation.trends")}
          </Link>
          <div className="border-border/80 hidden h-5 w-px border-l sm:block" />
          <div className="flex min-w-0 items-center gap-2.5">
            <span
              aria-hidden="true"
              className="bg-brand-orange/15 text-brand-orange flex size-8 shrink-0 items-center justify-center rounded-xl"
            >
              <Network className="size-4" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="truncate text-sm font-semibold tracking-tight">
                  {t("admin.trendGraph.bloomTitle")}
                </span>
                <span
                  aria-hidden="true"
                  className="border-emerald-500/30 bg-emerald-500/10 rounded-full border px-2 py-0.5 font-mono text-[10px] font-medium text-emerald-600 dark:text-emerald-400"
                >
                  READ-ONLY
                </span>
              </div>
              <p className="text-muted-foreground hidden truncate text-xs md:block">
                {t("admin.trendGraph.bloomSubtitle")}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-2.5">
          <label className="space-y-1 text-xs font-medium">
            <span className="text-muted-foreground block text-[11px]">
              {t("admin.trendGraph.depth")}
            </span>
            <Select
              aria-label={t("admin.trendGraph.depth")}
              value={view.depth}
              onChange={(event) => view.change({ depth: event.target.value })}
              className="h-9 min-w-[110px]"
            >
              {[1, 2].map((depth) => (
                <option key={depth} value={depth}>
                  {t("admin.trendGraph.hops", { count: depth })}
                </option>
              ))}
            </Select>
          </label>
          <label className="space-y-1 text-xs font-medium">
            <span className="text-muted-foreground block text-[11px]">
              {t("admin.trendGraph.maxNodes")}
            </span>
            <Select
              aria-label={t("admin.trendGraph.maxNodes")}
              value={view.maxNodes}
              onChange={(event) =>
                view.change({ maxNodes: event.target.value })
              }
              className="h-9 min-w-[90px]"
            >
              {[50, 100, 200].map((limit) => (
                <option key={limit} value={limit}>
                  {limit}
                </option>
              ))}
            </Select>
          </label>
          <Button
            variant="outline"
            disabled={!hasSelection || activeQuery.isFetching}
            loading={activeQuery.isFetching}
            onClick={() => void activeQuery.refetch()}
            className="h-9"
          >
            <RefreshCw aria-hidden="true" className="size-4" />
            {t("admin.trendGraph.refresh")}
          </Button>
        </div>
      </header>

      {view.invalid && (
        <div
          role="alert"
          className="bg-muted flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3 text-sm"
        >
          <p>{t("admin.trendGraph.invalidUrl")}</p>
          <Button
            variant="outline"
            onClick={() => {
              setCustomNodeId(null);
              view.reset();
            }}
          >
            {t("admin.trendGraph.reset")}
          </Button>
        </div>
      )}

      <div
        className={cn(
          "grid min-w-0 items-start gap-4",
          !searchCollapsed && "lg:grid-cols-[280px_minmax(0,1fr)]",
        )}
      >
        {!searchCollapsed && (
          <TrendGraphSearch
            key={`${view.q}:${view.date}`}
            view={view}
            customNodeId={customNodeId}
            onSelectCustomRoot={handleSelectCustomRoot}
          />
        )}
        <section
          className="min-w-0 space-y-4"
          aria-label={t("admin.trendGraph.region")}
        >
          <GraphContent
            view={view}
            customNodeId={customNodeId}
            customGraph={customGraph}
          />
        </section>
      </div>
    </div>
  );
}

export default AdminTrendGraphPanel;
