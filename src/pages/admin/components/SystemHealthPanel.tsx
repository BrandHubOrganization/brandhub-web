import { useTranslation } from "react-i18next";
import type { SystemHealthMetric } from "../types/admin";

const STATUS_DOT: Record<SystemHealthMetric["status"], string> = {
  UP: "bg-emerald-500",
  DEGRADED: "bg-amber-500",
  DOWN: "bg-rose-500",
};

const STATUS_TEXT: Record<SystemHealthMetric["status"], string> = {
  UP: "text-emerald-600 dark:text-emerald-400",
  DEGRADED: "text-amber-600 dark:text-amber-400",
  DOWN: "text-rose-600 dark:text-rose-400",
};

export interface SystemHealthPanelProps {
  metrics: SystemHealthMetric[];
}

export function SystemHealthPanel({ metrics }: SystemHealthPanelProps) {
  const { t } = useTranslation();

  return (
    <div className="grid w-full min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {metrics.map((metric) => (
        <div
          key={metric.service}
          className="border-border bg-card flex h-full flex-col justify-between gap-4 rounded-xl border p-5"
        >
          <div className="flex items-start justify-between gap-2">
            <span className="text-foreground min-w-0 text-sm leading-snug font-semibold">
              {metric.service}
            </span>
            <span
              className={`flex shrink-0 items-center gap-1.5 text-xs font-medium whitespace-nowrap ${STATUS_TEXT[metric.status]}`}
            >
              <span
                className={`size-2 shrink-0 rounded-full ${STATUS_DOT[metric.status]}`}
              />
              {t(`dashboard.admin.health.statuses.${metric.status}`)}
            </span>
          </div>
          <div className="space-y-2.5">
            <div className="text-muted-foreground flex items-center justify-between gap-2 text-xs">
              <span>{t("dashboard.admin.health.latency")}</span>
              <span className="text-foreground font-medium tabular-nums">
                {metric.latencyMs} ms
              </span>
            </div>
            <div className="text-muted-foreground flex items-center justify-between gap-2 text-xs">
              <span>{t("dashboard.admin.health.uptime")}</span>
              <span className="text-foreground font-medium tabular-nums">
                {metric.uptime}%
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default SystemHealthPanel;
