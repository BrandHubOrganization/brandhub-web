import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useTaskWorkflow } from "@/pages/tasks/hooks/useTaskWorkflow";
import { TaskApprovalSection } from "@/pages/tasks/components/approval/TaskApprovalSection";
import { workflowError } from "@/pages/tasks/utils/taskWorkflowErrors";

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
      className="bg-card min-h-0 h-full overflow-y-auto overscroll-contain rounded-2xl border p-5 sm:p-7 shadow-sm"
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b pb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          {t("tasks.approvalPage.back")}
        </Button>
        <Button variant="outline" size="sm" asChild className="gap-1.5">
          <Link
            to={`/workspaces/${workspaceId}/tasks?task=${encodeURIComponent(taskId)}`}
          >
            <ExternalLink className="size-3.5" />
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
