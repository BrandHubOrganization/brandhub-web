import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { TREND_LIMITS, useTrendView } from "@/pages/admin/hooks/useTrendView";
import { TREND_PLATFORMS } from "@/pages/admin/types/trendView";

type Filters = ReturnType<typeof useTrendView>;

export function AdminTrendFilters({
  view,
  topics,
}: {
  view: Filters;
  topics: string[];
}) {
  const { t } = useTranslation();
  return (
    <div className="bg-card border-border/80 shadow-2xs grid gap-4 rounded-xl border p-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="space-y-1.5">
        <label htmlFor="trend-source" className="text-xs font-semibold tracking-wide text-foreground">
          {t("admin.trends.dataSource")}
        </label>
        <Select id="trend-source" value={view.source} className="h-9 text-xs"
          onChange={(event) => view.change("source", event.target.value)}>
          <option value="redis">Redis</option>
          <option value="neo4j">Neo4j</option>
        </Select>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="trend-platform" className="text-xs font-semibold tracking-wide text-foreground">
          {t("admin.trends.platform")}
        </label>
        <Select id="trend-platform" value={view.platform ?? ""} className="h-9 text-xs"
          onChange={(event) => view.change("platform", event.target.value)}>
          <option value="">{t("admin.trends.allPlatforms")}</option>
          {TREND_PLATFORMS.map((platform) => (
            <option key={platform} value={platform}>
              {t(`admin.trends.platformNames.${platform}`)}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="trend-period" className="text-xs font-semibold tracking-wide text-foreground">
          {t("admin.trends.period")}
        </label>
        <Select
          id="trend-period"
          value={view.dateMode}
          onChange={(event) => view.change("window", event.target.value)}
          className="h-9 text-xs"
        >
          <option value="today">{t("admin.trends.today")}</option>
          {view.source === "redis" && <option value="6h">{t("admin.trends.live")}</option>}
          <option value="24h">{t("admin.trends.daily")}</option>
          <option value="7d">{t("admin.trends.weekly")}</option>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Input
          type="date"
          className="[color-scheme:light] dark:[color-scheme:dark] h-9 text-xs"
          label={t("admin.trends.date")}
          value={view.date}
          min="0001-01-07"
          max={view.today}
          disabled={view.dateMode === "6h" || view.dateMode === "today"}
          onChange={(event) => view.change("date", event.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="trend-limit" className="text-xs font-semibold tracking-wide text-foreground">
          {t("admin.trends.limit")}
        </label>
        <Select
          id="trend-limit"
          value={view.limit}
          onChange={(event) => view.change("limit", event.target.value)}
          className="h-9 text-xs"
        >
          {TREND_LIMITS.map((limit) => (
            <option key={limit} value={limit}>
              {limit}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-1.5">
        <Input
          type="search"
          label={t("admin.trends.search")}
          aria-label={t("admin.trends.search")}
          placeholder={t("admin.trends.searchPlaceholder", { defaultValue: "Search keywords..." })}
          iconPrefix={<Search className="size-3.5 text-muted-foreground" aria-hidden="true" />}
          value={view.search}
          onChange={(event) => view.change("q", event.target.value)}
          className="h-9 text-xs"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="trend-topic" className="text-xs font-semibold tracking-wide text-foreground">
          {t("admin.trends.topic")}
        </label>
        <Select
          id="trend-topic"
          value={view.topic}
          onChange={(event) => view.change("topic", event.target.value)}
          className="h-9 text-xs"
        >
          <option value="">{t("admin.trends.allTopics")}</option>
          {view.topic && !topics.includes(view.topic) && (
            <option value={view.topic}>{view.topic}</option>
          )}
          {topics.map((topic) => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </Select>
      </div>
      <p className="text-muted-foreground text-xs sm:col-span-2 lg:col-span-4">
        {t(view.source === "redis" ? "admin.trends.redisHint" : "admin.trends.neo4jHint")}
      </p>
    </div>
  );
}
