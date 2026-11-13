import { useEffect, useRef } from "react";
import type React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TaskListItem, TaskStatus } from "@/types/task";
import { STATUS_CONFIG } from "@/pages/tasks/constants";
import { TaskBoardCard } from "./TaskBoardCard";
import type { TaskBoardColumnProps } from "../types/types";

export type { TaskBoardColumnProps };

interface UseInfiniteScrollParams {
  hasMore: boolean;
  onLoadMore: () => void;
  threshold?: number;
}

function useInfiniteScroll({
  hasMore,
  onLoadMore,
  threshold = 60,
}: UseInfiniteScrollParams) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const lastTrigger = useRef(0);
  const callbackRef = useRef(onLoadMore);
  callbackRef.current = onLoadMore;

  const trigger = () => {
    const now = Date.now();
    if (now - lastTrigger.current >= 250) {
      lastTrigger.current = now;
      callbackRef.current();
    }
  };

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const root = scrollContainerRef.current;
    if (!sentinel || !root || !hasMore) return;
    const obs = new IntersectionObserver(
      (e) => e[0]?.isIntersecting && trigger(),
      { root, rootMargin: `${threshold}px`, threshold: 0.1 },
    );
    obs.observe(sentinel);
    return () => obs.disconnect();
  }, [hasMore, threshold]);

  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollHeight, scrollTop, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight <= threshold && hasMore) {
      trigger();
    }
  };

  return { scrollContainerRef, sentinelRef, onScroll };
}

interface ColumnHeaderProps {
  status: TaskStatus;
  count: number;
}

function TaskBoardColumnHeader({ status, count }: ColumnHeaderProps) {
  const { t } = useTranslation();
  const config = STATUS_CONFIG[status];

  return (
    <div
      className={cn(
        "mb-3 flex items-center justify-between gap-2 rounded-lg border px-2.5 py-2 text-xs font-bold tracking-wide",
        config.bg,
        config.border,
        config.text,
      )}
    >
      <span className="flex items-center gap-2 truncate">
        <span
          aria-hidden
          className={cn("size-2.5 shrink-0 rounded-full", config.dot)}
        />
        <span className="truncate">{t(`tasks.status.${status}`)}</span>
      </span>
      <span
        className={cn(
          "text-2xs shrink-0 rounded-full border bg-background/85 px-2 py-0.5 font-bold",
          config.border,
          config.text,
        )}
      >
        {count}
      </span>
    </div>
  );
}

interface CardListProps {
  tasks: TaskListItem[];
  draggedTaskId: string | null;
  onTaskClick: (task: TaskListItem) => void;
  onDragStart: (
    e: React.DragEvent<HTMLButtonElement>,
    task: TaskListItem,
  ) => void;
  onDragEnd: () => void;
}

function TaskBoardCardList({
  tasks,
  draggedTaskId,
  onTaskClick,
  onDragStart,
  onDragEnd,
}: CardListProps) {
  const { t } = useTranslation();

  if (tasks.length === 0) {
    return (
      <p className="text-muted-foreground border-border/80 rounded-xl border border-dashed p-6 text-center text-xs">
        {t("tasks.noBoardTasks")}
      </p>
    );
  }

  return (
    <>
      {tasks.map((task) => (
        <TaskBoardCard
          key={task.id}
          task={task}
          isDragging={draggedTaskId === task.id}
          onTaskClick={onTaskClick}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        />
      ))}
    </>
  );
}

interface ColumnFooterProps {
  hasMore: boolean;
  remaining: number;
  totalCount: number;
  sentinelRef: React.RefObject<HTMLDivElement | null>;
  onLoadMore: () => void;
}

function TaskBoardColumnFooter({
  hasMore,
  remaining,
  totalCount,
  sentinelRef,
  onLoadMore,
}: ColumnFooterProps) {
  const { t } = useTranslation();

  if (hasMore) {
    return (
      <>
        <div
          ref={sentinelRef}
          className="h-1 w-full shrink-0"
          aria-hidden="true"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onLoadMore}
          className="border-border/80 hover:bg-muted/80 text-muted-foreground hover:text-foreground mt-1 h-8 w-full shrink-0 cursor-pointer border-dashed text-xs font-medium transition-colors"
        >
          + {remaining}{" "}
          {t("tasks.board.moreTasks", {
            count: remaining,
            defaultValue: "Xem thêm",
          })}
        </Button>
      </>
    );
  }

  if (totalCount > 4) {
    return (
      <p className="text-muted-foreground/70 text-2xs shrink-0 py-2 text-center">
        {t("tasks.board.allLoaded", {
          count: totalCount,
          defaultValue: `Đã tải hết (${totalCount} công việc)`,
        })}
      </p>
    );
  }

  return null;
}

export function TaskBoardColumn({
  status,
  tasks,
  limit,
  isHovered,
  draggedTaskId,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragStart,
  onDragEnd,
  onTaskClick,
  onLoadMore,
}: TaskBoardColumnProps) {
  const visibleItems = tasks.slice(0, limit);
  const remaining = Math.max(0, tasks.length - limit);
  const { scrollContainerRef, sentinelRef, onScroll } = useInfiniteScroll({
    hasMore: remaining > 0,
    onLoadMore: () => onLoadMore(status),
  });

  return (
    <section
      onDragOver={(e) => onDragOver(e, status)}
      onDragLeave={(e) => onDragLeave(e, status)}
      onDrop={(e) => onDrop(e, status)}
      className={cn(
        "border-border flex w-full min-w-0 flex-col rounded-2xl border p-3 transition-colors duration-150",
        isHovered
          ? "bg-brand-orange/5 border-brand-orange/60 ring-brand-orange/20 ring-2"
          : "bg-muted/40",
      )}
    >
      <TaskBoardColumnHeader status={status} count={tasks.length} />
      <div
        ref={scrollContainerRef}
        onScroll={onScroll}
        className="flex max-h-[calc(100vh-270px)] min-h-[350px] flex-col gap-2.5 overflow-y-auto pr-1"
      >
        <TaskBoardCardList
          tasks={visibleItems}
          draggedTaskId={draggedTaskId}
          onTaskClick={onTaskClick}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        />
        <TaskBoardColumnFooter
          hasMore={remaining > 0}
          remaining={remaining}
          totalCount={tasks.length}
          sentinelRef={sentinelRef}
          onLoadMore={() => onLoadMore(status)}
        />
      </div>
    </section>
  );
}
