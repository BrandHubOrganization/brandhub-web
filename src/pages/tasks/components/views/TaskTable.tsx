import { useState } from "react";
import type React from "react";
import { useTranslation } from "react-i18next";
import { ArrowUpDown, FolderKanban, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STATUS_CONFIG, PRIORITY_CONFIG } from "@/pages/tasks/constants";
import { TaskRowActions } from "@/pages/tasks/components/TaskRowActions";
import type { TaskPriority } from "@/types/task";
import type { TaskTableProps } from "./types/types";

export type { TaskTableProps };

function formatTaskDate(iso: string | null | undefined, lang: string, fallback: string): string {
  if (!iso) return fallback;
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return new Intl.DateTimeFormat(lang, { dateStyle: "short", timeStyle: "short" }).format(d);
  } catch {
    return iso;
  }
}

function TaskPriorityBadge({ priority }: { priority?: TaskPriority }) {
  const p = priority ?? "MEDIUM";
  const conf = PRIORITY_CONFIG[p] ?? PRIORITY_CONFIG.MEDIUM;
  return (
    <div className="flex items-center gap-1.5 text-xs font-medium">
      <span className="flex flex-col gap-0.5">
        <span className={`h-0.5 w-3 rounded-full ${conf.barColor}`} />
        <span className={`h-0.5 w-3 rounded-full ${conf.barColor}`} />
      </span>
      <span className={conf.color}>{conf.label}</span>
    </div>
  );
}

interface SortableHeaderProps {
  field: "name" | "status" | "dueDate";
  sortField?: string;
  onSort: (field: "name" | "status" | "dueDate") => void;
  label: string;
  className: string;
}

function SortableHeader({ field, sortField, onSort, label, className }: SortableHeaderProps) {
  const active = sortField === field;
  return (
    <th
      onClick={() => onSort(field)}
      className={`hover:text-foreground cursor-pointer px-3 py-3 transition-colors ${className}`}
    >
      <div className="flex items-center gap-1.5">
        <span>{label}</span>
        <ArrowUpDown className={`size-3 ${active ? "text-brand-orange" : "opacity-40"}`} />
      </div>
    </th>
  );
}

function TableSkeletonRows() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <tr key={i} className="animate-pulse">
          <td className="px-3 py-3"><div className="bg-muted mx-auto size-3.5 rounded-sm" /></td>
          <td className="px-3 py-3"><div className="bg-muted h-4 w-48 rounded-md" /></td>
          <td className="px-3 py-3"><div className="bg-muted h-4 w-28 rounded-md" /></td>
          <td className="px-3 py-3"><div className="bg-muted h-4 w-16 rounded-md" /></td>
          <td className="px-3 py-3"><div className="bg-muted h-4 w-20 rounded-md" /></td>
          <td className="px-3 py-3"><div className="bg-muted h-4 w-24 rounded-md" /></td>
          <td className="px-3 py-3"><div className="bg-muted ml-auto h-4 w-16 rounded-md" /></td>
        </tr>
      ))}
    </>
  );
}

function TableEmptyRow({
  isFiltered,
  onResetFilters,
}: {
  isFiltered?: boolean;
  onResetFilters?: () => void;
}) {
  return (
    <tr>
      <td colSpan={7} className="py-12 text-center">
        <FolderKanban className="text-muted-foreground/40 mx-auto size-12" />
        <p className="text-foreground mt-3 font-medium">Không tìm thấy công việc nào</p>
        <p className="text-muted-foreground mt-0.5 text-xs">
          {isFiltered
            ? "Không có công việc nào khớp với bộ lọc hiện tại."
            : "Chưa có công việc nào trong không gian này."}
        </p>
        {isFiltered && onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="border-border bg-card text-foreground hover:bg-muted mt-3.5 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium shadow-2xs transition-colors"
          >
            <RotateCcw className="text-brand-orange size-3.5" />
            <span>Xóa bộ lọc</span>
          </button>
        )}
      </td>
    </tr>
  );
}

export function TaskTable(props: TaskTableProps) {
  const { t, i18n } = useTranslation();
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);

  const toggleSelectAll = () => {
    if (selectedTaskIds.length === props.tasks.length) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(props.tasks.map((t) => t.id));
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
      <div data-task-scroll="list" className="min-h-0 flex-1 overflow-x-auto overflow-y-auto overscroll-contain">
        <table className="w-full min-w-[960px] table-fixed border-collapse text-left text-sm">
          <thead className="bg-card sticky top-0 z-10 border-b">
            <tr className="border-border bg-muted/40 text-muted-foreground border-b text-xs font-semibold tracking-wider">
              <th className="w-12 px-3 py-3 text-center">
                <input
                  type="checkbox"
                  checked={props.tasks.length > 0 && selectedTaskIds.length === props.tasks.length}
                  onChange={toggleSelectAll}
                  aria-label="Chọn tất cả"
                  className="accent-brand-orange size-3.5 cursor-pointer rounded-sm"
                />
              </th>
              <SortableHeader
                field="name"
                sortField={props.sortField}
                onSort={props.onSort}
                label={t("tasks.inline.columns.work")}
                className="w-[280px] px-4"
              />
              <th className="w-[180px] px-3 py-3">{t("tasks.assignee")}</th>
              <th className="w-[110px] px-3 py-3">Độ ưu tiên</th>
              <SortableHeader
                field="status"
                sortField={props.sortField}
                onSort={props.onSort}
                label={t("tasks.inline.columns.status")}
                className="w-[130px]"
              />
              <SortableHeader
                field="dueDate"
                sortField={props.sortField}
                onSort={props.onSort}
                label={t("tasks.deadline")}
                className="w-[140px]"
              />
              <th className="w-[110px] px-4 py-3 text-right">{t("tasks.inline.columns.actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-border divide-y">
            {props.loading ? (
              <TableSkeletonRows />
            ) : props.tasks.length === 0 ? (
              <TableEmptyRow isFiltered={props.isFiltered} onResetFilters={props.onResetFilters} />
            ) : (
              props.tasks.map((task) => {
                const isSelected = selectedTaskIds.includes(task.id);
                const status = task.status;
                const statusConf = STATUS_CONFIG[status] ?? STATUS_CONFIG.TODO;

                return (
                  <tr
                    key={task.id}
                    onClick={() => props.onTaskClick(task)}
                    className={`hover:bg-muted/40 group cursor-pointer transition-colors ${
                      isSelected ? "bg-muted/30" : ""
                    } ${props.activeTaskId === task.id ? "bg-brand-orange/10 font-medium" : ""}`}
                  >
                    <td onClick={(e) => toggleSelectTask(e, task.id)} className="w-12 px-3 py-2.5 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        aria-label={`Chọn task ${task.name}`}
                        className="accent-brand-orange size-3.5 cursor-pointer rounded-sm"
                      />
                    </td>
                    <td className="w-[280px] overflow-hidden px-4 py-2.5">
                      <div className="flex max-w-[250px] min-w-0 flex-col" title={task.name}>
                        <span className="text-foreground group-hover:text-brand-orange truncate font-medium transition-colors">
                          {task.name}
                        </span>
                        <span className="text-muted-foreground truncate text-xs">
                          {t(`tasks.types.${task.type}`)}
                        </span>
                      </div>
                    </td>
                    <td className="overflow-hidden px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                      <TaskRowActions task={task} field="assignee" />
                    </td>
                    <td
                      className="px-3 py-2.5 whitespace-nowrap"
                      title={`Độ ưu tiên: ${PRIORITY_CONFIG[task.priority ?? "MEDIUM"]?.label ?? "Medium"}`}
                    >
                      <TaskPriorityBadge priority={task.priority} />
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span
                        title={`Trạng thái: ${t(`tasks.status.${status}`, { defaultValue: task.status })}`}
                        className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap ${statusConf.bg} ${statusConf.text} ${statusConf.border}`}
                      >
                        <span className={`size-1.5 shrink-0 rounded-full ${statusConf.dot}`} />
                        <span className="truncate">{t(`tasks.status.${status}`, { defaultValue: task.status })}</span>
                      </span>
                    </td>
                    <td className="text-muted-foreground px-3 py-2.5 text-xs whitespace-nowrap">
                      {formatDate(task.dueDate)}
                    </td>
                    <td className="px-4 py-2.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
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
          Showing <b>{props.tasks.length}</b> of <b>{props.totalElements}</b> tasks
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
    </div>
  );
}
