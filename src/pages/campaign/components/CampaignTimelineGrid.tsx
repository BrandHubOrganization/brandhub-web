import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  AlertCircle,
  ChevronDown,
  ChevronRight,
  GanttChart,
  Plus,
  Table2,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { RubberSegment, SpringCheck } from "@/components/micro";
import { JiraStatusLozenge } from "@/pages/tasks/components/JiraSubtaskUI";
import {
  isSubtaskDone,
  isSubtaskOverdue,
} from "@/pages/tasks/utils/jiraSubtaskUtils";
import { TimelineAssigneePicker } from "@/pages/campaign/components/TimelineAssigneePicker";
import { TimelineSubtaskCreator } from "@/pages/campaign/components/TimelineSubtaskCreator";
import { TimelineMilestoneRail } from "@/pages/campaign/components/TimelineMilestoneRail";
import { useTimelineStatusWidth } from "@/pages/campaign/hooks/useTimelineStatusWidth";
import { TimelineHorizontalScrollbar } from "@/pages/campaign/components/TimelineHorizontalScrollbar";
import { TimelineRange } from "@/pages/campaign/components/TimelineRange";
import { TimelineFilterBar } from "@/pages/campaign/components/TimelineFilterBar";
import { CampaignTimelineTableView } from "@/pages/campaign/components/CampaignTimelineTableView";
import { CampaignOutOfScopeTaskDialog } from "@/pages/campaign/components/CampaignOutOfScopeTaskDialog";
import type { TaskType } from "@/types/task";
import {
  useTimelineColumns,
  type TimelineColumn,
} from "@/pages/campaign/hooks/useTimelineColumns";
import {
  EMPTY_FILTERS,
  type TimelineEdit,
  type TimelineFilters,
  type TimelineView,
} from "@/pages/campaign/types/campaignTimeline";
import {
  dayInstant,
  dayNumber,
  dayString,
  localDay,
  parseTimeline,
  todayIn,
} from "@/pages/campaign/utils/timelineDates";
import {
  buildTimelineNodes,
  type TimelineNode,
} from "@/pages/campaign/utils/timelineNodes";
import { isTimelineItemMissingDetails } from "@/pages/campaign/utils/timelineFilters";
import type { Campaign } from "@/pages/campaign/types";
import { cn } from "@/lib/utils";
import "@/pages/campaign/components/campaignTimeline.css";
export function CampaignTimelineGrid({
  workspaceId,
  campaign,
  data,
  userId,
  busy,
  edit,
  onOpenTask,
  campaignDates,
  campaignActions,
  canEditMilestones,
  milestoneBusy,
  milestoneBlocked,
  onMilestoneDirty,
  onMilestonesChange,
  selectableSubtasks = false,
  excludedSubtaskIds,
  onToggleSubtask,
  canCreateTask = false,
  onOutOfScopeCreated,
}: {
  workspaceId: string;
  campaign: Campaign;
  data: TimelineView;
  userId: string;
  busy: boolean;
  edit: (value: TimelineEdit) => Promise<unknown>;
  onOpenTask: (id: string, subtaskId?: string) => void;
  campaignDates?: ReactNode;
  campaignActions?: ReactNode;
  canEditMilestones: boolean;
  milestoneBusy: boolean;
  milestoneBlocked: boolean;
  onMilestoneDirty: (dirty: boolean) => void;
  onMilestonesChange: (
    milestones: { name: string; date: string }[],
    version: number,
  ) => Promise<unknown>;
  selectableSubtasks?: boolean;
  excludedSubtaskIds?: string[];
  onToggleSubtask?: (subtaskId: string, included: boolean) => void;
  canCreateTask?: boolean;
  onOutOfScopeCreated?: () => void;
}) {
  const { t } = useTranslation();
  const excludedSet = useMemo(
    () => new Set(excludedSubtaskIds ?? []),
    [excludedSubtaskIds],
  );
  const [filters, setFilters] = useState<TimelineFilters>(EMPTY_FILTERS);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [creating, setCreating] = useState<string | null>(null);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const viewStorageKey = `brandhub:campaign-view:${userId || "anon"}`;
  const [viewMode, setViewMode] = useState<"gantt" | "table">(() => {
    try {
      return window.localStorage.getItem(viewStorageKey) === "table"
        ? "table"
        : "gantt";
    } catch {
      return "gantt";
    }
  });
  function changeViewMode(mode: "gantt" | "table") {
    setViewMode(mode);
    try {
      window.localStorage.setItem(viewStorageKey, mode);
    } catch {
      /* Ignore storage quota or private-mode restrictions. */
    }
  }
  const [zoom, setZoom] = useState("week");
  const scrollId = useId();
  const initializedRange = useRef("");
  const [scroll, setScroll] = useState({
    top: 0,
    left: 0,
    height: 500,
    width: 1000,
  });
  const viewport = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const measure = () =>
      setScroll({
        top: element.scrollTop,
        left: element.scrollLeft,
        height: element.clientHeight,
        width: element.clientWidth,
      });
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    measure();
    return () => observer.disconnect();
  }, [viewMode]);
  const statusLabels = data.rows
    .flatMap((row) => [row.status, ...row.subtasks.map((sub) => sub.status)])
    .map((status) => t(`tasks.status.${status}`, { defaultValue: status }));
  const statusMinimum = useTimelineStatusWidth(statusLabels);
  const columns = useTimelineColumns(userId, workspaceId, statusMinimum);
  const timeline = parseTimeline(campaign.timeline);
  const today = todayIn(data.timezone);
  const columnKeys: TimelineColumn[] = ["name", "status", "assignee"];
  const pinned = columnKeys.reduce((n, key) => n + columns.widths[key], 0);
  const { minDay, maxDay } = useMemo(() => {
    const timeline = parseTimeline(campaign.timeline);
    const starts = data.rows
      .flatMap((r) => [
        r.plannedStartDate,
        ...r.subtasks.map((s) => s.plannedStartDate),
      ])
      .filter((s): s is string => !!s)
      .map((s) => localDay(s, data.timezone));
    const ends = data.rows
      .flatMap((r) => [r.dueDate, ...r.subtasks.map((s) => s.dueDate)])
      .filter((s): s is string => !!s)
      .map((s) => localDay(s, data.timezone));
    const observed = [
      ...starts,
      ...ends,
      ...(timeline.milestones?.map((m) => m.date) ?? []),
    ].filter((s) => Number.isFinite(dayNumber(s)));
    const start =
      timeline.startDate ||
      (observed.length ? observed.reduce((a, b) => (a < b ? a : b)) : today);
    const end =
      timeline.endDate ||
      dayString(Math.max(dayNumber(start) + 13, ...observed.map(dayNumber)));
    return {
      minDay: Math.min(dayNumber(start), ...observed.map(dayNumber)),
      maxDay: Math.max(
        dayNumber(start),
        dayNumber(end),
        ...observed.map(dayNumber),
      ),
    };
  }, [data, campaign.timeline, today]);
  const viewStart = dayString(minDay),
    count = maxDay - minDay + 1;
  const pinColumns = scroll.width - pinned >= 180;
  const laneViewport = Math.max(180, scroll.width - (pinColumns ? pinned : 0));
  const calendarScroll = Math.max(0, scroll.left - (pinColumns ? 0 : pinned));
  // No scale may compress a day so far that its date or a range handle becomes unusable.
  const baseDayWidth = zoom === "day" ? 48 : zoom === "week" ? 40 : 32;
  const dayWidth = Math.max(baseDayWidth, laneViewport / count);
  const calendarWidth = count * dayWidth;
  const tickStride = zoom === "day" ? 1 : 7;
  const x = (date: string) => (dayNumber(date) - minDay) * dayWidth;
  useEffect(() => {
    const key = `${campaign.id}:${timeline.startDate || ""}`;
    if (initializedRange.current === key || !timeline.startDate) return;
    initializedRange.current = key;
    viewport.current?.scrollTo({
      left: Math.max(
        0,
        (dayNumber(timeline.startDate) - minDay) * dayWidth +
          (pinColumns ? 0 : pinned),
      ),
    });
  }, [campaign.id, timeline.startDate, minDay, dayWidth, pinColumns, pinned]);
  const template = [
    ...columnKeys.map((k) => `${columns.widths[k]}px`),
    `${calendarWidth}px`,
  ].join(" ");
  const gridStyle: CSSProperties = {
    gridTemplateColumns: template,
    width: pinned + calendarWidth,
  };
  const filtered =
    filters.search.trim() !== "" ||
    filters.mine !== "all" ||
    filters.assignee.length > 0 ||
    filters.supervisor.length > 0 ||
    filters.statuses.length > 0 ||
    filters.types.length > 0 ||
    filters.deliverable.length > 0 ||
    filters.schedule !== "all" ||
    filters.completeness !== "all" ||
    !!filters.from ||
    !!filters.to;
  const nodes = buildTimelineNodes(
    campaign,
    data,
    filters,
    userId,
    today,
    expanded,
    collapsed,
    creating,
    filtered,
    t("campaign.timeline.otherTasks"),
  );
  const first = Math.max(0, Math.floor((scroll.top - 92) / 36) - 6),
    last = first + Math.ceil(scroll.height / 36) + 14;
  const shown = nodes
    .map((node, index) => ({ node, index }))
    .filter(
      ({ node, index }) =>
        (index >= first && index < last) || node.kind === "creator",
    );
  const firstDay = Math.max(0, Math.floor(calendarScroll / dayWidth) - 3),
    lastDay = Math.min(
      count,
      firstDay + Math.ceil(laneViewport / dayWidth) + 8,
    );
  const visibleDays = Array.from(
    { length: Math.max(0, lastDay - firstDay) },
    (_, i) => firstDay + i,
  );
  const guides = (
    <>
      {visibleDays.map((n) => (
        <span key={n} className="ct-gridline" style={{ left: n * dayWidth }} />
      ))}
      {[timeline.startDate, timeline.endDate]
        .filter((date): date is string => !!date)
        .map((date, i) => (
          <span
            key={`${i}:${date}`}
            className="ct-campaign-boundary"
            style={{ left: x(date) + (i === 1 ? dayWidth : 0) }}
          />
        ))}
      {timeline.milestones?.map((m, i) => (
        <span
          key={i}
          className="ct-milestone-guide"
          style={{ left: x(m.date) + dayWidth / 2 }}
        />
      ))}
      <span className="ct-today" style={{ left: x(today) }} />
    </>
  );
  function toggle(id: string) {
    setExpanded((old) => ({ ...old, [id]: !old[id] }));
  }
  function fitColumn(key: TimelineColumn) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) return;
    context.font = viewport.current
      ? getComputedStyle(viewport.current).font
      : "12px sans-serif";
    const values =
      key === "name"
        ? [
            campaign.name,
            ...data.rows.flatMap((row) => [
              row.name,
              ...row.subtasks.map((sub) => sub.name),
            ]),
          ]
        : key === "status"
          ? [
              ...new Set(
                data.rows.flatMap((row) => [
                  row.status,
                  ...row.subtasks.map((sub) => sub.status),
                ]),
              ),
            ].map((status) =>
              t(`tasks.status.${status}`, { defaultValue: status }),
            )
          : [];
    values.push(t(`campaign.timeline.columns.${key}`));
    columns.adjust(
      key,
      Math.ceil(
        Math.max(...values.map((value) => context.measureText(value).width)),
      ) + (key === "name" ? 65 : 25),
    );
  }
  function cell(key: TimelineColumn, content: ReactNode, rowKind?: string) {
    const left = columnKeys
      .slice(0, columnKeys.indexOf(key))
      .reduce((sum, k) => sum + columns.widths[k], 0);
    return (
      <div
        key={key}
        className={cn(
          "ct-cell",
          key === "status" && "ct-status-cell",
          key !== "name" && "justify-center",
        )}
        style={{
          left: pinColumns ? left : undefined,
          position: pinColumns ? "sticky" : "relative",
        }}
        data-column={key}
      >
        {rowKind === "header" ? (
          <span
            className="ct-column-label flex items-center gap-1"
            title={typeof content === "string" ? content : undefined}
          >
            {key === "status" && (
              <span
                aria-hidden
                className="bg-brand-orange size-1.5 shrink-0 rounded-full"
              />
            )}
            <span className="truncate">{content}</span>
          </span>
        ) : (
          content
        )}
        {rowKind === "header" && (
          <div
            role="separator"
            tabIndex={0}
            aria-label={t("campaign.timeline.resizeColumn", {
              column: t(`campaign.timeline.columns.${key}`),
            })}
            aria-orientation="vertical"
            aria-valuenow={columns.widths[key]}
            aria-valuemin={columns.limits[key][0]}
            aria-valuemax={columns.limits[key][1]}
            className="ct-column-grip"
            onPointerDown={(e) => columns.start(e, key)}
            onPointerMove={columns.move}
            onPointerUp={columns.stop}
            onPointerCancel={columns.stop}
            onDoubleClick={() => fitColumn(key)}
            onKeyDown={(e) => {
              if (["ArrowLeft", "ArrowRight"].includes(e.key)) {
                e.preventDefault();
                columns.adjust(
                  key,
                  columns.widths[key] + (e.key === "ArrowRight" ? 10 : -10),
                );
              }
            }}
          />
        )}
      </div>
    );
  }
  function nodeCells(node: TimelineNode) {
    if (node.kind === "group")
      return columnKeys.map((key) =>
        cell(
          key,
          key === "name" ? (
            <Button
              variant="ghost"
              className="ct-name-button h-8 gap-1"
              onClick={() =>
                setCollapsed((old) => ({ ...old, [node.id]: !old[node.id] }))
              }
            >
              {!!collapsed[node.id] && !filtered ? (
                <ChevronRight className="text-brand-orange size-3" />
              ) : (
                <ChevronDown className="text-brand-orange size-3" />
              )}
              <span className="truncate font-bold">{node.name}</span>
              <span className="bg-brand-orange rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white">
                {node.count}
              </span>
            </Button>
          ) : null,
        ),
      );
    if (node.kind === "add")
      return columnKeys.map((key) =>
        cell(
          key,
          key === "name" ? (
            <Button
              size="sm"
              variant="ghost"
              className="text-brand-orange h-7 text-[11px]"
              onClick={() => setCreating(node.parent.id)}
            >
              <Plus className="size-3" />
              {t("campaign.timeline.addSubtask")}
            </Button>
          ) : null,
        ),
      );
    if (node.kind === "creator") return null;
    const task = node.kind === "task" ? node.row : node.parent,
      item = node.row;
    return columnKeys.map((key) =>
      cell(
        key,
        key === "name" ? (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="size-5 shrink-0"
              aria-label={t("campaign.timeline.expandSubtasks", {
                name: item.name,
              })}
              onClick={() =>
                node.kind === "task" ? toggle(task.id) : onOpenTask(task.id)
              }
            >
              {node.kind === "task" ? (
                !!expanded[task.id] || filtered ? (
                  <ChevronDown className="size-3" />
                ) : (
                  <ChevronRight className="size-3" />
                )
              ) : selectableSubtasks && onToggleSubtask ? (
                <span className="text-muted-foreground">↳</span>
              ) : (
                <span className="text-muted-foreground">↳</span>
              )}
            </Button>
            {node.kind === "sub" && selectableSubtasks && onToggleSubtask && (
              <SpringCheck
                checked={!excludedSet.has(item.id)}
                disabled={busy}
                stopPropagation
                ariaLabel={t("campaign.timeline.toggleSubtaskDeploy", {
                  name: item.name,
                  defaultValue: `Triển khai công việc con ${item.name}`,
                })}
                onCheckedChange={(checked) =>
                  onToggleSubtask(item.id, checked)
                }
              />
            )}
            <Button
              variant="ghost"
              className={cn(
                "ct-name-button h-8",
                node.kind === "task" &&
                  node.contextOnly &&
                  "text-muted-foreground",
                item.status === "FINISHED" && "line-through",
                node.kind === "sub" &&
                  selectableSubtasks &&
                  excludedSet.has(item.id) &&
                  "text-muted-foreground line-through opacity-60",
              )}
              title={item.name}
              onClick={() =>
                onOpenTask(task.id, node.kind === "sub" ? item.id : undefined)
              }
            >
              {item.name}
            </Button>
            {(!item.plannedStartDate || !item.dueDate) && (
              <span
                className="ct-unscheduled"
                title={t("campaign.timeline.unscheduled")}
              >
                {t("campaign.timeline.unscheduled")}
              </span>
            )}
            {node.kind === "task" && task.subtasks.length > 0 && (
              <span
                className={cn(
                  "shrink-0 text-[9px]",
                  selectableSubtasks &&
                    task.subtasks.some((s) => excludedSet.has(s.id))
                    ? "font-medium text-amber-600 dark:text-amber-400"
                    : "text-muted-foreground",
                )}
                title={
                  selectableSubtasks
                    ? t("campaign.timeline.selectedSubtasksCount", {
                        defaultValue: "Số công việc con được chọn triển khai",
                      })
                    : undefined
                }
              >
                {selectableSubtasks
                  ? task.subtasks.filter((s) => !excludedSet.has(s.id)).length
                  : task.subtasks.filter((s) => s.status === "FINISHED").length}
                /{task.subtasks.length}
              </span>
            )}
            {node.kind === "sub" &&
              selectableSubtasks &&
              excludedSet.has(item.id) && (
                <span className="text-muted-foreground bg-muted shrink-0 rounded px-1 py-0.5 text-[9px]">
                  {t("campaign.timeline.skipOnDeploy", {
                    defaultValue: "Không triển khai",
                  })}
                </span>
              )}
            {node.kind === "task" && task.outOfScope && (
              <span
                className="border-brand-orange/45 bg-brand-orange/15 text-brand-orange inline-flex shrink-0 items-center rounded-md border px-1.5 py-0.5 text-[9px] font-bold"
                title={t("campaign.timeline.outOfScopeBadge", {
                  defaultValue: "Ngoài phạm vi",
                })}
              >
                {t("campaign.timeline.outOfScopeBadge", {
                  defaultValue: "Ngoài phạm vi",
                })}
              </span>
            )}
            {isTimelineItemMissingDetails(item) && (
              <span
                className="inline-flex shrink-0 items-center gap-0.5 rounded border border-amber-500/30 bg-amber-500/10 px-1 py-0.5 text-[9px] font-semibold text-amber-700 dark:text-amber-300"
                title={t("campaign.timeline.missingDetailsTooltip", {
                  defaultValue:
                    "Manager/Owner chưa viết đầy đủ mô tả chi tiết hoặc tiêu chí nghiệm thu",
                })}
              >
                {t("campaign.timeline.missingDetailsBadge", {
                  defaultValue: "Thiếu mô tả",
                })}
              </span>
            )}
            {node.kind === "task" && task.awaitingClient && (
              <span
                className="inline-flex shrink-0 items-center gap-0.5 rounded border border-amber-500/25 bg-amber-500/10 px-1 py-0.5 text-[9px] font-semibold text-amber-600 dark:text-amber-400"
                title={t("campaign.timeline.awaitingClient")}
              >
                {t("campaign.timeline.awaitingClient")}
              </span>
            )}
            {node.kind === "sub" &&
              isSubtaskOverdue(item.dueDate, isSubtaskDone(item.status)) && (
                <span
                  className="inline-flex shrink-0 items-center gap-0.5 rounded border border-rose-500/25 bg-rose-500/10 px-1 py-0.5 text-[9px] font-semibold text-rose-600 dark:text-rose-400"
                  title={t("campaign.timeline.overdue")}
                >
                  <AlertCircle className="size-2.5" />
                  {t("campaign.timeline.overdue")}
                </span>
              )}
          </>
        ) : key === "status" ? (
          <JiraStatusLozenge
            status={item.status}
            label={t(`tasks.status.${item.status}`, {
              defaultValue: item.status,
            })}
            className="text-[10px] whitespace-nowrap"
          />
        ) : (
          <TimelineAssigneePicker
            value={item.assigneeId}
            name={item.assigneeId ? data.names[item.assigneeId] : undefined}
            options={data.members}
            allowEmpty={node.kind === "sub"}
            disabled={
              busy ||
              !(node.kind === "task" ? task.canAssign : task.canManageSubtasks)
            }
            onChange={(id) =>
              edit({
                kind: "assignee",
                taskId: task.id,
                assigneeId: id,
                ...(node.kind === "sub" ? { subtaskId: item.id } : {}),
              })
            }
          />
        ),
      ),
    );
  }
  return (
    <section className="border-border bg-card ct-timeline-shell flex min-w-0 flex-col overflow-hidden rounded-xl border">
      {(campaignDates || campaignActions) && (
        <div className="border-border flex flex-wrap items-center justify-between gap-2 border-b px-3 py-2">
          {campaignDates}
          {campaignActions}
        </div>
      )}
      <TimelineFilterBar
        filters={filters}
        onChange={setFilters}
        data={data}
        deliverables={campaign.deliverablePlan}
        trailingControls={
          <div className="ml-auto flex max-w-full flex-wrap items-center justify-end gap-2">
            {viewMode === "gantt" && (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs"
                  onClick={() =>
                    viewport.current?.scrollTo({
                      left: Math.max(0, x(today) - 60),
                      behavior: window.matchMedia(
                        "(prefers-reduced-motion: reduce)",
                      ).matches
                        ? "instant"
                        : "smooth",
                    })
                  }
                >
                  {t("campaign.timeline.today")}
                </Button>
                <RubberSegment
                  size="xs"
                  variant="soft"
                  ariaLabel={t("campaign.timeline.zoom")}
                  value={zoom}
                  onValueChange={setZoom}
                  options={(["day", "week", "month"] as const).map((value) => ({
                    value,
                    label: t(`campaign.timeline.zoomOptions.${value}`),
                  }))}
                />
              </>
            )}
            {viewMode === "table" && data.rows.some((r) => r.subtasks.length > 0 || r.canManageSubtasks) && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-7 text-xs"
                onClick={() => {
                  const anyCollapsed = data.rows.some((r) => !expanded[r.id]);
                  const next: Record<string, boolean> = {};
                  if (anyCollapsed) {
                    for (const r of data.rows) next[r.id] = true;
                  }
                  setExpanded(next);
                }}
              >
                {data.rows.some((r) => !expanded[r.id])
                  ? t("campaign.timeline.expandAllTasks", {
                      defaultValue: "Mở rộng việc con",
                    })
                  : t("campaign.timeline.collapseAllTasks", {
                      defaultValue: "Thu gọn việc con",
                    })}
              </Button>
            )}
            <RubberSegment
              size="xs"
              variant="solid"
              ariaLabel={t("campaign.timeline.viewModeLabel", {
                defaultValue: "Chế độ hiển thị",
              })}
              value={viewMode}
              onValueChange={changeViewMode}
              options={[
                {
                  value: "gantt" as const,
                  icon: <GanttChart className="size-3.5" />,
                  label: t("campaign.timeline.viewModes.gantt", {
                    defaultValue: "Gantt",
                  }),
                },
                {
                  value: "table" as const,
                  icon: <Table2 className="size-3.5" />,
                  label: t("campaign.timeline.viewModes.table", {
                    defaultValue: "Danh sách",
                  }),
                },
              ]}
            />
          </div>
        }
      />
      {viewMode === "table" ? (
        <CampaignTimelineTableView
          nodes={nodes}
          data={data}
          today={today}
          busy={busy}
          filtered={filtered}
          expanded={expanded}
          collapsed={collapsed}
          selectableSubtasks={selectableSubtasks}
          excludedSet={excludedSet}
          onToggleGroup={(id) =>
            setCollapsed((old) => ({ ...old, [id]: !old[id] }))
          }
          onToggleTask={toggle}
          onStartCreating={(id) => setCreating(id)}
          onCancelCreating={() => setCreating(null)}
          onToggleSubtask={onToggleSubtask}
          onOpenTask={onOpenTask}
          canCreateTask={canCreateTask}
          onOpenCreateTask={() => setCreateTaskOpen(true)}
          edit={edit}
        />
      ) : (
        <>
      <div
        id={scrollId}
        className="ct-scroll"
        ref={viewport}
        onWheel={(e) => {
          if (e.deltaX || e.shiftKey)
            e.currentTarget.scrollLeft += e.deltaX || e.deltaY;
        }}
        onScroll={(e) => {
          const el = e.currentTarget;
          setScroll({
            top: el.scrollTop,
            left: el.scrollLeft,
            height: el.clientHeight,
            width: el.clientWidth,
          });
        }}
      >
        <div className="ct-canvas" style={{ width: pinned + calendarWidth }}>
          <div className="ct-grid-row ct-ruler" style={gridStyle}>
            {columnKeys.map((key) =>
              cell(key, t(`campaign.timeline.columns.${key}`), "header"),
            )}
            <div className="ct-axis">
              {visibleDays
                .filter((n) => n % tickStride === 0)
                .map((n) => (
                  <span
                    key={n}
                    className="ct-tick"
                    style={{ left: n * dayWidth }}
                  >
                    {dayString(minDay + n)
                      .slice(5)
                      .split("-")
                      .reverse()
                      .join("/")}
                  </span>
                ))}
              {x(today) >= calendarScroll &&
                x(today) <= calendarScroll + laneViewport && (
                  <span
                    className="ct-today-label"
                    style={{
                      left: Math.max(
                        calendarScroll + 25,
                        Math.min(calendarScroll + laneViewport - 25, x(today)),
                      ),
                    }}
                  >
                    {t("campaign.timeline.today")}
                  </span>
                )}
            </div>
          </div>
          <div className="ct-grid-row ct-campaign-row" style={gridStyle}>
            {columnKeys.map((key) =>
              cell(
                key,
                key === "name" ? (
                  <span className="truncate">
                    {t("campaign.timeline.milestoneRow")}
                  </span>
                ) : null,
              ),
            )}
            <div className="ct-axis">
              {guides}
              <TimelineMilestoneRail
                milestones={timeline.milestones || []}
                version={campaign.contentVersion}
                viewStart={viewStart}
                dayWidth={dayWidth}
                laneWidth={calendarWidth}
                visibleStart={calendarScroll}
                visibleWidth={laneViewport}
                startDate={timeline.startDate}
                endDate={timeline.endDate}
                editable={canEditMilestones}
                busy={milestoneBusy}
                blocked={milestoneBlocked}
                onDirty={onMilestoneDirty}
                onChange={onMilestonesChange}
              />
            </div>
          </div>
          <div
            className="ct-virtual-body"
            style={{
              height: Math.max(
                (nodes.length + (canCreateTask ? 1 : 0)) * 36,
                canCreateTask && nodes.length === 0 ? 108 : 90,
              ),
            }}
          >
            {shown.map(({ node, index }) => (
              <div
                className={cn(
                  "ct-node",
                  node.kind === "group" && "ct-group",
                  node.kind === "sub" && "ct-sub",
                )}
                key={
                  node.kind === "group"
                    ? `group:${node.id}`
                    : node.kind === "task" || node.kind === "sub"
                      ? node.row.id
                      : `${node.kind}:${node.parent.id}`
                }
                style={{ top: index * 36 }}
              >
                {node.kind === "creator" ? (
                  <TimelineSubtaskCreator
                    timezone={data.timezone}
                    members={data.members}
                    busy={busy}
                    taskType={node.parent.type as TaskType}
                    onCancel={() => setCreating(null)}
                    onCreate={(name, assigneeId, dueDate, subtaskRole) =>
                      edit({
                        kind: "create",
                        taskId: node.parent.id,
                        name,
                        assigneeId,
                        dueDate,
                        subtaskRole,
                      })
                    }
                  />
                ) : (
                  <div className="ct-grid-row" style={gridStyle}>
                    {nodeCells(node)}
                    <div className="ct-axis">
                      {guides}
                      {(node.kind === "task" || node.kind === "sub") && (
                        <TimelineRange
                          start={localDay(
                            node.row.plannedStartDate,
                            data.timezone,
                          )}
                          end={localDay(node.row.dueDate, data.timezone)}
                          viewStart={viewStart}
                          dayWidth={dayWidth}
                          today={today}
                          status={node.row.status}
                          busy={busy}
                          editable={
                            node.kind === "task"
                              ? node.row.canSchedule
                              : node.parent.canManageSubtasks
                          }
                          onSave={(start, end) =>
                            edit({
                              kind: "schedule",
                              taskId:
                                node.kind === "task"
                                  ? node.row.id
                                  : node.parent.id,
                              ...(node.kind === "sub"
                                ? { subtaskId: node.row.id }
                                : {}),
                              start: dayInstant(start, data.timezone),
                              end: dayInstant(end, data.timezone),
                            })
                          }
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {canCreateTask && (
              <div className="ct-node" style={{ top: nodes.length * 36 }}>
                <div className="ct-grid-row" style={gridStyle}>
                  {columnKeys.map((key) =>
                    cell(
                      key,
                      key === "name" ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="text-brand-orange hover:bg-brand-orange/10 h-7 gap-1 px-1.5 text-xs font-medium"
                          onClick={() => setCreateTaskOpen(true)}
                        >
                          <Plus className="size-3.5" />
                          <span>
                            {t("campaign.timeline.addOutOfScopeTask", {
                              defaultValue: "Thêm công việc lớn",
                            })}
                          </span>
                        </Button>
                      ) : null,
                    ),
                  )}
                  <div className="ct-axis">{guides}</div>
                </div>
              </div>
            )}
            {nodes.length === 0 && (
              <p
                className={cn(
                  "text-muted-foreground sticky left-0 px-6 pb-6 text-sm",
                  canCreateTask ? "pt-12" : "pt-6",
                )}
              >
                {t("campaign.timeline.noResults")}
              </p>
            )}
          </div>
        </div>
      </div>
      <TimelineHorizontalScrollbar
        value={scroll.left}
        maximum={Math.max(0, pinned + calendarWidth - scroll.width)}
        visibleWidth={Math.max(1, scroll.width - (pinColumns ? pinned : 0))}
        contentWidth={pinColumns ? calendarWidth : pinned + calendarWidth}
        step={dayWidth}
        inset={pinColumns ? pinned : 0}
        controls={scrollId}
        onChange={(left) => viewport.current?.scrollTo({ left })}
      />
        </>
      )}
      {canCreateTask && (
        <CampaignOutOfScopeTaskDialog
          open={createTaskOpen}
          workspaceId={workspaceId}
          campaignId={campaign.id}
          userId={userId}
          timezone={data.timezone}
          members={data.members}
          onClose={() => setCreateTaskOpen(false)}
          onCreated={() => {
            setCollapsed((old) => ({ ...old, other: false }));
            onOutOfScopeCreated?.();
          }}
        />
      )}
    </section>
  );
}
