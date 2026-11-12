import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { AssigneeOptionList } from "./TaskFilterAssigneeOptions";
import {
  ParentOptionList,
  ScheduleOptionList,
  StatusOptionList,
  TypeOptionList,
} from "./TaskFilterCategoryList";
import {
  ApprovalOptionList,
  PriorityOptionList,
  ReporterOptionList,
} from "./TaskFilterExtraOptions";
import {
  computeCategoryCounts,
  getCategorySearchPlaceholder,
} from "./taskFilterCounts";
import type { FilterCategory, TaskFilterPopoverOptionsProps } from "./types";

export type { FilterCategory, TaskFilterPopoverOptionsProps };

export function TaskFilterPopoverOptions(props: TaskFilterPopoverOptionsProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const currentUser = useAuthStore((s) => s.user);

  useEffect(() => {
    setSearchQuery("");
  }, [props.activeCategory]);

  const searchPlaceholder = useMemo(() => {
    return getCategorySearchPlaceholder(props.activeCategory, t);
  }, [props.activeCategory, t]);

  const { totalCount, filteredCount, activeSelectedCount } = useMemo(() => {
    return computeCategoryCounts({
      category: props.activeCategory,
      q: searchQuery.trim().toLowerCase(),
      props,
      currentUser,
      t,
    });
  }, [props, searchQuery, currentUser, t]);

  return (
    <div className="flex flex-col h-full justify-between min-w-0">
      {/* Top Search Input */}
      <div className="p-2 border-b border-border bg-card">
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full bg-background border border-border rounded-lg pl-8 pr-7 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-brand-orange"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 cursor-pointer"
            >
              <X className="size-3" />
            </button>
          )}
        </div>
      </div>

      {/* Middle Options List */}
      <div className="flex-1 p-2 max-h-64 min-h-[200px] overflow-y-auto overflow-x-hidden space-y-0.5">
        {props.activeCategory === "parent" && (
          <ParentOptionList
            parents={props.parents}
            selectedParents={props.selectedParents}
            onToggleParent={props.onToggleParent}
            searchQuery={searchQuery}
          />
        )}
        {props.activeCategory === "assignee" && (
          <AssigneeOptionList
            assignees={props.assignees}
            selectedAssignees={props.selectedAssignees}
            onToggleAssignee={props.onToggleAssignee}
            searchQuery={searchQuery}
          />
        )}
        {props.activeCategory === "status" && (
          <StatusOptionList
            selectedStatuses={props.selectedStatuses}
            onToggleStatus={props.onToggleStatus}
            searchQuery={searchQuery}
          />
        )}
        {props.activeCategory === "type" && (
          <TypeOptionList
            selectedTypes={props.selectedTypes}
            onToggleType={props.onToggleType}
            searchQuery={searchQuery}
          />
        )}
        {props.activeCategory === "schedule" && (
          <ScheduleOptionList
            selectedSchedules={props.selectedSchedules}
            onToggleSchedule={props.onToggleSchedule}
            searchQuery={searchQuery}
          />
        )}
        {props.activeCategory === "priority" && (
          <PriorityOptionList
            selectedPriorities={props.selectedPriorities || []}
            onTogglePriority={props.onTogglePriority || (() => {})}
            searchQuery={searchQuery}
          />
        )}
        {props.activeCategory === "reporter" && (
          <ReporterOptionList
            reporters={props.reporters || []}
            selectedReporters={props.selectedReporters || []}
            onToggleReporter={props.onToggleReporter || (() => {})}
            searchQuery={searchQuery}
          />
        )}
        {props.activeCategory === "approval" && (
          <ApprovalOptionList
            selectedApprovals={props.selectedApprovals || []}
            onToggleApproval={props.onToggleApproval || (() => {})}
            searchQuery={searchQuery}
          />
        )}
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-border flex items-center justify-between p-2 bg-muted/10">
        <Button
          variant="ghost"
          size="sm"
          disabled={activeSelectedCount === 0}
          onClick={() => props.onClearCategory(props.activeCategory)}
          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer disabled:opacity-40"
        >
          {t("tasks.timelineGrid.clearCategory", { defaultValue: "Clear" })}
        </Button>
        <span className="text-2xs text-muted-foreground pr-2 font-mono tabular-nums">
          {filteredCount} of {totalCount}
        </span>
      </div>
    </div>
  );
}