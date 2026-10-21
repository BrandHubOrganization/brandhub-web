import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ClipboardCheck, Info, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useTaskApproval } from "@/pages/tasks/hooks/useTaskApproval";
import { TaskReviewStatus } from "@/pages/tasks/components/TaskReviewStatus";
import { TaskReviewContent } from "@/pages/tasks/components/TaskReviewContent";
import { TaskApprovalHistory } from "@/pages/tasks/components/TaskApprovalHistory";
import { TaskReviewDialog } from "@/pages/tasks/components/TaskReviewDialog";
import {
  reviewAllows,
  reviewError,
  reviewMatches,
} from "@/pages/tasks/taskApprovalView";
import type {
  ReviewAction,
  TaskReviewView,
} from "@/pages/tasks/types/taskApproval";
import type { TaskWorkflow } from "@/pages/tasks/types/taskWorkflow";

const ACTIONS: ReviewAction[] = ["submit", "withdraw", "approve", "reject"];
export function TaskApprovalSection({ task }: { task: TaskWorkflow }) {
  const { t } = useTranslation();
  const state = useTaskApproval(task);
  const [dialog, setDialog] = useState<{
    action: ReviewAction;
    view: TaskReviewView;
  } | null>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const view = state.query.data;
  const canAct = !state.query.isFetching && !state.query.isError && !state.busy;
  async function reload() {
    const [result] = await Promise.all([
      state.query.refetch(),
      state.history.refetch(),
    ]);
    if (result.isError || !result.data)
      throw result.error || new Error("REVIEW_LOAD_FAILED");
    return result.data;
  }
  function closeDialog() {
    setDialog(null);
    requestAnimationFrame(() => {
      const target = opener.current?.isConnected
        ? opener.current
        : heading.current;
      target?.focus({ preventScroll: true });
    });
  }
  return (
    <section
      className="min-w-0 space-y-4 border-t pt-5"
      aria-label={t("tasks.review.title")}
      aria-busy={state.busy}
    >
      <div className="flex items-center justify-between gap-3">
        <h3
          ref={heading}
          tabIndex={-1}
          className="flex items-center gap-2 font-semibold"
        >
          <ClipboardCheck aria-hidden className="size-4" />
          {t("tasks.review.title")}
        </h3>
        <Button
          size="sm"
          variant="ghost"
          disabled={state.query.isFetching || state.busy || !!dialog}
          onClick={() =>
            void Promise.all([state.query.refetch(), state.history.refetch()])
          }
        >
          <RefreshCw aria-hidden className="size-3.5" />
          {t("tasks.review.reload")}
        </Button>
      </div>
      {state.query.isPending && (
        <div role="status" className="flex items-center gap-2 text-sm">
          <Spinner />
          {t("tasks.review.loading")}
        </div>
      )}
      {state.query.isError && (
        <p role="alert" className="text-destructive text-sm">
          {reviewError(state.query.error, t)}
        </p>
      )}
      {view && (
        <>
          <TaskReviewStatus review={view.review} />
          {view.postError ? (
            <p role="alert" className="text-destructive text-sm">
              {reviewError(view.postError, t)}
            </p>
          ) : null}
          {view.review.supportedType &&
            (view.linked?.post ? (
              <TaskReviewContent post={view.linked.post} />
            ) : (
              <p className="text-muted-foreground text-sm">
                {t("tasks.review.contentUnavailable")}
              </p>
            ))}
          {view.review.postId && !reviewMatches(view) && (
            <p role="alert" className="text-destructive text-sm">
              {t("tasks.review.contentMismatch")}
            </p>
          )}
          {view.linked?.canEdit && task.type === "POST" && (
            <Button variant="outline" asChild>
              <Link
                to={`/workspaces/${encodeURIComponent(task.workspaceId)}/editor?taskId=${encodeURIComponent(task.id)}`}
              >
                {t("tasks.review.openEditor")}
              </Link>
            </Button>
          )}
          <div className="flex flex-wrap gap-2">
            {ACTIONS.map((action) => {
              const isAllowed = reviewAllows(view, action);
              const isDisabled = !canAct || !isAllowed;
              const stepName = view.review.reviewStep
                ? t(`tasks.review.steps.${view.review.reviewStep}`, {
                    defaultValue: view.review.reviewStep,
                  })
                : null;
              const disabledReason = !canAct
                ? t("tasks.review.loading")
                : !isAllowed
                  ? action === "approve" || action === "reject"
                    ? stepName
                      ? t("tasks.review.waitingStep", { step: stepName })
                      : t("tasks.review.errors.WRONG_APPROVAL_STEP")
                    : t("tasks.review.hint." + action)
                  : undefined;

              return (
                <span
                  key={action}
                  title={disabledReason}
                  className={
                    isDisabled
                      ? "inline-block cursor-not-allowed"
                      : "inline-block"
                  }
                >
                  <Button
                    variant={
                      action === "approve" || action === "submit"
                        ? "orange"
                        : "outline"
                    }
                    className={
                      action === "reject" ? "text-destructive" : undefined
                    }
                    disabled={isDisabled}
                    onClick={(event) => {
                      opener.current = event.currentTarget;
                      setDialog({ action, view });
                    }}
                  >
                    {t(`tasks.review.actions.${action}`)}
                  </Button>
                </span>
              );
            })}
          </div>
          {view.review.reviewStep && !view.review.allowedActions.canApprove && (
            <div className="flex items-center gap-2 rounded-lg bg-muted/40 p-2.5 text-xs text-muted-foreground border">
              <Info className="size-4 shrink-0 text-brand-orange" />
              <span>
                {t("tasks.review.waitingStep", {
                  step: t(`tasks.review.steps.${view.review.reviewStep}`, {
                    defaultValue: view.review.reviewStep,
                  }),
                })}
              </span>
            </div>
          )}
        </>
      )}
      <TaskApprovalHistory history={state.history} />
      {dialog && (
        <TaskReviewDialog
          key={`${task.id}:${dialog.action}`}
          action={dialog.action}
          initialView={dialog.view}
          act={state.act}
          reload={reload}
          onClose={closeDialog}
        />
      )}
    </section>
  );
}
