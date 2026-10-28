import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { TREND_LIMITS, useTrendView } from "@/pages/admin/hooks/useTrendView";

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
    <div className="bg-card border-border/80 shadow-2xs grid gap-4 rounded-xl border p-4 sm:grid-cols-2 lg:grid-cols-5">
      <div className="space-y-1.5">
        <label htmlFor="trend-period" className="text-xs font-semibold tracking-wide text-foreground">
          {t("admin.trends.period")}
        </label>
        <Select
          id="trend-period"
          value={view.period}
          onChange={(event) => view.change("period", event.target.value)}
          className="h-9 text-xs"
        >
          <option value="6h">{t("admin.trends.live")}</option>
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
          max={view.today}
          disabled={view.period === "6h"}
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
    </div>
  );
}
