import { useTranslation } from "react-i18next";
import { ChevronDown, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TaskTimelineToolbarProps, TimelineGroupBy } from "./types";

export type { TaskTimelineToolbarProps };

export function TaskTimelineToolbar({
  groupBy,
  onGroupByChange,
  totalCount,
  unscheduledCount,
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
    <div className="border-border bg-card/80 flex flex-wrap items-center justify-between gap-3 border-b p-3 backdrop-blur-xs">
      {/* Left: GroupBy */}
      <div className="flex flex-wrap items-center gap-2.5">
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
      </div>

      {/* Right: Counts */}
      <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
        <span className="font-medium">
          {t("tasks.timelineGrid.tasksCount", {
            count: totalCount,
            defaultValue: `${totalCount} công việc`,
          })}
        </span>
        {unscheduledCount > 0 && (
          <span className="text-amber-600 dark:text-amber-400 font-normal">
            ({unscheduledCount}{" "}
            {t("tasks.timelineGrid.unscheduled", {
              defaultValue: "chưa lên lịch",
            })}
            )
          </span>
        )}
      </div>
    </div>
  );
}
