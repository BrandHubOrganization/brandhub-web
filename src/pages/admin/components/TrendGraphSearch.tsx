import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Layers, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { useTrendGraph } from "@/pages/admin/hooks/useTrendGraph";
import { GRAPH_PAGE_SIZE } from "@/pages/admin/hooks/useTrendGraph";
import { trendGraphService } from "@/pages/admin/services/trendGraphService";
import { getNodeVisual } from "@/pages/admin/utils/graphLayout";
import type { GraphNode } from "@/pages/admin/types/trendGraph";
import { cn } from "@/lib/utils";

type View = ReturnType<typeof useTrendGraph>;

const NODE_CATEGORIES = [
  { value: "", key: "allCategories" },
  { value: "Person", key: "personType" },
  { value: "Organization", key: "organizationType" },
  { value: "Location", key: "locationType" },
  { value: "Product", key: "productType" },
  { value: "Event", key: "eventType" },
  { value: "CrawledPost", key: "postType" },
  { value: "Entity", key: "entityType" },
  { value: "Trend", key: "trendType" },
] as const;

export function TrendGraphSearch({
  view,
  customNodeId,
  onSelectCustomRoot,
}: {
  view: View;
  customNodeId?: string | null;
  onSelectCustomRoot?: (node: GraphNode | null) => void;
}) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<"trends" | "nodes">("trends");
  const [q, setQ] = useState(view.q);
  const [date, setDate] = useState(view.date);

  const [nodeInputQ, setNodeInputQ] = useState("");
  const [submittedNodeQ, setSubmittedNodeQ] = useState("");
  const [nodeLabel, setNodeLabel] = useState("");
  const [nodeOffset, setNodeOffset] = useState(0);

  const page = view.trends.data;

  const nodeSearchSelection = {
    q: submittedNodeQ,
    label: nodeLabel || undefined,
    offset: nodeOffset,
    limit: GRAPH_PAGE_SIZE,
  };

  const nodesQuery = useQuery({
    queryKey: ["admin-trend-graph-nodes", nodeSearchSelection],
    enabled: mode === "nodes",
    queryFn: ({ signal }) =>
      trendGraphService.searchNodes(nodeSearchSelection, signal),
    staleTime: 30000,
  });

  const nodesPage = nodesQuery.data;

  return (
    <aside className="bg-card/95 border-border/80 min-w-0 rounded-2xl border p-4 shadow-sm">
      <div className="bg-muted/70 mb-4 grid grid-cols-2 gap-1 rounded-xl p-1">
        <button
          type="button"
          aria-pressed={mode === "trends"}
          onClick={() => setMode("trends")}
          className={cn(
            "flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all",
            mode === "trends"
              ? "bg-card text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Sparkles aria-hidden="true" className="text-brand-orange size-3.5" />
          <span className="truncate">
            {t("admin.trendGraph.searchModeTrends")}
          </span>
        </button>
        <button
          type="button"
          aria-pressed={mode === "nodes"}
          onClick={() => setMode("nodes")}
          className={cn(
            "flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all",
            mode === "nodes"
              ? "bg-card text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Layers aria-hidden="true" className="size-3.5 text-violet-500" />
          <span className="truncate">
            {t("admin.trendGraph.searchModeNodes")}
          </span>
        </button>
      </div>

      {mode === "trends" ? (
        <>
          <form
            className="space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              view.submitSearch(q.trim(), date);
            }}
          >
            <Input
              label={t("admin.trendGraph.search")}
              value={q}
              maxLength={100}
              onChange={(event) => setQ(event.target.value)}
              iconPrefix={<Search />}
            />
            <Input
              label={t("admin.trendGraph.date")}
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="[color-scheme:light] dark:[color-scheme:dark]"
            />
            <div className="flex flex-wrap gap-2">
              <Button
                type="submit"
                variant="outline"
                loading={view.trends.isFetching}
              >
                {t("admin.trendGraph.searchAction")}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setQ("");
                  setDate("");
                  view.change({ q: "", date: "", offset: "" });
                }}
              >
                {t("admin.trendGraph.clear")}
              </Button>
            </div>
          </form>
          <div
            className="border-border mt-4 border-t pt-4"
            aria-busy={view.trends.isFetching}
          >
            {view.trends.isPending && (
              <Skeleton
                className="h-40 w-full"
                aria-label={t("admin.loading")}
              />
            )}
            {view.trends.isError && (
              <div role="alert" className="space-y-2 text-sm">
                <p>{t("admin.trendGraph.searchError")}</p>
                <Button
                  variant="outline"
                  onClick={() => void view.trends.refetch()}
                >
                  {t("admin.trends.retry")}
                </Button>
              </div>
            )}
            {view.trends.isSuccess && (
              <>
                <p
                  className="text-muted-foreground mb-2 font-mono text-xs tabular-nums"
                  role="status"
                >
                  {t("admin.trendGraph.range", {
                    start: page!.items.length ? view.offset + 1 : 0,
                    end: page!.items.length
                      ? view.offset + page!.items.length
                      : 0,
                  })}
                </p>
                {!page!.items.length && (
                  <p className="text-muted-foreground py-4 text-sm">
                    {t("admin.trendGraph.empty")}
                  </p>
                )}
                <ul className="max-h-96 space-y-1.5 overflow-y-auto pr-0.5">
                  {page!.items.map((node) => {
                    const isSelected =
                      !customNodeId && view.trendId === node.businessId;
                    return (
                      <li key={node.id}>
                        <Button
                          variant="ghost"
                          aria-pressed={isSelected}
                          className={cn(
                            "border-border/50 hover:border-brand-orange/40 h-auto min-h-11 w-full flex-col items-start gap-1 rounded-xl border bg-transparent px-3 py-2.5 text-left whitespace-normal transition-all",
                            isSelected &&
                              "border-brand-orange/50 bg-brand-orange-soft text-foreground shadow-xs",
                          )}
                          onClick={() => {
                            onSelectCustomRoot?.(null);
                            view.change({ trendId: node.businessId! });
                          }}
                        >
                          <span className="w-full font-medium [overflow-wrap:anywhere] break-words">
                            {node.name}
                          </span>
                          <span className="flex w-full items-center justify-between gap-2">
                            <span className="text-muted-foreground font-mono text-xs tabular-nums">
                              {String(node.properties.date ?? "")}
                            </span>
                            <span
                              aria-hidden="true"
                              className="border-brand-orange/30 bg-brand-orange/10 text-brand-orange rounded-full border px-2 py-0.5 font-mono text-[10px] font-medium"
                            >
                              Trend
                            </span>
                          </span>
                        </Button>
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-3 flex justify-between gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={view.offset === 0 || view.trends.isFetching}
                    onClick={() =>
                      view.change({
                        offset: String(
                          Math.max(0, view.offset - GRAPH_PAGE_SIZE),
                        ),
                      })
                    }
                  >
                    {t("admin.trendGraph.previous")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={
                      !page!.hasMore ||
                      view.offset + GRAPH_PAGE_SIZE > 10000 ||
                      view.trends.isFetching
                    }
                    onClick={() =>
                      view.change({
                        offset: String(view.offset + GRAPH_PAGE_SIZE),
                      })
                    }
                  >
                    {t("admin.trendGraph.next")}
                  </Button>
                </div>
              </>
            )}
          </div>
        </>
      ) : (
        <>
          <form
            className="space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              setSubmittedNodeQ(nodeInputQ.trim());
              setNodeOffset(0);
            }}
          >
            <label className="block space-y-1 text-xs font-medium">
              {t("admin.trendGraph.nodeCategory")}
              <Select
                aria-label={t("admin.trendGraph.nodeCategory")}
                value={nodeLabel}
                onChange={(event) => {
                  setNodeLabel(event.target.value);
                  setNodeOffset(0);
                }}
              >
                {NODE_CATEGORIES.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.value
                      ? `${t(`admin.trendGraph.${category.key}`)} (${category.value})`
                      : t(`admin.trendGraph.${category.key}`)}
                  </option>
                ))}
              </Select>
            </label>
            <Input
              label={t("admin.trendGraph.searchModeNodes")}
              value={nodeInputQ}
              maxLength={100}
              onChange={(event) => setNodeInputQ(event.target.value)}
              iconPrefix={<Search />}
            />
            <div className="flex flex-wrap gap-2">
              <Button
                type="submit"
                variant="outline"
                loading={nodesQuery.isFetching}
              >
                {t("admin.trendGraph.searchAction")}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setNodeInputQ("");
                  setSubmittedNodeQ("");
                  setNodeLabel("");
                  setNodeOffset(0);
                }}
              >
                {t("admin.trendGraph.clear")}
              </Button>
            </div>
          </form>
          <div
            className="border-border mt-4 border-t pt-4"
            aria-busy={nodesQuery.isFetching}
          >
            {nodesQuery.isPending && (
              <Skeleton
                className="h-40 w-full"
                aria-label={t("admin.loading")}
              />
            )}
            {nodesQuery.isError && (
              <div role="alert" className="space-y-2 text-sm">
                <p>{t("admin.trendGraph.searchError")}</p>
                <Button
                  variant="outline"
                  onClick={() => void nodesQuery.refetch()}
                >
                  {t("admin.trends.retry")}
                </Button>
              </div>
            )}
            {nodesQuery.isSuccess && (
              <>
                <p
                  className="text-muted-foreground mb-2 font-mono text-xs tabular-nums"
                  role="status"
                >
                  {t("admin.trendGraph.range", {
                    start: nodesPage!.items.length ? nodeOffset + 1 : 0,
                    end: nodesPage!.items.length
                      ? nodeOffset + nodesPage!.items.length
                      : 0,
                  })}
                </p>
                {!nodesPage!.items.length && (
                  <p className="text-muted-foreground py-4 text-sm">
                    {t("admin.trendGraph.empty")}
                  </p>
                )}
                <ul className="max-h-96 space-y-1.5 overflow-y-auto pr-0.5">
                  {nodesPage!.items.map((node) => {
                    const color = getNodeVisual(node.type).color;
                    const active = customNodeId === node.id;
                    return (
                      <li key={node.id}>
                        <Button
                          variant="ghost"
                          aria-pressed={active}
                          className={cn(
                            "border-border/50 hover:border-brand-orange/40 h-auto min-h-11 w-full flex-col items-start gap-1 rounded-xl border bg-transparent px-3 py-2.5 text-left whitespace-normal transition-all",
                            active &&
                              "border-brand-orange/50 bg-brand-orange-soft text-foreground shadow-xs",
                          )}
                          onClick={() => onSelectCustomRoot?.(node)}
                        >
                          <span className="w-full font-medium [overflow-wrap:anywhere] break-words">
                            {node.name}
                          </span>
                          <span className="flex w-full flex-wrap items-center justify-between gap-2">
                            <span className="text-muted-foreground inline-flex items-center gap-1.5 font-mono text-[11px]">
                              <span
                                aria-hidden="true"
                                className="size-2 shrink-0 rounded-full"
                                style={{ backgroundColor: color }}
                              />
                              {node.type}
                            </span>
                            {node.properties.date && (
                              <span className="text-muted-foreground font-mono text-[11px] tabular-nums">
                                {String(node.properties.date)}
                              </span>
                            )}
                          </span>
                        </Button>
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-3 flex justify-between gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={nodeOffset === 0 || nodesQuery.isFetching}
                    onClick={() =>
                      setNodeOffset((prev) =>
                        Math.max(0, prev - GRAPH_PAGE_SIZE),
                      )
                    }
                  >
                    {t("admin.trendGraph.previous")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={
                      !nodesPage!.hasMore ||
                      nodeOffset + GRAPH_PAGE_SIZE > 10000 ||
                      nodesQuery.isFetching
                    }
                    onClick={() =>
                      setNodeOffset((prev) => prev + GRAPH_PAGE_SIZE)
                    }
                  >
                    {t("admin.trendGraph.next")}
                  </Button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </aside>
  );
}
