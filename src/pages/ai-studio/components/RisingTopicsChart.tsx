import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { topicLabel, type TopicStat } from "@/services/trendService";

const MAX_TOPICS = 8;

/** FR 3.7.1 "all topics" view: which fields carry the most trend score right now. Click a bar to filter. */
export function RisingTopicsChart({
  stats,
  selectedTopic = "",
  onSelect,
}: {
  stats: TopicStat[];
  selectedTopic?: string;
  onSelect: (topic: string) => void;
}) {
  const { t } = useTranslation();
  const data = stats.slice(0, MAX_TOPICS);
  const tick = { fill: "var(--color-muted-foreground)", fontSize: 12 };

  return (
    <section className="border-border bg-card rounded-xl border p-4 shadow-xs">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold">
            {t("aiStudio.trends.chart.title")}
          </h2>
          <p className="text-muted-foreground mt-0.5 text-xs">
            {t("aiStudio.trends.chart.hint")}
          </p>
        </div>
        {selectedTopic && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSelect("")}
            className="text-muted-foreground hover:text-foreground h-7 shrink-0 gap-1 px-2 text-xs"
          >
            <X className="size-3" />
            {t("aiStudio.trends.chart.clearFilter")}
          </Button>
        )}
      </div>
      <div style={{ height: data.length * 36 + 16 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 44, bottom: 0, left: 0 }}
          >
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="topic"
              width={124}
              axisLine={false}
              tickLine={false}
              tick={tick}
              tickFormatter={(value) => topicLabel(t, String(value))}
            />
            <Tooltip
              cursor={{ fill: "var(--color-muted)", opacity: 0.5 }}
              contentStyle={{
                borderRadius: 12,
                fontSize: 12,
                background: "var(--color-card)",
                border: "1px solid var(--color-border)",
                color: "var(--color-foreground)",
                fontVariantNumeric: "tabular-nums",
              }}
              formatter={(_, __, item) => {
                const stat = item.payload as TopicStat;
                return [
                  t("aiStudio.trends.chart.tooltip", {
                    score: stat.score.toFixed(1),
                    trends: stat.trends,
                    rising: stat.rising,
                  }),
                  "",
                ];
              }}
              separator=""
            />
            <Bar
              dataKey="score"
              fill="var(--color-brand-orange)"
              radius={[0, 4, 4, 0]}
              barSize={16}
              className="cursor-pointer"
              onClick={(entry) => {
                const clicked = (entry as unknown as TopicStat).topic;
                onSelect(selectedTopic === clicked ? "" : clicked);
              }}
            >
              {data.map((stat) => {
                const isSelected = selectedTopic === stat.topic;
                const isDimmed = Boolean(selectedTopic && !isSelected);
                return (
                  <Cell
                    key={stat.topic}
                    fill="var(--color-brand-orange)"
                    fillOpacity={isDimmed ? 0.32 : 1}
                  />
                );
              })}
              <LabelList
                dataKey="score"
                position="right"
                formatter={(value) => Number(value).toFixed(1)}
                style={{
                  fill: "var(--color-muted-foreground)",
                  fontSize: 11,
                  fontVariantNumeric: "tabular-nums",
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="sr-only">
        <table>
          <caption>{t("aiStudio.trends.chart.title")}</caption>
          <tbody>
            {data.map((stat) => (
              <tr key={stat.topic}>
                <th scope="row">{topicLabel(t, stat.topic)}</th>
                <td>
                  {t("aiStudio.trends.chart.tooltip", {
                    score: stat.score.toFixed(1),
                    trends: stat.trends,
                    rising: stat.rising,
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
