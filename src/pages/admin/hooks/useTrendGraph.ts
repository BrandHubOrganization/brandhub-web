import { useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { trendGraphService } from "@/pages/admin/services/trendGraphService";

const TREND_ID = /^trend:[^\s]+$/u;
export const GRAPH_PAGE_SIZE = 20;

function parseSelection(params: URLSearchParams) {
  const requestedId = params.get("trendId") ?? "";
  const requestedDate = params.get("date") ?? "";
  const requestedOffset = Number(params.get("offset") ?? 0);
  const trendId =
    requestedId.length <= 300 && TREND_ID.test(requestedId) ? requestedId : "";
  const date = z.iso.date().safeParse(requestedDate).success
    ? requestedDate
    : "";
  const offset =
    Number.isInteger(requestedOffset) &&
    requestedOffset >= 0 &&
    requestedOffset <= 10000
      ? requestedOffset
      : 0;
  const depth = params.get("depth") === "1" ? 1 : 2;
  const requestedNodes = Number(params.get("maxNodes") ?? 100);
  const maxNodes = [50, 100, 200].includes(requestedNodes)
    ? requestedNodes
    : 100;
  const q = (params.get("q") ?? "").slice(0, 100);
  const label = (params.get("label") ?? "").slice(0, 40);
  const mode = params.get("mode") === "nodes" ? ("nodes" as const) : ("trends" as const);
  const nodeId = (params.get("nodeId") ?? "").slice(0, 300);
  const invalid =
    requestedId !== trendId ||
    requestedDate !== date ||
    requestedOffset !== offset ||
    requestedNodes !== maxNodes ||
    (params.has("depth") && !["1", "2"].includes(params.get("depth")!)) ||
    (params.get("q")?.length ?? 0) > 100;
  return { trendId, nodeId, mode, label, date, offset, depth, maxNodes, q, invalid };
}

export function useTrendGraph() {
  const client = useQueryClient();
  const [params, setParams] = useSearchParams();
  const selected = parseSelection(params);
  const search = {
    q: selected.q,
    date: selected.date || undefined,
    offset: selected.offset,
    limit: GRAPH_PAGE_SIZE,
  };
  const nodeSearch = {
    q: selected.q,
    label: selected.label || undefined,
    date: selected.date || undefined,
    offset: selected.offset,
    limit: GRAPH_PAGE_SIZE,
  };
  const selection = {
    trendId: selected.trendId,
    depth: selected.depth,
    maxNodes: selected.maxNodes,
  };
  const trends = useQuery({
    queryKey: ["admin-trend-graph-search", search],
    queryFn: ({ signal }) => trendGraphService.search(search, signal),
    staleTime: 30000,
  });
  const nodes = useQuery({
    queryKey: ["admin-trend-graph-nodes", nodeSearch],
    enabled: selected.mode === "nodes",
    queryFn: ({ signal }) => trendGraphService.searchNodes(nodeSearch, signal),
    staleTime: 30000,
  });
  const graph = useQuery({
    queryKey: [
      "admin-trend-graph",
      selected.trendId
        ? selection
        : {
            nodeId: selected.nodeId,
            depth: selected.depth,
            maxNodes: selected.maxNodes,
          },
    ],
    enabled: Boolean(selected.trendId || selected.nodeId),
    queryFn: ({ signal }) =>
      selected.trendId
        ? trendGraphService.neighborhood(selection, signal)
        : trendGraphService.expandNode(
            {
              nodeId: selected.nodeId,
              depth: selected.depth,
              maxNodes: selected.maxNodes,
            },
            signal,
          ),
    staleTime: 30000,
  });
  const change = (values: Record<string, string>) =>
    setParams((current) => {
      const next = new URLSearchParams(current);
      next.set("view", "trendGraph");
      for (const [key, value] of Object.entries(values)) {
        if (value) next.set(key, value);
        else next.delete(key);
      }
      return next;
    });
  const reset = () => setParams({ view: "trendGraph" });
  const submitSearch = (q: string, date: string, label?: string) => {
    void client.invalidateQueries({
      queryKey: ["admin-trend-graph-search"],
      refetchType: "none",
    });
    void client.invalidateQueries({
      queryKey: ["admin-trend-graph-nodes"],
      refetchType: "none",
    });
    change({
      q,
      date,
      ...(label !== undefined ? { label } : {}),
      offset: "",
    });
    if (
      q === selected.q &&
      date === selected.date &&
      (label === undefined || label === selected.label) &&
      selected.offset === 0
    ) {
      void trends.refetch();
      if (selected.mode === "nodes") void nodes.refetch();
    }
  };
  return { ...selected, trends, nodes, graph, change, reset, submitSearch };
}
