import { useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { TimelineHorizontalScrollbar } from "@/pages/campaign/components/TimelineHorizontalScrollbar";
import { useTaskTimelineCalculations } from "./useTaskTimelineCalculations";
import { TaskTimelineToolbar } from "./TaskTimelineToolbar";
import { TaskTimelineHeaderRow } from "./TaskTimelineHeaderRow";
import { TaskTimelineGroupRow } from "./TaskTimelineGroupRow";
import { TaskTimelineRow } from "./TaskTimelineRow";
import "@/pages/campaign/components/campaignTimeline.css";
import type { TaskTimelineViewProps } from "./types";

export type { TaskTimelineViewProps };

export function TaskTimelineView({
  tasks,
  onTaskClick,
  workspaceId,
  onUpdated,
}: TaskTimelineViewProps) {
  const { t } = useTranslation();
  const viewportRef = useRef<HTMLDivElement>(null);
  const initialScrolledRef = useRef(false);
  const scrollId = useId();
  const [scroll, setScroll] = useState({ left: 0, width: 1000 });

  const {
    zoom,
    setZoom,
    groupBy,
    setGroupBy,
    groups,
    allItems,
    filteredItems,
    unscheduledCount,
    calendarWidth,
    dayWidth,
    x,
    todayX,
    ticks,
    collapsed,
    toggleGroup,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    missingDetailsOnly,
    setMissingDetailsOnly,
    missingDetailsCount,
    expandedTasks,
    toggleTaskExpand,
    timezone,
  } = useTaskTimelineCalculations(tasks);

  const pinnedWidth = 490; // Work 280px + Status 120px + Assignee 90px

  const scrollToToday = (behavior: ScrollBehavior = "smooth") => {
    if (!viewportRef.current) return;
    const targetLeft = Math.max(0, todayX - 120);
    viewportRef.current.scrollTo({ left: targetLeft, behavior });
  };

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const measure = () => {
      setScroll({ left: el.scrollLeft, width: el.clientWidth });
    };
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    measure();
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!initialScrolledRef.current && todayX > 0) {
      initialScrolledRef.current = true;
      scrollToToday("instant");
    }
  }, [todayX]);

  return (
    <section className="relative border-border bg-card flex flex-col overflow-hidden rounded-2xl border shadow-xs w-full max-w-full min-w-0">
      <TaskTimelineToolbar
        groupBy={groupBy}
        onGroupByChange={setGroupBy}
        totalCount={allItems.length}
        unscheduledCount={unscheduledCount}
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        missingDetailsOnly={missingDetailsOnly}
        onToggleMissingDetails={() => setMissingDetailsOnly((prev) => !prev)}
        missingDetailsCount={missingDetailsCount}
        zoom={zoom}
        onZoomChange={setZoom}
        onScrollToToday={() => scrollToToday("smooth")}
      />

      <div
        id={scrollId}
        ref={viewportRef}
        onWheel={(e) => {
          if (e.deltaX || e.shiftKey) {
            e.currentTarget.scrollLeft += e.deltaX || e.deltaY;
          }
        }}
        onScroll={(e) => {
          const el = e.currentTarget;
          setScroll({
            left: el.scrollLeft,
            width: el.clientWidth,
          });
        }}
        className="ct-scroll w-full max-w-full min-w-0 max-h-[70vh] min-h-[350px] overflow-y-auto overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden select-none"
      >
        <div className="ct-canvas min-w-full">
          <TaskTimelineHeaderRow
            calendarWidth={calendarWidth}
            ticks={ticks}
            todayX={todayX}
            zoom={zoom}
          />

          {filteredItems.length === 0 ? (
            <div className="text-muted-foreground flex h-48 flex-col items-center justify-center p-6 text-center text-sm">
              <p>
                {t("tasks.timelineGrid.noTasks", {
                  defaultValue: "Không tìm thấy công việc nào phù hợp",
                })}
              </p>
            </div>
          ) : (
            groups.map((group) => {
              const isGroupCollapsed = !!collapsed[group.id];
              return (
                <div key={group.id} className="flex flex-col">
                  {groupBy !== "none" && (
                    <TaskTimelineGroupRow
                      group={group}
                      isCollapsed={isGroupCollapsed}
                      onToggle={() => toggleGroup(group.id)}
                      calendarWidth={calendarWidth}
                      ticks={ticks}
                      todayX={todayX}
                    />
                  )}
                  {!isGroupCollapsed &&
                    group.items.map((item) => (
                      <TaskTimelineRow
                        key={item.task.id}
                        item={item}
                        onTaskClick={onTaskClick}
                        calendarWidth={calendarWidth}
                        dayWidth={dayWidth}
                        x={x}
                        ticks={ticks}
                        todayX={todayX}
                        workspaceId={workspaceId}
                        onUpdated={onUpdated}
                        isExpanded={!!expandedTasks[item.task.id]}
                        onToggleExpand={() => toggleTaskExpand(item.task.id)}
                        timezone={timezone}
                      />
                    ))}
                </div>
              );
            })
          )}
        </div>
      </div>

      <TimelineHorizontalScrollbar
        value={scroll.left}
        maximum={Math.max(0, pinnedWidth + calendarWidth - scroll.width)}
        visibleWidth={Math.max(1, scroll.width - pinnedWidth)}
        contentWidth={calendarWidth}
        step={dayWidth}
        inset={pinnedWidth}
        controls={scrollId}
        onChange={(left) => viewportRef.current?.scrollTo({ left })}
      />
    </section>
  );
}
