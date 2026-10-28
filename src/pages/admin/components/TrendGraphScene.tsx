import { memo, useMemo } from "react";
import type { PointerEvent } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import {
  computeNodeDegrees,
  getEdgeVisual,
  getNodeRadius,
  getNodeVisual,
  layoutEdges,
  layoutGraph,
} from "@/pages/admin/utils/graphLayout";
import type { GraphPoint } from "@/pages/admin/utils/graphLayout";
import type { GraphFocus, TrendGraph } from "@/pages/admin/types/trendGraph";

export const TrendGraphScene = memo(function TrendGraphScene({
  graph,
  focus,
  onFocus,
  markerId,
  labelSize,
  positions: externalPositions,
  pinnedIds,
  expandingNodeId,
  highlightNeighbors = false,
  showEdgeLabels = false,
  onExpandNode,
  onNodePointerDown,
}: {
  graph: TrendGraph;
  focus: GraphFocus;
  onFocus: (focus: GraphFocus) => void;
  markerId: string;
  labelSize: number;
  positions?: Map<string, GraphPoint>;
  pinnedIds?: ReadonlySet<string>;
  expandingNodeId?: string | null;
  highlightNeighbors?: boolean;
  showEdgeLabels?: boolean;
  onExpandNode?: (nodeId: string) => void;
  onNodePointerDown?: (
    nodeId: string,
    event: PointerEvent<SVGGElement>,
  ) => void;
}) {
  const { t } = useTranslation();
  const fallbackPositions = useMemo(
    () => (externalPositions ? null : layoutGraph(graph)),
    [externalPositions, graph],
  );
  const positions = externalPositions ?? fallbackPositions!;
  const degrees = useMemo(() => computeNodeDegrees(graph), [graph]);
  const edges = useMemo(
    () => layoutEdges(graph, positions),
    [graph, positions],
  );
  const spotlight = useMemo(() => {
    if (!highlightNeighbors) return null;
    const activeNodes = new Set<string>();
    const activeEdges = new Set<string>();
    if (focus.kind === "node") {
      activeNodes.add(focus.id);
      for (const edge of graph.edges) {
        if (edge.source === focus.id || edge.target === focus.id) {
          activeEdges.add(edge.id);
          activeNodes.add(edge.source);
          activeNodes.add(edge.target);
        }
      }
    } else {
      const focusedEdge = graph.edges.find((item) => item.id === focus.id);
      if (focusedEdge) {
        activeEdges.add(focusedEdge.id);
        activeNodes.add(focusedEdge.source);
        activeNodes.add(focusedEdge.target);
      }
    }
    return { activeNodes, activeEdges };
  }, [focus, graph.edges, highlightNeighbors]);

  return (
    <>
      <defs>
        <pattern
          id={`${markerId}-grid`}
          width="36"
          height="36"
          patternUnits="userSpaceOnUse"
        >
          <circle
            cx="18"
            cy="18"
            r="1.25"
            className="fill-muted-foreground/20"
          />
        </pattern>
        <marker
          id={markerId}
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" className="fill-muted-foreground" />
        </marker>
      </defs>
      <rect
        x="-4000"
        y="-4000"
        width="10000"
        height="10000"
        fill={`url(#${markerId}-grid)`}
        pointerEvents="none"
      />
      {edges.map(({ edge, path, controlPoints }) => {
        const selected = focus.kind === "edge" && focus.id === edge.id;
        const dimmed = spotlight ? !spotlight.activeEdges.has(edge.id) : false;
        const edgeVisual = getEdgeVisual(edge.type);
        const labelPoint = controlPoints[0];
        return (
          <g
            key={edge.id}
            data-graph-item="edge"
            role="button"
            tabIndex={0}
            aria-label={t("admin.trendGraph.edgeLabel", { type: edge.type })}
            aria-pressed={selected}
            className={cn(
              "group cursor-pointer outline-none transition-opacity duration-200",
              dimmed && "opacity-20",
            )}
            onClick={() => onFocus({ kind: "edge", id: edge.id })}
            onKeyDown={(event) => {
              if (!["Enter", " "].includes(event.key)) return;
              event.preventDefault();
              onFocus({ kind: "edge", id: edge.id });
            }}
          >
            <title>{edge.type}</title>
            <path d={path} fill="none" stroke="transparent" strokeWidth="18" />
            <path
              d={path}
              fill="none"
              markerEnd={`url(#${markerId})`}
              stroke={selected ? "#f97316" : edgeVisual.color}
              strokeWidth={selected ? 4 : 2.2}
              strokeOpacity={selected ? 1 : 0.78}
              className="transition-all duration-150 group-hover:stroke-[#f97316] group-focus-visible:stroke-[#f97316]"
            />
            {(showEdgeLabels || selected) && labelPoint && (
              <text
                x={labelPoint.x}
                y={labelPoint.y - 6}
                textAnchor="middle"
                className="fill-muted-foreground pointer-events-none font-mono font-medium select-none"
                style={{ fontSize: labelSize }}
                aria-hidden="true"
              >
                {edge.type}
              </text>
            )}
          </g>
        );
      })}
      {graph.nodes.map((node) => {
        const point = positions.get(node.id) ?? { x: 600, y: 500 };
        const selected = focus.kind === "node" && focus.id === node.id;
        const isRoot = node.id === graph.rootId;
        const isPinned = pinnedIds?.has(node.id) ?? false;
        const isExpanding = expandingNodeId === node.id;
        const dimmed = spotlight ? !spotlight.activeNodes.has(node.id) : false;
        const visual = getNodeVisual(node.type);
        const radius = getNodeRadius(node.id, graph.rootId, degrees);
        return (
          <g
            key={node.id}
            data-graph-item="node"
            transform={`translate(${point.x} ${point.y})`}
            role="button"
            tabIndex={0}
            aria-label={t("admin.trendGraph.nodeLabel", {
              name: node.name,
              type: node.type,
            })}
            aria-pressed={selected}
            className={cn(
              "group cursor-grab outline-none transition-opacity duration-200 active:cursor-grabbing",
              dimmed && "opacity-25",
            )}
            onPointerDown={(event) => onNodePointerDown?.(node.id, event)}
            onClick={() => onFocus({ kind: "node", id: node.id })}
            onDoubleClick={(event) => {
              event.stopPropagation();
              onExpandNode?.(node.id);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && event.shiftKey && onExpandNode) {
                event.preventDefault();
                onExpandNode(node.id);
                return;
              }
              if (!["Enter", " "].includes(event.key)) return;
              event.preventDefault();
              onFocus({ kind: "node", id: node.id });
            }}
          >
            <title>
              {node.name} · {node.type}
            </title>
            <circle
              r={radius + 7}
              fill="none"
              stroke={visual.stroke}
              strokeWidth="3"
              className={cn(
                "transition-opacity duration-150 group-focus-visible:opacity-100",
                selected || isExpanding ? "opacity-100" : "opacity-0",
                isExpanding && "animate-pulse",
              )}
            />
            <circle r={radius} className="fill-card" />
            <circle
              r={radius}
              fill={visual.fill}
              stroke={visual.stroke}
              strokeWidth={isRoot ? 4 : 2.5}
              className="transition-transform duration-150 group-hover:scale-[1.04]"
              strokeDasharray={
                node.type !== "Trend" && node.type !== "CrawledPost"
                  ? "4 3"
                  : undefined
              }
            />
            {isPinned && (
              <circle
                cx={radius * 0.68}
                cy={-radius * 0.68}
                r="5"
                fill="#f97316"
                className="stroke-card"
                strokeWidth="1.5"
              />
            )}
            <text
              textAnchor="middle"
              y={labelSize * 0.34}
              className="fill-foreground font-semibold select-none"
              style={{ fontSize: labelSize }}
              aria-hidden="true"
            >
              {visual.code}
            </text>
            {(graph.nodes.length <= 35 || selected || isRoot) && (
              <text
                textAnchor="middle"
                y={radius + 4 + labelSize * 1.15}
                className="fill-foreground font-medium select-none"
                style={{ fontSize: labelSize }}
                aria-hidden="true"
              >
                {node.name.length > 24
                  ? `${node.name.slice(0, 24)}…`
                  : node.name}
              </text>
            )}
          </g>
        );
      })}
    </>
  );
});
