import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageWrapper from "@/components/layout/PageWrapper";
import {
  Plus,
  RefreshCw,
  List,
  Calendar as CalendarIcon,
  Kanban,
  GitCommitHorizontal,
} from "lucide-react";
import { useTasks } from "./hooks/useTasks";
import { TaskFilterBar } from "./components/TaskFilterBar";
import { TaskTable } from "./components/TaskTable";
import { TaskCalendarTimeline } from "./components/TaskCalendarTimeline";
import { TaskBoardView } from "./components/TaskBoardView";
import { TaskGanttView } from "./components/TaskGanttView";

export function TaskListPage() {
  const { id: workspaceId = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<
    "list" | "calendar" | "board" | "gantt"
  >("list");

  const {
    tasks,
    loading,
    page,
    setPage,
    totalPages,
    totalElements,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    sortField,
    handleSort,
    loadTasks,
    resetFilters,
    updateTaskStatus,
  } = useTasks(workspaceId);

  return (
    <PageWrapper
      title="Quản lý công việc (Task Management)"
      description="Quản lý tiến độ toàn diện với 4 chế độ hiển thị: Bảng Jira, Lịch phân bổ, Kanban Board và Gantt Timeline"
      actions={
        <div className="flex items-center gap-2">
          {/* 4 Task Views Switcher */}
          <div className="border-border bg-muted/60 flex items-center rounded-xl border p-1">
            <button
              type="button"
              onClick={() => setCurrentView("list")}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                currentView === "list"
                  ? "bg-card text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="size-3.5" />
              <span>List View</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentView("calendar")}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                currentView === "calendar"
                  ? "bg-card text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <CalendarIcon className="size-3.5" />
              <span>Calendar</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentView("board")}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                currentView === "board"
                  ? "bg-card text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Kanban className="size-3.5" />
              <span>Board</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentView("gantt")}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                currentView === "gantt"
                  ? "bg-card text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <GitCommitHorizontal className="size-3.5" />
              <span>Timeline</span>
            </button>
          </div>

          <button
            onClick={() => loadTasks()}
            className="border-border bg-card text-muted-foreground hover:bg-muted inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium transition-colors cursor-pointer"
          >
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
            <span>Làm mới</span>
          </button>
          <button
            onClick={() =>
              navigate(`/workspaces/${workspaceId}/content-writing`)
            }
            className="bg-brand-orange hover:bg-brand-orange/90 inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium text-white shadow-xs transition-all cursor-pointer"
          >
            <Plus className="size-4" />
            <span>Tạo Task mới</span>
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <TaskFilterBar
          search={search}
          onSearchChange={setSearch}
          typeFilter={typeFilter}
          onTypeFilterChange={(val) => {
            setTypeFilter(val);
            setPage(0);
          }}
          statusFilter={statusFilter}
          onStatusFilterChange={(val) => {
            setStatusFilter(val);
            setPage(0);
          }}
          onSearchSubmit={loadTasks}
        />

        <div className="transition-all duration-200">
          {currentView === "list" && (
            <div className="animate-in fade-in-50 duration-200">
              <TaskTable
                tasks={tasks}
                loading={loading}
                page={page}
                totalPages={totalPages}
                totalElements={totalElements}
                onPageChange={setPage}
                sortField={sortField}
                onSort={handleSort}
                onResetFilters={resetFilters}
                isFiltered={Boolean(search.trim() || statusFilter !== "ALL" || typeFilter !== "ALL")}
                onTaskClick={(task) =>
                  navigate(`/workspaces/${workspaceId}/editor?taskId=${task.id}`)
                }
              />
            </div>
          )}

          {currentView === "calendar" && (
            <div className="animate-in fade-in-50 duration-200">
              <TaskCalendarTimeline
                tasks={tasks}
                onTaskClick={(task) =>
                  navigate(`/workspaces/${workspaceId}/editor?taskId=${task.id}`)
                }
              />
            </div>
          )}

          {currentView === "board" && (
            <div className="animate-in fade-in-50 duration-200">
              <TaskBoardView
                tasks={tasks}
                onTaskClick={(task) =>
                  navigate(`/workspaces/${workspaceId}/editor?taskId=${task.id}`)
                }
                onTaskStatusChange={updateTaskStatus}
              />
            </div>
          )}

          {currentView === "gantt" && (
            <div className="animate-in fade-in-50 duration-200">
              <TaskGanttView
                tasks={tasks}
                onTaskClick={(task) =>
                  navigate(`/workspaces/${workspaceId}/editor?taskId=${task.id}`)
                }
              />
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}

export default TaskListPage;
