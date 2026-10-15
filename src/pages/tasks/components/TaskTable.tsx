import { useTranslation } from "react-i18next";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STATUS_CONFIG } from "@/pages/tasks/constants";
import { canonicalTaskStatus } from "@/pages/tasks/taskStatus";
import { TaskRowActions } from "@/pages/tasks/components/TaskRowActions";
import type { TaskListItem } from "@/types/task";
interface Props {
  tasks: TaskListItem[];
  loading: boolean;
  page: number;
  totalPages: number;
  totalElements: number;
  onPageChange: (page: number) => void;
  sortField: "dueDate" | "createdAt" | "name" | "status";
  onSort: (field: "dueDate" | "createdAt" | "name" | "status") => void;
  onTaskClick: (task: TaskListItem) => void;
  activeTaskId?: string;
  onResetFilters?: () => void;
  isFiltered?: boolean;
}
export function TaskTable(props: Props) {
  const { t } = useTranslation();
  function sort(label: string, field: "name" | "status" | "dueDate") {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 h-8 text-xs"
        onClick={() => props.onSort(field)}
      >
        {label}
        <ArrowUpDown aria-hidden className="size-3" />
      </Button>
    );
  }
  return (
    <div className="bg-card flex h-full min-h-0 flex-col overflow-hidden rounded-xl border">
      <div
        data-task-scroll="list"
        className="min-h-0 flex-1 overflow-auto overscroll-contain"
      >
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-card sticky top-0 z-10 border-b">
            <tr className="text-muted-foreground text-xs">
              <th className="min-w-48 px-3 py-2">
                {sort(t("tasks.inline.columns.work"), "name")}
              </th>
              <th className="min-w-36 px-3 py-2">{t("tasks.assignee")}</th>
              <th className="min-w-28 px-3 py-2">
                {sort(t("tasks.inline.columns.status"), "status")}
              </th>
              <th className="min-w-40 px-3 py-2">
                {sort(t("tasks.deadline"), "dueDate")}
              </th>
              <th className="px-3 py-2">{t("tasks.inline.columns.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {props.tasks.map((task) => {
              const status = canonicalTaskStatus(task.status);
              const color = STATUS_CONFIG[status] || STATUS_CONFIG.TODO;
              return (
                <tr
                  key={task.id}
                  onClick={() => props.onTaskClick(task)}
                  className={`hover:bg-muted/40 cursor-pointer border-b last:border-b-0 ${props.activeTaskId === task.id ? "bg-brand-orange/10" : ""}`}
                >
                  <td className="max-w-64 px-3 py-3">
                    <Button
                      variant="link"
                      className="text-foreground h-auto max-w-full justify-start p-0 text-left"
                      data-task-open={task.id}
                      aria-current={
                        task.id === props.activeTaskId ? "true" : undefined
                      }
                      onClick={(event) => {
                        event.stopPropagation();
                        props.onTaskClick(task);
                      }}
                    >
                      <span className="truncate">{task.name}</span>
                    </Button>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {t(`tasks.types.${task.type}`)}
                    </p>
                  </td>
                  <td className="px-3 py-3">
                    <TaskRowActions task={task} field="assignee" />
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`inline-flex rounded-md border px-2 py-1 text-xs whitespace-nowrap ${color.bg} ${color.text} ${color.border}`}
                    >
                      {t(`tasks.status.${status}`, {
                        defaultValue: task.status,
                      })}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <TaskRowActions task={task} field="deadline" />
                  </td>
                  <td className="px-3 py-3">
                    <TaskRowActions task={task} field="start" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <footer className="bg-card flex shrink-0 flex-wrap items-center justify-between gap-2 border-t px-3 py-2 text-xs">
        <p className="text-muted-foreground">
          {t("tasks.pagination", {
            page: props.page + 1,
            pages: Math.max(props.totalPages, 1),
            total: props.totalElements,
          })}
        </p>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={props.page === 0 || props.loading}
            onClick={() => props.onPageChange(props.page - 1)}
          >
            {t("tasks.previous")}
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={props.page + 1 >= props.totalPages || props.loading}
            onClick={() => props.onPageChange(props.page + 1)}
          >
            {t("tasks.next")}
          </Button>
        </div>
      </footer>
    </div>
  );
}
