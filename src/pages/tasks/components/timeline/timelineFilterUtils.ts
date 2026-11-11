import {
  extractUniqueAssignees,
  countActiveFilters,
  matchesAssignee,
  type TaskTimelineAssignee,
} from "@/pages/tasks/utils/taskFilterUtils";
import type { TaskTimelineItem, TimelineFilterCriteria } from "./types";

export type { TaskTimelineAssignee, TimelineFilterCriteria };
export { extractUniqueAssignees, countActiveFilters };

export function isTaskOverdue(
  item: TaskTimelineItem,
  now: number = Date.now(),
): boolean {
  if (!item.isScheduled) return false;
  const dateStr = item.task.dueDate || item.task.publishDate;
  if (!dateStr) return false;
  if (item.task.status === "FINISHED" || item.task.status === "CANCELLED") {
    return false;
  }
  const deadline = new Date(dateStr).getTime();
  return Number.isFinite(deadline) && deadline < now;
}

export function filterTimelineItems(
  items: TaskTimelineItem[],
  criteria: TimelineFilterCriteria,
  now: number = Date.now(),
): TaskTimelineItem[] {
  const { search, assignees, statuses, types, schedules } = criteria;
  const q = search.trim().toLowerCase();

  return items.filter((item) => {
    const { task } = item;
    if (q) {
      const nameMatch = task.name.toLowerCase().includes(q);
      const keyMatch = task.key ? task.key.toLowerCase().includes(q) : false;
      const assigneeMatch = task.assigneeName
        ? task.assigneeName.toLowerCase().includes(q)
        : false;
      if (!nameMatch && !keyMatch && !assigneeMatch) return false;
    }
    if (assignees.length > 0 && !matchesAssignee(task, assignees)) {
      return false;
    }
    if (statuses.length > 0 && !statuses.includes(task.status)) return false;
    if (types.length > 0 && (!task.type || !types.includes(task.type))) return false;
    if (schedules.length > 0 && !schedules.includes("ALL")) {
      const isUnscheduled = !item.isScheduled;
      const isOverdue = isTaskOverdue(item, now);
      const matchesUnscheduled =
        schedules.includes("UNSCHEDULED") && isUnscheduled;
      const matchesOverdue = schedules.includes("OVERDUE") && isOverdue;
      if (!matchesUnscheduled && !matchesOverdue) return false;
    }
    return true;
  });
}
