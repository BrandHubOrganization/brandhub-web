import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useTaskWorkflow } from "@/pages/tasks/hooks/useTaskWorkflow";
import { TaskApprovalSection } from "@/pages/tasks/components/TaskApprovalSection";
import { workflowError } from "@/pages/tasks/taskWorkflowErrors";

export function ApprovalDetail({
  workspaceId,
  taskId,
  onBack,
}: {
  workspaceId: string;
  taskId: string;
  onBack: () => void;
}) {
  const { t } = useTranslation();
  const state = useTaskWorkflow(workspaceId, taskId);
  const task = state.query.data;
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (task?.id) heading.current?.focus({ preventScroll: true });
  }, [task?.id]);
  return (
    <section
      aria-label={t("tasks.approvalPage.detail")}
      className="bg-card min-h-0 overflow-y-auto rounded-xl border p-4 sm:p-6"
    >
      <div className="mb-4 flex flex-wrap justify-between gap-2">
        <Button variant="outline" size="sm" onClick={onBack}>
          {t("tasks.approvalPage.back")}
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link
            to={`/workspaces/${workspaceId}/tasks?task=${encodeURIComponent(taskId)}`}
          >
            {t("tasks.approvalPage.openTask")}
          </Link>
        </Button>
      </div>
      {state.query.isPending && (
        <div role="status" className="flex items-center gap-2">
          <Spinner />
          {t("tasks.loading")}
        </div>
      )}
      {state.query.isError && (
        <div role="alert" className="space-y-3">
          <p>{workflowError(state.query.error, t)}</p>
          <Button variant="outline" onClick={() => void state.query.refetch()}>
            {t("tasks.retry")}
          </Button>
        </div>
      )}
      {task && !state.query.isError && (
        <>
          <h2
            ref={heading}
            tabIndex={-1}
            className="mb-4 text-xl font-semibold break-words"
          >
            {task.name}
          </h2>
          <TaskApprovalSection task={task} />
        </>
      )}
    </section>
  );
}
