import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Check,
  ClipboardCheck,
  ExternalLink,
  Info,
  RefreshCw,
  RotateCcw,
  Send,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useTaskApproval } from "@/pages/tasks/hooks/useTaskApproval";
import { useTaskWorkflow } from "@/pages/tasks/hooks/useTaskWorkflow";
import { TaskReviewStatus } from "@/pages/tasks/components/approval/TaskReviewStatus";
import { TaskReviewContent } from "@/pages/tasks/components/approval/TaskReviewContent";
import { TaskApprovalHistory } from "@/pages/tasks/components/approval/TaskApprovalHistory";
import { TaskReviewDialog } from "@/pages/tasks/components/approval/TaskReviewDialog";
import {
  reviewAllows,
  reviewError,
  reviewMatches,
} from "@/pages/tasks/utils/taskApprovalView";
import type {
  ReviewAction,
  TaskReviewView,
} from "@/pages/tasks/types/taskApproval";
import type { TaskWorkflow } from "@/pages/tasks/types/taskWorkflow";

const ACTIONS: ReviewAction[] = ["submit", "withdraw", "approve", "reject"];

function getActionButtonProps(action: ReviewAction) {
  switch (action) {
    case "approve":
      return {
        variant: "default" as const,
        className:
          "bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-2xs gap-1.5 focus-visible:ring-emerald-500/50",
        icon: Check,
      };
    case "reject":
      return {
        variant: "destructive" as const,
        className:
          "bg-rose-600 hover:bg-rose-700 text-white font-medium shadow-2xs gap-1.5 focus-visible:ring-rose-500/50",
        icon: X,
      };
    case "submit":
      return {
        variant: "orange" as const,
        className: "font-medium shadow-2xs gap-1.5",
        icon: Send,
      };
    case "withdraw":
    default:
      return {
        variant: "ghost" as const,
        className:
          "text-muted-foreground hover:text-foreground hover:bg-muted/80 gap-1.5",
        icon: RotateCcw,
      };
  }
}

export function TaskApprovalSection({ task }: { task: TaskWorkflow }) {
  const { t } = useTranslation();
  const state = useTaskApproval(task);
  const workflowState = useTaskWorkflow(task.workspaceId, task.id);
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
          <ClipboardCheck aria-hidden className="text-brand-orange size-4" />
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
        <div
          role="status"
          className="text-muted-foreground flex items-center gap-2 text-sm"
        >
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
            <Button variant="outline" size="sm" asChild className="gap-1.5">
              <Link
                to={`/workspaces/${encodeURIComponent(task.workspaceId)}/editor?taskId=${encodeURIComponent(task.id)}`}
              >
                <ExternalLink className="size-3.5" />
                {t("tasks.review.openEditor")}
              </Link>
            </Button>
          )}
          {view.review.reviewStep && !view.review.allowedActions.canApprove && (
            <p
              role="status"
              className="bg-muted/40 text-muted-foreground flex items-center gap-2 rounded-lg border p-3 text-sm"
            >
              <Info aria-hidden className="size-4 shrink-0" />
              {t("tasks.review.waitingStep", {
                step: t(`tasks.review.steps.${view.review.reviewStep}`),
              })}
            </p>
          )}
          <div className="border-border/40 flex flex-wrap items-center gap-2.5 border-t pt-2">
            {ACTIONS.filter((action) => reviewAllows(view, action)).map(
              (action) => {
                const btnConfig = getActionButtonProps(action);
                const ActionIcon = btnConfig.icon;
                return (
                  <Button
                    key={action}
                    variant={btnConfig.variant}
                    className={btnConfig.className}
                    disabled={!canAct}
                    onClick={(event) => {
                      opener.current = event.currentTarget;
                      setDialog({ action, view });
                    }}
                  >
                    <ActionIcon className="size-4 shrink-0" />
                    <span>{t(`tasks.review.actions.${action}`)}</span>
                  </Button>
                );
              },
            )}
          </div>
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
          task={task}
          onSetPublishDate={(dateIso) =>
            workflowState.field("publishDate", dateIso)
          }
        />
      )}
    </section>
  );
}
