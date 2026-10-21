import type { TaskListItem } from "@/types/task";

export function taskDeadline(task: TaskListItem): Date | null {
  const dateStr = task.publishDate || task.dueDate;
  if (!dateStr) return null;
  const deadline = new Date(dateStr);
  return Number.isNaN(deadline.getTime()) ? null : deadline;
}

export function deadlineColumn(
  task: TaskListItem,
  days: Date[],
): number | null {
  const deadline = taskDeadline(task);
  if (!deadline) return null;
  const column = days.findIndex(
    (day) =>
      day.getFullYear() === deadline.getFullYear() &&
      day.getMonth() === deadline.getMonth() &&
      day.getDate() === deadline.getDate(),
  );
  return column < 0 ? null : column + 1;
}
