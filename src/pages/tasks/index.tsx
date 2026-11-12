import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useTasks } from "@/pages/tasks/hooks/useTasks";
import { useTaskFilters } from "@/pages/tasks/hooks/useTaskFilters";
import { TaskFilterBar } from "@/pages/tasks/components/TaskFilterBar";
import { TaskDetailPanel } from "@/pages/tasks/components/TaskDetailPanel";
import { TaskPagination } from "@/pages/tasks/components/TaskPagination";
import {
  TaskViewSwitcher,
  type TaskViewMode,
} from "@/pages/tasks/components/TaskViewSwitcher";
import { TaskActiveView } from "@/pages/tasks/components/views/TaskActiveView";
import { useTaskPanel } from "@/pages/tasks/hooks/useTaskPanel";
import {
  TaskWorkflowProvider,
  useTaskEditContext,
} from "@/pages/tasks/components/TaskWorkflowProvider";
import { taskDeadline } from "@/pages/tasks/utils/taskViewData";

function WorkspaceTaskView({
  workspaceId,
  state,
}: {
  workspaceId: string;
  state: ReturnType<typeof useTasks>;
}) {
  const { t } = useTranslation();
  const [view, setView] = useState<TaskViewMode>("list");
  const panel = useTaskPanel(workspaceId);
  const { canLeave } = useTaskEditContext();
  const filters = useTaskFilters(state.tasks, workspaceId);

  const { setPageSize, setPage } = state;
  useEffect(() => {
    setPageSize(100);
    setPage(0);
  }, [setPageSize, setPage]);

  const guard = async (action: () => void) => {
    if (await canLeave()) action();
  };

  const unscheduled = (filters.filteredTasks || []).filter(
    (task) => !taskDeadline(task),
  ).length;

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-x-hidden overflow-y-auto">
      <PageWrapper
        guideUrl="/help/guide#tasks"
        title={t("tasks.title")}
        description={t("tasks.description")}
      >
        <div className="flex min-h-0 flex-1 flex-col gap-3.5 pt-1">
          {state.refreshError && (
            <p role="status" className="text-destructive shrink-0 text-xs">
              {t("tasks.inline.refreshError")}
            </p>
          )}

          {/* Unified Single Toolbar: Left = View Tabs, Right = Filter & Action Controls */}
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
            <TaskViewSwitcher
              currentView={view}
              onViewChange={(v) => guard(() => setView(v))}
              showRefresh={false}
            />

            <TaskFilterBar
              search={filters.search}
              onSearchChange={(value) => guard(() => filters.setSearch(value))}
              assignees={filters.uniqueAssignees}
              selectedAssignees={filters.selectedAssignees}
              onToggleAssignee={(id) => guard(() => filters.toggleAssignee(id))}
              selectedStatuses={filters.selectedStatuses}
              onToggleStatus={(status) => guard(() => filters.toggleStatus(status))}
              selectedTypes={filters.selectedTypes}
              onToggleType={(type) => guard(() => filters.toggleType(type))}
              selectedSchedules={filters.selectedSchedules}
              onToggleSchedule={(sched) => guard(() => filters.toggleSchedule(sched))}
              parents={filters.uniqueParents}
              selectedParents={filters.selectedParents}
              onToggleParent={(id) => guard(() => filters.toggleParent(id))}
              selectedPriorities={filters.selectedPriorities}
              onTogglePriority={(priority) => guard(() => filters.togglePriority(priority))}
              reporters={filters.uniqueReporters}
              selectedReporters={filters.selectedReporters}
              onToggleReporter={(id) => guard(() => filters.toggleReporter(id))}
              selectedApprovals={filters.selectedApprovals}
              onToggleApproval={(appr) => guard(() => filters.toggleApproval(appr))}
              onClearCategory={(cat) => guard(() => filters.clearCategory(cat))}
              onClearFilters={() => guard(filters.clearAllFilters)}
              activeFilterCount={filters.activeFilterCount}
              sort={filters.sort}
              onSortChange={(sort) => guard(() => filters.setSort(sort))}
              onRefresh={() => guard(() => void state.loadTasks())}
              loading={state.loading}
            />
          </div>

          <div
            className={cn(
              "min-h-0 flex-1",
              view === "gantt"
                ? "overflow-x-hidden overflow-y-auto"
                : "overflow-auto",
            )}
          >
            {state.loading && state.tasks.length === 0 && (
              <div role="status" className="flex items-center gap-2 p-6">
                <Spinner />
                {t("tasks.loading")}
              </div>
            )}

            {!state.loading && state.error && state.tasks.length === 0 && (
              <div
                role="alert"
                className="border-border bg-card rounded-xl border p-4"
              >
                <p className="text-destructive">{t("tasks.error")}</p>
                <Button
                  variant="outline"
                  className="mt-3"
                  onClick={() => void state.loadTasks()}
                >
                  {t("tasks.retry")}
                </Button>
              </div>
            )}

            {(!state.loading || state.tasks.length > 0) &&
              (!state.error || state.tasks.length > 0) && (
                <TaskActiveView
                  view={view}
                  workspaceId={workspaceId}
                  state={state}
                  filteredTasks={filters.filteredTasks}
                  panel={panel}
                  guard={guard}
                  unscheduled={unscheduled}
                  isFiltered={filters.isFiltered}
                  onResetFilters={() => guard(filters.clearAllFilters)}
                />
              )}
          </div>

          {view === "list" && filters.filteredTasks.length > 0 && (
            <TaskPagination
              page={state.page}
              totalPages={state.totalPages}
              totalElements={filters.filteredTasks.length}
              loading={state.loading}
              onPageChange={(newPage) => guard(() => state.setPage(newPage))}
            />
          )}
        </div>
      </PageWrapper>

      <TaskDetailPanel
        workspaceId={workspaceId}
        taskId={panel.taskId}
        isOpen={Boolean(panel.taskId)}
        isDesktop={panel.isDesktop}
        onClose={panel.close}
        onRestoreFocus={panel.restoreFocus}
        onUpdated={() => void state.loadTasks(true)}
      />
    </div>
  );
}

function WorkspaceTasks({ workspaceId }: { workspaceId: string }) {
  const state = useTasks(workspaceId);
  return (
    <TaskWorkflowProvider onUpdated={() => void state.loadTasks(true)}>
      <WorkspaceTaskView workspaceId={workspaceId} state={state} />
    </TaskWorkflowProvider>
  );
}

export function TaskListPage() {
  const { id: workspaceId = "" } = useParams<{ id: string }>();
  return <WorkspaceTasks key={workspaceId} workspaceId={workspaceId} />;
}

export default TaskListPage;
