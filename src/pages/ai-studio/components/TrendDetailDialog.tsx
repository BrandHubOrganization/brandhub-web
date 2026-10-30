import { useTranslation } from "react-i18next";
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
import {
  PLATFORM_LABEL,
  topicLabel,
  trendPlatforms,
  type TrendItem,
} from "@/services/trendService";
import { TrendPostList } from "./TrendPostList";

/** FR 3.7.1 trend detail (as in the trend-pipeline demo): growth line, emotion breakdown, keywords, posts. */
export function TrendDetailDialog({
  item,
  onClose,
}: {
  item: TrendItem;
  onClose: () => void;
}) {
  const { t, i18n } = useTranslation();
  const growth = item.growth ?? [];
  const day = (iso: string) =>
    new Intl.DateTimeFormat(i18n.language, {
      day: "2-digit",
      month: "2-digit",
    }).format(new Date(`${iso}T00:00:00`));
  const emotions = Object.entries(item.emotionDist ?? {}).sort(
    (a, b) => b[1] - a[1],
  );
  const tick = { fill: "var(--color-muted-foreground)", fontSize: 12 };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl">{item.keyword}</DialogTitle>
          <DialogDescription>
            {[
              item.status && t(`aiStudio.trends.status.${item.status}`),
              item.topic && topicLabel(t, item.topic),
              item.crossTopic && t("aiStudio.trends.superTrend"),
              item.isCampaign && t("aiStudio.trends.campaign"),
              ...trendPlatforms(item).map((p) => PLATFORM_LABEL[p] ?? p),
              `${t("aiStudio.trends.score")} ${item.score.toFixed(2)}`,
            ]
              .filter(Boolean)
              .join(" · ")}
          </DialogDescription>
        </DialogHeader>

        <section className="space-y-2">
          <h3 className="text-sm font-semibold">
            {t("aiStudio.trends.detail.growth")}
          </h3>
          {growth.length > 1 ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={growth}
                  margin={{ top: 8, right: 8, bottom: 0, left: -16 }}
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
                    tickFormatter={day}
                    axisLine={false}
                    tickLine={false}
                    tick={tick}
                    dy={6}
                  />
                  <YAxis
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
                    labelFormatter={(value) => day(String(value))}
                    formatter={(_, __, entry) => {
                      const point = entry.payload as {
                        posts: number;
                        change: number;
                      };
                      return [
                        t("aiStudio.trends.detail.tooltip", {
                          posts: point.posts,
                          change: (point.change > 0 ? "+" : "") + point.change,
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
                    dot={{ r: 4, strokeWidth: 2, fill: "var(--color-card)" }}
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-muted-foreground text-xs">
              {t("aiStudio.trends.detail.noGrowth")}
            </p>
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

        <div className="grid gap-6 sm:grid-cols-2">
          <section className="space-y-2">
            <h3 className="text-sm font-semibold">
              {t("aiStudio.trends.detail.emotions")}
            </h3>
            {emotions.length ? (
              <ul className="space-y-1.5 text-xs">
                {emotions.map(([label, share]) => (
                  <li
                    key={label}
                    className="grid grid-cols-[88px_1fr_40px] items-center gap-2"
                  >
                    <span>
                      {t(`aiStudio.trends.emotionName.${label}`, label)}
                    </span>
                    <span className="bg-muted h-1.5 overflow-hidden rounded-full">
                      <span
                        className="bg-brand-orange block h-full rounded-full"
                        style={{ width: `${share * 100}%` }}
                      />
                    </span>
                    <span className="text-right tabular-nums">
                      {Math.round(share * 100)}%
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-xs">—</p>
            )}
          </section>
          <section className="space-y-2 text-xs">
            <h3 className="text-sm font-semibold">
              {t("aiStudio.trends.detail.signals")}
            </h3>
            <dl className="grid grid-cols-2 gap-y-1.5">
              <dt className="text-muted-foreground">
                {t("aiStudio.trends.virality")}
              </dt>
              <dd className="font-medium tabular-nums">
                {Math.round(item.virality)}/100
              </dd>
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
              {item.brandRisk && (
                <>
                  <dt className="text-muted-foreground">
                    {t("aiStudio.trends.riskLabel")}
                  </dt>
                  <dd className="font-medium">
                    {t(`aiStudio.trends.risk.${item.brandRisk}`)}
                  </dd>
                </>
              )}
            </dl>
            {item.keywords.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {item.keywords.map((kw) => (
                  <span
                    key={kw}
                    className="bg-muted text-muted-foreground rounded-full px-2 py-0.5"
                  >
                    {kw.startsWith("#") ? kw : `#${kw}`}
                  </span>
                ))}
              </div>
            )}
          </section>
        </div>

        {item.isCampaign && (
          <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-800 dark:text-amber-200">
            {t("aiStudio.trends.campaignHint")}
          </p>
        )}

        {item.format && (
          <section className="space-y-2 text-xs">
            <h3 className="text-sm font-semibold">
              {t("aiStudio.trends.format.title")}
            </h3>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
              {item.format.sound && (
                <>
                  <dt className="text-muted-foreground">
                    {t("aiStudio.trends.format.sound")}
                  </dt>
                  <dd className="min-w-0 font-medium break-words">
                    {item.format.sound}
                    {item.format.soundKind &&
                      ` (${t(`aiStudio.trends.format.kind.${item.format.soundKind}`)})`}
                  </dd>
                </>
              )}
              {item.format.sharedSound && (
                <>
                  <dt className="text-muted-foreground">
                    {t("aiStudio.trends.format.sharedSound")}
                  </dt>
                  <dd className="min-w-0 font-medium break-words">
                    {item.format.sharedSound}
                  </dd>
                </>
              )}
              {item.format.medianDurationS != null && (
                <>
                  <dt className="text-muted-foreground">
                    {t("aiStudio.trends.format.length")}
                  </dt>
                  <dd className="font-medium tabular-nums">
                    {t("aiStudio.trends.format.seconds", {
                      count: Math.round(item.format.medianDurationS),
                    })}
                  </dd>
                </>
              )}
              {item.format.openingLine && (
                <>
                  <dt className="text-muted-foreground">
                    {t("aiStudio.trends.format.opening")}
                  </dt>
                  <dd className="min-w-0 break-words italic">
                    “{item.format.openingLine}”
                  </dd>
                </>
              )}
            </dl>
            {item.format.topVideo && (
              <a
                href={item.format.topVideo}
                target="_blank"
                rel="noreferrer"
                className="text-brand-orange inline-block font-medium underline-offset-2 hover:underline"
              >
                {t("aiStudio.trends.format.topVideo")}
              </a>
            )}
          </section>
        )}

        {(item.posts?.length ?? 0) > 0 && (
          <section className="border-border overflow-hidden rounded-xl border">
            <TrendPostList keyword={item.keyword} posts={item.posts!} />
          </section>
        )}
      </DialogContent>
    </Dialog>
  );
}
