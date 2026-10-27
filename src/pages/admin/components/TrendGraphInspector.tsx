import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowRight, ExternalLink, GitBranchPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  getEdgeVisual,
  getNodeVisual,
} from "@/pages/admin/utils/graphLayout";
import type { GraphFocus, TrendGraph } from "@/pages/admin/types/trendGraph";

function safeUrl(value: unknown) {
  if (typeof value !== "string") return undefined;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
}

function GraphProperties({
  graph,
  focus,
  onExpandNode,
  expandingNodeId,
}: {
  graph: TrendGraph;
  focus: GraphFocus;
  onExpandNode?: (nodeId: string) => void;
  expandingNodeId?: string | null;
}) {
  const { t } = useTranslation();
  const node =
    focus.kind === "node"
      ? graph.nodes.find((item) => item.id === focus.id)
      : undefined;
  const edge =
    focus.kind === "edge"
      ? graph.edges.find((item) => item.id === focus.id)
      : undefined;
  const selected = node ?? edge;
  if (!selected) return null;

  const badgeColor = node
    ? getNodeVisual(node.type).color
    : getEdgeVisual(selected.type).color;

  const properties = {
    ...selected.properties,
    elementId: selected.id,
    ...(node && {
      businessId: node.businessId,
      labels: node.labels.join(", "),
    }),
    ...(edge && { source: edge.source, target: edge.target }),
  };

  const isExpanding = Boolean(node && expandingNodeId === node.id);

  return (
    <section
      className="border-border/80 min-w-0 space-y-3 border-b p-4"
      aria-label={t("admin.trendGraph.properties")}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              aria-hidden="true"
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: badgeColor }}
            />
            <p className="text-muted-foreground font-mono text-xs font-medium">
              {selected.type}
            </p>
          </div>
          <h3 className="text-base leading-snug font-semibold [overflow-wrap:anywhere] break-words">
            {node?.name ?? edge?.type}
          </h3>
        </div>
        {node && onExpandNode && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isExpanding}
            loading={isExpanding}
            onClick={() => onExpandNode(node.id)}
            className="shrink-0 gap-1.5 text-xs"
          >
            <GitBranchPlus aria-hidden="true" className="size-3.5" />
            {t(
              isExpanding
                ? "admin.trendGraph.expanding"
                : "admin.trendGraph.expandNode",
            )}
          </Button>
        )}
      </div>

      {selected.propertiesTruncated && (
        <p
          role="status"
          className="bg-muted/60 text-muted-foreground rounded-lg border px-2.5 py-1.5 text-xs"
        >
          {t("admin.trendGraph.propertiesTruncated")}
        </p>
      )}

      <dl className="max-h-64 space-y-2 overflow-y-auto pr-1 text-sm">
        {Object.entries(properties).map(([key, value]) => {
          const url =
            key === "url" || key === "sourceUrl" ? safeUrl(value) : undefined;
          return (
            <div
              key={key}
              className="border-border/60 bg-muted/25 rounded-lg border px-3 py-2"
            >
              <dt className="text-muted-foreground font-mono text-[11px]">
                {key}
              </dt>
              <dd className="mt-0.5 font-mono text-xs [overflow-wrap:anywhere] break-words whitespace-pre-wrap">
                {url ? (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground inline-flex items-center gap-1 underline focus-visible:outline-2"
                  >
                    <span>{String(value)}</span>
                    <ExternalLink
                      aria-hidden="true"
                      className="size-3 shrink-0"
                    />
                  </a>
                ) : value === null ? (
                  "—"
                ) : (
                  String(value)
                )}
              </dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}

export function TrendGraphInspector({
  graph,
  focus,
  onFocus,
  onExpandNode,
  expandingNodeId,
}: {
  graph: TrendGraph;
  focus: GraphFocus;
  onFocus: (focus: GraphFocus) => void;
  onExpandNode?: (nodeId: string) => void;
  expandingNodeId?: string | null;
}) {
  const { t } = useTranslation();
  const [kind, setKind] = useState<"node" | "edge">("node");
  const [filter, setFilter] = useState("");
  const [offset, setOffset] = useState(0);
  const names = new Map(graph.nodes.map((node) => [node.id, node.name]));
  const entries =
    kind === "node"
      ? graph.nodes.map((node) => ({
          id: node.id,
          name: node.name,
          type: node.type,
        }))
      : graph.edges.map((edge) => ({
          id: edge.id,
          name: `${names.get(edge.source)} → ${names.get(edge.target)}`,
          type: edge.type,
        }));
  const matches = entries.filter((item) =>
    `${item.name} ${item.type} ${item.id}`
      .toLocaleLowerCase()
      .includes(filter.toLocaleLowerCase()),
  );

  return (
    <section className="bg-card/95 border-border/80 flex min-w-0 flex-col overflow-hidden rounded-2xl border shadow-sm">
      <GraphProperties
        graph={graph}
        focus={focus}
        onExpandNode={onExpandNode}
        expandingNodeId={expandingNodeId}
      />
      <div className="min-w-0 space-y-3 p-4">
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label={t("admin.trendGraph.browse")}
        >
          {(["node", "edge"] as const).map((value) => (
            <Button
              key={value}
              size="sm"
              variant={kind === value ? "secondary" : "ghost"}
              aria-pressed={kind === value}
              onClick={() => {
                setKind(value);
                setOffset(0);
              }}
            >
              {t(`admin.trendGraph.${value}List`, {
                count: value === "node" ? graph.nodeCount : graph.edgeCount,
              })}
            </Button>
          ))}
        </div>
        <Input
          label={t("admin.trendGraph.findItem")}
          value={filter}
          maxLength={100}
          onChange={(event) => {
            setFilter(event.target.value);
            setOffset(0);
          }}
        />
        <ul className="max-h-64 space-y-1 overflow-y-auto pr-0.5">
          {matches.slice(offset, offset + 20).map((entry) => {
            const dotColor =
              kind === "node"
                ? getNodeVisual(entry.type).color
                : getEdgeVisual(entry.type).color;
            return (
              <li key={entry.id}>
                <Button
                  variant="ghost"
                  aria-pressed={focus.kind === kind && focus.id === entry.id}
                  className={cn(
                    "h-auto min-h-11 w-full items-start justify-start gap-2.5 rounded-xl px-3 py-2 text-left whitespace-normal",
                    focus.kind === kind &&
                      focus.id === entry.id &&
                      "bg-brand-orange-soft text-foreground",
                  )}
                  onClick={() => onFocus({ kind, id: entry.id })}
                >
                  {kind === "node" ? (
                    <span
                      aria-hidden="true"
                      className="mt-1.5 size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: dotColor }}
                    />
                  ) : (
                    <ArrowRight
                      aria-hidden="true"
                      className="mt-1 size-4 shrink-0"
                      style={{ color: dotColor }}
                    />
                  )}
                  <span className="min-w-0 [overflow-wrap:anywhere]">
                    {entry.name}
                    <span className="text-muted-foreground block font-mono text-xs">
                      {entry.type}
                    </span>
                  </span>
                </Button>
              </li>
            );
          })}
        </ul>
        {!matches.length && (
          <p className="text-muted-foreground text-sm">
            {t("admin.trendGraph.noItems")}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={offset === 0}
            onClick={() => setOffset(offset - 20)}
          >
            {t("admin.trendGraph.previous")}
          </Button>
          <span className="text-muted-foreground font-mono text-xs tabular-nums">
            {t("admin.trendGraph.itemCount", { count: matches.length })}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={offset + 20 >= matches.length}
            onClick={() => setOffset(offset + 20)}
          >
            {t("admin.trendGraph.next")}
          </Button>
        </div>
      </div>
    </section>
  );
}
