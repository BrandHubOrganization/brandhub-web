import { useId } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import type { TrendItem } from "@/services/trendService";

interface SparkPoint {
  label: string;
  posts: number;
  change: number;
  synthetic?: boolean;
}

function formatShortDay(iso: string, locale: string): string {
  const raw = String(iso ?? "").trim();
  if (!raw || raw.startsWith("#")) return raw;
  const d = raw.includes("T") ? new Date(raw) : new Date(`${raw}T00:00:00`);
  if (Number.isNaN(d.getTime())) return raw;
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
  }).format(d);
}

function buildSparkPoints(item: TrendItem, locale: string): SparkPoint[] {
  const growth = item.growth ?? [];
  if (growth.length >= 2) {
    return growth.map((g) => ({
      label: formatShortDay(g.day, locale),
      posts: Math.max(0, Number(g.posts) || 0),
      change: Number(g.change) || 0,
    }));
  }

  if (growth.length === 1) {
    const first = growth[0];
    const currentPosts = Math.max(0, Number(first.posts) || 0);
    const rawChange = Number(first.change) || 0;
    const prevPosts =
      rawChange !== 0 ? Math.max(0, currentPosts - rawChange) : 0;
    return [
      { label: "", posts: prevPosts, change: 0, synthetic: true },
      {
        label: formatShortDay(first.day, locale),
        posts: currentPosts,
        change: rawChange || currentPosts,
      },
    ];
  }

  const daily = (item.dailyCounts ?? []).map((n) => Math.max(0, Number(n) || 0));
  if (daily.length >= 2) {
    return daily.map((posts, idx) => ({
      label: `#${idx + 1}`,
      posts,
      change: idx > 0 ? posts - daily[idx - 1] : 0,
    }));
  }

  if (daily.length === 1) {
    const currentPosts = daily[0];
    return [
      { label: "#1", posts: 0, change: 0, synthetic: true },
      { label: "#2", posts: currentPosts, change: currentPosts },
    ];
  }

  const sourceSum = Object.values(item.sources ?? {}).reduce(
    (sum, n) => sum + (Number(n) || 0),
    0,
  );
  const fallbackPosts = sourceSum || (item.posts?.length ?? 0);
  return [
    { label: "", posts: 0, change: 0, synthetic: true },
    { label: "", posts: fallbackPosts, change: fallbackPosts },
  ];
}

function buildSmoothSvgPaths(
  points: SparkPoint[],
  width: number,
  height: number,
  padX = 4,
  padTop = 5,
  padBottom = 4,
): {
  linePath: string;
  areaPath: string;
  coords: { x: number; y: number; point: SparkPoint }[];
} {
  const values = points.map((p) => p.posts);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values, 0);
  const minVal =
    rawMin === rawMax
      ? 0
      : Math.max(0, rawMin - (rawMax - rawMin) * 0.25);
  const maxVal =
    rawMin === rawMax ? Math.max(1, rawMax * 1.5) : Math.max(1, rawMax);
  const range = Math.max(1, maxVal - minVal);
  const innerW = Math.max(1, width - padX * 2);
  const innerH = Math.max(1, height - padTop - padBottom);
  const baselineY = height - padBottom;

  const coords = points.map((point, idx) => {
    const x =
      points.length === 1
        ? padX + innerW / 2
        : padX + (idx / (points.length - 1)) * innerW;
    const norm = (point.posts - minVal) / range;
    const y = padTop + (1 - norm) * innerH;
    return { x, y, point };
  });

  if (coords.length === 0) {
    return { linePath: "", areaPath: "", coords: [] };
  }

  let linePath = `M ${coords[0].x.toFixed(2)} ${coords[0].y.toFixed(2)}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const curr = coords[i];
    const next = coords[i + 1];
    const cpx1 = curr.x + (next.x - curr.x) * 0.45;
    const cpx2 = next.x - (next.x - curr.x) * 0.45;
    linePath += ` C ${cpx1.toFixed(2)} ${curr.y.toFixed(2)}, ${cpx2.toFixed(2)} ${next.y.toFixed(2)}, ${next.x.toFixed(2)} ${next.y.toFixed(2)}`;
  }

  const first = coords[0];
  const last = coords[coords.length - 1];
  const areaPath = `${linePath} L ${last.x.toFixed(2)} ${baselineY.toFixed(2)} L ${first.x.toFixed(2)} ${baselineY.toFixed(2)} Z`;

  return { linePath, areaPath, coords };
}

export function TrendSparkline({
  item,
  className,
}: {
  item: TrendItem;
  className?: string;
}) {
  const { t, i18n } = useTranslation();
  const rawId = useId();
  const gradientId = `trend-spark-${rawId.replace(/:/g, "")}`;

  const points = buildSparkPoints(item, i18n.language);
  const realPoints = points.filter((p) => !p.synthetic);
  const latest = points[points.length - 1];
  const latestPosts = latest?.posts ?? 0;
  const latestChange = latest?.change ?? 0;

  const svgWidth = 320;
  const svgHeight = 32;
  const { linePath, areaPath } = buildSmoothSvgPaths(
    points,
    svgWidth,
    svgHeight,
  );

  const tooltipLines = (realPoints.length > 0 ? realPoints : points)
    .map((p) => {
      const prefix = p.label ? `${p.label}: ` : "";
      const delta =
        p.change !== 0 ? ` (${p.change > 0 ? "+" : ""}${p.change})` : "";
      return `${prefix}${p.posts}${delta}`;
    })
    .join(" → ");
  const titleText = `${t("aiStudio.trends.detail.growth")}: ${tooltipLines}`;

  return (
    <div
      title={titleText}
      aria-label={titleText}
      className={cn(
        "flex h-11 w-full flex-col justify-between select-none",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-1.5 leading-none">
        <span className="text-muted-foreground truncate text-[10px]">
          {t("aiStudio.trends.dailyPosts")}
        </span>
        <span className="text-muted-foreground font-mono text-[11px] font-medium tabular-nums">
          <span className="text-foreground">{latestPosts}</span>
          {latestChange !== 0 && (
            <span
              className={cn(
                "ml-0.5 text-[10px]",
                latestChange > 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-muted-foreground",
              )}
            >
              {latestChange > 0 ? `+${latestChange}` : latestChange}
            </span>
          )}
        </span>
      </div>

      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        preserveAspectRatio="none"
        className="h-7 w-full overflow-visible"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="var(--color-brand-orange)"
              stopOpacity={0.25}
            />
            <stop
              offset="100%"
              stopColor="var(--color-brand-orange)"
              stopOpacity={0.0}
            />
          </linearGradient>
        </defs>

        {areaPath && <path d={areaPath} fill={`url(#${gradientId})`} />}

        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke="var(--color-brand-orange)"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>
    </div>
  );
}
