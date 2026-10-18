import { isAxiosError } from "axios";
import type { TFunction } from "i18next";
import type {
  ReviewAction,
  ReviewExpected,
  TaskReviewView,
} from "@/pages/tasks/types/taskApproval";

export const MAX_REVIEW_COMMENT = 5000;
const ACTION_KEYS = {
  submit: "canSubmit",
  withdraw: "canWithdraw",
  approve: "canApprove",
  reject: "canReject",
} as const;

export function reviewMatches(view: TaskReviewView) {
  const { review, linked } = view;
  return (
    !view.postError &&
    !!linked?.post &&
    review.postId === linked.post.id &&
    review.postContentVersion === linked.post.contentVersion &&
    review.workflowRevision !== null &&
    review.workflowRevision === linked.taskRevision
  );
}
export function reviewAllows(view: TaskReviewView, action: ReviewAction) {
  return reviewMatches(view) && view.review.allowedActions[ACTION_KEYS[action]];
}
export function reviewExpected(
  view: TaskReviewView,
  action: ReviewAction,
  comment: string,
): ReviewExpected {
  if (!reviewAllows(view, action)) throw new Error("REVIEW_VIEW_STALE");
  const { review } = view;
  const expected: ReviewExpected = {
    expectedRevision: review.workflowRevision!,
    expectedApprovalRound: review.approvalRound,
  };
  if (action === "withdraw") return expected;
  expected.expectedPostContentVersion = review.postContentVersion!;
  if (action === "submit") return expected;
  if (review.reviewStep !== "MANAGER" && review.reviewStep !== "CLIENT")
    throw new Error("REVIEW_VIEW_STALE");
  return {
    ...expected,
    expectedStep: review.reviewStep,
    comment: comment.trim(),
  };
}
export function reviewMessage(reason: string | null | undefined, t: TFunction) {
  const key = `tasks.review.errors.${reason}`;
  return reason && t(key) !== key ? t(key) : t("tasks.review.errors.generic");
}
export function reviewError(error: unknown, t: TFunction) {
  const code: unknown = isAxiosError(error)
    ? error.response?.data?.error?.code
    : undefined;
  return reviewMessage(typeof code === "string" ? code : null, t);
}
export function reviewMediaUrl(value: string) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) &&
      !url.username &&
      !url.password
      ? url.href
      : null;
  } catch {
    return null;
  }
}
export function reviewTime(value: string | null | undefined, locale: string) {
  return value && Number.isFinite(Date.parse(value))
    ? new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "—";
}
