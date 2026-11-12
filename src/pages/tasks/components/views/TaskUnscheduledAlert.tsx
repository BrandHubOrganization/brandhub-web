import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AlertTriangle,
  Calendar,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  FileText,
  Megaphone,
  Video,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { JiraStatusLozenge } from "@/pages/tasks/components/JiraSubtaskUI";
import { cn } from "@/lib/utils";
import type { TaskType } from "@/types/task";
import type {
  TaskUnscheduledAlertProps,
  TaskUnscheduledItemProps,
} from "./types/types";

export type { TaskUnscheduledAlertProps, TaskUnscheduledItemProps };

function getTaskTypeIcon(type: TaskType) {
  switch (type) {
    case "POST":
      return FileText;
    case "LIVESTREAM":
      return Video;
    case "SURVEY":
      return ClipboardList;
    case "EVENT_PLAN":
      return Calendar;
    case "PRESS_RECOMMENDATION":
      return Megaphone;
    default:
      return FileText;
  }
}

function TaskUnscheduledItem({ task, onTaskClick }: TaskUnscheduledItemProps) {
  const { t } = useTranslation();
  const Icon = getTaskTypeIcon(task.type);
  const assignee = task.assigneeName || t("tasks.unscheduledAlert.unassigned");

  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    onTaskClick(task);
  };

  return (
    <div
      onClick={() => onTaskClick(task)}
      className="group flex cursor-pointer flex-wrap items-center justify-between gap-2.5 rounded-md p-2 transition-colors hover:bg-amber-500/10 active:scale-[0.99] dark:hover:bg-amber-500/15"
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span
          className="flex size-6 shrink-0 items-center justify-center rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-300"
          title={t(`tasks.types.${task.type}`, { defaultValue: task.type })}
        >
          <Icon className="size-3.5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            {task.key && (
              <span className="text-2xs text-muted-foreground shrink-0 font-mono">
                {task.key}
              </span>
            )}
            <span className="text-foreground group-hover:text-brand-orange truncate text-xs font-medium transition-colors">
              {task.name}
            </span>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <span className="text-2xs text-muted-foreground hidden max-w-[120px] truncate sm:inline-block">
          {assignee}
        </span>
        <JiraStatusLozenge status={task.status} />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAction}
          className="text-2xs border-brand-orange/40 text-brand-orange hover:bg-brand-orange/10 dark:hover:bg-brand-orange/20 h-6 cursor-pointer gap-1 px-2 active:scale-[0.97]"
        >
          <Calendar className="size-3" />
          <span>{t("tasks.unscheduledAlert.setDeadline")}</span>
        </Button>
      </div>
    </div>
  );
}

export function TaskUnscheduledAlert({
  tasks,
  onTaskClick,
  className,
}: TaskUnscheduledAlertProps) {
  const { t } = useTranslation();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  if (tasks.length === 0) return null;

  if (isDismissed) {
    return (
      <div className="mb-4 flex items-center justify-between gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-900 transition-all duration-200 ease-out dark:bg-amber-500/15 dark:text-amber-200">
        <div className="flex items-center gap-1.5 font-medium">
          <AlertTriangle className="size-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>{t("tasks.unscheduledBadge", { count: tasks.length })}</span>
        </div>
        <button
          type="button"
          onClick={() => setIsDismissed(false)}
          className="text-2xs inline-flex cursor-pointer items-center font-medium text-amber-700 underline-offset-2 transition-colors hover:text-amber-950 hover:underline active:scale-[0.97] dark:text-amber-300 dark:hover:text-amber-100"
        >
          {t("tasks.showNotice")}
        </button>
      </div>
    );
  }

  return (
    <div
      role="status"
      className={cn(
        "relative mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 shadow-2xs transition-all duration-200 ease-out sm:p-3.5 dark:bg-amber-500/15",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0 rounded-md bg-amber-500/20 p-1 text-amber-600 dark:text-amber-400">
          <AlertTriangle className="size-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0 flex-1 pr-2">
              <p className="text-xs leading-snug font-semibold text-amber-900 dark:text-amber-200">
                {t("tasks.unscheduledAlert.title", {
                  count: tasks.length,
                  defaultValue: t("tasks.unscheduled", { count: tasks.length }),
                })}
              </p>
              <p className="text-2xs mt-0.5 leading-relaxed text-amber-800/80 dark:text-amber-300/80">
                {t("tasks.unscheduledAlert.description", {
                  defaultValue: t("tasks.pageNotice"),
                })}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsExpanded((prev) => !prev)}
                className="h-7 cursor-pointer gap-1 rounded-md border-amber-500/30 bg-amber-500/10 px-2.5 text-xs text-amber-900 transition-all hover:bg-amber-500/20 active:scale-[0.97] dark:text-amber-200"
              >
                <span>
                  {isExpanded
                    ? t("tasks.unscheduledAlert.collapse")
                    : t("tasks.unscheduledAlert.viewList", {
                        count: tasks.length,
                      })}
                </span>
                {isExpanded ? (
                  <ChevronUp className="size-3.5" />
                ) : (
                  <ChevronDown className="size-3.5" />
                )}
              </Button>

              <button
                type="button"
                onClick={() => setIsDismissed(true)}
                title={t("tasks.unscheduledAlert.dismiss")}
                aria-label={t("tasks.unscheduledAlert.dismiss")}
                className="inline-flex size-7 cursor-pointer items-center justify-center rounded-md text-amber-700/70 transition-colors hover:bg-amber-500/20 hover:text-amber-900 active:scale-[0.97] dark:text-amber-300/70 dark:hover:bg-amber-500/30 dark:hover:text-amber-100"
              >
                <X className="size-3.5" />
              </button>
            </div>
          </div>

          {isExpanded && (
            <div className="bg-card/60 animate-in fade-in-0 mt-2.5 max-h-64 divide-y divide-amber-500/20 overflow-y-auto rounded-lg border border-amber-500/25 p-1 duration-200 ease-out">
              {tasks.map((task) => (
                <TaskUnscheduledItem
                  key={task.id}
                  task={task}
                  onTaskClick={onTaskClick}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
