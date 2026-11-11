import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FolderUp,
  Loader2,
  Sparkles,
  Trash2,
  UploadCloud,
  Video,
  X,
  XCircle,
} from "lucide-react";
import {
  useBackgroundTaskStore,
  type BackgroundTask,
} from "@/store/backgroundTaskStore";

export function CircularPercent({
  percent,
  size = 34,
  strokeWidth = 3.2,
}: {
  percent: number;
  size?: number;
  strokeWidth?: number;
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div
      className="relative inline-flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/60 dark:text-zinc-800"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-brand-orange transition-all duration-300 ease-out"
        />
      </svg>
      <span className="absolute text-[9px] font-bold tabular-nums text-foreground">
        {clamped}%
      </span>
    </div>
  );
}

function TaskIcon({ task }: { task: BackgroundTask }) {
  if (task.status === "CANCEL_CLEANUP") {
    return <Loader2 className="h-4 w-4 animate-spin text-amber-500 shrink-0" />;
  }
  if (task.status === "COMPLETED") {
    return <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />;
  }
  if (task.status === "CANCELLED") {
    return <Trash2 className="h-4 w-4 text-muted-foreground shrink-0" />;
  }
  if (task.status === "FAILED") {
    return <XCircle className="h-5 w-5 text-destructive shrink-0" />;
  }
  return <CircularPercent percent={task.progress} />;
}

function TypeBadgeIcon({ type }: { type: BackgroundTask["type"] }) {
  switch (type) {
    case "AI_IMAGE":
      return <Sparkles className="h-3.5 w-3.5 text-brand-orange" />;
    case "AI_VIDEO":
      return <Video className="h-3.5 w-3.5 text-brand-orange" />;
    case "DRIVE_IMPORT":
      return <FolderUp className="h-3.5 w-3.5 text-brand-orange" />;
    default:
      return <UploadCloud className="h-3.5 w-3.5 text-brand-orange" />;
  }
}

export function BackgroundTaskDock() {
  const navigate = useNavigate();
  const {
    tasks,
    isDockMinimized,
    setDockMinimized,
    cancelTask,
    dismissTask,
    clearFinishedTasks,
  } = useBackgroundTaskStore();
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  if (tasks.length === 0) return null;

  const runningTasks = tasks.filter(
    (t) => t.status === "RUNNING" || t.status === "CANCEL_CLEANUP",
  );
  const overallPercent =
    runningTasks.length > 0
      ? Math.round(
          runningTasks.reduce((sum, t) => sum + t.progress, 0) /
            runningTasks.length,
        )
      : 100;

  const headerTitle =
    runningTasks.length > 0
      ? `Đang xử lý ${runningTasks.length} tiến trình • ${overallPercent}%`
      : `Hoàn tất ${tasks.filter((t) => t.status === "COMPLETED").length}/${tasks.length} tác vụ`;

  return (
    <aside
      aria-label="Tiến trình chạy ngầm"
      className="fixed bottom-4 right-4 z-50 w-[340px] sm:w-[390px] overflow-hidden rounded-2xl border border-border/80 bg-card shadow-2xl transition-all duration-200"
    >
      {/* Google Drive-style dark header bar */}
      <div className="flex items-center justify-between gap-2 bg-[#16171B] px-4 py-3 text-white">
        <button
          type="button"
          onClick={() => setDockMinimized(!isDockMinimized)}
          className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
        >
          {runningTasks.length > 0 ? (
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-orange opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand-orange" />
            </span>
          ) : (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          )}
          <span className="truncate text-xs font-semibold tracking-tight text-white">
            {headerTitle}
          </span>
        </button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setDockMinimized(!isDockMinimized)}
            className="rounded-lg p-1 text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
            title={isDockMinimized ? "Mở rộng" : "Thu gọn"}
          >
            {isDockMinimized ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          {runningTasks.length === 0 && (
            <button
              type="button"
              onClick={clearFinishedTasks}
              className="rounded-lg p-1 text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
              title="Đóng khay tác vụ"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Smooth overall progress bar when minimized or active */}
      {runningTasks.length > 0 && (
        <div className="h-1 w-full bg-zinc-800/30">
          <div
            className="h-full bg-gradient-to-r from-brand-orange to-amber-400 transition-all duration-300 ease-out"
            style={{ width: `${Math.max(4, overallPercent)}%` }}
          />
        </div>
      )}

      {!isDockMinimized && (
        <div className="max-h-80 divide-y divide-border/60 overflow-y-auto bg-card">
          {tasks.map((task) => {
            const isExpanded = expandedTaskId === task.id;
            const hasSubItems = task.items.length > 1;
            const isRunning = task.status === "RUNNING";
            const isCleaning = task.status === "CANCEL_CLEANUP";

            return (
              <div
                key={task.id}
                className="p-3.5 transition-colors hover:bg-muted/20"
              >
                <div className="flex items-start gap-3">
                  <TaskIcon task={task} />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <TypeBadgeIcon type={task.type} />
                      <p className="truncate text-xs font-semibold text-foreground">
                        {task.title}
                      </p>
                    </div>
                    <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                      {task.subtitle}
                    </p>

                    {/* Linear progress bar with % inside task row */}
                    {(isRunning || isCleaning) && (
                      <div className="mt-2 space-y-1">
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ease-out ${
                              isCleaning
                                ? "w-full animate-pulse bg-amber-500"
                                : "bg-brand-orange"
                            }`}
                            style={
                              isCleaning
                                ? undefined
                                : { width: `${Math.max(3, task.progress)}%` }
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-medium text-muted-foreground">
                          <span>
                            {task.type === "DRIVE_IMPORT"
                              ? task.totalItems > 0
                                ? `${task.completedItems}/${task.totalItems} tệp${task.importedFolders ? ` • ${task.importedFolders} thư mục` : ""}`
                                : task.importedFolders
                                  ? `Đã quét ${task.importedFolders} thư mục...`
                                  : "Đang quét thư mục Drive..."
                              : task.totalItems > 1
                                ? `${task.completedItems}/${task.totalItems} tệp`
                                : "Đang xử lý ngầm"}
                          </span>
                          <span className="font-semibold tabular-nums text-brand-orange">
                            {Math.round(task.progress)}%
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Action buttons row */}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {isRunning && (
                        <button
                          type="button"
                          onClick={() => void cancelTask(task.id)}
                          className="inline-flex items-center gap-1 rounded-md border border-destructive/30 bg-destructive/10 px-2 py-1 text-[11px] font-semibold text-destructive transition-colors hover:bg-destructive hover:text-white"
                        >
                          <X className="h-3 w-3" />
                          {task.type === "UPLOAD_BATCH"
                            ? "Huỷ & xoá dở"
                            : task.type === "DRIVE_IMPORT"
                              ? "Huỷ import"
                              : "Huỷ"}
                        </button>
                      )}

                      {task.status === "COMPLETED" && task.targetRoute && (
                        <button
                          type="button"
                          onClick={() => navigate(task.targetRoute!)}
                          className="inline-flex items-center gap-1 rounded-md bg-brand-orange/10 px-2 py-1 text-[11px] font-semibold text-brand-orange transition-colors hover:bg-brand-orange hover:text-white"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Mở xem
                        </button>
                      )}

                      {hasSubItems && (
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedTaskId(isExpanded ? null : task.id)
                          }
                          className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                          {isExpanded ? "Ẩn chi tiết" : `Chi tiết (${task.items.length})`}
                        </button>
                      )}
                    </div>
                  </div>

                  {!isRunning && !isCleaning && (
                    <button
                      type="button"
                      onClick={() => dismissTask(task.id)}
                      className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      title="Xoá khỏi danh sách"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Expandable per-file list for folder/multi-file uploads */}
                {isExpanded && hasSubItems && (
                  <div className="mt-2.5 max-h-36 space-y-1.5 overflow-y-auto rounded-xl border border-border/60 bg-muted/30 p-2">
                    {task.items.map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center justify-between gap-2 text-[11px]"
                      >
                        <span className="truncate text-foreground/90">
                          {sub.name}
                        </span>
                        <span
                          className={`shrink-0 font-semibold tabular-nums ${
                            sub.status === "COMPLETED"
                              ? "text-emerald-600 dark:text-emerald-400"
                              : sub.status === "UPLOADING"
                                ? "text-brand-orange"
                                : sub.status === "FAILED" ||
                                    sub.status === "CANCELLED"
                                  ? "text-destructive"
                                  : "text-muted-foreground"
                          }`}
                        >
                          {sub.status === "COMPLETED"
                            ? "100%"
                            : sub.status === "UPLOADING"
                              ? `${sub.progress}%`
                              : sub.status === "CANCELLED"
                                ? "Đã huỷ"
                                : sub.status === "FAILED"
                                  ? "Lỗi"
                                  : "Chờ"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </aside>
  );
}
