import { useTranslation } from "react-i18next";
import {
  AlertCircle,
  CheckCircle2,
  CircleDashed,
  Clock,
  Layers,
  PlayCircle,
  UserCheck,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { reviewMessage, reviewTime } from "@/pages/tasks/taskApprovalView";
import type { TaskReview } from "@/pages/tasks/types/taskApproval";

function getStatusBadgeConfig(status: string) {
  switch (status) {
    case "IN_REVIEW":
    case "PENDING":
      return {
        className:
          "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
        icon: Clock,
      };
    case "FINISHED":
    case "APPROVED":
    case "ACCEPTED":
      return {
        className:
          "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
        icon: CheckCircle2,
      };
    case "REJECTED":
    case "DENIED":
    case "CANCELLED":
      return {
        className:
          "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30",
        icon: XCircle,
      };
    case "IN_PROGRESS":
      return {
        className:
          "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30",
        icon: PlayCircle,
      };
    case "TODO":
    default:
      return {
        className:
          "bg-brand-orange-soft text-brand-orange border-brand-orange/30",
        icon: CircleDashed,
      };
  }
}

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

  const statusConfig = getStatusBadgeConfig(review.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="space-y-3">
      <div role="status" className="flex flex-wrap items-center gap-2 text-sm">
        <Badge
          variant="outline"
          className={cn("gap-1.5 py-1 px-2.5 font-medium shadow-2xs", statusConfig.className)}
        >
          <StatusIcon className="size-3.5 shrink-0" />
          <span>
            {t(
              knownStatuses.includes(review.status)
                ? `tasks.status.${review.status}`
                : "tasks.review.legacyStep",
            )}
          </span>
        </Badge>

        <span className="inline-flex items-center gap-1 rounded-full border bg-muted/40 px-2.5 py-1 text-xs font-medium text-foreground">
          <Layers className="size-3 text-muted-foreground" />
          {t("tasks.review.currentRound", { round: review.approvalRound })}
        </span>

        {review.reviewStep && (
          <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary">
            <UserCheck className="size-3" />
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
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="size-3 opacity-70" />
            {t("tasks.review.submittedAt", {
              time: reviewTime(submission.submittedAt, i18n.language),
            })}
          </span>
          {submission.outcome &&
            ["APPROVED", "REJECTED", "WITHDRAWN", "CANCELLED"].includes(
              submission.outcome,
            ) && (
              <Badge
                variant="outline"
                className={cn(
                  "gap-1 py-0.2 px-1.5 text-2xs font-normal",
                  submission.outcome === "APPROVED" &&
                    "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
                  submission.outcome === "REJECTED" &&
                    "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30",
                  (submission.outcome === "WITHDRAWN" || submission.outcome === "CANCELLED") &&
                    "bg-muted text-muted-foreground",
                )}
              >
                {submission.outcome === "APPROVED" && <CheckCircle2 className="size-2.5" />}
                {submission.outcome === "REJECTED" && <XCircle className="size-2.5" />}
                <span>{t(`tasks.review.outcomes.${submission.outcome}`)}</span>
              </Badge>
            )}
        </div>
      )}

      {review.status === "FINISHED" && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-sm text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <p>{t("tasks.review.finishedHint")}</p>
        </div>
      )}

      {reason && !normalState && (
        <div
          role="status"
          className="flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-900 dark:text-amber-200"
        >
          <AlertCircle className="size-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <p>{reviewMessage(reason, t)}</p>
        </div>
      )}
    </div>
  );
}
