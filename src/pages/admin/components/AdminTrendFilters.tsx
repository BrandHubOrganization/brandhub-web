import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-range-picker";
import { SelectMenu } from "@/components/ui/select-menu";
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
    <div className="bg-card border-border/80 grid gap-4 rounded-xl border p-4 shadow-2xs sm:grid-cols-2 lg:grid-cols-4">
      <div className="space-y-1.5">
        <span className="text-foreground block text-xs font-semibold tracking-wide">
          {t("admin.trends.dataSource")}
        </span>
        <SelectMenu
          ariaLabel={t("admin.trends.dataSource")}
          value={view.source}
          className="h-9 w-full text-xs"
          onChange={(val) => view.change("source", val)}
          options={[
            { value: "redis", label: "Redis" },
            { value: "neo4j", label: "Neo4j" },
          ]}
        />
      </div>

      <div className="space-y-1.5">
        <span className="text-foreground block text-xs font-semibold tracking-wide">
          {t("admin.trends.platform")}
        </span>
        <SelectMenu
          ariaLabel={t("admin.trends.platform")}
          value={view.platform ?? ""}
          className="h-9 w-full text-xs"
          onChange={(val) => view.change("platform", val)}
          options={[
            { value: "", label: t("admin.trends.allPlatforms") },
            ...TREND_PLATFORMS.map((platform) => ({
              value: platform,
              label: t(`admin.trends.platformNames.${platform}`),
            })),
          ]}
        />
      </div>

      <div className="space-y-1.5">
        <span className="text-foreground block text-xs font-semibold tracking-wide">
          {t("admin.trends.period")}
        </span>
        <SelectMenu
          ariaLabel={t("admin.trends.period")}
          value={view.dateMode}
          onChange={(val) => view.change("window", val)}
          className="h-9 w-full text-xs"
          options={[
            { value: "today", label: t("admin.trends.today") },
            ...(view.source === "redis"
              ? [{ value: "6h", label: t("admin.trends.live") }]
              : []),
            { value: "24h", label: t("admin.trends.daily") },
            { value: "7d", label: t("admin.trends.weekly") },
          ]}
        />
      </div>

      <div>
        <DatePicker
          label={t("admin.trends.date")}
          value={view.date}
          max={view.today}
          disabled={view.dateMode === "6h" || view.dateMode === "today"}
          onChange={(val) => view.change("date", val)}
        />
      </div>
      <div className="space-y-1.5">
        <span className="text-foreground block text-xs font-semibold tracking-wide">
          {t("admin.trends.limit")}
        </span>
        <SelectMenu
          ariaLabel={t("admin.trends.limit")}
          value={String(view.limit)}
          onChange={(val) => view.change("limit", val)}
          className="h-9 w-full text-xs"
          options={TREND_LIMITS.map((limit) => ({
            value: String(limit),
            label: String(limit),
          }))}
        />
      </div>

      <div className="space-y-1.5">
        <Input
          type="search"
          label={t("admin.trends.search")}
          aria-label={t("admin.trends.search")}
          placeholder={t("admin.trends.searchPlaceholder", {
            defaultValue: "Search keywords...",
          })}
          iconPrefix={
            <Search
              className="text-muted-foreground size-3.5"
              aria-hidden="true"
            />
          }
          value={view.search}
          onChange={(event) => view.change("q", event.target.value)}
          className="h-9 text-xs"
        />
      </div>

      <div className="space-y-1.5">
        <span className="text-foreground block text-xs font-semibold tracking-wide">
          {t("admin.trends.topic")}
        </span>
        <SelectMenu
          ariaLabel={t("admin.trends.topic")}
          value={view.topic}
          onChange={(val) => view.change("topic", val)}
          className="h-9 w-full text-xs"
          options={[
            { value: "", label: t("admin.trends.allTopics") },
            ...(view.topic && !topics.includes(view.topic)
              ? [{ value: view.topic, label: view.topic }]
              : []),
            ...topics.map((topic) => ({
              value: topic,
              label: topic,
            })),
          ]}
        />
      </div>
      <p className="text-muted-foreground text-xs sm:col-span-2 lg:col-span-4">
        {t(
          view.source === "redis"
            ? "admin.trends.redisHint"
            : "admin.trends.neo4jHint",
        )}
      </p>
    </div>
  );
}
