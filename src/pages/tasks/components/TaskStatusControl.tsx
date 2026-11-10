import { opensPostEditor } from "@/types/task";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { JiraStatusLozenge } from "@/pages/tasks/components/JiraSubtaskUI";
import { TaskReviewDialog } from "@/pages/tasks/components/approval/TaskReviewDialog";
import { useTaskApproval } from "@/pages/tasks/hooks/useTaskApproval";
import { useTaskWorkflow } from "@/pages/tasks/hooks/useTaskWorkflow";
import type {
  ReviewAction,
  TaskReviewView,
} from "@/pages/tasks/types/taskApproval";
import type { TaskWorkflow } from "@/pages/tasks/types/taskWorkflow";
import {
  reviewAllows,
  reviewError,
  reviewMessage,
} from "@/pages/tasks/utils/taskApprovalView";
import { workflowError } from "@/pages/tasks/utils/taskWorkflowErrors";

const actions: ReviewAction[] = ["submit", "withdraw", "approve", "reject"];

export function TaskStatusControl({ task }: { task: TaskWorkflow }) {
  const { t } = useTranslation();
  const workflow = useTaskWorkflow(task.workspaceId, task.id);
  const status = task.status;
  const reviewable =
    (status === "IN_PROGRESS" || status === "IN_REVIEW") &&
    (opensPostEditor(task.type) ||
      (task.campaignId !== null &&
        (task.sourceType === "CAMPAIGN" ||
          task.sourceType === "CONTENT_REQUEST")));
  const review = useTaskApproval(task, {
    enabled: reviewable,
    includeHistory: false,
  });
  const [starting, setStarting] = useState(false);
  const [dialog, setDialog] = useState<{
    action: ReviewAction;
    view: TaskReviewView;
  } | null>(null);
  const view = review.query.data;
  const available =
    reviewable && view
      ? actions.filter((action) => reviewAllows(view, action))
      : [];

  async function start() {
    setStarting(true);
    workflow.retry();
    try {
      await workflow.start();
      toast.success(t("tasks.workflow.started"));
    } catch (error) {
      toast.error(workflowError(error, t));
    } finally {
      setStarting(false);
    }
  }

  async function reloadReview() {
    const result = await review.query.refetch();
    if (result.isError || !result.data) throw result.error;
    return result.data;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={starting || review.busy}
            aria-label={t("tasks.workflow.changeTaskStatus")}
            className="h-8 gap-1 rounded-full px-1.5"
          >
            <JiraStatusLozenge
              status={status}
              label={t(`tasks.status.${status}`)}
            />
            <ChevronDown
              aria-hidden
              className="text-muted-foreground size-3.5"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60">
          <DropdownMenuLabel>
            {t("tasks.workflow.changeTaskStatus")}
          </DropdownMenuLabel>
          {task.allowedActions.canStart && (
            <DropdownMenuItem onSelect={() => void start()}>
              {t("tasks.workflow.start")}
            </DropdownMenuItem>
          )}
          {available.map((action) => (
            <DropdownMenuItem
              key={action}
              disabled={review.query.isFetching || review.query.isError}
              onSelect={() => {
                if (view) setDialog({ action, view });
              }}
            >
              {t(`tasks.review.actions.${action}`)}
            </DropdownMenuItem>
          ))}
          {reviewable && review.query.isError ? (
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                void review.query.refetch();
              }}
            >
              {t("tasks.retry")}
            </DropdownMenuItem>
          ) : (
            !task.allowedActions.canStart &&
            available.length === 0 && (
              <p
                role="status"
                className="text-muted-foreground px-2 py-1.5 text-xs"
              >
                {reviewable && review.query.isPending
                  ? t("tasks.loading")
                  : view?.postError
                    ? reviewError(view.postError, t)
                    : view?.review.blockedReason
                      ? reviewMessage(view.review.blockedReason, t)
                      : t(
                          status === "TODO"
                            ? "tasks.workflow.startUnavailable"
                            : "tasks.workflow.noStatusActions",
                        )}
              </p>
            )
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      {dialog && (
        <TaskReviewDialog
          action={dialog.action}
          initialView={dialog.view}
          task={task}
          act={review.act}
          reload={reloadReview}
          onClose={() => setDialog(null)}
        />
      )}
    </>
  );
}
