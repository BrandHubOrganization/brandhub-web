import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowUpDown, FolderKanban, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STATUS_CONFIG, PRIORITY_CONFIG } from "@/pages/tasks/constants";
import { canonicalTaskStatus } from "@/pages/tasks/taskStatus";
import { TaskRowActions } from "@/pages/tasks/components/TaskRowActions";
import type { TaskListItem, TaskPriority } from "@/types/task";

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
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const formatDate = (iso?: string | null) => {
    if (!iso) return t("tasks.missing");
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return iso;
      return new Intl.DateTimeFormat(i18n.language, {
        dateStyle: "short",
        timeStyle: "short",
      }).format(d);
    } catch {
      return iso;
    }
  };

  const renderPriority = (priority?: TaskPriority) => {
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
  };

  return (
    <div className="border-border bg-card/90 flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border shadow-xs">
      <div
        data-task-scroll="list"
        className="min-h-0 flex-1 overflow-x-auto overflow-y-auto overscroll-contain"
      >
        <table className="w-full min-w-[960px] table-fixed border-collapse text-left text-sm">
          <thead className="bg-card sticky top-0 z-10 border-b">
            <tr className="border-border bg-muted/40 text-muted-foreground border-b text-xs font-semibold tracking-wider">
              {/* Checkbox column */}
              <th className="w-12 px-3 py-3 text-center">
                <input
                  type="checkbox"
                  checked={props.tasks.length > 0 && selectedTaskIds.length === props.tasks.length}
                  onChange={toggleSelectAll}
                  aria-label="Chọn tất cả"
                  className="accent-brand-orange size-3.5 cursor-pointer rounded-sm"
                />
              </th>

              {/* Work / Title */}
              <th
                onClick={() => props.onSort("name")}
                className="hover:text-foreground w-[280px] cursor-pointer px-4 py-3 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>{t("tasks.inline.columns.work")}</span>
                  <ArrowUpDown
                    className={`size-3 ${props.sortField === "name" ? "text-brand-orange" : "opacity-40"}`}
                  />
                </div>
              </th>

              {/* Assignee */}
              <th className="w-[180px] px-3 py-3">{t("tasks.assignee")}</th>

              {/* Priority */}
              <th className="w-[110px] px-3 py-3">Độ ưu tiên</th>

              {/* Status */}
              <th
                onClick={() => props.onSort("status")}
                className="hover:text-foreground w-[130px] cursor-pointer px-3 py-3 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>{t("tasks.inline.columns.status")}</span>
                  <ArrowUpDown
                    className={`size-3 ${props.sortField === "status" ? "text-brand-orange" : "opacity-40"}`}
                  />
                </div>
              </th>

              {/* Due date */}
              <th
                onClick={() => props.onSort("dueDate")}
                className="hover:text-foreground w-[140px] cursor-pointer px-3 py-3 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>{t("tasks.deadline")}</span>
                  <ArrowUpDown
                    className={`size-3 ${props.sortField === "dueDate" ? "text-brand-orange" : "opacity-40"}`}
                  />
                </div>
              </th>

              {/* Actions */}
              <th className="w-[110px] px-4 py-3 text-right">{t("tasks.inline.columns.actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-border divide-y">
            {props.loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-3 py-3"><div className="bg-muted mx-auto size-3.5 rounded-sm" /></td>
                  <td className="px-3 py-3"><div className="bg-muted h-4 w-48 rounded-md" /></td>
                  <td className="px-3 py-3"><div className="bg-muted h-4 w-28 rounded-md" /></td>
                  <td className="px-3 py-3"><div className="bg-muted h-4 w-16 rounded-md" /></td>
                  <td className="px-3 py-3"><div className="bg-muted h-4 w-20 rounded-md" /></td>
                  <td className="px-3 py-3"><div className="bg-muted h-4 w-24 rounded-md" /></td>
                  <td className="px-3 py-3"><div className="bg-muted ml-auto h-4 w-16 rounded-md" /></td>
                </tr>
              ))
            ) : props.tasks.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center">
                  <FolderKanban className="text-muted-foreground/40 mx-auto size-12" />
                  <p className="text-foreground mt-3 font-medium">Không tìm thấy công việc nào</p>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    {props.isFiltered
                      ? "Không có công việc nào khớp với bộ lọc hiện tại."
                      : "Chưa có công việc nào trong không gian này."}
                  </p>
                  {props.isFiltered && props.onResetFilters && (
                    <button
                      type="button"
                      onClick={props.onResetFilters}
                      className="border-border bg-card text-foreground hover:bg-muted shadow-2xs mt-3.5 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors"
                    >
                      <RotateCcw className="text-brand-orange size-3.5" />
                      <span>Xóa bộ lọc</span>
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              props.tasks.map((task) => {
                const isSelected = selectedTaskIds.includes(task.id);
                const status = canonicalTaskStatus(task.status);
                const statusConf = STATUS_CONFIG[status] ?? STATUS_CONFIG.TODO;

                return (
                  <tr
                    key={task.id}
                    onClick={() => props.onTaskClick(task)}
                    className={`hover:bg-muted/40 group cursor-pointer transition-colors ${
                      isSelected ? "bg-muted/30" : ""
                    } ${props.activeTaskId === task.id ? "bg-brand-orange/10 font-medium" : ""}`}
                  >
                    {/* Checkbox */}
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

                    {/* Work / Title */}
                    <td className="w-[280px] px-4 py-2.5 overflow-hidden">
                      <div className="flex flex-col max-w-[250px] min-w-0" title={task.name}>
                        <span className="text-foreground group-hover:text-brand-orange truncate font-medium transition-colors">
                          {task.name}
                        </span>
                        <span className="text-muted-foreground text-xs truncate">
                          {t(`tasks.types.${task.type}`)}
                        </span>
                      </div>
                    </td>

                    {/* Assignee */}
                    <td className="px-3 py-2.5 overflow-hidden" onClick={(event) => event.stopPropagation()}>
                      <TaskRowActions task={task} field="assignee" />
                    </td>

                    {/* Priority */}
                    <td className="px-3 py-2.5 whitespace-nowrap" title={`Độ ưu tiên: ${PRIORITY_CONFIG[task.priority ?? "MEDIUM"]?.label ?? "Medium"}`}>
                      {renderPriority(task.priority)}
                    </td>

                    {/* Status Badge */}
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span
                        title={`Trạng thái: ${t(`tasks.status.${status}`, { defaultValue: task.status })}`}
                        className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-medium ${statusConf.bg} ${statusConf.text} ${statusConf.border}`}
                      >
                        <span className={`size-1.5 rounded-full shrink-0 ${statusConf.dot}`} />
                        <span className="truncate">
                          {t(`tasks.status.${status}`, { defaultValue: task.status })}
                        </span>
                      </span>
                    </td>

                    {/* Due date */}
                    <td className="text-muted-foreground px-3 py-2.5 text-xs whitespace-nowrap">
                      {formatDate(task.dueDate)}
                    </td>

                    {/* Actions */}
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

      {/* Pagination Footer */}
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
