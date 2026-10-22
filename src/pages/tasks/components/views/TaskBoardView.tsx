import { useTranslation } from "react-i18next";
import { Clock } from "lucide-react";
import type { TaskListItem } from "@/types/task";
import { STATUS_CONFIG } from "@/pages/tasks/constants";
import {
  canonicalTaskStatus,
  type CanonicalTaskStatus,
} from "@/pages/tasks/utils/taskStatus";
import { taskDeadline } from "@/pages/tasks/utils/taskViewData";

export function TaskBoardView({
  tasks,
  onTaskClick,
}: {
  tasks: TaskListItem[];
  onTaskClick: (task: TaskListItem) => void;
}) {
  const { t, i18n } = useTranslation();
  return (
    <div className="flex gap-4 overflow-x-auto pt-1 pb-4">
      {(Object.keys(STATUS_CONFIG) as CanonicalTaskStatus[]).map((status) => {
        const items = tasks.filter(
          (task) => canonicalTaskStatus(task.status) === status,
        );
        const config = STATUS_CONFIG[status];
        return (
          <section
            key={status}
            className="border-border bg-muted/40 flex w-72 shrink-0 flex-col rounded-2xl border p-3"
          >
            <h3 className="flex items-center justify-between gap-2 pb-3 text-xs font-semibold">
              <span className="flex items-center gap-2">
                <span
                  aria-hidden
                  className={`size-2 rounded-full ${config.dot}`}
                />
                {t(`tasks.status.${status}`)}
              </span>
              <span>{items.length}</span>
            </h3>
            <div className="flex min-h-[300px] flex-col gap-2.5">
              {items.length === 0 && (
                <p className="text-muted-foreground rounded-xl border border-dashed p-6 text-center text-xs">
                  {t("tasks.noBoardTasks")}
                </p>
              )}
              {items.map((task) => {
                const due = taskDeadline(task);
                return (
                  <button
                    type="button"
                    key={task.id}
                    data-task-open={task.id}
                    onClick={() => onTaskClick(task)}
                    className="border-border bg-card hover:border-brand-orange focus-visible:ring-ring space-y-3 rounded-xl border p-3 text-left shadow-xs outline-none focus-visible:ring-2"
                  >
                    <p className="text-muted-foreground text-xs">
                      {t(`tasks.types.${task.type}`)}
                    </p>
                    <p className="line-clamp-2 text-sm font-medium">
                      {task.name}
                    </p>
                    <p className="text-muted-foreground truncate text-xs">
                      {task.assigneeName ||
                        (task.assigneeId
                          ? t("tasks.unknownAssignee")
                          : t("tasks.unassigned"))}
                    </p>
                    {due && (
                      <p className="text-muted-foreground flex items-center gap-1 text-xs">
                        <Clock aria-hidden className="size-3" />
                        {new Intl.DateTimeFormat(i18n.language, {
                          dateStyle: "medium",
                        }).format(due)}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
