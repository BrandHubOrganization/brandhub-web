import { useMemo, useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  Flame,
  Megaphone,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { SelectMenu } from "@/components/ui/select-menu";
import { cn } from "@/lib/utils";
import {
  fetchTrends,
  PLATFORM_LABEL,
  topicLabel,
  trendPlatforms,
  type TrendItem,
  type TrendPeriod,
} from "@/services/trendService";
import { AiStudioErrorBanner } from "./components/AiStudioErrorBanner";
import { TrendDetailDialog } from "./components/TrendDetailDialog";
import { TrendSparkline } from "./components/TrendSparkline";
import { TrendRankBadge } from "@/pages/workspace-trends/components/TrendRankBadge";

const PERIODS: TrendPeriod[] = ["24h", "7d"];

/** FR 3.7.1: read-only dashboard of the keywords the trend pipeline currently ranks highest. */
export function TrendsPage() {
  // The app has no root QueryClientProvider; pages own theirs (same as /admin).
  const [client] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: false } } }),
  );
  return (
    <QueryClientProvider client={client}>
      <TrendsDashboard />
    </QueryClientProvider>
  );
}

function TrendsDashboard() {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<TrendPeriod>("24h");
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selected, setSelected] = useState<TrendItem | null>(null);

  const trends = useQuery({
    queryKey: ["ai-trends", period, topic, platform],
    queryFn: () => fetchTrends(period, topic, platform),
    staleTime: 60_000,
  });

  const items = useMemo(
    () =>
      [...(trends.data?.items ?? [])].sort(
        (a, b) => a.rank - b.rank || b.score - a.score,
      ),
    [trends.data?.items],
  );

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return items.filter((item) => {
      if (statusFilter) {
        const s = (item.status ?? "").toLowerCase();
        if (statusFilter === "new" && s !== "new" && s !== "emerging") {
          return false;
        }
        if (statusFilter === "peaking" && s !== "peaking" && s !== "peak") {
          return false;
        }
        if (
          statusFilter !== "new" &&
          statusFilter !== "peaking" &&
          s !== statusFilter
        ) {
          return false;
        }
      }
      if (q) {
        const matchKeyword = item.keyword.toLowerCase().includes(q);
        const matchTopic = item.topic
          ? item.topic.toLowerCase().includes(q) ||
            topicLabel(t, item.topic).toLowerCase().includes(q)
          : false;
        const matchTags = (item.keywords ?? []).some((kw) =>
          kw.toLowerCase().includes(q),
        );
        if (!matchKeyword && !matchTopic && !matchTags) return false;
      }
      return true;
    });
  }, [items, searchQuery, statusFilter, t]);

  const hasActiveFilters = Boolean(
    topic || platform || statusFilter || searchQuery.trim(),
  );

  const resetFilters = () => {
    setTopic("");
    setPlatform("");
    setStatusFilter("");
    setSearchQuery("");
  };

  return (
    <PageWrapper
      compact
      title={t("aiStudio.trends.title")}
      description={t("aiStudio.trends.description")}
    >
      {/* Filter Toolbar */}
      <div className="border-border/70 bg-card/60 mb-5 flex flex-wrap items-center gap-2.5 rounded-xl border p-2.5 shadow-2xs">
        <div
          role="group"
          aria-label={t("aiStudio.trends.periodLabel")}
          className="bg-muted inline-flex shrink-0 rounded-lg p-1"
        >
          {PERIODS.map((p) => (
            <button
              key={p}
              type="button"
              aria-pressed={period === p}
              onClick={() => setPeriod(p)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                period === p
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t(`aiStudio.trends.period.${p}`)}
            </button>
          ))}
        </div>

        <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("aiStudio.trends.searchPlaceholder")}
            aria-label={t("aiStudio.trends.searchPlaceholder")}
            iconPrefix={<Search className="size-4" />}
            className={cn("h-9 text-sm", searchQuery && "pr-8")}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              aria-label={t("aiStudio.trends.clearSearch")}
              className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2.5 -translate-y-1/2 rounded p-0.5 transition-colors"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <SelectMenu
          className="h-9 w-48 text-sm"
          ariaLabel={t("aiStudio.trends.topicFilter")}
          value={topic}
          onChange={setTopic}
          options={[
            { value: "", label: t("aiStudio.trends.allTopics") },
            ...(trends.data?.topics ?? []).map((name) => ({
              value: name,
              label: topicLabel(t, name),
            })),
          ]}
        />

        <SelectMenu
          className="h-9 w-40 text-sm"
          ariaLabel={t("aiStudio.trends.platformFilter")}
          value={platform}
          onChange={setPlatform}
          options={[
            { value: "", label: t("aiStudio.trends.allPlatforms") },
            // Every crawled platform stays selectable, even on a day it has no trend.
            ...[
              ...new Set([
                ...Object.keys(PLATFORM_LABEL),
                ...(trends.data?.platforms ?? []),
              ]),
            ].map((name) => ({
              value: name,
              label: PLATFORM_LABEL[name] ?? name,
            })),
          ]}
        />

        <SelectMenu
          className="h-9 w-40 text-sm"
          ariaLabel={t("aiStudio.trends.statusFilter")}
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: "", label: t("aiStudio.trends.allStatuses") },
            { value: "new", label: t("aiStudio.trends.status.new") },
            { value: "rising", label: t("aiStudio.trends.status.rising") },
            { value: "peaking", label: t("aiStudio.trends.status.peaking") },
          ]}
        />

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="text-muted-foreground hover:text-foreground h-9 gap-1.5 text-xs"
          >
            <RotateCcw className="size-3.5" />
            {t("aiStudio.trends.resetFilters")}
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          className="ml-auto h-9 gap-1.5"
          disabled={trends.isFetching}
          onClick={() => void trends.refetch()}
        >
          <RefreshCw
            className={cn("size-3.5", trends.isFetching && "animate-spin")}
          />
          {t("aiStudio.trends.refresh")}
        </Button>
      </div>

      {/* Loading Skeleton (Full-width single-column list) */}
      {trends.isPending && (
        <div className="space-y-2.5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton
              key={i}
              className="h-18 rounded-xl motion-reduce:animate-none"
            />
          ))}
        </div>
      )}

      {/* Error State */}
      {trends.isError && (
        <AiStudioErrorBanner
          messageKey="aiStudio.trends.loadError"
          retryKey="aiStudio.trends.retry"
          onRetry={() => void trends.refetch()}
        />
      )}

      {/* Full-Width Trend List */}
      {trends.isSuccess && (
        <div className="space-y-2.5">
          {filteredItems.length === 0 ? (
            <div className="border-border flex flex-col items-center gap-2.5 rounded-xl border border-dashed px-6 py-14 text-center">
              <TrendingUp className="text-muted-foreground size-8" />
              <p className="text-sm font-medium">
                {items.length > 0 && hasActiveFilters
                  ? t("aiStudio.trends.noFilterResults")
                  : t("aiStudio.trends.empty")}
              </p>
              <p className="text-muted-foreground max-w-md text-xs">
                {items.length > 0 && hasActiveFilters
                  ? t("aiStudio.trends.noFilterResultsHint")
                  : t("aiStudio.trends.emptyHint")}
              </p>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetFilters}
                  className="mt-1 gap-1.5 text-xs"
                >
                  <RotateCcw className="size-3.5" />
                  {t("aiStudio.trends.resetFilters")}
                </Button>
              )}
            </div>
          ) : (
            filteredItems.map((item) => (
              <TrendCard
                key={item.id}
                item={item}
                onOpen={() => setSelected(item)}
              />
            ))
          )}
        </div>
      )}

      {selected && (
        <TrendDetailDialog item={selected} onClose={() => setSelected(null)} />
      )}
    </PageWrapper>
  );
}

const STATUS_BADGE_STYLE: Record<string, string> = {
  new: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20",
  emerging: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20",
  rising:
    "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
  peaking: "bg-brand-orange/10 text-brand-orange border-brand-orange/20",
  peak: "bg-brand-orange/10 text-brand-orange border-brand-orange/20",
  declining: "bg-muted text-muted-foreground border-border",
};

function TrendCard({
  item,
  onOpen,
}: {
  item: TrendItem;
  onOpen: () => void;
}) {
  const { t, i18n } = useTranslation();

  const sourceEntries = useMemo(
    () => Object.entries(item.sources ?? {}),
    [item.sources],
  );
  const platforms = useMemo(() => trendPlatforms(item), [item]);
  const sampleCount =
    (item.posts?.length ?? 0) || (item.samplePosts?.length ?? 0);
  const totalEngagement = useMemo(
    () =>
      (item.posts ?? []).reduce(
        (sum, p) => sum + (p.likes ?? 0) + (p.comments ?? 0) + (p.shares ?? 0),
        0,
      ),
    [item.posts],
  );
  const compactFormatter = useMemo(
    () =>
      new Intl.NumberFormat(i18n.language || "vi-VN", {
        notation: "compact",
      }),
    [i18n.language],
  );

  const subKeywords = useMemo(() => {
    const main = item.keyword.toLowerCase().trim();
    return (item.keywords ?? []).filter(
      (kw) => kw.toLowerCase().trim() !== main,
    );
  }, [item.keyword, item.keywords]);

  return (
    <article
      onClick={onOpen}
      className="border-border bg-card hover:border-brand-orange/40 group flex cursor-pointer flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border px-4 py-3.5 transition-colors shadow-2xs hover:shadow-xs"
    >
      {/* Left side: Trend info, status badges & rich metadata */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Row 1: Rank + Keyword + Status badges */}
        <div className="flex flex-wrap items-center gap-2">
          <TrendRankBadge rank={item.rank} />

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpen();
            }}
            className="focus-visible:ring-ring block max-w-full rounded text-left focus-visible:ring-2 focus-visible:outline-none"
            aria-label={t("aiStudio.trends.detail.open", {
              keyword: item.keyword,
            })}
          >
            <h3 className="text-foreground group-hover:text-brand-orange truncate text-base font-semibold tracking-tight transition-colors">
              {item.keyword}
            </h3>
          </button>

          {item.status && (
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 text-[11px] font-medium leading-none",
                STATUS_BADGE_STYLE[item.status] ??
                  "border-border bg-muted text-muted-foreground",
              )}
            >
              {t(`aiStudio.trends.status.${item.status}`, item.status)}
            </span>
          )}

          {item.crossTopic && (
            <span className="inline-flex items-center gap-1 rounded-full border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 text-[11px] font-semibold text-purple-700 dark:text-purple-300 leading-none">
              <Sparkles className="size-3 shrink-0" />
              {t("aiStudio.trends.superTrend")}
            </span>
          )}

          {item.isCampaign && (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-300 leading-none">
              <Megaphone className="size-3 shrink-0" />
              {t("aiStudio.trends.campaign")}
            </span>
          )}

          {(item.brandRisk === "high" || item.brandRisk === "medium") && (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium leading-none",
                item.brandRisk === "high"
                  ? "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300"
                  : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
              )}
            >
              <ShieldAlert className="size-3 shrink-0" />
              {t("aiStudio.trends.riskLabel")}:{" "}
              {t(`aiStudio.trends.risk.${item.brandRisk}`)}
            </span>
          )}
        </div>

        {/* Row 2: Topic + Platforms + Virality + Engagement + Sample posts + Sub-keywords */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {item.topic && (
            <span className="border-border/70 bg-muted/70 text-foreground/80 inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium">
              {topicLabel(t, item.topic)}
            </span>
          )}

          {sourceEntries.length > 0
            ? sourceEntries.map(([plat, count]) => (
                <span
                  key={plat}
                  className="border-border/60 bg-muted/40 text-muted-foreground inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px]"
                >
                  <span>
                    {PLATFORM_LABEL[plat.toLowerCase()] ??
                      PLATFORM_LABEL[plat] ??
                      plat}
                  </span>
                  <span className="text-foreground font-mono font-medium tabular-nums">
                    · {count}
                  </span>
                </span>
              ))
            : platforms.map((plat) => (
                <span
                  key={plat}
                  className="border-border/60 bg-muted/40 text-muted-foreground inline-flex items-center rounded-md border px-1.5 py-0.5 text-[11px]"
                >
                  {PLATFORM_LABEL[plat] ?? plat}
                </span>
              ))}

          {item.virality > 0 && (
            <span
              className="inline-flex items-center gap-1 text-[11px] text-muted-foreground"
              title={t("aiStudio.trends.virality")}
            >
              <Flame className="size-3 text-orange-500 shrink-0" />
              <span>{t("aiStudio.trends.virality")}:</span>
              <span className="text-foreground font-mono font-medium tabular-nums">
                {Math.round(item.virality)}/100
              </span>
            </span>
          )}

          {totalEngagement > 0 && (
            <span
              className="inline-flex items-center gap-1 text-[11px] text-muted-foreground"
              title={t("aiStudio.trends.engagement")}
            >
              <span>{t("aiStudio.trends.engagement")}:</span>
              <span className="text-foreground font-mono font-medium tabular-nums">
                {compactFormatter.format(totalEngagement)}
              </span>
            </span>
          )}

          {sampleCount > 0 && (
            <span className="border-border/50 bg-muted/30 text-muted-foreground inline-flex items-center rounded-md border px-1.5 py-0.5 text-[11px]">
              {sampleCount} bài viết mẫu
            </span>
          )}

          {subKeywords.length > 0 && (
            <div className="flex items-center gap-1.5">
              {subKeywords.slice(0, 3).map((kw) => (
                <span
                  key={kw}
                  className="text-muted-foreground/75 hover:text-foreground text-[11px] transition-colors"
                >
                  #{kw}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right side: Score + Sparkline placed at the FAR RIGHT */}
      <div className="flex shrink-0 items-center justify-between sm:justify-end gap-4 sm:gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-border/60">
        {/* Trend Score */}
        <div className="flex min-w-[68px] flex-col items-start sm:items-end justify-center text-left sm:text-right shrink-0">
          <p className="text-foreground font-mono text-xl font-bold leading-none tabular-nums">
            {item.score.toFixed(2)}
          </p>
          <p className="text-muted-foreground mt-1 text-[11px]">
            {t("aiStudio.trends.score")}
          </p>
        </div>

        {/* Growth Sparkline (posts per day) at the far right */}
        <div className="w-40 sm:w-52 lg:w-56 shrink-0">
          <TrendSparkline item={item} />
        </div>
      </div>
    </article>
  );
}

export default TrendsPage;
