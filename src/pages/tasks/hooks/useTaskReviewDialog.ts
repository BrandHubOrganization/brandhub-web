import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useTaskEditContext } from "@/pages/tasks/components/TaskWorkflowProvider";
import {
  MAX_REVIEW_COMMENT,
  reviewAllows,
  reviewError,
} from "@/pages/tasks/taskApprovalView";
import type {
  ReviewAction,
  TaskReviewView,
} from "@/pages/tasks/types/taskApproval";

export interface ReviewDialogProps {
  action: ReviewAction;
  initialView: TaskReviewView;
  onClose: () => void;
  act: (
    view: TaskReviewView,
    action: ReviewAction,
    comment: string,
  ) => Promise<boolean>;
  reload: () => Promise<TaskReviewView>;
}

export function useTaskReviewDialog(props: ReviewDialogProps) {
  const { t } = useTranslation();
  const { session } = useTaskEditContext();
  const [view, setView] = useState(props.initialView);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [needsReload, setNeedsReload] = useState(false);
  const [discarding, setDiscarding] = useState(false);
  const pending = useRef(false);
  const identity = `${view.review.workspaceId}:${view.review.taskId}:review-note`;
  useEffect(() => {
    session.setDirty(identity, !!comment.trim());
    return () => session.setDirty(identity, false);
  }, [identity, session, comment]);
  function close() {
    if (pending.current) return;
    if (comment.trim()) {
      setDiscarding(true);
      return;
    }
    props.onClose();
  }
  async function confirm() {
    if (pending.current || needsReload || !reviewAllows(view, props.action))
      return;
    if (
      (props.action === "reject" && !comment.trim()) ||
      comment.length > MAX_REVIEW_COMMENT
    ) {
      setError(
        t(
          comment.length > MAX_REVIEW_COMMENT
            ? "tasks.review.noteTooLong"
            : "tasks.review.reasonRequired",
        ),
      );
      return;
    }
    pending.current = true;
    setBusy(true);
    setError("");
    try {
      if (await props.act(view, props.action, comment)) {
        session.setDirty(identity, false);
        toast.success(t(`tasks.review.success.${props.action}`));
        props.onClose();
      }
    } catch (failure) {
      setError(reviewError(failure, t));
      setNeedsReload(true);
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }
  async function reload() {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    try {
      const fresh = await props.reload();
      setView(fresh);
      setNeedsReload(false);
      setError(
        reviewAllows(fresh, props.action)
          ? ""
          : t("tasks.review.actionUnavailable"),
      );
    } catch (failure) {
      setError(reviewError(failure, t));
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }
  return {
    view,
    comment,
    setComment,
    error,
    busy,
    needsReload,
    discarding,
    setDiscarding,
    close,
    confirm,
    reload,
    canConfirm: !needsReload && !busy && reviewAllows(view, props.action),
  };
}
