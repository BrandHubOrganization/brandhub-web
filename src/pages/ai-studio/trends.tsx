import { useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  Copy,
  Flame,
  Newspaper,
  Radar,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SelectMenu } from "@/components/ui/select-menu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";
import {
  fetchTrends,
  topicLabel,
  type TrendItem,
  type TrendPeriod,
} from "@/services/trendService";
import { AiStudioErrorBanner } from "./components/AiStudioErrorBanner";
import { RisingTopicsChart } from "./components/RisingTopicsChart";
import { TrendDetailDialog } from "./components/TrendDetailDialog";
import { TrendPostList } from "./components/TrendPostList";

const PERIODS: TrendPeriod[] = ["6h", "24h", "7d"];
const STATUS_STYLE: Record<string, string> = {
  new: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  rising: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  peaking: "bg-brand-orange/10 text-brand-orange",
  declining: "bg-muted text-muted-foreground",
};
const RISK_STYLE: Record<string, string> = {
  low: "bg-emerald-500",
  medium: "bg-amber-500",
  high: "bg-red-500",
};

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
  const { t, i18n } = useTranslation();
  const [period, setPeriod] = useState<TrendPeriod>("24h");
  const [topic, setTopic] = useState("");
  const [selected, setSelected] = useState<TrendItem | null>(null);
  const trends = useQuery({
    queryKey: ["ai-trends", period, topic],
    queryFn: () => fetchTrends(period, topic),
    staleTime: 60_000,
  });
  const items = trends.data?.items ?? [];
  const topicStats = trends.data?.topicStats ?? [];
  const maxScore = Math.max(0, ...items.map((i) => i.score)) || 1;
  const crawl = trends.data?.crawl;
  const schedule = crawl?.cron
    ? t("aiStudio.trends.crawl.cron", { cron: crawl.cron })
    : crawl?.intervalMinutes
      ? crawl.intervalMinutes % 60 === 0
        ? t("aiStudio.trends.crawl.everyHours", {
            count: crawl.intervalMinutes / 60,
          })
        : t("aiStudio.trends.crawl.everyMinutes", {
            count: crawl.intervalMinutes,
          })
      : null;

  return (
    <PageWrapper
      title={t("aiStudio.trends.title")}
      description={t("aiStudio.trends.description")}
    >
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div
          role="group"
          aria-label={t("aiStudio.trends.periodLabel")}
          className="bg-muted inline-flex rounded-lg p-1"
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
        <SelectMenu
          className="h-9 w-52 text-sm"
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
        <Button
          variant="outline"
          size="sm"
          className="ml-auto gap-1.5"
          disabled={trends.isFetching}
          onClick={() => void trends.refetch()}
        >
          <RefreshCw
            className={cn("size-3.5", trends.isFetching && "animate-spin")}
          />
          {t("aiStudio.trends.refresh")}
        </Button>
      </div>

      {crawl && (
        <p className="text-muted-foreground -mt-2 mb-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
          <Radar className="size-3.5" />
          <span>
            {t("aiStudio.trends.crawl.sources", {
              sources: crawl.sources.join(", ") || "—",
              count: crawl.pageCount,
            })}
          </span>
          {schedule && <span>· {schedule}</span>}
          {crawl.nextRunAt && (
            <span>
              ·{" "}
              {t("aiStudio.trends.crawl.next", {
                date: new Intl.DateTimeFormat(i18n.language, {
                  dateStyle: "short",
                  timeStyle: "short",
                }).format(new Date(crawl.nextRunAt)),
              })}
            </span>
          )}
        </p>
      )}

      {trends.isPending && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-56 rounded-xl" />
          ))}
        </div>
      )}

      {trends.isError && (
        <AiStudioErrorBanner
          messageKey="aiStudio.trends.loadError"
          retryKey="aiStudio.trends.retry"
        />
      )}

      {!topic && topicStats.length > 0 && (
        <RisingTopicsChart stats={topicStats} onSelect={setTopic} />
      )}

      {trends.isSuccess && items.length === 0 && (
        <div className="border-border flex flex-col items-center gap-2 rounded-xl border border-dashed px-6 py-14 text-center">
          <TrendingUp className="text-muted-foreground size-8" />
          <p className="text-sm font-medium">{t("aiStudio.trends.empty")}</p>
          <p className="text-muted-foreground max-w-md text-xs">
            {t("aiStudio.trends.emptyHint")}
          </p>
        </div>
      )}

      {items.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <TrendCard
              key={item.id}
              item={item}
              maxScore={maxScore}
              onOpen={() => setSelected(item)}
            />
          ))}
        </div>
      )}

      {selected && (
        <TrendDetailDialog item={selected} onClose={() => setSelected(null)} />
      )}
    </PageWrapper>
  );
}

function TrendCard({
  item,
  maxScore,
  onOpen,
}: {
  item: TrendItem;
  maxScore: number;
  onOpen: () => void;
}) {
  const { t } = useTranslation();
  const maxCount = Math.max(1, ...item.dailyCounts);
  const posts = item.posts ?? [];
  const copy = () =>
    navigator.clipboard
      .writeText(item.keyword)
      .then(() => toast.success(t("aiStudio.trends.copied")))
      .catch(() => toast.error(t("aiStudio.trends.copyError")));

  const card = (
    <article
      tabIndex={0}
      aria-label={t("aiStudio.trends.detail.open", { keyword: item.keyword })}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (
          e.target === e.currentTarget &&
          (e.key === "Enter" || e.key === " ")
        ) {
          e.preventDefault();
          onOpen();
        }
      }}
      className="border-border bg-card hover:border-brand-orange/40 focus-visible:ring-ring flex h-full cursor-pointer flex-col gap-3 rounded-xl border p-4 shadow-xs transition-colors focus-visible:ring-2 focus-visible:outline-none"
    >
      <header className="flex items-start gap-3">
        <span className="text-muted-foreground font-mono text-xs tabular-nums">
          #{item.rank}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-foreground truncate text-base font-semibold">
            {item.keyword}
          </h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs">
            {item.status && (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 font-medium",
                  STATUS_STYLE[item.status],
                )}
              >
                {t(`aiStudio.trends.status.${item.status}`)}
              </span>
            )}
            {item.topic && (
              <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5">
                {topicLabel(t, item.topic)}
              </span>
            )}
            {item.crossTopic && (
              <span className="bg-brand-orange inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium text-white">
                <Flame className="size-3" />
                {t("aiStudio.trends.superTrend")}
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">
            {t("aiStudio.trends.score")}
          </span>
          <span className="font-medium tabular-nums">
            {item.score.toFixed(2)}
          </span>
        </div>
        <div className="bg-muted h-1.5 overflow-hidden rounded-full">
          <div
            className="bg-brand-orange h-full rounded-full"
            style={{ width: `${Math.max(4, (item.score / maxScore) * 100)}%` }}
          />
        </div>
      </div>

      <div className="flex items-end justify-between gap-3">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
          <dt className="text-muted-foreground">
            {t("aiStudio.trends.virality")}
          </dt>
          <dd className="font-medium tabular-nums">
            {Math.round(item.virality)}/100
          </dd>
          {item.brandRisk && (
            <>
              <dt className="text-muted-foreground">
                {t("aiStudio.trends.riskLabel")}
              </dt>
              <dd className="flex items-center gap-1.5 font-medium">
                <span
                  className={cn(
                    "size-2 rounded-full",
                    RISK_STYLE[item.brandRisk],
                  )}
                />
                {t(`aiStudio.trends.risk.${item.brandRisk}`)}
              </dd>
            </>
          )}
          {item.mood && (
            <>
              <dt className="text-muted-foreground">
                {t("aiStudio.trends.moodLabel")}
              </dt>
              <dd className="font-medium">
                {t(`aiStudio.trends.mood.${item.mood}`, item.mood)}
              </dd>
            </>
          )}
        </dl>
        {item.dailyCounts.length > 1 && (
          <div
            className="flex h-8 items-end gap-0.5"
            title={t("aiStudio.trends.dailyPosts")}
            aria-label={t("aiStudio.trends.dailyPosts")}
          >
            {item.dailyCounts.slice(-10).map((count, i) => (
              <span
                key={i}
                className="bg-brand-orange/60 w-1.5 rounded-sm"
                style={{ height: `${Math.max(8, (count / maxCount) * 100)}%` }}
              />
            ))}
          </div>
        )}
      </div>

      {item.keywords.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {item.keywords.slice(0, 6).map((kw) => (
            <span
              key={kw}
              className="bg-muted text-muted-foreground text-3xs rounded-full px-2 py-0.5"
            >
              {kw}
            </span>
          ))}
        </div>
      )}

      {item.samplePosts[0] && (
        <p className="text-muted-foreground border-border line-clamp-2 border-l-2 pl-2 text-xs italic">
          {item.samplePosts[0]}
        </p>
      )}

      {posts.length > 0 && (
        <p className="text-muted-foreground mt-auto flex items-center gap-1.5 text-xs">
          <Newspaper className="size-3.5" />
          {t("aiStudio.trends.posts.hint", { count: posts.length })}
        </p>
      )}

      <Button
        variant="outline"
        size="sm"
        className={cn("gap-1.5 text-xs", !posts.length && "mt-auto")}
        onClick={(e) => {
          e.stopPropagation();
          copy();
        }}
      >
        <Copy className="size-3.5" />
        {t("aiStudio.trends.copyKeyword")}
      </Button>
    </article>
  );
  if (!posts.length) return card;
  return (
    <HoverCard openDelay={250} closeDelay={150}>
      <HoverCardTrigger asChild>{card}</HoverCardTrigger>
      <HoverCardContent
        side="right"
        align="start"
        collisionPadding={16}
        className="w-96 p-0"
      >
        <TrendPostList keyword={item.keyword} posts={posts} />
      </HoverCardContent>
    </HoverCard>
  );
}

export default TrendsPage;
