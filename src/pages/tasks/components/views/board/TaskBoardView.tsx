import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Archive, ArchiveRestore } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TaskListItem, TaskStatus } from "@/types/task";
import { TaskBoardColumn } from "./TaskBoardColumn";
import {
  useBoardColumns,
  useBoardDragAndDrop,
  INITIAL_LIMIT,
  MAIN_STATUSES,
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
        className="text-muted-foreground hover:text-foreground h-8 cursor-pointer gap-1.5 text-xs"
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

interface TaskBoardMainGridProps {
  localTasks: TaskListItem[];
  columnLimits: Record<TaskStatus, number>;
  dnd: ReturnType<typeof useBoardDragAndDrop>;
  onTaskClick: (task: TaskListItem) => void;
  onLoadMore: (status: TaskStatus) => void;
}

function TaskBoardMainGrid({
  localTasks,
  columnLimits,
  dnd,
  onTaskClick,
  onLoadMore,
}: TaskBoardMainGridProps) {
  return (
    <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {MAIN_STATUSES.map((status) => (
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

interface CancelledHeaderProps {
  cancelledCount: number;
  onClose: () => void;
}

function TaskBoardCancelledHeader({
  cancelledCount,
  onClose,
}: CancelledHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="border-border/60 flex items-center justify-between border-b pb-2.5">
      <div className="flex items-center gap-2">
        <Archive className="text-muted-foreground size-4" aria-hidden="true" />
        <h3 className="text-foreground text-sm font-semibold">
          {t("tasks.board.cancelledSection", {
            defaultValue: "Công việc đã hủy",
          })}
        </h3>
        <span className="bg-muted text-muted-foreground text-2xs rounded-full px-2 py-0.5 font-semibold">
          {cancelledCount}
        </span>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="text-muted-foreground hover:text-foreground h-7 cursor-pointer px-2 text-xs"
      >
        {t("tasks.board.hideCancelled", { defaultValue: "Ẩn đã hủy" })}
      </Button>
    </div>
  );
}

interface CancelledSectionProps {
  tasks: TaskListItem[];
  limit: number;
  dnd: ReturnType<typeof useBoardDragAndDrop>;
  cancelledCount: number;
  onClose: () => void;
  onTaskClick: (task: TaskListItem) => void;
  onLoadMore: (status: TaskStatus) => void;
}

function TaskBoardCancelledSection({
  tasks,
  limit,
  dnd,
  cancelledCount,
  onClose,
  onTaskClick,
  onLoadMore,
}: CancelledSectionProps) {
  const { t } = useTranslation();

  return (
    <section
      aria-label={t("tasks.board.cancelledSection", {
        defaultValue: "Công việc đã hủy",
      })}
      className="border-border bg-card/40 mt-2 flex flex-col gap-3 rounded-2xl border p-4 shadow-xs transition-all duration-200"
    >
      <TaskBoardCancelledHeader
        cancelledCount={cancelledCount}
        onClose={onClose}
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <TaskBoardColumn
          status="CANCELLED"
          tasks={tasks}
          limit={limit}
          isHovered={dnd.dragOverStatus === "CANCELLED"}
          draggedTaskId={dnd.draggedTaskId}
          onDragOver={dnd.handleDragOver}
          onDragLeave={dnd.handleDragLeave}
          onDrop={dnd.handleDrop}
          onDragStart={dnd.handleDragStart}
          onDragEnd={dnd.handleDragEnd}
          onTaskClick={onTaskClick}
          onLoadMore={onLoadMore}
        />
      </div>
    </section>
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
      <TaskBoardMainGrid
        localTasks={localTasks}
        columnLimits={columnLimits}
        dnd={dnd}
        onTaskClick={onTaskClick}
        onLoadMore={handleLoadMore}
      />
      {showCancelled && (
        <TaskBoardCancelledSection
          tasks={localTasks.filter((item) => item.status === "CANCELLED")}
          limit={columnLimits.CANCELLED ?? INITIAL_LIMIT}
          dnd={dnd}
          cancelledCount={cancelledCount}
          onClose={toggleShowCancelled}
          onTaskClick={onTaskClick}
          onLoadMore={handleLoadMore}
        />
      )}
    </div>
  );
}
