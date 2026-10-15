import { useState } from "react";
import type { TaskListItem } from "@/types/task";
import { Calendar, MoveHorizontal } from "lucide-react";

interface TaskGanttViewProps {
  tasks: TaskListItem[];
  onTaskClick: (task: TaskListItem) => void;
  onTaskSpanChange?: (taskId: string, newStartCol: number, newSpan: number) => void;
}

export function TaskGanttView({
  tasks,
  onTaskClick,
  onTaskSpanChange,
}: TaskGanttViewProps) {
  // Days of current view window (14 days)
  const days = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 3 + i);
    return d;
  });

  // Local state for interactive gantt bars offset/span
  const [taskBarPositions, setTaskBarPositions] = useState<
    Record<string, { startCol: number; span: number }>
  >({});
  const [draggedBarId, setDraggedBarId] = useState<string | null>(null);

  const formatDateShort = (d: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "narrow",
      day: "numeric",
    }).format(d);
  };

  const getBarPosition = (taskId: string, rowIdx: number) => {
    if (taskBarPositions[taskId]) {
      return taskBarPositions[taskId];
    }
    const defaultStart = (rowIdx % 8) + 1;
    const defaultSpan = Math.min((rowIdx % 4) + 2, 6);
    return { startCol: defaultStart, span: defaultSpan };
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("text/plain", taskId);
    e.dataTransfer.effectAllowed = "move";
    setDraggedBarId(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDropOnDay = (e: React.DragEvent, dayColIndex: number, rowIdx: number) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain") || draggedBarId;
    if (taskId) {
      const currentPos = getBarPosition(taskId, rowIdx);
      const newStart = Math.max(1, Math.min(dayColIndex + 1, 14 - currentPos.span + 1));
      setTaskBarPositions((prev) => ({
        ...prev,
        [taskId]: { startCol: newStart, span: currentPos.span },
      }));
      if (onTaskSpanChange) {
        onTaskSpanChange(taskId, newStart, currentPos.span);
      }
    }
    setDraggedBarId(null);
  };

  return (
    <div className="border-border bg-card overflow-hidden rounded-2xl border shadow-xs">
      {/* Header bar */}
      <div className="border-border bg-muted/40 flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Calendar className="text-brand-orange size-4" />
          <span className="text-foreground text-xs font-semibold uppercase tracking-wider">
            Waterfall Timeline & Milestones
          </span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground text-2xs font-mono">
          <MoveHorizontal className="size-3 text-brand-orange" />
          <span>Kéo thả thanh tiến độ để đổi ngày mốc</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[850px]">
          {/* Header Days Row */}
          <div className="border-border bg-muted/20 text-muted-foreground grid grid-cols-[280px_1fr] border-b text-xs font-semibold">
            <div className="border-border border-r px-4 py-2.5">Task Name</div>
            <div className="grid grid-cols-14 text-center">
              {days.map((day, idx) => {
                const isToday =
                  day.toDateString() === new Date().toDateString();
                return (
                  <div
                    key={idx}
                    className={`py-2 text-2xs border-border/40 border-r last:border-r-0 ${
                      isToday
                        ? "bg-brand-orange/15 font-bold text-brand-orange"
                        : ""
                    }`}
                  >
                    {formatDateShort(day)}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Task Rows */}
          <div className="divide-border divide-y">
            {tasks.map((task, rowIdx) => {
              const { startCol, span: colSpan } = getBarPosition(task.id, rowIdx);
              const isDraggingThis = draggedBarId === task.id;

              return (
                <div
                  key={task.id}
                  className="hover:bg-muted/40 group grid grid-cols-[280px_1fr] items-center transition-colors text-xs"
                >
                  {/* Task details on left */}
                  <div
                    onClick={() => onTaskClick(task)}
                    className="border-border flex items-center border-r px-4 py-3 cursor-pointer"
                  >
                    <span className="text-foreground group-hover:text-brand-orange truncate font-medium transition-colors">
                      {task.name}
                    </span>
                  </div>

                  {/* Gantt Bar area with Drop Zones for all 14 columns */}
                  <div className="relative h-full py-2 px-1">
                    <div className="grid grid-cols-14 h-full items-center relative">
                      {/* Interactive Day Drop Targets */}
                      {days.map((_, dayIdx) => (
                        <div
                          key={dayIdx}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDropOnDay(e, dayIdx, rowIdx)}
                          className="h-full border-r border-border/20 last:border-r-0 hover:bg-brand-orange/10 transition-colors cursor-crosshair"
                        />
                      ))}

                      {/* Draggable Gantt Bar overlay */}
                      <div
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onDragEnd={() => setDraggedBarId(null)}
                        onClick={() => onTaskClick(task)}
                        style={{
                          gridColumnStart: startCol,
                          gridColumnEnd: `span ${colSpan}`,
                        }}
                        className={`absolute inset-y-1.5 rounded-md px-2.5 flex items-center justify-between text-2xs font-semibold text-white shadow-2xs transition-all duration-150 cursor-grab active:cursor-grabbing hover:scale-[1.01] hover:shadow-md ${
                          isDraggingThis ? "opacity-50 scale-95 ring-2 ring-white" : ""
                        } ${
                          task.status === "COMPLETED"
                            ? "bg-emerald-600"
                            : task.status === "IN_PROGRESS"
                              ? "bg-brand-orange"
                              : "bg-indigo-600"
                        }`}
                      >
                        <span className="truncate">{task.name}</span>
                        <span className="opacity-90 font-mono text-3xs ml-1 shrink-0">
                          {task.status === "COMPLETED" ? "100%" : "60%"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
