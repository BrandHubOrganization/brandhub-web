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
    () => new Set(),
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

  const visibleGraph = useMemo<TrendGraph>(() => {
    if (!activeHiddenLabels.size) return graph;
    const nodes = graph.nodes.filter(
      (node) =>
        node.id === graph.rootId || !activeHiddenLabels.has(node.type),
    );
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
  }, [activeHiddenLabels, graph]);

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
          <Button
            type="button"
            variant={layoutMode === "force" ? "secondary" : "outline"}
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
            variant={activeHighlight ? "secondary" : "outline"}
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
            variant={activeEdgeLabels ? "secondary" : "outline"}
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
                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-opacity",
                  hidden ? "opacity-40 line-through" : "opacity-100",
                )}
                style={{
                  borderColor: visual.stroke,
                  backgroundColor: visual.fill,
                }}
              >
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: visual.color }}
                  aria-hidden="true"
                />
                <span>
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
