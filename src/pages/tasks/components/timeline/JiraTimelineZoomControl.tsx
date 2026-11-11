import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import type {
  JiraTimelineZoomControlProps,
  TimelineZoom,
  ZoomOption,
} from "./types";

export type { JiraTimelineZoomControlProps, TimelineZoom, ZoomOption };

const ZOOM_OPTIONS: ZoomOption[] = [
  { id: "week", labelKey: "tasks.timelineGrid.zoomWeeks", defaultLabel: "Tuần" },
  { id: "month", labelKey: "tasks.timelineGrid.zoomMonths", defaultLabel: "Tháng" },
  { id: "quarter", labelKey: "tasks.timelineGrid.zoomQuarters", defaultLabel: "Quý" },
];

export function JiraTimelineZoomControl({
  zoom,
  onZoomChange,
  onScrollToToday,
  className,
}: JiraTimelineZoomControlProps) {
  const { t } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const activeOption =
    ZOOM_OPTIONS.find((opt) => opt.id === zoom) ?? ZOOM_OPTIONS[0];
  const activeLabel = t(activeOption.labelKey, {
    defaultValue: activeOption.defaultLabel,
  });

  if (isCollapsed) {
    return (
      <HoverCard openDelay={150} closeDelay={100}>
        <HoverCardTrigger asChild>
          <button
            type="button"
            onClick={() => setIsCollapsed(false)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-card/90 px-2.5 py-1 text-xs font-medium text-brand-orange shadow-2xs select-none backdrop-blur-xs hover:bg-muted/30 cursor-pointer transition-all",
              className,
            )}
            aria-label={t("tasks.timelineGrid.expandZoom", {
              defaultValue: "Mở rộng",
            })}
          >
            <ChevronLeft className="size-3.5" />
            <span>{activeLabel}</span>
          </button>
        </HoverCardTrigger>
        <HoverCardContent
          align="end"
          side="top"
          sideOffset={8}
          collisionPadding={16}
          className="w-auto px-2.5 py-1 text-xs shadow-md"
        >
          <p className="text-muted-foreground whitespace-nowrap">
            {t("tasks.timelineGrid.expandZoom", {
              defaultValue: "Mở rộng",
            })}
          </p>
        </HoverCardContent>
      </HoverCard>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 rounded-lg border border-border/80 bg-card/90 p-0.5 shadow-2xs select-none backdrop-blur-xs",
        className,
      )}
    >
      <button
        type="button"
        onClick={onScrollToToday}
        className="px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 cursor-pointer rounded-md transition-colors"
      >
        {t("tasks.timelineGrid.today", { defaultValue: "Hôm nay" })}
      </button>

      <div className="flex items-center gap-0.5">
        {ZOOM_OPTIONS.map((opt) => {
          const isActive = zoom === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onZoomChange(opt.id)}
              className={
                isActive
                  ? "border border-[#0c66e4]/50 bg-[#ebf2fc] text-[#0c66e4] dark:border-[#2684FF]/80 dark:bg-[#1c2b41] dark:text-[#579DFF] font-medium shadow-2xs px-2.5 py-1 text-xs rounded-md cursor-pointer transition-colors"
                  : "px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 cursor-pointer rounded-md transition-colors"
              }
            >
              {t(opt.labelKey, { defaultValue: opt.defaultLabel })}
            </button>
          );
        })}
      </div>

      <div className="h-3.5 w-px bg-border/80 mx-1" aria-hidden />

      <HoverCard openDelay={150} closeDelay={100}>
        <HoverCardTrigger asChild>
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground hover:bg-muted/30 cursor-pointer rounded-md p-1 transition-colors"
            aria-label={t("tasks.timelineGrid.zoomInfo", {
              defaultValue: "Thông tin thu phóng",
            })}
          >
            <Info className="size-3.5" />
          </button>
        </HoverCardTrigger>
        <HoverCardContent
          align="end"
          side="top"
          sideOffset={8}
          collisionPadding={16}
          className="w-56 p-2 text-xs shadow-md"
        >
          <p className="text-muted-foreground">
            {t("tasks.timelineGrid.zoomInfo", {
              defaultValue:
                "Điều chỉnh phạm vi thu phóng dòng thời gian theo tuần, tháng hoặc quý",
            })}
          </p>
        </HoverCardContent>
      </HoverCard>

      <HoverCard openDelay={150} closeDelay={100}>
        <HoverCardTrigger asChild>
          <button
            type="button"
            onClick={() => setIsCollapsed(true)}
            className="text-muted-foreground hover:text-foreground hover:bg-muted/30 cursor-pointer rounded-md p-1 transition-colors"
            aria-label={t("tasks.timelineGrid.collapseZoom", {
              defaultValue: "Thu nhỏ",
            })}
          >
            <ChevronRight className="size-3.5" />
          </button>
        </HoverCardTrigger>
        <HoverCardContent
          align="end"
          side="top"
          sideOffset={8}
          collisionPadding={16}
          className="w-auto px-2 py-1 text-xs shadow-md"
        >
          <p className="text-muted-foreground whitespace-nowrap">
            {t("tasks.timelineGrid.collapseZoom", {
              defaultValue: "Thu nhỏ",
            })}
          </p>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
}
