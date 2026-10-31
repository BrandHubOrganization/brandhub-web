import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Info, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface VideoMetricItem {
  id: string;
  labelKey: string;
  defaultLabel: string;
  value: string | number;
  change: number;
  tooltipKey: string;
  defaultTooltip: string;
}

interface PostVideoMetricsCardsProps {
  metrics?: VideoMetricItem[];
  activeMetricId?: string;
  onSelectMetric?: (id: string) => void;
}

export function PostVideoMetricsCards({
  metrics,
  activeMetricId: controlledActiveId,
  onSelectMetric,
}: PostVideoMetricsCardsProps) {
  const { t, i18n } = useTranslation();
  const isVi = i18n.language?.startsWith("vi") ?? true;
  const [internalActiveId, setInternalActiveId] = useState<string>("views");

  const activeId = controlledActiveId ?? internalActiveId;

  const defaultMetrics: VideoMetricItem[] = [
    {
      id: "views",
      labelKey: "publish.dashboard.videoMetrics.views",
      defaultLabel: "Lượt xem",
      value: "252",
      change: 223,
      tooltipKey: "publish.dashboard.videoMetrics.viewsTooltip",
      defaultTooltip:
        "Số lần video hoặc nội dung của bạn được phát ít nhất 1 mili giây hoặc số lần video được xem lặp lại.",
    },
    {
      id: "views3s",
      labelKey: "publish.dashboard.videoMetrics.views3s",
      defaultLabel: "Lượt xem trong tối thiểu 3 giây",
      value: "1",
      change: -80,
      tooltipKey: "publish.dashboard.videoMetrics.views3sTooltip",
      defaultTooltip:
        "Số lần video được phát trong tối thiểu 3 giây hoặc gần hết thời lượng nếu video ngắn hơn 3 giây.",
    },
    {
      id: "views1m",
      labelKey: "publish.dashboard.videoMetrics.views1m",
      defaultLabel: "Lượt xem trong tối thiểu 1 phút",
      value: "0",
      change: 0,
      tooltipKey: "publish.dashboard.videoMetrics.views1mTooltip",
      defaultTooltip:
        "Số lần video được phát trong tối thiểu 1 phút hoặc gần hết thời lượng nếu video ngắn hơn 1 phút.",
    },
    {
      id: "watchTime",
      labelKey: "publish.dashboard.videoMetrics.watchTime",
      defaultLabel: "Thời gian xem",
      value: isVi ? "34 giây" : "34 sec",
      change: -41,
      tooltipKey: "publish.dashboard.videoMetrics.watchTimeTooltip",
      defaultTooltip:
        "Tổng thời gian mọi người đã dành để xem video hoặc thước phim của bạn.",
    },
  ];

  const items = metrics && metrics.length > 0 ? metrics : defaultMetrics;

  const handleCardClick = (id: string) => {
    setInternalActiveId(id);
    onSelectMetric?.(id);
  };

  const renderGrowth = (change: number) => {
    if (change > 0) {
      return (
        <span className="flex items-center gap-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <ArrowUp className="size-3 stroke-[2.5]" />
          <span>{change}%</span>
        </span>
      );
    }
    if (change < 0) {
      return (
        <span className="flex items-center gap-0.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
          <ArrowDown className="size-3 stroke-[2.5]" />
          <span>{change}%</span>
        </span>
      );
    }
    return (
      <span className="flex items-center gap-0.5 text-xs font-semibold text-muted-foreground">
        <Minus className="size-3 stroke-[2.5]" />
        <span>0%</span>
      </span>
    );
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((metric) => {
        const isActive = activeId === metric.id;
        const tooltip = t(metric.tooltipKey, metric.defaultTooltip);

        return (
          <button
            key={metric.id}
            type="button"
            onClick={() => handleCardClick(metric.id)}
            className={cn(
              "bg-card relative flex flex-col justify-between rounded-xl p-4 text-left transition-all duration-150 cursor-pointer border",
              isActive
                ? "border-[#1877F2] ring-1 ring-[#1877F2] shadow-xs"
                : "border-border hover:border-border/80 hover:bg-muted/30",
            )}
          >
            {/* Header: Label and Info Icon */}
            <div className="flex min-h-[2.25rem] items-start justify-between gap-2">
              <span className="text-muted-foreground text-xs font-medium leading-snug line-clamp-2">
                {t(metric.labelKey, metric.defaultLabel)}
              </span>
              <span
                title={tooltip}
                className="text-muted-foreground/60 hover:text-foreground shrink-0 cursor-help transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <Info className="size-3.5" />
              </span>
            </div>

            {/* Metric Value */}
            <div className="mt-3">
              <span className="text-foreground font-mono text-2xl font-bold tracking-tight">
                {metric.value}
              </span>
            </div>

            {/* Growth / Comparison Percentage */}
            <div className="mt-2 flex items-center">
              {renderGrowth(metric.change)}
            </div>
          </button>
        );
      })}
    </div>
  );
}
