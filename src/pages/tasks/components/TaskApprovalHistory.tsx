import { useTranslation } from "react-i18next";
import {
  CheckCircle2,
  ChevronDown,
  Clock,
  History,
  MessageSquareQuote,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { reviewError, reviewTime } from "@/pages/tasks/taskApprovalView";
import type { useTaskApproval } from "@/pages/tasks/hooks/useTaskApproval";
import type { TaskApprovalDecision } from "@/pages/tasks/types/taskApproval";

export function TaskApprovalHistory({
  history,
}: {
  history: ReturnType<typeof useTaskApproval>["history"];
}) {
  const { t, i18n } = useTranslation();
  const items = [
    ...new Map(
      history.data?.pages
        .flatMap((page) => page.items)
        .map((row) => [row.id, row]) || [],
    ).values(),
  ];
  const groups = new Map<number, TaskApprovalDecision[]>();
  for (const item of items)
    groups.set(item.approvalRound, [
      ...(groups.get(item.approvalRound) || []),
      item,
    ]);
  return (
    <details className="group rounded-2xl border bg-card transition-all" open>
      <summary className="focus-visible:ring-ring flex cursor-pointer list-none items-center justify-between rounded-2xl p-4 font-semibold text-sm transition-colors hover:bg-muted/40 [&::-webkit-details-marker]:hidden">
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-lg bg-brand-orange-soft text-brand-orange">
            <History className="size-4" />
          </div>
          <span>{t("tasks.review.history")}</span>
          {items.length > 0 && (
            <Badge variant="secondary" className="text-3xs font-normal">
              {items.length}
            </Badge>
          )}
        </div>
        <ChevronDown className="size-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
      </summary>
      <div className="border-t p-4 pt-3 space-y-4">
        <p className="text-muted-foreground text-xs leading-5">
          {t("tasks.review.historyNoContentVersions")}
        </p>
        {history.isPending && (
          <p role="status" className="text-sm">
            {t("tasks.review.loadingHistory")}
          </p>
        )}
        {history.isError && (
          <div role="alert" className="space-y-2">
            <p className="text-destructive text-sm">
              {reviewError(history.error, t)}
            </p>
            <Button
              size="sm"
              variant="outline"
              disabled={history.isFetching}
              onClick={() =>
                void (history.isFetchNextPageError
                  ? history.fetchNextPage()
                  : history.refetch())
              }
            >
              {t("tasks.retry")}
            </Button>
          </div>
        )}
        {[...groups.entries()]
          .sort(([left], [right]) => right - left)
          .map(([round, decisions]) => (
            <section
              key={round}
              className="space-y-3"
              aria-label={t("tasks.review.currentRound", { round })}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("tasks.review.currentRound", { round })}
                </span>
                <div className="h-px flex-1 bg-border/60" />
              </div>
              <ol className="space-y-3">
                {decisions.map((decision) => {
                  const isRejected = decision.action === "REJECT";
                  const actorInitials =
                    decision.actorDisplayName
                      ?.split(" ")
                      .map((w) => w[0])
                      .slice(-2)
                      .join("")
                      .toUpperCase() || "BH";

                  return (
                    <li
                      key={decision.id}
                      className={cn(
                        "rounded-xl border p-4 space-y-3 shadow-2xs transition-all",
                        isRejected
                          ? "border-destructive/30 bg-destructive/[0.02]"
                          : "border-emerald-500/30 bg-emerald-500/[0.02]",
                      )}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "flex size-9 items-center justify-center rounded-full font-bold text-xs shrink-0 shadow-2xs",
                              isRejected
                                ? "bg-destructive/10 text-destructive"
                                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                            )}
                          >
                            {actorInitials}
                          </div>
                          <div>
                            <div className="font-semibold text-sm text-foreground">
                              {decision.actorDisplayName ||
                                t("tasks.review.unknownActor")}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <span className="font-medium">
                                {t(
                                  ["MANAGER", "CLIENT", "QC"].includes(
                                    decision.step,
                                  )
                                    ? `tasks.review.steps.${decision.step}`
                                    : "tasks.review.legacyStep",
                                )}
                              </span>
                              <span>·</span>
                              <Clock className="size-3 text-muted-foreground/70" />
                              <time dateTime={decision.createdAt}>
                                {reviewTime(decision.createdAt, i18n.language)}
                              </time>
                            </div>
                          </div>
                        </div>
                        <Badge
                          variant={isRejected ? "destructive" : "approved"}
                          className="gap-1 px-2.5 py-1 font-medium shadow-2xs"
                        >
                          {isRejected ? (
                            <XCircle className="size-3.5" />
                          ) : (
                            <CheckCircle2 className="size-3.5" />
                          )}
                          {t(`tasks.review.decisions.${decision.action}`)}
                        </Badge>
                      </div>
                      {decision.comment && (
                        <div
                          className={cn(
                            "rounded-lg p-3.5 text-sm space-y-1.5 border shadow-2xs",
                            isRejected
                              ? "bg-background/90 border-destructive/20"
                              : "bg-background/90 border-border",
                          )}
                        >
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                            <MessageSquareQuote className="size-3.5 text-brand-orange" />
                            <span>{t("tasks.review.reviewNote")}</span>
                          </div>
                          <p className="text-foreground leading-relaxed [overflow-wrap:anywhere] break-words whitespace-pre-wrap pl-5 text-sm italic">
                            "{decision.comment}"
                          </p>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ol>
            </section>
          ))}
        {history.isSuccess && !items.length && (
          <p className="text-muted-foreground text-sm">
            {t("tasks.review.noHistory")}
          </p>
        )}
        {history.hasNextPage && !history.isError && (
          <Button
            size="sm"
            variant="outline"
            loading={history.isFetchingNextPage}
            onClick={() => void history.fetchNextPage()}
          >
            {t("tasks.review.loadMore")}
          </Button>
        )}
      </div>
    </details>
  );
}
