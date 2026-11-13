import { useMemo, useState } from "react";
import type { TaskListItem, TaskStatus, TaskType } from "@/types/task";
import {
  dayNumber,
  dayString,
  localDay,
  todayIn,
} from "@/pages/campaign/utils/timelineDates";
import type {
  TaskTimelineGroup,
  TaskTimelineItem,
  TimelineGroupBy,
  TimelineTick,
  TimelineZoom,
} from "./types";

export type {
  TaskTimelineGroup,
  TaskTimelineItem,
  TimelineGroupBy,
  TimelineTick,
  TimelineZoom,
};

const TYPE_ORDER: TaskType[] = [
  "POST",
  "LIVESTREAM",
  "SURVEY",
  "EVENT_PLAN",
  "PRESS_RECOMMENDATION",
];

const STATUS_ORDER: TaskStatus[] = [
  "TODO",
  "IN_PROGRESS",
  "IN_REVIEW",
  "FINISHED",
  "CANCELLED",
];

function parseItemDates(task: TaskListItem, timezone: string): TaskTimelineItem {
  const deadline = task.dueDate || task.publishDate;
  if (!deadline) {
    return { task, startDate: null, endDate: null, isScheduled: false };
  }
  const end = localDay(deadline, timezone);
  if (!end || !Number.isFinite(dayNumber(end))) {
    return { task, startDate: null, endDate: null, isScheduled: false };
  }
  const endNum = dayNumber(end);
  const rawStart = localDay(task.createdAt, timezone);
  const startNum =
    rawStart && Number.isFinite(dayNumber(rawStart))
      ? Math.min(endNum, Math.max(dayNumber(rawStart), endNum - 30))
      : endNum;
  return {
    task,
    startDate: dayString(startNum),
    endDate: end,
    isScheduled: true,
  };
}

function groupByType(items: TaskTimelineItem[]): TaskTimelineGroup[] {
  const map = new Map<string, TaskTimelineItem[]>();
  for (const item of items) {
    const key = item.task.type || "POST";
    const list = map.get(key) || [];
    list.push(item);
    map.set(key, list);
  }
  const result: TaskTimelineGroup[] = [];
  for (const type of TYPE_ORDER) {
    const list = map.get(type);
    if (list && list.length > 0) {
      result.push({ id: `type:${type}`, name: type, type, items: list });
      map.delete(type);
    }
  }
  for (const [otherKey, list] of map.entries()) {
    result.push({ id: `type:${otherKey}`, name: otherKey, items: list });
  }
  return result;
}

function groupByStatus(items: TaskTimelineItem[]): TaskTimelineGroup[] {
  const map = new Map<string, TaskTimelineItem[]>();
  for (const item of items) {
    const key = item.task.status || "TODO";
    const list = map.get(key) || [];
    list.push(item);
    map.set(key, list);
  }
  const result: TaskTimelineGroup[] = [];
  for (const status of STATUS_ORDER) {
    const list = map.get(status);
    if (list && list.length > 0) {
      result.push({ id: `status:${status}`, name: status, status, items: list });
      map.delete(status);
    }
  }
  for (const [otherKey, list] of map.entries()) {
    result.push({ id: `status:${otherKey}`, name: otherKey, items: list });
  }
  return result;
}

function calculateRange(
  items: TaskTimelineItem[],
  today: string,
  zoom: TimelineZoom,
) {
  const observed: number[] = [dayNumber(today)];
  for (const item of items) {
    if (item.isScheduled && item.startDate && item.endDate) {
      observed.push(dayNumber(item.startDate));
      observed.push(dayNumber(item.endDate));
    }
  }
  const padLeft =
    zoom === "quarter" ? 60 : zoom === "month" ? 28 : zoom === "week" ? 14 : 5;
  const padRight =
    zoom === "quarter" ? 90 : zoom === "month" ? 42 : zoom === "week" ? 28 : 14;
  const minDay = Math.min(...observed) - padLeft;
  const maxDay = Math.max(...observed) + padRight;
  return { minDay, maxDay, count: maxDay - minDay + 1 };
}

export function useTaskTimelineCalculations(tasks: TaskListItem[]) {
  const [zoom, setZoom] = useState<TimelineZoom>("week");
  const [groupBy, setGroupBy] = useState<TimelineGroupBy>("type");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [missingDetailsOnly, setMissingDetailsOnly] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});

  const timezone = useMemo(() => {
    return (
      Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Ho_Chi_Minh"
    );
  }, []);

  const today = useMemo(() => todayIn(timezone), [timezone]);

  const allItems = useMemo(() => {
    return tasks.map((task) => parseItemDates(task, timezone));
  }, [tasks, timezone]);

  const missingDetailsCount = useMemo(() => {
    return allItems.filter(
      (item) => !item.task.description || !item.task.description.trim(),
    ).length;
  }, [allItems]);

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      const { task } = item;
      if (search.trim()) {
        const query = search.trim().toLowerCase();
        const matchesName = task.name.toLowerCase().includes(query);
        const matchesDesc =
          task.description?.toLowerCase().includes(query) ?? false;
        if (!matchesName && !matchesDesc) return false;
      }
      if (statusFilter !== "ALL") {
        if (task.status !== statusFilter) return false;
      }
      if (missingDetailsOnly) {
        if (task.description && task.description.trim()) return false;
      }
      return true;
    });
  }, [allItems, search, statusFilter, missingDetailsOnly]);

  const groups = useMemo(() => {
    if (groupBy === "type") return groupByType(filteredItems);
    if (groupBy === "status") return groupByStatus(filteredItems);
    return [{ id: "group:all", name: "allTasks", items: filteredItems }];
  }, [filteredItems, groupBy]);

  const { minDay, maxDay, count } = useMemo(() => {
    return calculateRange(filteredItems.length > 0 ? filteredItems : allItems, today, zoom);
  }, [filteredItems, allItems, today, zoom]);

  const baseDayWidth =
    zoom === "day" ? 48 : zoom === "week" ? 36 : zoom === "month" ? 18 : 8;
  const dayWidth = baseDayWidth;
  const calendarWidth = count * dayWidth;

  const x = useMemo(() => {
    return (date: string) => (dayNumber(date) - minDay) * dayWidth;
  }, [minDay, dayWidth]);

  const todayX = useMemo(() => x(today), [x, today]);

  const ticks = useMemo<TimelineTick[]>(() => {
    const stride =
      zoom === "quarter" ? 90 : zoom === "month" ? 30 : zoom === "week" ? 7 : 1;
    const list: TimelineTick[] = [];
    for (let i = 0; i < count; i += stride) {
      const d = minDay + i;
      list.push({ dayNum: d, dateStr: dayString(d), left: i * dayWidth });
    }
    return list;
  }, [count, minDay, dayWidth, zoom]);

  const toggleGroup = (id: string) => {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleTaskExpand = (taskId: string) => {
    setExpandedTasks((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const unscheduledCount = useMemo(() => {
    return filteredItems.filter((i) => !i.isScheduled).length;
  }, [filteredItems]);

  return {
    zoom,
    setZoom,
    groupBy,
    setGroupBy,
    groups,
    allItems,
    filteredItems,
    unscheduledCount,
    minDay,
    maxDay,
    count,
    dayWidth,
    calendarWidth,
    x,
    today,
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
  };
}
