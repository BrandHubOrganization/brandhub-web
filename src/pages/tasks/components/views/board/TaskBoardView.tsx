import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Archive, ArchiveRestore } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TaskListItem, TaskStatus } from "@/types/task";
import { TaskBoardColumn } from "./TaskBoardColumn";
import {
  useBoardColumns,
  useBoardDragAndDrop,
  INITIAL_LIMIT,
} from "../hooks";
import type { TaskBoardViewProps } from "../types/types";

export type { TaskBoardViewProps };

interface TaskBoardHeaderProps {
  showCancelled: boolean;
  cancelledCount: number;
  onToggleCancelled: () => void;
}

function TaskBoardHeader({
  showCancelled,
  cancelledCount,
  onToggleCancelled,
}: TaskBoardHeaderProps) {
  const { t } = useTranslation();
  const label = showCancelled
    ? t("tasks.board.hideCancelled", { defaultValue: "Ẩn đã hủy" })
    : t("tasks.board.showCancelled", { defaultValue: "Hiện đã hủy" });

  return (
    <div className="flex items-center justify-end">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onToggleCancelled}
        className="text-muted-foreground hover:text-foreground h-8 cursor-pointer gap-1.5 text-xs transition-colors"
      >
        {showCancelled ? (
          <ArchiveRestore className="size-3.5" aria-hidden="true" />
        ) : (
          <Archive className="size-3.5" aria-hidden="true" />
        )}
        <span>{label}</span>
        <span className="bg-muted text-2xs rounded-full px-1.5 py-0.5 font-semibold">
          {cancelledCount}
        </span>
      </Button>
    </div>
  );
}

interface TaskBoardGridProps {
  statuses: TaskStatus[];
  showCancelled: boolean;
  localTasks: TaskListItem[];
  columnLimits: Record<TaskStatus, number>;
  dnd: ReturnType<typeof useBoardDragAndDrop>;
  onTaskClick: (task: TaskListItem) => void;
  onLoadMore: (status: TaskStatus) => void;
}

function TaskBoardGrid({
  statuses,
  showCancelled,
  localTasks,
  columnLimits,
  dnd,
  onTaskClick,
  onLoadMore,
}: TaskBoardGridProps) {
  return (
    <div
      className={cn(
        "grid w-full gap-4 transition-all duration-200 ease-out",
        showCancelled
          ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
          : "grid-cols-1 md:grid-cols-2 xl:grid-cols-4",
      )}
    >
      {statuses.map((status) => (
        <TaskBoardColumn
          key={status}
          status={status}
          tasks={localTasks.filter((item) => item.status === status)}
          limit={columnLimits[status] ?? INITIAL_LIMIT}
          isHovered={dnd.dragOverStatus === status}
          draggedTaskId={dnd.draggedTaskId}
          onDragOver={dnd.handleDragOver}
          onDragLeave={dnd.handleDragLeave}
          onDrop={dnd.handleDrop}
          onDragStart={dnd.handleDragStart}
          onDragEnd={dnd.handleDragEnd}
          onTaskClick={onTaskClick}
          onLoadMore={onLoadMore}
        />
      ))}
    </div>
  );
}

export function TaskBoardView({
  tasks,
  onTaskClick,
  workspaceId,
  onStatusChange,
}: TaskBoardViewProps) {
  const [localTasks, setLocalTasks] = useState<TaskListItem[]>(tasks);
  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const {
    activeStatuses,
    columnLimits,
    showCancelled,
    cancelledCount,
    handleLoadMore,
    toggleShowCancelled,
  } = useBoardColumns(localTasks);

  const dnd = useBoardDragAndDrop({
    localTasks,
    setLocalTasks,
    workspaceId,
    onStatusChange,
  });

  return (
    <div className="flex w-full flex-col gap-3 pt-1 pb-4">
      <TaskBoardHeader
        showCancelled={showCancelled}
        cancelledCount={cancelledCount}
        onToggleCancelled={toggleShowCancelled}
      />
      <TaskBoardGrid
        statuses={activeStatuses}
        showCancelled={showCancelled}
        localTasks={localTasks}
        columnLimits={columnLimits}
        dnd={dnd}
        onTaskClick={onTaskClick}
        onLoadMore={handleLoadMore}
      />
    </div>
  );
}
