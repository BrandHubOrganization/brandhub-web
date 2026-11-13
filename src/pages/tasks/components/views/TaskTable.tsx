import { useState } from "react";
import type React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { STATUS_CONFIG } from "@/pages/tasks/constants";
import { TaskRowActions } from "@/pages/tasks/components/TaskRowActions";
import { TaskBulkActionBar } from "../TaskBulkActionBar";
import { TaskPriorityPicker } from "../TaskPriorityPicker";
import {
  formatTaskDate,
  SortableHeader,
  TableSkeletonRows,
  TableEmptyRow,
} from "./TaskTableParts";
import type { TaskTableProps } from "./types/types";

export type { TaskTableProps };

export function TaskTable(props: TaskTableProps) {
  const { t, i18n } = useTranslation();
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);

  const toggleSelectAll = () => {
    if (selectedTaskIds.length === props.tasks.length) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(props.tasks.map((task) => task.id));
    }
  };

  const toggleSelectTask = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedTaskIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const formatDate = (iso?: string | null) =>
    formatTaskDate(iso, i18n.language, t("tasks.missing"));

  return (
    <div className="border-border bg-card/90 flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border shadow-xs">
      <div
        data-task-scroll="list"
        className="min-h-0 flex-1 overflow-x-auto overflow-y-auto overscroll-contain"
      >
        <table className="w-full min-w-[960px] table-fixed border-collapse text-left text-sm">
          <thead className="bg-card sticky top-0 z-10 border-b">
            <tr className="border-border bg-muted/40 text-muted-foreground border-b text-xs font-semibold tracking-wider">
              <th className="w-12 px-3 py-3 text-center">
                <input
                  type="checkbox"
                  checked={
                    props.tasks.length > 0 &&
                    selectedTaskIds.length === props.tasks.length
                  }
                  onChange={toggleSelectAll}
                  aria-label="Chọn tất cả"
                  className="accent-brand-orange size-3.5 cursor-pointer rounded-sm"
                />
              </th>
              <SortableHeader
                field="name"
                sortField={props.sortField}
                sortDirection={props.sortDirection}
                onSort={props.onSort}
                label={t("tasks.inline.columns.work")}
                className="w-[280px] px-4"
              />
              <th className="w-[180px] px-3 py-3">{t("tasks.assignee")}</th>
              <th className="w-[120px] px-3 py-3">
                {t("tasks.priority.title", { defaultValue: "Độ ưu tiên" })}
              </th>
              <SortableHeader
                field="status"
                sortField={props.sortField}
                sortDirection={props.sortDirection}
                onSort={props.onSort}
                label={t("tasks.inline.columns.status")}
                className="w-[130px]"
              />
              <SortableHeader
                field="dueDate"
                sortField={props.sortField}
                sortDirection={props.sortDirection}
                onSort={props.onSort}
                label={t("tasks.deadline")}
                className="w-[140px]"
              />
              <th className="w-[110px] px-4 py-3 text-right">
                {t("tasks.inline.columns.actions")}
              </th>
            </tr>
          </thead>
          <tbody
            className={cn(
              "divide-border divide-y transition-opacity duration-150",
              props.loading && props.tasks.length > 0
                ? "opacity-60"
                : "opacity-100",
            )}
          >
            {props.loading && props.tasks.length === 0 ? (
              <TableSkeletonRows />
            ) : props.tasks.length === 0 ? (
              <TableEmptyRow
                isFiltered={props.isFiltered}
                onResetFilters={props.onResetFilters}
              />
            ) : (
              props.tasks.map((task) => {
                const isSelected = selectedTaskIds.includes(task.id);
                const status = task.status;
                const statusConf = STATUS_CONFIG[status] ?? STATUS_CONFIG.TODO;

                return (
                  <tr
                    key={task.id}
                    onClick={() => props.onTaskClick(task)}
                    className={cn(
                      "hover:bg-muted/40 group cursor-pointer transition-colors",
                      isSelected && "bg-muted/30",
                      props.activeTaskId === task.id &&
                        "bg-brand-orange/10 font-medium",
                    )}
                  >
                    <td
                      onClick={(e) => toggleSelectTask(e, task.id)}
                      className="w-12 px-3 py-2.5 text-center"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        aria-label={`Chọn task ${task.name}`}
                        className="accent-brand-orange size-3.5 cursor-pointer rounded-sm"
                      />
                    </td>
                    <td className="w-[280px] overflow-hidden px-4 py-2.5">
                      <div
                        className="flex max-w-[250px] min-w-0 flex-col"
                        title={task.name}
                      >
                        <span className="text-foreground group-hover:text-brand-orange truncate font-medium transition-colors">
                          {task.name}
                        </span>
                        <span className="text-muted-foreground truncate text-xs">
                          {t(`tasks.types.${task.type}`)}
                        </span>
                      </div>
                    </td>
                    <td
                      className="overflow-hidden px-3 py-2.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <TaskRowActions
                        task={task}
                        field="assignee"
                        onUpdated={props.onUpdated}
                      />
                    </td>
                    <td
                      className="px-3 py-2.5 whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <TaskPriorityPicker
                        workspaceId={props.workspaceId || task.workspaceId}
                        taskId={task.id}
                        priority={task.priority}
                        onUpdated={() => props.onUpdated?.()}
                      />
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span
                        title={`Trạng thái: ${t(`tasks.status.${status}`, { defaultValue: task.status })}`}
                        className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap ${statusConf.bg} ${statusConf.text} ${statusConf.border}`}
                      >
                        <span
                          className={`size-1.5 shrink-0 rounded-full ${statusConf.dot}`}
                        />
                        <span className="truncate">
                          {t(`tasks.status.${status}`, {
                            defaultValue: task.status,
                          })}
                        </span>
                      </span>
                    </td>
                    <td className="text-muted-foreground px-3 py-2.5 text-xs whitespace-nowrap">
                      {formatDate(task.dueDate)}
                    </td>
                    <td
                      className="px-4 py-2.5 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <TaskRowActions task={task} field="start" />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <footer className="border-border bg-card/60 flex shrink-0 flex-wrap items-center justify-between border-t px-4 py-3 text-sm">
        <span className="text-muted-foreground text-xs">
          Showing <b>{props.tasks.length}</b> of <b>{props.totalElements}</b>{" "}
          tasks
        </span>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={props.page <= 0 || props.loading}
            onClick={() => props.onPageChange(props.page - 1)}
            className="text-xs"
          >
            {t("tasks.previous")}
          </Button>
          <span className="text-muted-foreground text-xs">
            Page {props.page + 1} / {Math.max(props.totalPages, 1)}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={props.page + 1 >= props.totalPages || props.loading}
            onClick={() => props.onPageChange(props.page + 1)}
            className="text-xs"
          >
            {t("tasks.next")}
          </Button>
        </div>
      </footer>

      <TaskBulkActionBar
        selectedTaskIds={selectedTaskIds}
        workspaceId={props.workspaceId || ""}
        isAllSelected={
          props.tasks.length > 0 &&
          selectedTaskIds.length === props.tasks.length
        }
        onToggleSelectAll={toggleSelectAll}
        onClearSelection={() => setSelectedTaskIds([])}
        onUpdated={props.onUpdated}
      />
    </div>
  );
}
