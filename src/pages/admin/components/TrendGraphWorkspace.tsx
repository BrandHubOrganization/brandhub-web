import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  EyeOff,
  GitBranchPlus,
  PanelRightClose,
  PanelRightOpen,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrendGraphCanvas } from "@/pages/admin/components/TrendGraphCanvas";
import { TrendGraphInspector } from "@/pages/admin/components/TrendGraphInspector";
import { trendGraphService } from "@/pages/admin/services/trendGraphService";
import { getNodeVisual } from "@/pages/admin/utils/graphLayout";
import {
  mergeTrendGraphs,
  type GraphFocus,
  type TrendGraph,
} from "@/pages/admin/types/trendGraph";
import { cn } from "@/lib/utils";

export function TrendGraphWorkspace({ graph }: { graph: TrendGraph }) {
  const { t } = useTranslation();
  const [focus, setFocus] = useState<GraphFocus>({
    kind: "node",
    id: graph.rootId,
  });
  const [extraGraphs, setExtraGraphs] = useState<TrendGraph[]>([]);
  const [hiddenNodeIds, setHiddenNodeIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [hiddenLabels, setHiddenLabels] = useState<Set<string>>(
    () => new Set(),
  );
  const [expandingNodeId, setExpandingNodeId] = useState<string | null>(null);
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const [highlightNeighbors, setHighlightNeighbors] = useState(false);
  const [showEdgeLabels, setShowEdgeLabels] = useState(true);

  const mergedBaseGraph = useMemo(() => {
    if (!extraGraphs.length) return graph;
    return extraGraphs.reduce(
      (acc, incoming) => mergeTrendGraphs(acc, incoming),
      graph,
    );
  }, [graph, extraGraphs]);

  const activeGraph = useMemo<TrendGraph>(() => {
    if (hiddenNodeIds.size === 0 && hiddenLabels.size === 0) {
      return mergedBaseGraph;
    }
    const visibleNodes = mergedBaseGraph.nodes.filter((node) => {
      if (node.id === mergedBaseGraph.rootId) return true;
      if (hiddenNodeIds.has(node.id)) return false;
      if (hiddenLabels.has(node.type)) return false;
      return true;
    });
    const visibleIds = new Set(visibleNodes.map((node) => node.id));
    const visibleEdges = mergedBaseGraph.edges.filter(
      (edge) => visibleIds.has(edge.source) && visibleIds.has(edge.target),
    );
    return {
      ...mergedBaseGraph,
      nodes: visibleNodes,
      edges: visibleEdges,
      nodeCount: visibleNodes.length,
      edgeCount: visibleEdges.length,
    };
  }, [mergedBaseGraph, hiddenNodeIds, hiddenLabels]);

  const selectedNode = useMemo(
    () =>
      focus.kind === "node"
        ? activeGraph.nodes.find((node) => node.id === focus.id)
        : undefined,
    [activeGraph.nodes, focus],
  );

  const selectedNodeDegree = useMemo(() => {
    if (!selectedNode) return 0;
    let count = 0;
    for (const edge of activeGraph.edges) {
      if (edge.source === selectedNode.id || edge.target === selectedNode.id) {
        count += 1;
      }
    }
    return count;
  }, [activeGraph.edges, selectedNode]);

  const hasSceneModifications =
    extraGraphs.length > 0 || hiddenNodeIds.size > 0 || hiddenLabels.size > 0;

  const handleExpandNode = async (nodeId: string) => {
    if (expandingNodeId) return;
    setExpandingNodeId(nodeId);
    try {
      const expanded = await trendGraphService.expandNode({
        nodeId,
        depth: 1,
        maxNodes: 50,
      });
      setExtraGraphs((prev) => [...prev, expanded]);
      setFocus({ kind: "node", id: nodeId });
    } catch {
      // Keep existing scene intact if expansion fails
    } finally {
      setExpandingNodeId(null);
    }
  };

  const handleToggleLabel = (label: string) => {
    setHiddenLabels((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const handleDismissNode = (nodeId: string) => {
    if (nodeId === activeGraph.rootId) return;
    setHiddenNodeIds((prev) => {
      const next = new Set(prev);
      next.add(nodeId);
      return next;
    });
    setFocus({ kind: "node", id: activeGraph.rootId });
  };

  const handleResetScene = () => {
    setExtraGraphs([]);
    setHiddenNodeIds(new Set());
    setHiddenLabels(new Set());
    setFocus({ kind: "node", id: graph.rootId });
  };

  return (
    <div className="min-w-0 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <p
            role="status"
            aria-live="polite"
            className="text-muted-foreground font-mono text-sm tabular-nums"
          >
            {t("admin.trendGraph.counts", {
              nodes: activeGraph.nodeCount,
              edges: activeGraph.edgeCount,
              depth: activeGraph.depth,
            })}
          </p>
          <span className="text-muted-foreground hidden text-xs md:inline">
            · {t("admin.trendGraph.doubleClickHint")}
          </span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-label={t("admin.trendGraph.toggleInspectorDrawer")}
          title={t("admin.trendGraph.toggleInspectorDrawer")}
          aria-pressed={inspectorOpen}
          onClick={() => setInspectorOpen((prev) => !prev)}
          className="gap-1.5 text-xs"
        >
          {inspectorOpen ? (
            <PanelRightClose aria-hidden="true" className="size-3.5" />
          ) : (
            <PanelRightOpen aria-hidden="true" className="size-3.5" />
          )}
          <span className="hidden sm:inline">
            {t("admin.trendGraph.toggleInspectorDrawer")}
          </span>
        </Button>
      </div>

      {activeGraph.truncated && (
        <div
          role="status"
          className="bg-muted space-y-1 rounded-xl border p-3 text-sm"
        >
          <p className="font-medium">{t("admin.trendGraph.truncated")}</p>
          <p>
            {activeGraph.truncationReasons
              .map((reason) =>
                t(`admin.trendGraph.reasons.${reason}`, {
                  defaultValue: reason,
                }),
              )
              .join(" · ")}
          </p>
        </div>
      )}

      {activeGraph.nodeCount === 1 && activeGraph.edgeCount === 0 && (
        <p className="text-muted-foreground text-sm">
          {t("admin.trendGraph.isolated")}
        </p>
      )}

      {selectedNode && (
        <div className="bg-card/90 border-border/80 flex flex-wrap items-center justify-between gap-2 rounded-2xl border px-3.5 py-2.5 shadow-xs">
          <div
            aria-hidden="true"
            className="flex min-w-0 items-center gap-2.5 text-sm"
          >
            <span
              className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-xs font-medium"
              style={{
                borderColor: `${getNodeVisual(selectedNode.type).color}55`,
                backgroundColor: `${getNodeVisual(selectedNode.type).color}18`,
                color: getNodeVisual(selectedNode.type).color,
              }}
            >
              <span
                className="size-2 rounded-full"
                style={{
                  backgroundColor: getNodeVisual(selectedNode.type).color,
                }}
              />
              {selectedNode.type}
            </span>
            <span className="truncate font-semibold">{selectedNode.name}</span>
            <span className="text-muted-foreground hidden font-mono text-xs tabular-nums sm:inline">
              ·{" "}
              {t("admin.trendGraph.connectedDegree", {
                count: selectedNodeDegree,
              })}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={expandingNodeId === selectedNode.id}
              loading={expandingNodeId === selectedNode.id}
              onClick={() => void handleExpandNode(selectedNode.id)}
              className="gap-1.5 text-xs"
            >
              <GitBranchPlus aria-hidden="true" className="size-3.5" />
              {t(
                expandingNodeId === selectedNode.id
                  ? "admin.trendGraph.expanding"
                  : "admin.trendGraph.expandNode",
              )}
            </Button>
            <Button
              type="button"
              variant={highlightNeighbors ? "secondary" : "ghost"}
              size="sm"
              aria-pressed={highlightNeighbors}
              onClick={() => setHighlightNeighbors((prev) => !prev)}
              className="gap-1.5 text-xs"
            >
              <Sparkles aria-hidden="true" className="size-3.5" />
              {t("admin.trendGraph.highlightNeighbors")}
            </Button>
            {selectedNode.id !== activeGraph.rootId && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleDismissNode(selectedNode.id)}
                className="gap-1.5 text-xs"
              >
                <EyeOff aria-hidden="true" className="size-3.5" />
                {t("admin.trendGraph.hideNode")}
              </Button>
            )}
            {hasSceneModifications && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResetScene}
                className="gap-1.5 text-xs"
              >
                <RotateCcw aria-hidden="true" className="size-3.5" />
                {t("admin.trendGraph.resetScene")}
              </Button>
            )}
          </div>
        </div>
      )}

      <div
        className={cn(
          "grid min-w-0 items-start gap-4",
          inspectorOpen &&
            "lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px]",
        )}
      >
        <TrendGraphCanvas
          graph={activeGraph}
          focus={focus}
          onFocus={setFocus}
          onExpandNode={(nodeId) => void handleExpandNode(nodeId)}
          expandingNodeId={expandingNodeId}
          hiddenLabels={hiddenLabels}
          onToggleLabel={handleToggleLabel}
          highlightNeighbors={highlightNeighbors}
          onToggleHighlightNeighbors={() =>
            setHighlightNeighbors((prev) => !prev)
          }
          showEdgeLabels={showEdgeLabels}
          onToggleEdgeLabels={() => setShowEdgeLabels((prev) => !prev)}
        />
        {inspectorOpen && (
          <TrendGraphInspector
            graph={activeGraph}
            focus={focus}
            onFocus={setFocus}
            onExpandNode={(nodeId) => void handleExpandNode(nodeId)}
            expandingNodeId={expandingNodeId}
          />
        )}
      </div>
    </div>
  );
}
