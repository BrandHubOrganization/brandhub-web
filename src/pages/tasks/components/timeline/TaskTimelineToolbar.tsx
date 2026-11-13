import { useTranslation } from "react-i18next";
import { ChevronDown, Layers, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlideSelect, RubberSegment } from "@/components/micro";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { TaskTimelineToolbarProps, TimelineGroupBy } from "./types";

export type { TaskTimelineToolbarProps };

const STATUS_OPTIONS = [
  "TODO",
  "IN_PROGRESS",
  "IN_REVIEW",
  "FINISHED",
  "CANCELLED",
] as const;

export function TaskTimelineToolbar({
  groupBy,
  onGroupByChange,
  totalCount,
  unscheduledCount,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  missingDetailsOnly,
  onToggleMissingDetails,
  missingDetailsCount,
  zoom,
  onZoomChange,
  onScrollToToday,
}: TaskTimelineToolbarProps) {
  const { t } = useTranslation();

  const getGroupLabel = (val: TimelineGroupBy) => {
    switch (val) {
      case "type":
        return t("tasks.timelineGrid.groupType", {
          defaultValue: "Loại công việc",
        });
      case "status":
        return t("tasks.timelineGrid.groupStatus", {
          defaultValue: "Trạng thái",
        });
      case "none":
        return t("tasks.timelineGrid.groupNone", {
          defaultValue: "Không nhóm",
        });
    }
  };

  return (
    <div className="border-border bg-card/90 flex flex-wrap items-center justify-between gap-2.5 border-b px-3 py-2 backdrop-blur-xs">
      {/* Left controls: Search, Status filter, GroupBy, Missing details */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search Input */}
        <div className="border-input bg-background flex h-8 w-full min-w-[200px] shrink-0 items-center gap-1.5 rounded-xl border px-2.5 sm:w-[240px]">
          <Search className="text-muted-foreground size-3.5 shrink-0" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t("campaign.timeline.search", {
              defaultValue: "Tìm công việc...",
            })}
            aria-label={t("campaign.timeline.search", {
              defaultValue: "Tìm công việc...",
            })}
            className="h-7 min-w-0 flex-1 border-0 bg-transparent px-1 text-xs shadow-none focus-visible:ring-0"
          />
          {search && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-5 shrink-0 text-muted-foreground hover:text-foreground cursor-pointer"
              onClick={() => onSearchChange("")}
            >
              <X className="size-3" />
            </Button>
          )}
        </div>

        {/* Status Dropdown Filter */}
        <div className="w-34 shrink-0">
          <GlideSelect
            ariaLabel={t("tasks.statusLabel", { defaultValue: "Trạng thái" })}
            align="start"
            value={statusFilter}
            onValueChange={onStatusFilterChange}
            options={[
              {
                value: "ALL",
                label: t("campaign.timeline.allStatuses", {
                  defaultValue: "Mọi trạng thái",
                }),
              },
              ...STATUS_OPTIONS.map((status) => ({
                value: status,
                dotClassName:
                  status === "FINISHED"
                    ? "bg-emerald-500"
                    : status === "IN_PROGRESS"
                      ? "bg-brand-orange"
                      : status === "IN_REVIEW"
                        ? "bg-amber-500"
                        : status === "CANCELLED"
                          ? "bg-rose-500"
                          : "bg-amber-500",
                label: t(`tasks.status.${status}`, { defaultValue: status }),
              })),
            ]}
          />
        </div>

        {/* Group By Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs font-medium cursor-pointer"
            >
              <Layers className="text-muted-foreground size-3.5" />
              <span>
                {t("tasks.timelineGrid.groupBy", { defaultValue: "Nhóm" })}:{" "}
                {getGroupLabel(groupBy)}
              </span>
              <ChevronDown className="text-muted-foreground size-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-44">
            <DropdownMenuRadioGroup
              value={groupBy}
              onValueChange={(val) => onGroupByChange(val as TimelineGroupBy)}
            >
              <DropdownMenuRadioItem value="type">
                {t("tasks.timelineGrid.groupType", {
                  defaultValue: "Loại công việc",
                })}
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="status">
                {t("tasks.timelineGrid.groupStatus", {
                  defaultValue: "Trạng thái",
                })}
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="none">
                {t("tasks.timelineGrid.groupNone", {
                  defaultValue: "Không nhóm",
                })}
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Missing Description Quick Filter */}
        <Button
          type="button"
          variant={missingDetailsOnly ? "orange" : "outline"}
          size="sm"
          aria-pressed={missingDetailsOnly}
          className={cn(
            "h-8 shrink-0 gap-1.5 px-2.5 text-xs font-normal cursor-pointer",
            missingDetailsOnly &&
              "border-brand-orange bg-brand-orange font-semibold text-white shadow-xs hover:bg-brand-orange/90",
          )}
          onClick={onToggleMissingDetails}
        >
          <span>
            {t("campaign.timeline.missingDetailsQuick", {
              defaultValue: "Chưa viết mô tả",
            })}
          </span>
          {missingDetailsCount > 0 && (
            <span
              className={cn(
                "rounded px-1.5 py-0.2 text-[10px] font-semibold tabular-nums",
                missingDetailsOnly
                  ? "bg-white/20 text-white"
                  : "bg-brand-orange-soft text-brand-orange",
              )}
            >
              {missingDetailsCount}
            </span>
          )}
        </Button>
      </div>

      {/* Right controls: Hôm nay button, Zoom Segments, and Summary Counts */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Today Button */}
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-8 text-xs font-medium cursor-pointer hover:text-brand-orange"
          onClick={onScrollToToday}
        >
          {t("campaign.timeline.today", { defaultValue: "Hôm nay" })}
        </Button>

        {/* Granularity Switcher */}
        <RubberSegment
          size="xs"
          variant="soft"
          ariaLabel={t("campaign.timeline.zoom", { defaultValue: "Thu phóng" })}
          value={zoom}
          onValueChange={(val) => onZoomChange(val as typeof zoom)}
          options={[
            {
              value: "day",
              label: t("campaign.timeline.zoomOptions.day", {
                defaultValue: "Theo ngày",
              }),
            },
            {
              value: "week",
              label: t("campaign.timeline.zoomOptions.week", {
                defaultValue: "Theo tuần",
              }),
            },
            {
              value: "month",
              label: t("campaign.timeline.zoomOptions.month", {
                defaultValue: "Theo tháng",
              }),
            },
            {
              value: "quarter",
              label: t("campaign.timeline.zoomOptions.quarter", {
                defaultValue: "Theo quý",
              }),
            },
          ]}
        />

        {/* Counts summary */}
        <div className="text-muted-foreground hidden items-center gap-1.5 text-xs xl:flex">
          <span className="font-medium tabular-nums">
            {t("tasks.timelineGrid.tasksCount", {
              count: totalCount,
              defaultValue: `${totalCount} công việc`,
            })}
          </span>
          {unscheduledCount > 0 && (
            <span className="text-amber-600 dark:text-amber-400 font-normal tabular-nums">
              ({unscheduledCount}{" "}
              {t("tasks.timelineGrid.unscheduled", {
                defaultValue: "chưa lên lịch",
              })}
              )
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
