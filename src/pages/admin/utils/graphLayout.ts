import type { TrendGraph } from "@/pages/admin/types/trendGraph";
export { mergeTrendGraphs } from "@/pages/admin/types/trendGraph";

export type GraphPoint = { x: number; y: number };
export const GRAPH_WIDTH = 1200;
export const GRAPH_HEIGHT = 1000;
export const GRAPH_RADIUS = 26;
export type GraphBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type NodeVisual = {
  type: string;
  code: string;
  labelKey: string;
  color: string;
  fill: string;
  stroke: string;
};

export const BLOOM_NODE_CATEGORIES: Record<string, NodeVisual> = {
  Trend: {
    type: "Trend",
    code: "T",
    labelKey: "trendType",
    color: "#f97316",
    fill: "rgba(249, 115, 22, 0.16)",
    stroke: "#f97316",
  },
  CrawledPost: {
    type: "CrawledPost",
    code: "P",
    labelKey: "postType",
    color: "#0ea5e9",
    fill: "rgba(14, 165, 233, 0.16)",
    stroke: "#0ea5e9",
  },
  Person: {
    type: "Person",
    code: "Pe",
    labelKey: "personType",
    color: "#8b5cf6",
    fill: "rgba(139, 92, 246, 0.16)",
    stroke: "#8b5cf6",
  },
  Organization: {
    type: "Organization",
    code: "Or",
    labelKey: "organizationType",
    color: "#10b981",
    fill: "rgba(16, 185, 129, 0.16)",
    stroke: "#10b981",
  },
  Location: {
    type: "Location",
    code: "Lo",
    labelKey: "locationType",
    color: "#f59e0b",
    fill: "rgba(245, 158, 11, 0.16)",
    stroke: "#f59e0b",
  },
  Product: {
    type: "Product",
    code: "Pr",
    labelKey: "productType",
    color: "#f43f5e",
    fill: "rgba(244, 63, 94, 0.16)",
    stroke: "#f43f5e",
  },
  Event: {
    type: "Event",
    code: "Ev",
    labelKey: "eventType",
    color: "#6366f1",
    fill: "rgba(99, 102, 241, 0.16)",
    stroke: "#6366f1",
  },
  Entity: {
    type: "Entity",
    code: "E",
    labelKey: "entityType",
    color: "#64748b",
    fill: "rgba(100, 116, 139, 0.16)",
    stroke: "#64748b",
  },
};

export function getNodeVisual(type: string): NodeVisual {
  return BLOOM_NODE_CATEGORIES[type] ?? BLOOM_NODE_CATEGORIES.Entity;
}

const EDGE_COLORS: Record<string, { color: string }> = {
  BELONGS_TO: { color: "#0ea5e9" },
  MENTIONS: { color: "#8b5cf6" },
  ASSOCIATED_WITH: { color: "#f97316" },
};

export function getEdgeVisual(type: string): { color: string } {
  return EDGE_COLORS[type] ?? { color: "#94a3b8" };
}

export function computeNodeDegrees(graph: TrendGraph): Map<string, number> {
  const degrees = new Map<string, number>();
  for (const node of graph.nodes) degrees.set(node.id, 0);
  for (const edge of graph.edges) {
    degrees.set(edge.source, (degrees.get(edge.source) ?? 0) + 1);
    if (edge.target !== edge.source) {
      degrees.set(edge.target, (degrees.get(edge.target) ?? 0) + 1);
    }
  }
  return degrees;
}

export function getNodeRadius(
  nodeId: string,
  rootId: string,
  degrees: Map<string, number>,
): number {
  if (nodeId === rootId) return 32;
  const degree = degrees.get(nodeId) ?? 0;
  return Math.min(32, Math.max(24, Math.round(24 + Math.sqrt(degree) * 2)));
}

function hashOffset(id: string): GraphPoint {
  let hash = 2166136261;
  for (let i = 0; i < id.length; i++) {
    hash ^= id.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const angle = ((hash >>> 0) % 360) * (Math.PI / 180);
  return { x: Math.cos(angle) * 8, y: Math.sin(angle) * 8 };
}

export function layoutForceGraph(
  graph: TrendGraph,
  initialPositions?: Map<string, GraphPoint>,
  pinnedIds?: ReadonlySet<string>,
  iterations = 90,
): Map<string, GraphPoint> {
  const base = layoutGraph(graph);
  const positions = new Map<string, GraphPoint>();
  for (const node of graph.nodes) {
    const existing = initialPositions?.get(node.id);
    if (existing) {
      positions.set(node.id, { x: existing.x, y: existing.y });
      continue;
    }
    const radial = base.get(node.id) ?? { x: 600, y: 500 };
    if (node.id === graph.rootId) {
      positions.set(node.id, { x: radial.x, y: radial.y });
    } else {
      const jitter = hashOffset(node.id);
      positions.set(node.id, {
        x: radial.x + jitter.x,
        y: radial.y + jitter.y,
      });
    }
  }
  if (graph.nodes.length <= 1 || iterations <= 0) return positions;

  const ids = graph.nodes.map((node) => node.id);
  const forces = new Map<string, GraphPoint>();

  for (let step = 0; step < iterations; step++) {
    const alpha = 0.85 * (1 - step / iterations) + 0.08;
    for (const id of ids) forces.set(id, { x: 0, y: 0 });

    // Coulomb repulsion between all node pairs
    for (let i = 0; i < ids.length; i++) {
      const a = positions.get(ids[i])!;
      const fa = forces.get(ids[i])!;
      for (let j = i + 1; j < ids.length; j++) {
        const b = positions.get(ids[j])!;
        const fb = forces.get(ids[j])!;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const distSq = Math.max(900, dx * dx + dy * dy);
        const dist = Math.sqrt(distSq);
        const repulse = 26000 / distSq;
        const fx = (dx / dist) * repulse;
        const fy = (dy / dist) * repulse;
        fa.x -= fx;
        fa.y -= fy;
        fb.x += fx;
        fb.y += fy;
      }
    }

    // Hooke spring attraction along edges
    for (const edge of graph.edges) {
      if (edge.source === edge.target) continue;
      const source = positions.get(edge.source);
      const target = positions.get(edge.target);
      if (!source || !target) continue;
      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const dist = Math.hypot(dx, dy) || 1;
      const displacement = dist - 180;
      const spring = displacement * 0.045;
      const fx = (dx / dist) * spring;
      const fy = (dy / dist) * spring;
      const fs = forces.get(edge.source)!;
      const ft = forces.get(edge.target)!;
      fs.x += fx;
      fs.y += fy;
      ft.x -= fx;
      ft.y -= fy;
    }

    // Gentle centering gravity & position update
    for (const id of ids) {
      if (id === graph.rootId || pinnedIds?.has(id)) continue;
      const pos = positions.get(id)!;
      const f = forces.get(id)!;
      f.x += (600 - pos.x) * 0.018;
      f.y += (500 - pos.y) * 0.018;
      const mag = Math.hypot(f.x, f.y) || 1;
      const maxStep = 26 * alpha;
      const scale = mag > maxStep ? maxStep / mag : alpha;
      pos.x = Math.min(1020, Math.max(180, pos.x + f.x * scale));
      pos.y = Math.min(760, Math.max(180, pos.y + f.y * scale));
    }
  }

  return positions;
}

/** Deterministic hop rings; coordinates carry no scoring or similarity meaning. */
export function layoutGraph(graph: TrendGraph) {
  const neighbors = new Map<string, Set<string>>();
  for (const edge of graph.edges) {
    for (const [source, target] of [
      [edge.source, edge.target],
      [edge.target, edge.source],
    ]) {
      if (!neighbors.has(source)) neighbors.set(source, new Set());
      neighbors.get(source)!.add(target);
    }
  }
  const distances = new Map([[graph.rootId, 0]]);
  const queue = [graph.rootId];
  for (let index = 0; index < queue.length; index++) {
    for (const next of neighbors.get(queue[index]) ?? []) {
      if (distances.has(next)) continue;
      distances.set(next, distances.get(queue[index])! + 1);
      queue.push(next);
    }
  }
  const positions = new Map<string, GraphPoint>([
    [graph.rootId, { x: 600, y: 500 }],
  ]);
  for (const depth of [1, 2]) {
    const ring = graph.nodes.filter(
      (node) =>
        node.id !== graph.rootId && (distances.get(node.id) ?? 2) === depth,
    );
    ring.sort((a, b) => a.id.localeCompare(b.id));
    ring.forEach((node, index) => {
      const angle = -Math.PI / 2 + (2 * Math.PI * index) / ring.length;
      const radius = depth === 1 ? 230 : 430;
      positions.set(node.id, {
        x: 600 + Math.cos(angle) * radius,
        y: 500 + Math.sin(angle) * radius,
      });
    });
  }
  return positions;
}

/** Curves keep parallel and reverse edges individually selectable. */
export function layoutEdges(
  graph: TrendGraph,
  positions: Map<string, GraphPoint>,
) {
  const groups = new Map<string, typeof graph.edges>();
  for (const edge of graph.edges) {
    const pair = JSON.stringify([edge.source, edge.target].sort());
    groups.set(pair, [...(groups.get(pair) ?? []), edge]);
  }
  return [...groups.values()].flatMap((edges) =>
    edges.map((edge, index) => {
      const start = positions.get(edge.source)!;
      const end = positions.get(edge.target)!;
      if (edge.source === edge.target) {
        const radius = 45 + index * 16;
        return {
          edge,
          controlPoints: [
            { x: start.x - radius * 2, y: start.y - radius * 2 },
            { x: start.x + radius * 2, y: start.y - radius * 2 },
          ],
          path: `M ${start.x - 12} ${start.y - 23} C ${start.x - radius * 2} ${start.y - radius * 2}, ${start.x + radius * 2} ${start.y - radius * 2}, ${start.x + 12} ${start.y - 23}`,
        };
      }
      const length = Math.hypot(end.x - start.x, end.y - start.y);
      const dx = (end.x - start.x) / length,
        dy = (end.y - start.y) / length;
      const offset =
        (index - (edges.length - 1) / 2) *
        40 *
        (edge.source < edge.target ? 1 : -1);
      return {
        edge,
        controlPoints: [
          {
            x: (start.x + end.x) / 2 - dy * offset,
            y: (start.y + end.y) / 2 + dx * offset,
          },
        ],
        path: `M ${start.x + dx * GRAPH_RADIUS} ${start.y + dy * GRAPH_RADIUS} Q ${(start.x + end.x) / 2 - dy * offset} ${(start.y + end.y) / 2 + dx * offset}, ${end.x - dx * (GRAPH_RADIUS + 5)} ${end.y - dy * (GRAPH_RADIUS + 5)}`,
      };
    }),
  );
}

/** Include edge curve control points so Fit also preserves loops and parallel arcs. */
export function graphBounds(graph: TrendGraph): GraphBounds {
  const positions = layoutGraph(graph);
  const points = [
    ...positions.values(),
    ...layoutEdges(graph, positions).flatMap((edge) => edge.controlPoints),
  ];
  const x = points.map((point) => point.x),
    y = points.map((point) => point.y);
  const left = Math.min(...x) - 100,
    top = Math.min(...y) - 100;
  const width = Math.max(400, Math.max(...x) - left + 100);
  const height = Math.max(400, Math.max(...y) - top + 100);
  return {
    x: (Math.min(...x) + Math.max(...x) - width) / 2,
    y: (Math.min(...y) + Math.max(...y) - height) / 2,
    width,
    height,
  };
}
