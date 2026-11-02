import { useTranslation } from "react-i18next";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TrendHistory } from "@/pages/workspace-trends/types/trends";

export default function TrendHistoryCharts({
  points,
}: Pick<TrendHistory, "points">) {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      {(["postCount", "score"] as const).map((metric) => (
        <section
          key={metric}
          aria-label={t(`aiStudio.workspaceTrends.${metric}`)}
        >
          <h3 className="mb-3 text-sm font-semibold">
            {t(`aiStudio.workspaceTrends.${metric}`)}
          </h3>
          {points.some((point) => point[metric] !== null) ? (
            <div className="h-48 min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={points}
                  margin={{ left: 0, right: 16, top: 8, bottom: 4 }}
                  accessibilityLayer
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--color-border)"
                  />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => String(value).slice(5)}
                    minTickGap={28}
                    stroke="var(--color-muted-foreground)"
                  />
                  <YAxis
                    width={40}
                    stroke="var(--color-muted-foreground)"
                    allowDecimals={metric === "score"}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-popover)",
                      color: "var(--color-popover-foreground)",
                      borderColor: "var(--color-border)",
                    }}
                  />
                  <Line
                    dataKey={metric}
                    name={t(`aiStudio.workspaceTrends.${metric}`)}
                    stroke="var(--color-brand-orange)"
                    strokeWidth={2}
                    dot={false}
                    connectNulls={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-muted-foreground rounded-lg border p-6 text-sm">
              {t("aiStudio.workspaceTrends.noMetric")}
            </p>
          )}
        </section>
      ))}
      <details className="text-sm">
        <summary className="cursor-pointer">
          {t("aiStudio.workspaceTrends.dataTable")}
        </summary>
        <div className="mt-2 max-h-60 overflow-auto">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="p-2">{t("aiStudio.workspaceTrends.date")}</th>
                <th>{t("aiStudio.workspaceTrends.postCount")}</th>
                <th>{t("aiStudio.workspaceTrends.score")}</th>
              </tr>
            </thead>
            <tbody>
              {points.map((point) => (
                <tr key={point.date} className="border-border border-t">
                  <td className="p-2">{point.date}</td>
                  <td>{point.postCount ?? "—"}</td>
                  <td>{point.score?.toFixed(2) ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
