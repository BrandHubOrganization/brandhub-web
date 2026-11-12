import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { SelectMenu } from "@/components/ui/select-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { taskService } from "@/services/taskService";
import { useAuthStore } from "@/store/authStore";
import type { Workspace } from "@/types/workspace";
const statuses: Record<string, string> = {
  TODO: "taskTodo",
  IN_PROGRESS: "taskProgress",
  IN_REVIEW: "taskReview",
  FINISHED: "taskFinished",
  CANCELLED: "taskCancelled",
};
export function AgencyTaskSection({
  workspaces,
  isOwner,
}: {
  workspaces: Workspace[];
  isOwner: boolean;
}) {
  const { t, i18n } = useTranslation();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  const userId = useAuthStore((s) => s.user?.id);
  const [selection, setSelection] = useState("");
  const [page, setPage] = useState(0);
  const workspaceId = workspaces.some((w) => w.id === selection)
    ? selection
    : workspaces[0]?.id;
  const query = useQuery({
    queryKey: ["agency-dashboard-tasks", userId, workspaceId, page],
    enabled: !!workspaceId && !!userId,
    staleTime: 30_000,
    retry: 1,
    queryFn: () =>
      taskService.getWorkspaceTasks(workspaceId!, { page, size: 20 }),
  });
  const tasks = (query.data?.content || []).filter(
    (task) => isOwner || task.assigneeId === userId,
  );
  return (
    <section className="bg-card min-w-0 space-y-4 rounded-xl border p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">
            {t(
              `dashboard.experience.${isOwner ? "workspaceTasks" : "myRecentTasks"}`,
            )}
          </h2>
          <p className="text-muted-foreground mt-1 text-xs">
            {t("dashboard.experience.taskScope")}
          </p>
        </div>
        {workspaceId && (
          <Button asChild variant="ghost" size="sm">
            <Link to={`/workspaces/${workspaceId}/tasks`}>
              {t("dashboard.experience.openTasks")}
            </Link>
          </Button>
        )}
      </div>
      {workspaces.length > 0 && (
        <SelectMenu
          value={workspaceId || ""}
          onChange={(value) => {
            setSelection(value);
            setPage(0);
          }}
          ariaLabel={t("dashboard.experience.selectWorkspace")}
          options={workspaces.map((ws) => ({ value: ws.id, label: ws.name }))}
          className="w-full sm:max-w-sm"
        />
      )}
      {!isOwner && workspaces.length > 0 && (
        <p className="text-muted-foreground text-xs">
          {t("dashboard.experience.mineScope")}
        </p>
      )}
      {!workspaceId ? (
        <p className="text-muted-foreground py-6 text-sm">
          {t("dashboard.experience.noWorkspace")}
        </p>
      ) : query.isPending ? (
        <div className="space-y-2" aria-busy="true">
          {[0, 1, 2].map((key) => (
            <Skeleton key={key} className="h-16 rounded-lg" />
          ))}
        </div>
      ) : query.isError ? (
        <div role="alert" className="rounded-lg border p-4 text-sm">
          {t("dashboard.experience.loadError")}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void query.refetch()}
          >
            {t("dashboard.experience.retry")}
          </Button>
        </div>
      ) : (
        <>
          <div className="divide-y">
            {tasks.length ? (
              tasks.map((task) => {
                const due = task.dueDate ? new Date(task.dueDate) : null;
                const valid = due && !Number.isNaN(due.getTime());
                if (valid && /^\d{4}-\d{2}-\d{2}$/.test(task.dueDate || ""))
                  due.setHours(23, 59, 59, 999);
                const overdue =
                  valid &&
                  due.getTime() < now &&
                  !["FINISHED", "CANCELLED"].includes(task.status);
                return (
                  <Link
                    key={task.id}
                    to={`/workspaces/${workspaceId}/tasks?task=${encodeURIComponent(task.id)}`}
                    className="hover:bg-muted/60 focus-visible:outline-brand-orange flex flex-wrap items-center justify-between gap-2 rounded-lg px-2 py-3 transition-colors focus-visible:outline-2"
                  >
                    <span
                      className="min-w-0 flex-1 truncate text-sm font-medium"
                      title={task.name}
                    >
                      {task.name}
                    </span>
                    <span className="bg-muted rounded-md px-2 py-1 text-xs">
                      {t(
                        `dashboard.experience.${statuses[task.status] || "unavailable"}`,
                      )}
                    </span>
                    <span
                      className={`w-32 text-right text-xs ${overdue ? "text-destructive" : "text-muted-foreground"}`}
                    >
                      {overdue && `${t("dashboard.experience.overdue")} · `}
                      {valid
                        ? due.toLocaleDateString(
                            i18n.language === "vi" ? "vi-VN" : "en-GB",
                          )
                        : t("dashboard.experience.noDeadline")}
                    </span>
                  </Link>
                );
              })
            ) : (
              <p className="text-muted-foreground py-6 text-sm">
                {t("dashboard.experience.noTasks")}
              </p>
            )}
          </div>
          <div className="flex items-center justify-end gap-3 border-t pt-3">
            <span className="text-muted-foreground text-xs">
              {t("dashboard.experience.page", {
                page: page + 1,
                total: Math.max(1, query.data?.totalPages || 1),
              })}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0 || query.isFetching}
              onClick={() => setPage((p) => p - 1)}
            >
              {t("dashboard.experience.previous")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={
                query.isFetching || page + 1 >= (query.data?.totalPages || 0)
              }
              onClick={() => setPage((p) => p + 1)}
            >
              {t("dashboard.experience.next")}
            </Button>
          </div>
        </>
      )}
    </section>
  );
}
