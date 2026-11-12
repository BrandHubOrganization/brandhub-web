import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Info } from "lucide-react";
import { TaskTable } from "./TaskTable";
import { TaskCalendarTimeline } from "./TaskCalendarTimeline";
import { TaskBoardView } from "./TaskBoardView";
import { TaskGanttView } from "./TaskGanttView";
import { TaskUnscheduledAlert } from "./TaskUnscheduledAlert";
import { taskDeadline } from "@/pages/tasks/utils/taskViewData";
import { taskService } from "@/services/taskService";
import type { TaskActiveViewProps } from "./types/types";

export type { TaskActiveViewProps };

export function TaskActiveView({
  view,
  workspaceId,
  state,
  filteredTasks,
  panel,
  guard,
  isFiltered,
  onResetFilters,
}: TaskActiveViewProps) {
  const { t } = useTranslation();

  const unscheduledTasks = useMemo(
    () => filteredTasks.filter((t) => !taskDeadline(t)),
    [filteredTasks],
  );

  const showUnscheduledAlert =
    (view === "calendar" || view === "gantt") && unscheduledTasks.length > 0;

  return (
    <>
      {filteredTasks.length === 0 && (
        <p className="text-muted-foreground rounded-xl border p-6">
          {t(isFiltered ? "tasks.noMatches" : "tasks.empty")}
        </p>
      )}

      {showUnscheduledAlert ? (
        <TaskUnscheduledAlert
          tasks={unscheduledTasks}
          onTaskClick={panel.open}
        />
      ) : (
        view !== "list" &&
        view !== "board" && (
          <div className="bg-muted/60 text-2xs text-muted-foreground mb-4 inline-flex w-fit items-center gap-1.5 rounded-md px-2.5 py-1">
            <Info className="text-muted-foreground/80 size-3 shrink-0" />
            <span>{t("tasks.pageNotice")}</span>
          </div>
        )
      )}

      {view === "list" && filteredTasks.length > 0 && (
        <TaskTable
          tasks={filteredTasks}
          loading={state.loading}
          page={state.page}
          totalPages={state.totalPages}
          totalElements={state.totalElements}
          onPageChange={(value) => guard(() => state.setPage(value))}
          sortField={state.sortField}
          sortDirection={state.sortDirection}
          onSort={(value) => guard(() => state.handleSort(value))}
          onResetFilters={onResetFilters}
          isFiltered={isFiltered}
          activeTaskId={panel.taskId}
          onTaskClick={panel.open}
        />
      )}

      {view === "calendar" && (
        <TaskCalendarTimeline
          tasks={filteredTasks}
          onTaskClick={panel.open}
          workspaceId={workspaceId}
          onUpdated={() => void state.loadTasks(true)}
        />
      )}

      {view === "board" && (
        <TaskBoardView
          tasks={filteredTasks}
          onTaskClick={panel.open}
          workspaceId={workspaceId}
          onStatusChange={async (taskId, newStatus) => {
            await taskService.updateTaskStatus(workspaceId, taskId, newStatus);
            void state.loadTasks(true);
          }}
        />
      )}

      {view === "gantt" && (
        <TaskGanttView
          tasks={filteredTasks}
          onTaskClick={panel.open}
          workspaceId={workspaceId}
          onUpdated={() => void state.loadTasks(true)}
        />
      )}
    </>
  );
}
