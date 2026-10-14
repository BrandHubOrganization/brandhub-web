import { useState } from "react";
import type { TaskListItem, TaskStatus } from "@/types/task";
import { STATUS_CONFIG, PRIORITY_CONFIG } from "../constants";
import { Clock, GripVertical } from "lucide-react";

interface TaskBoardViewProps {
  tasks: TaskListItem[];
  onTaskClick: (task: TaskListItem) => void;
  onTaskStatusChange?: (taskId: string, newStatus: TaskStatus) => void;
}

const BOARD_COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: "BACKLOG", label: "Backlog" },
  { status: "ASSIGNED", label: "To Do / Assigned" },
  { status: "IN_PROGRESS", label: "In Progress" },
  { status: "MANAGER_REVIEW", label: "In Review" },
  { status: "COMPLETED", label: "Done" },
];

export function TaskBoardView({
  tasks,
  onTaskClick,
  onTaskStatusChange,
}: TaskBoardViewProps) {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [activeDropCol, setActiveDropCol] = useState<TaskStatus | null>(null);

  const getTasksByStatus = (status: TaskStatus) => {
    if (status === "MANAGER_REVIEW") {
      return tasks.filter(
        (t) =>
          t.status === "QC_REVIEW" ||
          t.status === "MANAGER_REVIEW" ||
          t.status === "CLIENT_REVIEW",
      );
    }
    return tasks.filter((t) => t.status === status);
  };

  const formatDate = (iso?: string | null) => {
    if (!iso) return null;
    try {
      const d = new Date(iso);
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "2-digit",
      }).format(d);
    } catch {
      return null;
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("text/plain", taskId);
    e.dataTransfer.effectAllowed = "move";
    setDraggedTaskId(taskId);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setActiveDropCol(null);
  };

  const handleDragOver = (e: React.DragEvent, colStatus: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (activeDropCol !== colStatus) {
      setActiveDropCol(colStatus);
    }
  };

  const handleDragLeave = (e: React.DragEvent, colStatus: TaskStatus) => {
    if (activeDropCol === colStatus) {
      setActiveDropCol(null);
    }
  };

  const handleDrop = (e: React.DragEvent, colStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain") || draggedTaskId;
    if (taskId && onTaskStatusChange) {
      onTaskStatusChange(taskId, colStatus);
    }
    setDraggedTaskId(null);
    setActiveDropCol(null);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 pt-1">
      {BOARD_COLUMNS.map((col) => {
        const colTasks = getTasksByStatus(col.status);
        const statusConf = STATUS_CONFIG[col.status] ?? STATUS_CONFIG.BACKLOG;
        const isColumnActive = activeDropCol === col.status;

        return (
          <div
            key={col.status}
            onDragOver={(e) => handleDragOver(e, col.status)}
            onDragLeave={(e) => handleDragLeave(e, col.status)}
            onDrop={(e) => handleDrop(e, col.status)}
            className={`border-border bg-muted/40 flex w-72 shrink-0 flex-col rounded-2xl border p-3 transition-colors duration-150 ${
              isColumnActive
                ? "border-brand-orange bg-brand-orange/5 ring-2 ring-brand-orange/20"
                : ""
            }`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <span className={`size-2 rounded-full ${statusConf.dot}`} />
                <span className="text-foreground text-xs font-semibold tracking-wide uppercase">
                  {col.label}
                </span>
              </div>
              <span className="border-border bg-background text-muted-foreground rounded-full border px-2 py-0.5 text-2xs font-semibold">
                {colTasks.length}
              </span>
            </div>

            {/* Task Cards Column */}
            <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto min-h-[300px]">
              {colTasks.length === 0 ? (
                <div
                  className={`border-border/60 text-muted-foreground/60 flex h-28 items-center justify-center rounded-xl border border-dashed text-xs transition-colors ${
                    isColumnActive ? "border-brand-orange text-brand-orange font-medium bg-brand-orange/10" : ""
                  }`}
                >
                  {isColumnActive ? "Thả công việc vào đây" : "Không có task"}
                </div>
              ) : (
                colTasks.map((task) => {
                  const pConf =
                    PRIORITY_CONFIG[task.priority ?? "MEDIUM"] ??
                    PRIORITY_CONFIG.MEDIUM;
                  const formattedDue = formatDate(task.dueDate);
                  const isDraggingThis = draggedTaskId === task.id;

                  return (
                    <div
                      key={task.id}
                      draggable={true}
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onDragEnd={handleDragEnd}
                      onClick={() => onTaskClick(task)}
                      className={`border-border bg-card hover:border-brand-orange/50 group flex cursor-grab active:cursor-grabbing flex-col gap-2 rounded-xl border p-3 shadow-2xs transition-all duration-150 ease-out hover:-translate-y-0.5 hover:shadow-md ${
                        isDraggingThis ? "opacity-40 scale-95 border-dashed border-brand-orange" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <GripVertical className="size-3.5 text-muted-foreground/40 group-hover:text-muted-foreground/80 transition-colors" />
                        <span
                          className={`text-2xs font-medium ${pConf.color}`}
                        >
                          {pConf.label}
                        </span>
                      </div>

                      <p className="text-foreground group-hover:text-brand-orange line-clamp-2 text-xs font-medium transition-colors">
                        {task.name}
                      </p>

                      <div className="border-border/60 text-muted-foreground flex items-center justify-between border-t pt-2 text-2xs">
                        <div className="flex items-center gap-1.5">
                          {task.assigneeName === "team" ? (
                            <div className="bg-purple-600 flex size-5 items-center justify-center rounded-full text-2xs font-semibold text-white">
                              T
                            </div>
                          ) : (
                            <div className="bg-amber-600 flex size-5 items-center justify-center rounded-full text-2xs font-semibold text-white">
                              {(task.assigneeName ?? "U")
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                          )}
                          <span className="truncate max-w-[100px]">
                            {task.assigneeName ?? "Unassigned"}
                          </span>
                        </div>

                        {formattedDue && (
                          <div className="flex items-center gap-1">
                            <Clock className="size-3" />
                            <span>{formattedDue}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
