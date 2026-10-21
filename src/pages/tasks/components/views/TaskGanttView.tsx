import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import type { TaskListItem } from "@/types/task";
import { deadlineColumn, taskDeadline } from "@/pages/tasks/utils/taskViewData";

export function TaskGanttView({
  tasks,
  onTaskClick,
}: {
  tasks: TaskListItem[];
  onTaskClick: (task: TaskListItem) => void;
}) {
  const { t, i18n } = useTranslation();
  const [offset, setOffset] = useState(0);
  const days = Array.from({ length: 14 }, (_, index) => {
    const day = new Date();
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - 3 + index + offset);
    return day;
  });
  const format = (date: Date) =>
    new Intl.DateTimeFormat(i18n.language, {
      day: "numeric",
      month: "short",
    }).format(date);
  return (
    <section className="border-border bg-card overflow-hidden rounded-2xl border shadow-xs">
      <div className="border-border bg-muted/40 flex flex-wrap items-center justify-between gap-3 border-b p-3">
        <h3 className="text-sm font-semibold">{t("tasks.timeline")}</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOffset((value) => value - 14)}
          >
            {t("tasks.previous")}
          </Button>
          <span className="text-xs">
            {format(days[0])} – {format(days[13])}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOffset((value) => value + 14)}
          >
            {t("tasks.next")}
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[850px]">
          <div className="border-border grid grid-cols-[280px_1fr] border-b">
            <div className="p-3 text-sm">{t("tasks.title")}</div>
            <div className="grid grid-cols-14">
              {days.map((day) => (
                <span
                  key={day.toISOString()}
                  className="border-border border-l p-2 text-center text-xs"
                >
                  {format(day)}
                </span>
              ))}
            </div>
          </div>
          {tasks.map((task) => {
            const column = deadlineColumn(task, days);
            const deadline = taskDeadline(task);
            return (
              <div
                key={task.id}
                className="border-border grid grid-cols-[280px_1fr] border-b last:border-b-0"
              >
                <button
                  type="button"
                  data-task-open={task.id}
                  onClick={() => onTaskClick(task)}
                  className="hover:bg-muted/40 focus-visible:ring-ring p-3 text-left text-sm outline-none focus-visible:ring-2"
                >
                  <span className="block truncate">{task.name}</span>
                  <span className="text-muted-foreground text-xs">
                    {deadline ? format(deadline) : t("tasks.missing")}
                  </span>
                </button>
                <div className="border-border grid grid-cols-14 items-center border-l p-2">
                  {column && (
                    <button
                      type="button"
                      aria-label={`${task.name} · ${t("tasks.deadline")}`}
                      title={deadline?.toLocaleString(i18n.language)}
                      onClick={() => onTaskClick(task)}
                      style={{ gridColumn: column }}
                      className="bg-brand-orange focus-visible:ring-ring mx-auto size-3 rotate-45 rounded-sm focus-visible:ring-2"
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
