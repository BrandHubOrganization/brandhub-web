import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { reviewMessage, reviewTime } from "@/pages/tasks/taskApprovalView";
import type { TaskReview } from "@/pages/tasks/types/taskApproval";

export function TaskReviewStatus({ review }: { review: TaskReview }) {
  const { t, i18n } = useTranslation();
  const submission = review.lastSubmission;
  const knownStatuses = [
    "TODO",
    "IN_PROGRESS",
    "IN_REVIEW",
    "FINISHED",
    "CANCELLED",
  ];
  const normalState =
    ["TODO", "FINISHED", "CANCELLED"].includes(review.status) &&
    review.blockedReason === "TASK_REVIEW_STATE_CONFLICT";
  const reason = review.supportedType
    ? review.blockedReason
    : "TASK_REVIEW_TYPE_UNSUPPORTED";
  return (
    <div className="space-y-3">
      <div role="status" className="flex flex-wrap items-center gap-2 text-sm">
        <Badge variant="outline">
          {t(
            knownStatuses.includes(review.status)
              ? `tasks.status.${review.status}`
              : "tasks.review.legacyStep",
          )}
        </Badge>
        <span>
          {t("tasks.review.currentRound", { round: review.approvalRound })}
        </span>
        {review.reviewStep && (
          <span>
            {t("tasks.review.waitingStep", {
              step: t(
                ["MANAGER", "CLIENT", "QC"].includes(review.reviewStep)
                  ? `tasks.review.steps.${review.reviewStep}`
                  : "tasks.review.legacyStep",
              ),
            })}
          </span>
        )}
      </div>
      {submission && (
        <p className="text-muted-foreground text-xs leading-5">
          {t("tasks.review.submittedAt", {
            time: reviewTime(submission.submittedAt, i18n.language),
          })}
          {submission.outcome &&
            ["APPROVED", "REJECTED", "WITHDRAWN", "CANCELLED"].includes(
              submission.outcome,
            ) &&
            ` · ${t(`tasks.review.outcomes.${submission.outcome}`)}`}
        </p>
      )}
      {review.status === "FINISHED" && (
        <p className="text-muted-foreground text-sm">
          {t("tasks.review.finishedHint")}
        </p>
      )}
      {reason && !normalState && (
        <p
          role="status"
          className="bg-muted text-muted-foreground rounded-xl border p-3 text-sm"
        >
          {reviewMessage(reason, t)}
        </p>
      )}
    </div>
  );
}
