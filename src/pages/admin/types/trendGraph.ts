import { z } from "zod";

const identity = z.string().min(1).max(4000);
const properties = z.record(
  z.string(),
  z.union([z.string().max(4000), z.number().finite(), z.boolean(), z.null()]),
);
export const graphNodeSchema = z.object({
  id: identity,
  businessId: z.string().nullable(),
  name: z.string().max(4000),
  labels: z.array(z.string()).max(8),
  type: z.string(),
  properties,
  propertiesTruncated: z.boolean(),
});
const graphEdgeSchema = z.object({
  id: identity,
  source: identity,
  target: identity,
  type: z.string(),
  properties,
  propertiesTruncated: z.boolean(),
});
export const graphPageSchema = z.object({
  items: z
    .array(
      graphNodeSchema.refine(
        (node) =>
          node.type === "Trend" &&
          node.businessId !== null &&
          /^trend:[^\s]+$/u.test(node.businessId),
      ),
    )
    .max(100),
  offset: z.number().int().nonnegative(),
  limit: z.number().int().min(1).max(100),
  hasMore: z.boolean(),
});
export const nodeSearchPageSchema = z.object({
  items: z.array(graphNodeSchema).max(100),
  offset: z.number().int().nonnegative(),
  limit: z.number().int().min(1).max(100),
  hasMore: z.boolean(),
});
const baseGraphObjectSchema = z.object({
  trendId: z.string(),
  rootId: identity,
  nodes: z.array(graphNodeSchema).min(1).max(200),
  edges: z.array(graphEdgeSchema).max(400),
  nodeCount: z.number().int(),
  edgeCount: z.number().int(),
  depth: z.number().int().min(1).max(2),
  maxNodes: z.number().int().min(1).max(200),
  maxEdges: z.number().int().min(1).max(400),
  fanout: z.number().int().min(1).max(50),
  truncated: z.boolean(),
  truncationReasons: z.array(z.string()).max(10),
});
export const graphResultSchema = baseGraphObjectSchema.refine((graph) => {
  const nodes = new Set(graph.nodes.map((node) => node.id));
  return (
    nodes.has(graph.rootId) &&
    graph.nodes.some(
      (node) => node.id === graph.rootId && node.businessId === graph.trendId,
    ) &&
    nodes.size === graph.nodes.length &&
    new Set(graph.edges.map((edge) => edge.id)).size === graph.edges.length &&
    graph.nodeCount === graph.nodes.length &&
    graph.edgeCount === graph.edges.length &&
    graph.nodeCount <= graph.maxNodes &&
    graph.edgeCount <= graph.maxEdges &&
    graph.edges.every(
      (edge) => nodes.has(edge.source) && nodes.has(edge.target),
    )
  );
}, "Invalid graph topology");
export const expandedGraphResultSchema = baseGraphObjectSchema.refine(
  (graph) => {
    const nodes = new Set(graph.nodes.map((node) => node.id));
    return (
      nodes.has(graph.rootId) &&
      nodes.size === graph.nodes.length &&
      new Set(graph.edges.map((edge) => edge.id)).size === graph.edges.length &&
      graph.nodeCount === graph.nodes.length &&
      graph.edgeCount === graph.edges.length &&
      graph.nodeCount <= graph.maxNodes &&
      graph.edgeCount <= graph.maxEdges &&
      graph.edges.every(
        (edge) => nodes.has(edge.source) && nodes.has(edge.target),
      )
    );
  },
  "Invalid graph topology",
);

export type GraphNode = z.infer<typeof graphNodeSchema>;
export type GraphEdge = z.infer<typeof graphEdgeSchema>;
export type TrendGraph = z.infer<typeof graphResultSchema>;
export type GraphSearch = {
  q: string;
  date?: string;
  offset: number;
  limit: number;
};
export type GraphNodeSearch = {
  q: string;
  label?: string;
  date?: string;
  offset: number;
  limit: number;
};
export type GraphSelection = {
  trendId: string;
  depth: number;
  maxNodes: number;
};
export type GraphExpandSelection = {
  nodeId: string;
  depth?: number;
  maxNodes?: number;
};
export type GraphLayoutMode = "force" | "radial";
export type GraphFocus = { kind: "node" | "edge"; id: string };

export function mergeTrendGraphs(
  base: TrendGraph,
  incoming: TrendGraph,
): TrendGraph {
  const nodeMap = new Map<string, GraphNode>();
  for (const node of base.nodes) nodeMap.set(node.id, node);
  let nodeCapReached = false;
  for (const node of incoming.nodes) {
    if (nodeMap.has(node.id)) continue;
    if (nodeMap.size >= 200) {
      nodeCapReached = true;
      break;
    }
    nodeMap.set(node.id, node);
  }
  const nodes = [...nodeMap.values()];
  const validNodeIds = new Set(nodeMap.keys());
  const edgeMap = new Map<string, GraphEdge>();
  let edgeCapReached = false;
  for (const edge of [...base.edges, ...incoming.edges]) {
    if (!validNodeIds.has(edge.source) || !validNodeIds.has(edge.target))
      continue;
    if (edgeMap.has(edge.id)) continue;
    if (edgeMap.size >= 400) {
      edgeCapReached = true;
      break;
    }
    edgeMap.set(edge.id, edge);
  }
  const edges = [...edgeMap.values()];
  const reasons = new Set([
    ...base.truncationReasons,
    ...incoming.truncationReasons,
  ]);
  if (nodeCapReached) reasons.add("NODE_LIMIT");
  if (edgeCapReached) reasons.add("EDGE_LIMIT");
  return {
    ...base,
    rootId: base.rootId,
    trendId: base.trendId,
    nodes,
    edges,
    nodeCount: nodes.length,
    edgeCount: edges.length,
    maxNodes: Math.min(200, Math.max(base.maxNodes, nodes.length)),
    maxEdges: Math.min(400, Math.max(base.maxEdges, edges.length)),
    truncated:
      base.truncated || incoming.truncated || nodeCapReached || edgeCapReached,
    truncationReasons: [...reasons].slice(0, 10),
  };
}
