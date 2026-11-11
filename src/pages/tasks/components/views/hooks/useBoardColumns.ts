import { useState, useMemo } from "react";
import type { TaskListItem, TaskStatus } from "@/types/task";

export const MAIN_STATUSES: TaskStatus[] = [
  "TODO",
  "IN_PROGRESS",
  "IN_REVIEW",
  "FINISHED",
];
export const INITIAL_LIMIT = 4;

const DEFAULT_LIMITS: Record<TaskStatus, number> = {
  TODO: INITIAL_LIMIT,
  IN_PROGRESS: INITIAL_LIMIT,
  IN_REVIEW: INITIAL_LIMIT,
  FINISHED: INITIAL_LIMIT,
  CANCELLED: INITIAL_LIMIT,
};

export function useBoardColumns(localTasks: TaskListItem[]) {
  const [showCancelled, setShowCancelled] = useState(false);
  const [columnLimits, setColumnLimits] = useState<Record<TaskStatus, number>>(DEFAULT_LIMITS);

  const cancelledCount = useMemo(
    () => localTasks.filter((item) => item.status === "CANCELLED").length,
    [localTasks],
  );

  const activeStatuses = useMemo(
    () => (showCancelled ? [...MAIN_STATUSES, "CANCELLED" as TaskStatus] : MAIN_STATUSES),
    [showCancelled],
  );

  const handleLoadMore = (status: TaskStatus) => {
    setColumnLimits((prev) => ({
      ...prev,
      [status]: (prev[status] ?? INITIAL_LIMIT) + 4,
    }));
  };

  const toggleShowCancelled = () => setShowCancelled((prev) => !prev);

  return {
    columnLimits,
    showCancelled,
    cancelledCount,
    activeStatuses,
    handleLoadMore,
    toggleShowCancelled,
  };
}

