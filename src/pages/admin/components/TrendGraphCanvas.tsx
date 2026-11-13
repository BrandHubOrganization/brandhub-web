import { useCallback, useId, useMemo, useRef, useState } from "react";
import type { PointerEvent } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Maximize,
  Minus,
  Network,
  Orbit,
  PinOff,
  Plus,
  Sparkles,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useGraphViewport } from "@/pages/admin/hooks/useGraphViewport";
import { TrendGraphScene } from "@/pages/admin/components/TrendGraphScene";
import {
  getNodeVisual,
  graphBounds,
  layoutForceGraph,
  layoutGraph,
} from "@/pages/admin/utils/graphLayout";
import type { GraphPoint } from "@/pages/admin/utils/graphLayout";
import type {
  GraphFocus,
  GraphLayoutMode,
  TrendGraph,
} from "@/pages/admin/types/trendGraph";

export function TrendGraphCanvas({
  graph,
  focus,
  onFocus,
  onExpandNode,
  expandingNodeId = null,
  hiddenLabels,
  onToggleLabel,
  highlightNeighbors,
  onToggleHighlightNeighbors,
  showEdgeLabels,
  onToggleEdgeLabels,
}: {
  graph: TrendGraph;
  focus: GraphFocus;
  onFocus: (focus: GraphFocus) => void;
  onExpandNode?: (nodeId: string) => void;
  expandingNodeId?: string | null;
  hiddenLabels?: ReadonlySet<string>;
  onToggleLabel?: (label: string) => void;
  highlightNeighbors?: boolean;
  onToggleHighlightNeighbors?: () => void;
  showEdgeLabels?: boolean;
  onToggleEdgeLabels?: () => void;
}) {
  const { t } = useTranslation();
  const [layoutMode, setLayoutMode] = useState<GraphLayoutMode>("force");
  const [localHiddenLabels, setLocalHiddenLabels] = useState<Set<string>>(
    () => new Set(["CrawledPost"]),
  );
  const [localHighlight, setLocalHighlight] = useState(false);
  const [localEdgeLabels, setLocalEdgeLabels] = useState(false);
  const [customPositions, setCustomPositions] = useState<
    Map<string, GraphPoint>
  >(() => new Map());
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(() => new Set());

  const activeHiddenLabels = hiddenLabels ?? localHiddenLabels;
  const activeHighlight = highlightNeighbors ?? localHighlight;
  const activeEdgeLabels = showEdgeLabels ?? localEdgeLabels;

  const handleToggleLabel = useCallback(
    (label: string) => {
      if (onToggleLabel) {
        onToggleLabel(label);
        return;
      }
      setLocalHiddenLabels((prev) => {
        const next = new Set(prev);
        if (next.has(label)) next.delete(label);
        else next.add(label);
        return next;
      });
    },
    [onToggleLabel],
  );

  const handleToggleHighlight = useCallback(() => {
    if (onToggleHighlightNeighbors) {
      onToggleHighlightNeighbors();
      return;
    }
    setLocalHighlight((prev) => !prev);
  }, [onToggleHighlightNeighbors]);

  const handleToggleEdgeLabels = useCallback(() => {
    if (onToggleEdgeLabels) {
      onToggleEdgeLabels();
      return;
    }
    setLocalEdgeLabels((prev) => !prev);
  }, [onToggleEdgeLabels]);

  const hopDistances = useMemo(() => {
    const distances = new Map<string, number>();
    if (!graph.rootId) return distances;

    const adj = new Map<string, string[]>();
    for (const edge of graph.edges) {
      if (!adj.has(edge.source)) adj.set(edge.source, []);
      if (!adj.has(edge.target)) adj.set(edge.target, []);
      adj.get(edge.source)!.push(edge.target);
      adj.get(edge.target)!.push(edge.source);
    }

    distances.set(graph.rootId, 0);
    const queue: string[] = [graph.rootId];

    while (queue.length > 0) {
      const current = queue.shift()!;
      const currentDist = distances.get(current)!;
      const neighbors = adj.get(current) ?? [];
      for (const neighbor of neighbors) {
        if (!distances.has(neighbor)) {
          distances.set(neighbor, currentDist + 1);
          queue.push(neighbor);
        }
      }
    }

    return distances;
  }, [graph.rootId, graph.edges]);

  const bounds = useMemo(() => graphBounds(graph), [graph]);
  const {
    svgRef,
    zoom,
    zoomIn,
    zoomOut,
    fit,
    pan,
    svgPointFromClient,
    viewBox,
    handlers,
    labelSize,
  } = useGraphViewport(bounds);

  const isOverviewZoom = zoom < 0.85;

  const visibleGraph = useMemo<TrendGraph>(() => {
    const nodes = graph.nodes.filter((node) => {
      if (node.id === graph.rootId) return true;
      if (activeHiddenLabels.has(node.type)) return false;
      if (!isOverviewZoom) {
        const dist = hopDistances.get(node.id);
        return dist !== undefined && dist <= 2;
      }
      return true;
    });
    const nodeIds = new Set(nodes.map((node) => node.id));
    const edges = graph.edges.filter(
      (edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target),
    );
    return {
      ...graph,
      nodes,
      edges,
      nodeCount: nodes.length,
      edgeCount: edges.length,
    };
  }, [activeHiddenLabels, graph, hopDistances, isOverviewZoom]);

  const basePositions = useMemo(
    () =>
      layoutMode === "force"
        ? layoutForceGraph(visibleGraph)
        : layoutGraph(visibleGraph),
    [layoutMode, visibleGraph],
  );

  const positions = useMemo(() => {
    if (!customPositions.size) return basePositions;
    const merged = new Map(basePositions);
    for (const [id, point] of customPositions.entries()) {
      if (merged.has(id)) merged.set(id, point);
    }
    return merged;
  }, [basePositions, customPositions]);

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const node of graph.nodes) {
      counts.set(node.type, (counts.get(node.type) ?? 0) + 1);
    }
    return [...counts.entries()];
  }, [graph.nodes]);

  const nodeDragRef = useRef<{
    nodeId: string;
    pointerId: number;
    startX: number;
    startY: number;
    moved: boolean;
  } | null>(null);

  const onNodePointerDown = useCallback(
    (nodeId: string, event: PointerEvent<SVGGElement>) => {
      if (event.button !== 0) return;
      nodeDragRef.current = {
        nodeId,
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        moved: false,
      };
      svgRef.current?.setPointerCapture?.(event.pointerId);
    },
    [svgRef],
  );

  const handleSvgPointerMove = useCallback(
    (event: PointerEvent<SVGSVGElement>) => {
      const activeDrag = nodeDragRef.current;
      if (activeDrag && activeDrag.pointerId === event.pointerId) {
        const dist = Math.hypot(
          event.clientX - activeDrag.startX,
          event.clientY - activeDrag.startY,
        );
        if (dist > 4) activeDrag.moved = true;
        if (activeDrag.moved) {
          const pt = svgPointFromClient(event.clientX, event.clientY);
          if (pt) {
            setCustomPositions((prev) => {
              const next = new Map(prev);
              next.set(activeDrag.nodeId, pt);
              return next;
            });
            setPinnedIds((prev) => {
              if (prev.has(activeDrag.nodeId)) return prev;
              const next = new Set(prev);
              next.add(activeDrag.nodeId);
              return next;
            });
          }
        }
        return;
      }
      handlers.onPointerMove(event);
    },
    [handlers, svgPointFromClient],
  );

  const handleSvgPointerUp = useCallback(() => {
    nodeDragRef.current = null;
    handlers.onPointerUp();
  }, [handlers]);

  const unpinAll = useCallback(() => {
    setPinnedIds(new Set());
    setCustomPositions(new Map());
  }, []);

  const markerId = useId().replace(/:/g, "");
  const actions = [
    {
      key: "zoomIn",
      Icon: Plus,
      action: zoomIn,
      disabled: zoom >= 4,
    },
    {
      key: "zoomOut",
      Icon: Minus,
      action: zoomOut,
      disabled: zoom <= 0.5,
    },
    { key: "fit", Icon: Maximize, action: fit },
    { key: "panLeft", Icon: ArrowLeft, action: () => pan(-1, 0) },
    { key: "panRight", Icon: ArrowRight, action: () => pan(1, 0) },
    { key: "panUp", Icon: ArrowUp, action: () => pan(0, -1) },
    { key: "panDown", Icon: ArrowDown, action: () => pan(0, 1) },
  ];
  return (
    <section className="bg-card min-w-0 overflow-hidden rounded-xl border">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b p-3">
        <div
          className="flex flex-wrap gap-1"
          role="group"
          aria-label={t("admin.trendGraph.controls")}
        >
          {actions.map(({ key, Icon, action, disabled }) => (
            <Button
              key={key}
              variant="outline"
              size="icon"
              className="size-11"
              aria-label={t(`admin.trendGraph.${key}`)}
              title={t(`admin.trendGraph.${key}`)}
              disabled={disabled}
              onClick={action}
            >
              <Icon className="size-4" aria-hidden="true" />
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
              isOverviewZoom
                ? "border-sky-500/40 bg-sky-500/15 font-semibold text-sky-600 shadow-xs dark:text-sky-400"
                : "border-border/80 bg-muted/50 text-muted-foreground",
            )}
            title={
              isOverviewZoom
                ? t("admin.trendGraph.hopsOverviewTooltip", {
                    defaultValue:
                      "Đang mở rộng hiển thị toàn cảnh tất cả các liên kết (>2 bước liên kết).",
                  })
                : t("admin.trendGraph.hopsLimitedTooltip", {
                    defaultValue:
                      "Đang giới hạn hiển thị trong 2 bước liên kết. Thu nhỏ (zoom < 85%) để tự động xem toàn cảnh.",
                  })
            }
          >
            <span
              className={cn(
                "size-1.5 rounded-full",
                isOverviewZoom
                  ? "animate-pulse bg-sky-500"
                  : "bg-muted-foreground/60",
              )}
              aria-hidden="true"
            />
            {isOverviewZoom
              ? t("admin.trendGraph.hopsOverview", {
                  defaultValue: "Toàn cảnh (>2 Hops)",
                })
              : t("admin.trendGraph.hopsLimited", {
                  defaultValue: "2 Hops (Thu nhỏ để xem thêm)",
                })}
          </span>
          <Button
            type="button"
            variant={layoutMode === "force" ? "orange" : "outline"}
            size="sm"
            aria-pressed={layoutMode === "force"}
            onClick={() =>
              setLayoutMode((mode) => (mode === "force" ? "radial" : "force"))
            }
            title={t(
              layoutMode === "force"
                ? "admin.trendGraph.layoutForce"
                : "admin.trendGraph.layoutRadial",
            )}
          >
            {layoutMode === "force" ? (
              <Network className="size-3.5" aria-hidden="true" />
            ) : (
              <Orbit className="size-3.5" aria-hidden="true" />
            )}
            <span className="text-xs">
              {t(
                layoutMode === "force"
                  ? "admin.trendGraph.layoutForce"
                  : "admin.trendGraph.layoutRadial",
              )}
            </span>
          </Button>
          <Button
            type="button"
            variant={activeHighlight ? "orange" : "outline"}
            size="sm"
            aria-pressed={activeHighlight}
            onClick={handleToggleHighlight}
          >
            <Sparkles className="size-3.5" aria-hidden="true" />
            <span className="text-xs">
              {t("admin.trendGraph.highlightNeighbors")}
            </span>
          </Button>
          <Button
            type="button"
            variant={activeEdgeLabels ? "orange" : "outline"}
            size="sm"
            aria-pressed={activeEdgeLabels}
            onClick={handleToggleEdgeLabels}
          >
            <Tag className="size-3.5" aria-hidden="true" />
            <span className="text-xs">{t("admin.trendGraph.edgeLabels")}</span>
          </Button>
          {pinnedIds.size > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={unpinAll}
            >
              <PinOff className="size-3.5" aria-hidden="true" />
              <span className="font-mono text-xs tabular-nums">
                {t("admin.trendGraph.unpinAll", { count: pinnedIds.size })}
              </span>
            </Button>
          )}
          <span className="text-muted-foreground px-1.5 font-mono text-sm tabular-nums">
            {Math.round(zoom * 100)}%
          </span>
        </div>
      </div>
      <svg
        ref={svgRef}
        viewBox={viewBox}
        onPointerDown={handlers.onPointerDown}
        onPointerMove={handleSvgPointerMove}
        onPointerUp={handleSvgPointerUp}
        onPointerCancel={handleSvgPointerUp}
        onLostPointerCapture={handleSvgPointerUp}
        role="group"
        aria-label={t("admin.trendGraph.canvas")}
        className="h-[420px] w-full touch-pan-y select-none md:h-[540px]"
      >
        <TrendGraphScene
          graph={visibleGraph}
          focus={focus}
          onFocus={onFocus}
          markerId={markerId}
          labelSize={labelSize}
          positions={positions}
          pinnedIds={pinnedIds}
          expandingNodeId={expandingNodeId}
          highlightNeighbors={activeHighlight}
          showEdgeLabels={activeEdgeLabels}
          onExpandNode={onExpandNode}
          onNodePointerDown={onNodePointerDown}
        />
      </svg>
      <div className="border-t p-3">
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          {categoryCounts.map(([type, count]) => {
            const visual = getNodeVisual(type);
            const hidden = activeHiddenLabels.has(type);
            return (
              <button
                key={type}
                type="button"
                aria-pressed={!hidden}
                onClick={() => handleToggleLabel(type)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-opacity cursor-pointer",
                  hidden
                    ? "opacity-40 line-through border-dashed"
                    : "opacity-100",
                )}
                style={{
                  borderColor: visual.stroke,
                  backgroundColor: visual.fill,
                }}
                title={
                  hidden
                    ? t("admin.trendGraph.showCategoryHint", {
                        defaultValue: "Bấm để hiển thị lại {{type}}",
                        type,
                      })
                    : t("admin.trendGraph.hideCategoryHint", {
                        defaultValue: "Bấm để ẩn {{type}}",
                        type,
                      })
                }
              >
                <span
                  className={cn(
                    "size-2 rounded-full",
                    hidden && "opacity-60",
                  )}
                  style={{ backgroundColor: visual.color }}
                  aria-hidden="true"
                />
                <span className={cn(hidden && "line-through text-muted-foreground")}>
                  {visual.code} ·{" "}
                  {t(`admin.trendGraph.${visual.labelKey}`, {
                    defaultValue: type,
                  })}
                </span>
                <span className="font-mono tabular-nums">({count})</span>
              </button>
            );
          })}
        </div>
        <div className="text-muted-foreground flex flex-wrap gap-x-5 gap-y-2 text-xs">
          <span>T · {t("admin.trendGraph.trendType")}</span>
          <span>P · {t("admin.trendGraph.postType")}</span>
          <span>E · {t("admin.trendGraph.entityType")}</span>
          <span>{t("admin.trendGraph.canvasHint")}</span>
        </div>
      </div>
    </section>
  );
}
