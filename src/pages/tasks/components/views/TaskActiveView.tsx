import { useTranslation } from "react-i18next";
import type { TaskViewMode } from "@/pages/tasks/components/TaskViewSwitcher";
import { TaskTable } from "@/pages/tasks/components/views/TaskTable";
import { TaskCalendarTimeline } from "@/pages/tasks/components/views/TaskCalendarTimeline";
import { TaskBoardView } from "@/pages/tasks/components/views/TaskBoardView";
import { TaskGanttView } from "@/pages/tasks/components/views/TaskGanttView";
import type { useTasks } from "@/pages/tasks/hooks/useTasks";
import type { useTaskPanel } from "@/pages/tasks/hooks/useTaskPanel";

interface TaskActiveViewProps {
  view: TaskViewMode;
  workspaceId: string;
  state: ReturnType<typeof useTasks>;
  panel: ReturnType<typeof useTaskPanel>;
  guard: (action: () => void) => void;
  unscheduled: number;
}

export function TaskActiveView({
  view,
  workspaceId,
  state,
  panel,
  guard,
  unscheduled,
}: TaskActiveViewProps) {
  const { t } = useTranslation();

  return (
    <>
      {state.tasks.length === 0 && (
        <p className="text-muted-foreground rounded-xl border p-6">
          {t(
            state.search.trim() ||
              state.statusFilter !== "ALL" ||
              state.typeFilter !== "ALL"
              ? "tasks.noMatches"
              : "tasks.empty",
          )}
        </p>
      )}

      {view !== "list" && (
        <p className="text-muted-foreground text-xs">{t("tasks.pageNotice")}</p>
      )}

      {(view === "calendar" || view === "gantt") && unscheduled > 0 && (
        <p role="status" className="text-muted-foreground text-sm">
          {t("tasks.unscheduled", { count: unscheduled })}
        </p>
      )}

      {view === "list" && state.tasks.length > 0 && (
        <TaskTable
          tasks={state.tasks}
          loading={state.loading}
          page={state.page}
          totalPages={state.totalPages}
          totalElements={state.totalElements}
          onPageChange={(value) => guard(() => state.setPage(value))}
          sortField={state.sortField}
          onSort={(value) => guard(() => state.handleSort(value))}
          onResetFilters={() => guard(state.resetFilters)}
          isFiltered={Boolean(
            state.search ||
            state.typeFilter !== "ALL" ||
            state.statusFilter !== "ALL",
          )}
          activeTaskId={panel.taskId}
          onTaskClick={panel.open}
        />
      )}

      {view === "calendar" && (
        <TaskCalendarTimeline
          tasks={state.tasks}
          onTaskClick={panel.open}
          workspaceId={workspaceId}
          onUpdated={() => void state.loadTasks(true)}
        />
      )}

      {view === "board" && (
        <TaskBoardView tasks={state.tasks} onTaskClick={panel.open} />
      )}

      {view === "gantt" && (
        <TaskGanttView tasks={state.tasks} onTaskClick={panel.open} />
      )}
    </>
  );
}
