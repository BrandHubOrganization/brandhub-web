import { useState, useId } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  ExternalLink,
  Share2,
  ThumbsUp,
  MessageCircle,
  Network,
  Activity,
  Layers,
} from "lucide-react";
import type { PublishedTrend } from "@/pages/admin/types/trendView";

function safePostUrl(value?: string | null) {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
}

/** Smooth SVG Sparkline for Momentum history */
function MomentumSparkline({
  days,
  counts,
}: {
  days: string[];
  counts: number[];
}) {
  const { t } = useTranslation();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const gradientId = useId();

  if (!days.length || !counts.length || days.length !== counts.length) {
    return null;
  }

  const width = 360;
  const height = 90;
  const padX = 24;
  const padTop = 18;
  const padBottom = 22;

  const maxCount = Math.max(...counts, 1);
  const minCount = Math.min(...counts, 0);
  const countRange = maxCount - minCount || 1;

  const points = counts.map((cnt, i) => {
    const x =
      days.length === 1
        ? width / 2
        : padX + (i / (days.length - 1)) * (width - padX * 2);
    const y =
      height - padBottom - ((cnt - minCount) / countRange) * (height - padTop - padBottom);
    return { x, y, count: cnt, day: days[i] };
  });

  const peakIdx = counts.indexOf(Math.max(...counts));
  const peakPoint = points[peakIdx];

  // SVG Line path
  const linePath = points.reduce((acc, pt, i) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    // Simple smooth bezier control points
    const prev = points[i - 1];
    const cpX = (prev.x + pt.x) / 2;
    return `${acc} C ${cpX} ${prev.y}, ${cpX} ${pt.y}, ${pt.x} ${pt.y}`;
  }, "");

  // Area under line
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padBottom} L ${points[0].x} ${height - padBottom} Z`;

  const activePoint = hoveredIdx !== null ? points[hoveredIdx] : peakPoint;

  return (
    <div className="rounded-xl border border-border/70 bg-card/60 p-3.5 space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold flex items-center gap-1.5 text-foreground">
          <Activity className="size-3.5 text-primary" />
          {t("admin.trends.momentum")}
        </span>
        {activePoint && (
          <span className="font-mono text-[11px] text-muted-foreground">
            {activePoint.day}:{" "}
            <strong className="text-foreground font-semibold">
              {activePoint.count}
            </strong>{" "}
            {t("admin.trends.postsUnit", { defaultValue: "bài viết" })}
          </span>
        )}
      </div>

      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-24 overflow-visible select-none"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.35" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Baseline */}
          <line
            x1={padX}
            y1={height - padBottom}
            x2={width - padX}
            y2={height - padBottom}
            stroke="currentColor"
            className="text-border/60"
            strokeDasharray="2 2"
          />

          {/* Area gradient */}
          <path d={areaPath} fill={`url(#${gradientId})`} />

          {/* Line curve */}
          <path
            d={linePath}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Peak point marker */}
          {peakPoint && (
            <g>
              <circle
                cx={peakPoint.x}
                cy={peakPoint.y}
                r="5"
                className="fill-primary"
              />
              <circle
                cx={peakPoint.x}
                cy={peakPoint.y}
                r="8"
                className="fill-primary/20 animate-ping"
              />
            </g>
          )}

          {/* Interactive touch/hover points */}
          {points.map((pt, i) => (
            <g
              key={i}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <circle
                cx={pt.x}
                cy={pt.y}
                r="6"
                className="fill-transparent hover:fill-primary/50 transition-colors"
              />
              <circle
                cx={pt.x}
                cy={pt.y}
                r={hoveredIdx === i ? 4 : 2}
                className={hoveredIdx === i ? "fill-primary" : "fill-primary/70"}
              />
              {/* Day label */}
              <text
                x={pt.x}
                y={height - 6}
                textAnchor="middle"
                className="fill-muted-foreground text-[9px] font-mono select-none"
              >
                {pt.day.slice(-5)}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <ul className="flex flex-wrap gap-1.5 pt-1">
        {days.map((day, index) => {
          const isPeak = index === peakIdx;
          return (
            <li
              key={day}
              className={`rounded-md px-2.5 py-1 text-[11px] font-mono transition-colors ${
                isPeak
                  ? "bg-primary/10 border border-primary/30 text-primary font-semibold"
                  : "bg-muted/50 border border-border/40 text-muted-foreground"
              }`}
            >
              {day}:{" "}
              <span className="font-semibold text-foreground">
                {counts[index] ?? "—"}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Visual Score Progress Gauge */
function ScoreGauge({
  label,
  value,
  formattedValue,
  colorScheme,
}: {
  label: string;
  value: number;
  formattedValue: string;
  colorScheme: "cyan" | "amber" | "blue" | "purple";
}) {
  // Cap at 10 for percentage calc unless value is larger
  const maxScale = Math.max(10, value);
  const percentage = Math.min(100, Math.max(4, (value / maxScale) * 100));

  const colorStyles = {
    cyan: {
      bar: "bg-gradient-to-r from-teal-500 to-cyan-500",
      text: "text-cyan-600 dark:text-cyan-400",
      bg: "bg-cyan-500/10 border-cyan-500/20",
    },
    amber: {
      bar: "bg-gradient-to-r from-amber-500 to-orange-500",
      text: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
    },
    blue: {
      bar: "bg-gradient-to-r from-blue-500 to-indigo-500",
      text: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/20",
    },
    purple: {
      bar: "bg-gradient-to-r from-purple-500 to-pink-500",
      text: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-500/10 border-purple-500/20",
    },
  }[colorScheme];

  return (
    <div className="rounded-xl border border-border/70 bg-card/60 p-3 space-y-2 shadow-2xs">
      <div className="flex items-center justify-between gap-1 text-xs">
        <dt className="text-muted-foreground text-[11px] font-medium truncate">
          {label}
        </dt>
        <dd className={`font-mono text-sm font-bold tabular-nums ${colorStyles.text}`}>
          {formattedValue}
        </dd>
      </div>

      {/* Progress Track */}
      <div className="h-1.5 w-full rounded-full bg-muted/60 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colorStyles.bar}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export function AdminTrendDetail({ trend }: { trend: PublishedTrend }) {
  const { t, i18n } = useTranslation();
  const number = new Intl.NumberFormat(i18n.language, {
    maximumFractionDigits: 3,
  });

  const components: Array<{
    key: "anomaly" | "virality" | "engagement" | "weeklyScore";
    value?: number;
    colorScheme: "cyan" | "amber" | "blue" | "purple";
  }> = [
    {
      key: "anomaly",
      value: trend.anomaly_score,
      colorScheme: "cyan",
    },
    {
      key: "virality",
      value: trend.virality_score,
      colorScheme: "amber",
    },
    {
      key: "engagement",
      value: trend.engagement_score,
      colorScheme: "blue",
    },
    {
      key: "weeklyScore",
      value: trend.weekly_final_score,
      colorScheme: "purple",
    },
  ];

  return (
    <div className="border-border space-y-4 border-t p-4 bg-muted/5">
      {/* Neo4j Graph Link */}
      {trend.trend_id && (
        <div className="flex items-center justify-between">
          <Link
            to={`/admin?view=trendGraph&trendId=${encodeURIComponent(trend.trend_id)}`}
            className="text-foreground inline-flex items-center gap-1.5 rounded text-xs font-medium underline underline-offset-4 hover:text-primary focus-visible:outline-2"
          >
            <Network className="size-3.5" />
            {t("admin.trendGraph.openGraph", {
              defaultValue: "Inspect Trend Graph (Neo4j)",
            })}
          </Link>
          <span className="text-[11px] font-mono text-muted-foreground [overflow-wrap:anywhere]">
            {trend.trend_id}
          </span>
        </div>
      )}

      {/* Visual Score Progress Gauges */}
      <dl className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {components
          .filter((item) => item.value !== undefined)
          .map((item) => (
            <ScoreGauge
              key={item.key}
              label={t(`admin.trends.${item.key}`)}
              value={item.value!}
              formattedValue={number.format(item.value!)}
              colorScheme={item.colorScheme}
            />
          ))}
      </dl>

      {/* Related Keywords */}
      {trend.keywords.length > 0 && (
        <div className="rounded-xl border border-border/70 bg-card/60 p-3 text-xs space-y-1">
          <span className="text-muted-foreground font-medium text-[11px] flex items-center gap-1">
            <Layers className="size-3" />
            {t("admin.trends.related")}:
          </span>
          <p className="text-foreground font-medium break-words leading-relaxed">
            {trend.keywords.join(" · ")}
          </p>
        </div>
      )}

      {/* Mini Sparkline SVG for Momentum */}
      {trend.momentum.days?.length && trend.momentum.counts?.length ? (
        <MomentumSparkline
          days={trend.momentum.days}
          counts={trend.momentum.counts}
        />
      ) : null}

      {/* Source Posts Evidence */}
      {trend.post_items.length > 0 ? (
        <section className="space-y-2.5 pt-1">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t("admin.trends.posts", { count: trend.post_items.length })}
          </h3>
          <div className="space-y-2">
            {trend.post_items.map((post, index) => {
              const href = safePostUrl(post.url);
              return (
                <article
                  key={`${post.url ?? "post"}-${index}`}
                  className="rounded-xl border border-border bg-card p-3.5 space-y-2 shadow-2xs hover:border-border/80 transition-colors"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-foreground">
                      {post.author ||
                        post.source ||
                        t("admin.trends.unknownSource", {
                          defaultValue: "Unknown Source",
                        })}
                    </span>
                    {href && (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-orange-fg focus-visible:outline-ring inline-flex items-center gap-1 rounded text-xs underline underline-offset-4 focus-visible:outline-2 font-medium"
                      >
                        {t("admin.trends.openPost", {
                          defaultValue: "Open Post",
                        })}
                        <ExternalLink aria-hidden="true" className="size-3" />
                      </a>
                    )}
                  </div>

                  {/* Raw post.text for safe XSS rendering and exact test match */}
                  <p className="text-sm leading-relaxed [overflow-wrap:anywhere] whitespace-pre-wrap text-foreground/90">
                    {post.text}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1 border-t border-border/40">
                    <span className="flex items-center gap-1 text-[11px]">
                      <ThumbsUp className="size-3" />
                      {post.likes ?? "—"}
                    </span>
                    <span className="flex items-center gap-1 text-[11px]">
                      <Share2 className="size-3" />
                      {post.shares ?? "—"}
                    </span>
                    <span className="flex items-center gap-1 text-[11px]">
                      <MessageCircle className="size-3" />
                      {post.comments ?? "—"}
                    </span>
                    <span className="text-[11px] ml-auto">
                      {t("admin.trends.interactions", {
                        likes: post.likes ?? "—",
                        shares: post.shares ?? "—",
                        comments: post.comments ?? "—",
                      })}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : (
        <section className="space-y-2 text-sm pt-1">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t("admin.trends.samples")}
          </h3>
          {trend.sample_posts.length ? (
            <div className="space-y-2">
              {trend.sample_posts.map((post, index) => (
                <p
                  key={index}
                  className="rounded-lg bg-card border border-border/60 p-3 [overflow-wrap:anywhere] whitespace-pre-wrap text-xs leading-relaxed"
                >
                  {post}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-xs">
              {t("admin.trends.noEvidence")}
            </p>
          )}
        </section>
      )}
    </div>
  );
}
