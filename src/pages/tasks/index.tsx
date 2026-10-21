import { useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useTasks } from "@/pages/tasks/hooks/useTasks";
import { TaskFilterBar } from "@/pages/tasks/components/TaskFilterBar";
import { TaskDetailPanel } from "@/pages/tasks/components/TaskDetailPanel";
import { TaskPagination } from "@/pages/tasks/components/TaskPagination";
import { TaskViewSwitcher, type TaskViewMode } from "@/pages/tasks/components/TaskViewSwitcher";
import { TaskActiveView } from "@/pages/tasks/components/views/TaskActiveView";
import { useTaskPanel } from "@/pages/tasks/hooks/useTaskPanel";
import { TaskWorkflowProvider, useTaskEditContext } from "@/pages/tasks/components/TaskWorkflowProvider";
import { taskDeadline } from "@/pages/tasks/utils/taskViewData";

function WorkspaceTaskView({ workspaceId, state }: { workspaceId: string; state: ReturnType<typeof useTasks> }) {
  const { t } = useTranslation();
  const [view, setView] = useState<TaskViewMode>("list");
  const panel = useTaskPanel(workspaceId);
  const { canLeave } = useTaskEditContext();

  const guard = async (action: () => void) => {
    if (await canLeave()) action();
  };

  const unscheduled = state.tasks.filter((task) => !taskDeadline(task)).length;

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-auto">
      <PageWrapper
        showGuideButton={false}
        title={t("tasks.title")}
        description={t("tasks.description")}
        actions={
          <TaskViewSwitcher
            currentView={view}
            onViewChange={(v) => guard(() => setView(v))}
            onRefresh={() => guard(() => void state.loadTasks())}
            loading={state.loading}
          />
        }
      >
        <div className="flex min-h-0 flex-1 flex-col gap-3 px-5 py-3">
          {state.refreshError && (
            <p role="status" className="text-destructive shrink-0 text-xs">
              {t("tasks.inline.refreshError")}
            </p>
          )}

          <TaskFilterBar
            search={state.search}
            onSearchChange={(value) => guard(() => state.setSearch(value))}
            typeFilter={state.typeFilter}
            onTypeFilterChange={(v) => guard(() => { state.setTypeFilter(v); state.setPage(0); })}
            statusFilter={state.statusFilter}
            onStatusFilterChange={(v) => guard(() => { state.setStatusFilter(v); state.setPage(0); })}
            onSearchSubmit={() => guard(() => void state.loadTasks())}
          />

          <div className="min-h-0 flex-1 overflow-auto">
            {state.loading && (
              <div role="status" className="flex items-center gap-2">
                <Spinner />
                {t("tasks.loading")}
              </div>
            )}

            {!state.loading && state.error && (
              <div role="alert" className="border-border bg-card rounded-xl border p-4">
                <p className="text-destructive">{t("tasks.error")}</p>
                <Button variant="outline" className="mt-3" onClick={() => void state.loadTasks()}>
                  {t("tasks.retry")}
                </Button>
              </div>
            )}

            {!state.loading && !state.error && (
              <TaskActiveView
                view={view}
                workspaceId={workspaceId}
                state={state}
                panel={panel}
                guard={guard}
                unscheduled={unscheduled}
              />
            )}
          </div>

          {(view !== "list" || state.tasks.length === 0) && (
            <TaskPagination
              page={state.page}
              totalPages={state.totalPages}
              totalElements={state.totalElements}
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
