import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { TaskReviewContent } from "@/pages/tasks/components/approval/TaskReviewContent";
import {
  useTaskReviewDialog,
  type ReviewDialogProps,
} from "@/pages/tasks/hooks/useTaskReviewDialog";
import { MAX_REVIEW_COMMENT } from "@/pages/tasks/utils/taskApprovalView";

export function TaskReviewDialog(props: ReviewDialogProps) {
  const { t } = useTranslation();
  const state = useTaskReviewDialog(props);
  const noteRef = useRef<HTMLTextAreaElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (state.error) errorRef.current?.focus();
  }, [state.error]);
  const hasNote = props.action === "approve" || props.action === "reject";
  const post = state.view.linked?.post;
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) state.close();
      }}
    >
      <DialogContent
        className="rounded-xl motion-reduce:animate-none motion-reduce:transition-none sm:max-w-2xl [&>button]:hidden"
        aria-busy={state.busy}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          (hasNote ? noteRef.current : cancelRef.current)?.focus();
        }}
      >
        <DialogHeader>
          <DialogTitle>{t(`tasks.review.confirm.${props.action}`)}</DialogTitle>
          <DialogDescription>
            {t(`tasks.review.hint.${props.action}`)}
          </DialogDescription>
        </DialogHeader>
        <div className="min-w-0 space-y-4">
          <p className="text-muted-foreground text-sm">
            {t("tasks.review.currentRound", {
              round: state.view.review.approvalRound,
            })}
            {state.view.review.reviewStep &&
              ` · ${t(`tasks.review.steps.${state.view.review.reviewStep}`)}`}
          </p>
          {post && <TaskReviewContent post={post} />}
          {hasNote && (
            <div className="space-y-2">
              <label htmlFor="task-review-note" className="text-sm font-medium">
                {t(
                  props.action === "reject"
                    ? "tasks.review.rejectReason"
                    : "tasks.review.optionalNote",
                )}
              </label>
              <Textarea
                id="task-review-note"
                ref={noteRef}
                value={state.comment}
                maxLength={MAX_REVIEW_COMMENT}
                required={props.action === "reject"}
                disabled={state.busy}
                aria-invalid={!!state.error}
                aria-describedby={
                  state.error ? "task-review-error" : "task-review-limit"
                }
                onChange={(event) => state.setComment(event.target.value)}
              />
              <p
                id="task-review-limit"
                className="text-muted-foreground text-xs"
              >
                {t("tasks.review.noteLimit", {
                  count: state.comment.length,
                  max: MAX_REVIEW_COMMENT,
                })}
              </p>
            </div>
          )}
          {state.error && (
            <p
              id="task-review-error"
              ref={errorRef}
              tabIndex={-1}
              role="alert"
              className="text-destructive rounded-md border p-3 text-sm"
            >
              {state.error}
            </p>
          )}
          {state.needsReload && (
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm">
                {t("tasks.review.reloadBeforeRetry")}
              </p>
              <Button
                variant="outline"
                loading={state.busy}
                onClick={() => void state.reload()}
              >
                {t("tasks.review.reload")}
              </Button>
            </div>
          )}
          {state.discarding && (
            <div
              role="alert"
              className="bg-muted space-y-3 rounded-xl border p-3"
            >
              <p className="text-sm">{t("tasks.review.discardNote")}</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() => state.setDiscarding(false)}
                >
                  {t("tasks.inline.keepEditing")}
                </Button>
                <Button variant="destructive" onClick={props.onClose}>
                  {t("tasks.inline.discardChanges")}
                </Button>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            ref={cancelRef}
            variant="outline"
            disabled={state.busy}
            onClick={state.close}
          >
            {t("tasks.close")}
          </Button>
          <Button
            variant={props.action === "reject" ? "destructive" : "orange"}
            loading={state.busy}
            disabled={!state.canConfirm || state.discarding}
            onClick={() => void state.confirm()}
          >
            {t(`tasks.review.actions.${props.action}`)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
