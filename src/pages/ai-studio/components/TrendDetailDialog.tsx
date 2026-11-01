import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  Check,
  Copy,
  ExternalLink,
  Flame,
  Megaphone,
  Music2,
  Clock,
  Video,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  PLATFORM_LABEL,
  topicLabel,
  trendPlatforms,
  type TrendFormat,
  type TrendItem,
} from "@/services/trendService";
import { TrendPostList } from "./TrendPostList";

const STATUS_BADGE_STYLE: Record<string, string> = {
  new: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20",
  emerging: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20",
  rising:
    "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
  peaking: "bg-brand-orange/10 text-brand-orange border-brand-orange/20",
  peak: "bg-brand-orange/10 text-brand-orange border-brand-orange/20",
  declining: "bg-muted text-muted-foreground border-border",
};

const MOOD_BADGE_STYLE: Record<string, string> = {
  positive:
    "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
  humor:
    "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
  negative:
    "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20",
  controversy:
    "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
  mixed:
    "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
  neutral: "bg-muted text-muted-foreground border-border",
};

const RISK_STYLE: Record<
  string,
  { badge: string; dot: string }
> = {
  low: {
    badge:
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
    dot: "bg-emerald-500",
  },
  medium: {
    badge:
      "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
    dot: "bg-amber-500",
  },
  high: {
    badge:
      "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20",
    dot: "bg-rose-500",
  },
};

const EMOTION_BAR_COLOR: Record<string, string> = {
  vui: "bg-brand-orange",
  joy: "bg-brand-orange",
  trust: "bg-emerald-500",
  ngạc_nhiên: "bg-sky-500",
  surprise: "bg-sky-500",
  anticipation: "bg-sky-500",
  trung_lập: "bg-slate-400 dark:bg-slate-500",
  neutral: "bg-slate-400 dark:bg-slate-500",
  tức_giận: "bg-rose-500",
  anger: "bg-rose-500",
  lo_sợ: "bg-amber-500",
  fear: "bg-amber-500",
  buồn: "bg-purple-500",
  sadness: "bg-purple-500",
  disgust: "bg-purple-500",
};

function formatDay(iso: string, locale: string): string {
  const raw = String(iso ?? "").trim();
  if (!raw) return "";
  const d = raw.includes("T") ? new Date(raw) : new Date(`${raw}T00:00:00`);
  if (Number.isNaN(d.getTime())) return raw;
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
  }).format(d);
}

type ExtendedTrendFormat = TrendFormat & {
  pattern?: string | null;
  hashtagCount?: number | null;
};

/** FR 3.7.1 trend detail: KPI cards, growth line, emotion breakdown, TikTok format, keywords, posts. */
export function TrendDetailDialog({
  item,
  onClose,
}: {
  item: TrendItem;
  onClose: () => void;
}) {
  const { t, i18n } = useTranslation();
  const [copiedKeyword, setCopiedKeyword] = useState(false);
  const [coverError, setCoverError] = useState(false);

  const growth = item.growth ?? [];
  const dailyCounts = item.dailyCounts ?? [];
  const hasGrowth = growth.length > 1;
  const hasDailyFallback = !hasGrowth && dailyCounts.length > 1;
  const fallbackData = hasDailyFallback
    ? dailyCounts.map((posts, idx) => ({
        day: `#${idx + 1}`,
        posts,
        change: idx > 0 ? posts - dailyCounts[idx - 1] : 0,
      }))
    : [];

  const emotions = Object.entries(item.emotionDist ?? {}).sort(
    (a, b) => b[1] - a[1],
  );
  const tick = { fill: "var(--color-muted-foreground)", fontSize: 12 };
  const compactNumber = new Intl.NumberFormat(i18n.language, {
    notation: "compact",
  });

  const platforms = trendPlatforms(item);
  const sourceEntries = Object.entries(item.sources ?? {});
  const totalPostsFromSources = sourceEntries.reduce(
    (sum, [, count]) => sum + count,
    0,
  );
  const totalPosts = totalPostsFromSources || item.posts?.length || 0;
  const totalEngagement = (item.posts ?? []).reduce(
    (sum, p) => sum + (p.likes ?? 0) + (p.comments ?? 0) + (p.shares ?? 0),
    0,
  );

  const copyText = (text: string, isMainKeyword = false) => {
    void navigator.clipboard
      .writeText(text)
      .then(() => {
        if (isMainKeyword) {
          setCopiedKeyword(true);
          window.setTimeout(() => setCopiedKeyword(false), 1800);
        }
        toast.success(t("aiStudio.trends.copied"));
      })
      .catch(() => toast.error(t("aiStudio.trends.copyError")));
  };

  const summaryText = [
    item.status && t(`aiStudio.trends.status.${item.status}`, item.status),
    item.topic && topicLabel(t, item.topic),
    item.crossTopic && t("aiStudio.trends.superTrend"),
    item.isCampaign && t("aiStudio.trends.campaign"),
    ...platforms.map((p) => PLATFORM_LABEL[p] ?? p),
    `${t("aiStudio.trends.score")} ${item.score.toFixed(2)}`,
  ]
    .filter(Boolean)
    .join(" · ");

  const format = item.format as ExtendedTrendFormat | null | undefined;
  const hasPostsOrSamples =
    (item.posts?.length ?? 0) > 0 || (item.samplePosts?.length ?? 0) > 0;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl md:max-w-3xl">
        <DialogHeader className="space-y-2.5 text-left">
          <div className="flex items-start justify-between gap-3 pr-6">
            <div className="flex flex-wrap items-center gap-2">
              <DialogTitle className="text-xl font-bold tracking-tight">
                {item.keyword}
              </DialogTitle>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7 shrink-0 rounded-lg"
                aria-label={t("aiStudio.trends.copyKeyword")}
                title={t("aiStudio.trends.copyKeyword")}
                onClick={() => copyText(item.keyword, true)}
              >
                {copiedKeyword ? (
                  <Check className="size-3.5 text-emerald-500" />
                ) : (
                  <Copy className="size-3.5" />
                )}
              </Button>
            </div>
          </div>

          <DialogDescription className="sr-only">
            {summaryText}
          </DialogDescription>

          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {item.status && (
              <span
                className={cn(
                  "rounded-full border px-2.5 py-0.5 font-medium",
                  STATUS_BADGE_STYLE[item.status] ??
                    "border-border bg-muted text-muted-foreground",
                )}
              >
                {t(`aiStudio.trends.status.${item.status}`, item.status)}
              </span>
            )}
            {item.topic && (
              <span className="border-border bg-muted/60 text-foreground/90 rounded-full border px-2.5 py-0.5 font-medium">
                {topicLabel(t, item.topic)}
              </span>
            )}
            {item.crossTopic && (
              <span className="border-brand-orange/30 bg-brand-orange/15 text-brand-orange inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-semibold">
                <Flame className="size-3" />
                {t("aiStudio.trends.superTrend")}
              </span>
            )}
            {sourceEntries.length > 0
              ? sourceEntries.map(([platform, count]) => (
                  <span
                    key={platform}
                    className="border-border bg-background text-muted-foreground inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5"
                  >
                    <span>
                      {PLATFORM_LABEL[platform.toLowerCase()] ??
                        PLATFORM_LABEL[platform] ??
                        platform}
                    </span>
                    <span className="text-foreground font-mono font-medium tabular-nums">
                      · {count}
                    </span>
                  </span>
                ))
              : platforms.map((p) => (
                  <span
                    key={p}
                    className="border-border bg-background text-muted-foreground rounded-full border px-2.5 py-0.5"
                  >
                    {PLATFORM_LABEL[p] ?? p}
                  </span>
                ))}
          </div>
        </DialogHeader>

        {item.isCampaign && (
          <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2.5 text-xs text-amber-900 dark:text-amber-200">
            <Megaphone className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <div className="space-y-0.5">
              <p className="font-semibold">{t("aiStudio.trends.campaign")}</p>
              <p className="leading-relaxed opacity-90">
                {t("aiStudio.trends.campaignHint")}
              </p>
            </div>
          </div>
        )}

        {/* 4 KPI Cards */}
        <section
          aria-label={t("aiStudio.trends.detail.signals")}
          className="grid grid-cols-2 gap-2.5 sm:grid-cols-4"
        >
          {/* 1. Trend Score */}
          <div className="border-border bg-muted/20 flex flex-col justify-between rounded-xl border p-3">
            <span className="text-muted-foreground text-xs font-medium">
              {t("aiStudio.trends.score")}
            </span>
            <div className="mt-1.5 space-y-1">
              <p className="text-brand-orange font-mono text-lg font-bold tabular-nums">
                {Number.isInteger(item.score)
                  ? item.score
                  : item.score.toFixed(2)}
              </p>
              {(totalPosts > 0 || totalEngagement > 0) && (
                <p className="text-muted-foreground font-mono text-[11px] tabular-nums">
                  {totalPosts > 0 &&
                    t("aiStudio.trends.posts.title", {
                      count: totalPosts,
                      keyword: item.keyword,
                    }).split(" ")[0] +
                      " " +
                      (t("aiStudio.trends.posts.title", {
                        count: totalPosts,
                        keyword: "",
                      })
                        .replace(/""|“”/g, "")
                        .trim()
                        .split(" ")[1] ?? "")}
                  {totalPosts > 0 && totalEngagement > 0 ? " · " : ""}
                  {totalEngagement > 0 &&
                    `${compactNumber.format(totalEngagement)} ♥`}
                </p>
              )}
            </div>
          </div>

          {/* 2. Virality */}
          <div className="border-border bg-muted/20 flex flex-col justify-between rounded-xl border p-3">
            <span className="text-muted-foreground text-xs font-medium">
              {t("aiStudio.trends.virality")}
            </span>
            <div className="mt-1.5 space-y-1.5">
              <p className="text-foreground font-mono text-lg font-bold tabular-nums">
                {Math.round(item.virality)}/100
              </p>
              <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
                <div
                  className="bg-brand-orange h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, Math.max(4, Math.round(item.virality)))}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* 3. Public Mood */}
          <div className="border-border bg-muted/20 flex flex-col justify-between rounded-xl border p-3">
            <span className="text-muted-foreground text-xs font-medium">
              {t("aiStudio.trends.moodLabel")}
            </span>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              {item.mood ? (
                <span
                  className={cn(
                    "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold",
                    MOOD_BADGE_STYLE[item.mood] ??
                      "border-border bg-muted text-foreground",
                  )}
                >
                  {t(`aiStudio.trends.mood.${item.mood}`, item.mood)}
                </span>
              ) : (
                <span className="text-muted-foreground text-sm font-medium">
                  —
                </span>
              )}
              {item.emotion && (
                <span className="border-border bg-background text-muted-foreground rounded-md border px-2 py-0.5 text-[11px] font-medium">
                  {t(`aiStudio.trends.emotionName.${item.emotion}`, item.emotion)}
                </span>
              )}
            </div>
          </div>

          {/* 4. Brand Risk */}
          <div className="border-border bg-muted/20 flex flex-col justify-between rounded-xl border p-3">
            <span className="text-muted-foreground text-xs font-medium">
              {t("aiStudio.trends.riskLabel")}
            </span>
            <div className="mt-1.5 flex items-center gap-1.5">
              {item.brandRisk ? (
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 text-xs font-semibold",
                    RISK_STYLE[item.brandRisk]?.badge ??
                      "border-border bg-muted text-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "size-2 rounded-full",
                      RISK_STYLE[item.brandRisk]?.dot ?? "bg-muted-foreground",
                    )}
                  />
                  {t(`aiStudio.trends.risk.${item.brandRisk}`, item.brandRisk)}
                </span>
              ) : (
                <span className="text-muted-foreground text-sm font-medium">
                  —
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Growth Chart (7 cols) & Emotions Breakdown (5 cols) */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
          <section className="border-border bg-card flex flex-col justify-between space-y-2.5 rounded-xl border p-3.5 md:col-span-7">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold">
                {t("aiStudio.trends.detail.growth")}
              </h3>
              {hasDailyFallback && (
                <span className="text-muted-foreground text-[11px]">
                  {t("aiStudio.trends.dailyPosts")}
                </span>
              )}
            </div>

            {hasGrowth || hasDailyFallback ? (
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={hasGrowth ? growth : fallbackData}
                    margin={{ top: 8, right: 8, bottom: 0, left: -8 }}
                  >
                    <defs>
                      <linearGradient
                        id="trendGrowth"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="var(--color-brand-orange)"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="100%"
                          stopColor="var(--color-brand-orange)"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      vertical={false}
                      stroke="var(--color-border)"
                    />
                    <XAxis
                      dataKey="day"
                      tickFormatter={(val) =>
                        hasGrowth
                          ? formatDay(String(val), i18n.language)
                          : String(val)
                      }
                      axisLine={false}
                      tickLine={false}
                      tick={tick}
                      dy={6}
                    />
                    <YAxis
                      width={34}
                      allowDecimals={false}
                      axisLine={false}
                      tickLine={false}
                      tick={tick}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        fontSize: 12,
                        background: "var(--color-card)",
                        border: "1px solid var(--color-border)",
                        color: "var(--color-foreground)",
                      }}
                      labelFormatter={(value) =>
                        hasGrowth
                          ? formatDay(String(value), i18n.language)
                          : String(value)
                      }
                      formatter={(_, __, entry) => {
                        const point = entry.payload as {
                          posts: number;
                          change: number;
                        };
                        return [
                          t("aiStudio.trends.detail.tooltip", {
                            posts: point.posts,
                            change:
                              (point.change > 0 ? "+" : "") + point.change,
                          }),
                          "",
                        ];
                      }}
                      separator=""
                    />
                    <Area
                      type="monotone"
                      dataKey="posts"
                      stroke="var(--color-brand-orange)"
                      strokeWidth={2}
                      fill="url(#trendGrowth)"
                      dot={{ r: 3.5, strokeWidth: 2, fill: "var(--color-card)" }}
                      activeDot={{ r: 5 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="border-border text-muted-foreground flex h-48 items-center justify-center rounded-lg border border-dashed px-4 text-center text-xs">
                {t("aiStudio.trends.detail.noGrowth")}
              </div>
            )}

            <table className="sr-only">
              <caption>{t("aiStudio.trends.detail.growth")}</caption>
              <tbody>
                {growth.map((point) => (
                  <tr key={point.day}>
                    <th scope="row">{point.day}</th>
                    <td>{point.posts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="border-border bg-card flex flex-col justify-between space-y-3 rounded-xl border p-3.5 md:col-span-5">
            <h3 className="text-sm font-semibold">
              {t("aiStudio.trends.detail.emotions")}
            </h3>
            {emotions.length > 0 ? (
              <ul className="my-auto space-y-2.5 text-xs">
                {emotions.map(([label, share]) => {
                  const pct = Math.round(share * 100);
                  const barColor =
                    EMOTION_BAR_COLOR[label.toLowerCase()] ??
                    EMOTION_BAR_COLOR[label] ??
                    "bg-brand-orange";
                  return (
                    <li
                      key={label}
                      className="grid grid-cols-[84px_1fr_42px] items-center gap-2.5"
                    >
                      <span className="text-foreground/90 truncate font-medium">
                        {t(`aiStudio.trends.emotionName.${label}`, label)}
                      </span>
                      <span className="bg-muted h-2 overflow-hidden rounded-full">
                        <span
                          className={cn(
                            "block h-full rounded-full transition-all",
                            barColor,
                          )}
                          style={{ width: `${Math.min(100, Math.max(2, pct))}%` }}
                        />
                      </span>
                      <span className="text-muted-foreground text-right font-mono tabular-nums">
                        {pct}%
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="border-border text-muted-foreground flex h-40 items-center justify-center rounded-lg border border-dashed text-xs">
                —
              </div>
            )}
          </section>
        </div>

        {/* TikTok Video Format Card */}
        {format && (
          <section className="border-border bg-muted/15 space-y-3 rounded-xl border p-4 text-xs">
            <div className="flex items-center justify-between gap-2">
              <h3 className="flex items-center gap-1.5 text-sm font-semibold">
                <Video className="text-brand-orange size-4" />
                {t("aiStudio.trends.format.title")}
              </h3>
              {format.topVideo && (
                <a
                  href={format.topVideo}
                  target="_blank"
                  rel="noreferrer"
                  className="text-brand-orange inline-flex items-center gap-1 text-xs font-medium underline-offset-2 hover:underline"
                >
                  {t("aiStudio.trends.format.topVideo")}
                  <ExternalLink className="size-3.5" />
                </a>
              )}
            </div>

            <div className="flex items-start gap-3.5">
              {format.coverUrl && !coverError && (
                <img
                  src={format.coverUrl}
                  alt={item.keyword}
                  onError={() => setCoverError(true)}
                  className="border-border h-24 w-16 shrink-0 rounded-lg border object-cover"
                />
              )}

              <div className="min-w-0 flex-1 space-y-2.5">
                {format.openingLine && (
                  <div className="space-y-1">
                    <span className="text-muted-foreground text-[11px] font-medium">
                      {t("aiStudio.trends.format.opening")}
                    </span>
                    <blockquote className="border-brand-orange bg-background/80 text-foreground rounded-r-lg border-l-2 px-3 py-2 text-sm italic">
                      “{format.openingLine}”
                    </blockquote>
                  </div>
                )}

                <dl className="grid grid-cols-1 gap-x-4 gap-y-1.5 sm:grid-cols-[auto_1fr]">
                  {format.pattern && (
                    <>
                      <dt className="text-muted-foreground">Pattern</dt>
                      <dd className="min-w-0 font-medium break-words">
                        {format.pattern}
                      </dd>
                    </>
                  )}
                  {format.sound && (
                    <>
                      <dt className="text-muted-foreground flex items-center gap-1">
                        <Music2 className="size-3 shrink-0" />
                        {t("aiStudio.trends.format.sound")}
                      </dt>
                      <dd className="min-w-0 font-medium break-words">
                        {format.sound}
                        {format.soundKind &&
                          ` (${t(`aiStudio.trends.format.kind.${format.soundKind}`)})`}
                      </dd>
                    </>
                  )}
                  {format.sharedSound && (
                    <>
                      <dt className="text-muted-foreground">
                        {t("aiStudio.trends.format.sharedSound")}
                      </dt>
                      <dd className="min-w-0 font-medium break-words">
                        {format.sharedSound}
                      </dd>
                    </>
                  )}
                  {format.medianDurationS != null && (
                    <>
                      <dt className="text-muted-foreground flex items-center gap-1">
                        <Clock className="size-3 shrink-0" />
                        {t("aiStudio.trends.format.length")}
                      </dt>
                      <dd className="font-mono font-medium tabular-nums">
                        {t("aiStudio.trends.format.seconds", {
                          count: Math.round(format.medianDurationS),
                        })}
                      </dd>
                    </>
                  )}
                  {format.hashtagCount != null && (
                    <>
                      <dt className="text-muted-foreground">#</dt>
                      <dd className="font-mono font-medium tabular-nums">
                        {format.hashtagCount}
                      </dd>
                    </>
                  )}
                </dl>
              </div>
            </div>
          </section>
        )}

        {/* Related Keywords / Hashtags */}
        {item.keywords.length > 0 && (
          <section className="flex flex-wrap items-center gap-1.5">
            {item.keywords.map((kw) => {
              const tag = kw.startsWith("#") ? kw : `#${kw}`;
              return (
                <button
                  key={kw}
                  type="button"
                  onClick={() => copyText(tag)}
                  title={t("aiStudio.trends.copyKeyword")}
                  className="border-border bg-muted/50 text-muted-foreground hover:border-brand-orange/40 hover:text-foreground inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors"
                >
                  {tag}
                </button>
              );
            })}
          </section>
        )}

        {/* Source Posts / Sample Posts */}
        {hasPostsOrSamples && (
          <section className="border-border overflow-hidden rounded-xl border">
            <TrendPostList
              keyword={item.keyword}
              posts={item.posts ?? []}
              samplePosts={item.samplePosts}
            />
          </section>
        )}
      </DialogContent>
    </Dialog>
  );
}
