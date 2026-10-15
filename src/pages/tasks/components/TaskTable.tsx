import React from "react";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  ChevronDown,
  RotateCcw,
} from "lucide-react";
import type { TaskListItem, TaskPriority } from "@/types/task";
import { STATUS_CONFIG, PRIORITY_CONFIG } from "../constants";

interface TaskTableProps {
  tasks: TaskListItem[];
  loading: boolean;
  page: number;
  totalPages: number;
  totalElements: number;
  onPageChange: (newPage: number) => void;
  sortField: "dueDate" | "createdAt" | "name" | "status";
  onSort: (field: "dueDate" | "createdAt" | "name" | "status") => void;
  onTaskClick: (task: TaskListItem) => void;
  onResetFilters?: () => void;
  isFiltered?: boolean;
}

export function TaskTable({
  tasks,
  loading,
  page,
  totalPages,
  totalElements,
  onPageChange,
  sortField,
  onSort,
  onTaskClick,
  onResetFilters,
  isFiltered,
}: TaskTableProps) {
  const [selectedTaskIds, setSelectedTaskIds] = React.useState<string[]>([]);

  const toggleSelectAll = () => {
    if (selectedTaskIds.length === tasks.length) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(tasks.map((t) => t.id));
    }
  };

  const toggleSelectTask = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (selectedTaskIds.includes(id)) {
      setSelectedTaskIds(selectedTaskIds.filter((item) => item !== id));
    } else {
      setSelectedTaskIds([...selectedTaskIds, id]);
    }
  };

  const formatDate = (iso?: string | null) => {
    if (!iso) return "None";
    try {
      const d = new Date(iso);
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
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
    <div className="border-border bg-card/90 overflow-hidden rounded-2xl border shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-border bg-muted/40 text-muted-foreground border-b text-xs font-semibold tracking-wider">
              {/* Checkbox column */}
              <th className="w-10 px-3 py-3.5 text-center">
                <input
                  type="checkbox"
                  checked={tasks.length > 0 && selectedTaskIds.length === tasks.length}
                  onChange={toggleSelectAll}
                  className="accent-brand-orange size-3.5 rounded-sm cursor-pointer"
                />
              </th>

              {/* Work / Task Name */}
              <th
                onClick={() => onSort("name")}
                className="hover:text-foreground min-w-[260px] cursor-pointer px-3 py-3.5 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Work</span>
                  <ArrowUpDown
                    className={`size-3 ${sortField === "name" ? "text-brand-orange" : "opacity-40"}`}
                  />
                </div>
              </th>

              {/* Assignee */}
              <th className="min-w-[150px] px-3 py-3.5">Assignee</th>

              {/* Priority */}
              <th className="min-w-[110px] px-3 py-3.5">Priority</th>

              {/* Status */}
              <th
                onClick={() => onSort("status")}
                className="hover:text-foreground min-w-[130px] cursor-pointer px-3 py-3.5 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Status</span>
                  <ArrowUpDown
                    className={`size-3 ${sortField === "status" ? "text-brand-orange" : "opacity-40"}`}
                  />
                </div>
              </th>

              {/* Due date */}
              <th
                onClick={() => onSort("dueDate")}
                className="hover:text-foreground min-w-[140px] cursor-pointer px-3 py-3.5 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Due date</span>
                  <ArrowUpDown
                    className={`size-3 ${sortField === "dueDate" ? "text-brand-orange" : "opacity-40"}`}
                  />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-border divide-y">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-3 py-3"><div className="bg-muted size-3.5 rounded-sm mx-auto" /></td>
                  <td className="px-3 py-3"><div className="bg-muted h-4 w-48 rounded-md" /></td>
                  <td className="px-3 py-3"><div className="bg-muted h-4 w-28 rounded-md" /></td>
                  <td className="px-3 py-3"><div className="bg-muted h-4 w-16 rounded-md" /></td>
                  <td className="px-3 py-3"><div className="bg-muted h-4 w-20 rounded-md" /></td>
                  <td className="px-3 py-3"><div className="bg-muted h-4 w-24 rounded-md" /></td>
                </tr>
              ))
            ) : tasks.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center">
                  <FolderKanban className="text-muted-foreground/40 mx-auto size-12" />
                  <p className="text-foreground mt-3 font-medium">Không tìm thấy công việc nào</p>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    {isFiltered
                      ? "Không có công việc nào khớp với bộ lọc hiện tại."
                      : "Chưa có công việc nào trong không gian này."}
                  </p>
                  {isFiltered && onResetFilters && (
                    <button
                      type="button"
                      onClick={onResetFilters}
                      className="border-border bg-card text-foreground hover:bg-muted mt-3.5 inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium shadow-2xs transition-colors cursor-pointer"
                    >
                      <RotateCcw className="size-3.5 text-brand-orange" />
                      <span>Xóa bộ lọc</span>
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              tasks.map((task) => {
                const isSelected = selectedTaskIds.includes(task.id);
                const statusConf = STATUS_CONFIG[task.status] ?? STATUS_CONFIG.BACKLOG;

                return (
                  <tr
                    key={task.id}
                    onClick={() => onTaskClick(task)}
                    className={`hover:bg-muted/40 group cursor-pointer transition-colors ${
                      isSelected ? "bg-muted/30" : ""
                    }`}
                  >
                    {/* Checkbox */}
                    <td
                      onClick={(e) => toggleSelectTask(e, task.id)}
                      className="px-3 py-2.5 text-center"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="accent-brand-orange size-3.5 rounded-sm cursor-pointer"
                      />
                    </td>

                    {/* Work / Title */}
                    <td className="px-3 py-2.5">
                      <div className="flex items-center" title={task.name}>
                        <span className="text-foreground group-hover:text-brand-orange truncate font-medium transition-colors">
                          {task.name}
                        </span>
                      </div>
                    </td>

                    {/* Assignee */}
                    <td className="px-3 py-2.5">
                      <div
                        className="flex items-center gap-2"
                        title={task.assigneeName ? `Người phụ trách: ${task.assigneeName}` : "Chưa phân công"}
                      >
                        {task.assigneeName === "team" ? (
                          <div className="bg-purple-600 flex size-5.5 items-center justify-center rounded-full text-2xs font-semibold text-white">
                            T
                          </div>
                        ) : (
                          <div className="bg-amber-600/90 flex size-5.5 items-center justify-center rounded-full text-2xs font-semibold text-white">
                            {(task.assigneeName ?? "U").charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="text-foreground/90 truncate text-xs">
                          {task.assigneeName ?? "Unassigned"}
                        </span>
                      </div>
                    </td>

                    {/* Priority */}
                    <td className="px-3 py-2.5" title={`Độ ưu tiên: ${PRIORITY_CONFIG[task.priority ?? "MEDIUM"]?.label ?? "Medium"}`}>
                      {renderPriority(task.priority)}
                    </td>

                    {/* Status Badge */}
                    <td className="px-3 py-2.5">
                      <span
                        title={`Trạng thái: ${statusConf.defaultLabel}`}
                        className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-semibold ${statusConf.bg} ${statusConf.text} ${statusConf.border}`}
                      >
                        <span className="truncate">{statusConf.defaultLabel}</span>
                        <ChevronDown className="size-3 shrink-0 opacity-60" />
                      </span>
                    </td>

                    {/* Due date */}
                    <td className="text-muted-foreground px-3 py-2.5 text-xs whitespace-nowrap">
                      {formatDate(task.dueDate)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="border-border bg-card/60 flex items-center justify-between border-t px-4 py-3 text-sm">
        <span className="text-muted-foreground text-xs">
          Showing <b>{tasks.length}</b> of <b>{totalElements}</b> tasks
        </span>
        <div className="flex items-center gap-2">
          <button
            disabled={page <= 0 || loading}
            onClick={() => onPageChange(page - 1)}
            className="border-border hover:bg-muted disabled:opacity-40 inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors"
          >
            <ChevronLeft className="size-4" />
            <span>Prev</span>
          </button>
          <span className="text-muted-foreground text-xs">
            Page {page + 1} / {totalPages || 1}
          </span>
          <button
            disabled={page + 1 >= totalPages || loading}
            onClick={() => onPageChange(page + 1)}
            className="border-border hover:bg-muted disabled:opacity-40 inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors"
          >
            <span>Next</span>
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
