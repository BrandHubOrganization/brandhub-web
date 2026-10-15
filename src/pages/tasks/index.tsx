import { useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  RefreshCw,
  List,
  Calendar,
  Kanban,
  GitCommitHorizontal,
} from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useTasks } from "@/pages/tasks/hooks/useTasks";
import { TaskFilterBar } from "@/pages/tasks/components/TaskFilterBar";
import { TaskTable } from "@/pages/tasks/components/TaskTable";
import { TaskCalendarTimeline } from "@/pages/tasks/components/TaskCalendarTimeline";
import { TaskBoardView } from "@/pages/tasks/components/TaskBoardView";
import { TaskGanttView } from "@/pages/tasks/components/TaskGanttView";
import { TaskDetailPanel } from "@/pages/tasks/components/TaskDetailPanel";
import { useTaskPanel } from "@/pages/tasks/hooks/useTaskPanel";
import {
  TaskWorkflowProvider,
  useTaskEditContext,
} from "@/pages/tasks/components/TaskWorkflowProvider";
import { taskDeadline } from "@/pages/tasks/taskViewData";

function WorkspaceTaskView({
  workspaceId,
  state,
}: {
  workspaceId: string;
  state: ReturnType<typeof useTasks>;
}) {
  const { t } = useTranslation();
  const [view, setView] = useState("list");
  const panel = useTaskPanel(workspaceId);
  const { canLeave } = useTaskEditContext();
  const guard = (action: () => void) => {
    if (canLeave()) action();
  };
  const views = [
    { key: "list", icon: List },
    { key: "calendar", icon: Calendar },
    { key: "board", icon: Kanban },
    { key: "gantt", icon: GitCommitHorizontal },
  ];
  const unscheduled = state.tasks.filter((task) => !taskDeadline(task)).length;
  const pagination = (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
      <p className="text-muted-foreground">
        {t("tasks.pagination", {
          page: state.page + 1,
          pages: Math.max(state.totalPages, 1),
          total: state.totalElements,
        })}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          disabled={state.page === 0 || state.loading}
          onClick={() => guard(() => state.setPage(state.page - 1))}
        >
          {t("tasks.previous")}
        </Button>
        <Button
          variant="outline"
          disabled={state.page + 1 >= state.totalPages || state.loading}
          onClick={() => guard(() => state.setPage(state.page + 1))}
        >
          {t("tasks.next")}
        </Button>
      </div>
    </div>
  );
  return (
    <div className="flex h-full min-h-0 min-w-0 overflow-hidden">
      <PageWrapper
        hideBanner
        showGuideButton={false}
        className="flex h-full min-h-0 min-w-0 flex-1 flex-col space-y-0 overflow-hidden p-0 md:p-0 [&>div:first-child]:shrink-0 [&>div:first-child]:flex-col [&>div:first-child]:items-stretch [&>div:first-child]:px-5 [&>div:first-child]:pt-4 [&>div:first-child>div:last-child]:flex-wrap [&>div:first-child>div:last-child]:self-stretch [&>div:last-child]:flex [&>div:last-child]:min-h-0 [&>div:last-child]:flex-1 [&>div:last-child]:flex-col"
        title={t("tasks.title")}
        description={t("tasks.description")}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="border-border bg-muted/60 flex flex-wrap items-center rounded-xl border p-1">
              {views.map(({ key, icon: Icon }) => (
                <Button
                  key={key}
                  variant={view === key ? "secondary" : "ghost"}
                  size="sm"
                  aria-pressed={view === key}
                  onClick={() => guard(() => setView(key))}
                >
                  <Icon aria-hidden className="size-3.5" />
                  {t(`tasks.views.${key}`)}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              disabled={state.loading}
              onClick={() => guard(() => void state.loadTasks())}
            >
              <RefreshCw aria-hidden className="size-4" />
              {t("tasks.refresh")}
            </Button>
          </div>
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
            onTypeFilterChange={(value) => {
              guard(() => {
                state.setTypeFilter(value);
                state.setPage(0);
              });
            }}
            statusFilter={state.statusFilter}
            onStatusFilterChange={(value) => {
              guard(() => {
                state.setStatusFilter(value);
                state.setPage(0);
              });
            }}
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
            {!state.loading && !state.error && (
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
                  <p className="text-muted-foreground text-xs">
                    {t("tasks.pageNotice")}
                  </p>
                )}
                {(view === "calendar" || view === "gantt") &&
                  unscheduled > 0 && (
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
                  />
                )}
                {view === "board" && (
                  <TaskBoardView tasks={state.tasks} onTaskClick={panel.open} />
                )}
                {view === "gantt" && (
                  <TaskGanttView tasks={state.tasks} onTaskClick={panel.open} />
                )}
              </>
            )}
          </div>
          {(view !== "list" || state.tasks.length === 0) && pagination}
        </div>
      </PageWrapper>
      {panel.taskId && (
        <TaskDetailPanel
          workspaceId={workspaceId}
          taskId={panel.taskId}
          isDesktop={panel.isDesktop}
          onClose={panel.close}
          onRestoreFocus={panel.restoreFocus}
          onUpdated={() => void state.loadTasks(true)}
        />
      )}
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
