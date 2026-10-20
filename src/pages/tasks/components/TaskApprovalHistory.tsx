import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  History,
  MessageSquare,
  ShieldAlert,
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
  const [isOpen, setIsOpen] = useState(true);

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

  const sortedRounds = [...groups.entries()].sort(([left], [right]) => right - left);

  return (
    <section
      aria-label={t("tasks.review.history")}
      className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-border/50 px-4 py-3 bg-muted/20">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-brand-orange-soft text-brand-orange">
            <History className="size-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              {t("tasks.review.history")}
            </h3>
            <p className="text-2xs text-muted-foreground">
              {t("tasks.review.historyNoContentVersions")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {items.length > 0 && (
            <Badge variant="outline" className="text-2xs font-normal">
              {items.length} {t("tasks.review.decisionsCount", { defaultValue: "lượt duyệt" })}
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="size-7 p-0 text-muted-foreground hover:text-foreground"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-expanded={isOpen}
            aria-label={isOpen ? "Thu gọn lịch sử" : "Mở rộng lịch sử"}
          >
            {isOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </Button>
        </div>
      </div>

      {/* Content Container */}
      {isOpen && (
        <div className="p-4 sm:p-5 space-y-4">
          {history.isPending && (
            <p role="status" className="text-sm text-muted-foreground">
              {t("tasks.review.loadingHistory")}
            </p>
          )}

          {history.isError && (
            <div role="alert" className="space-y-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-destructive">
              <p className="text-sm font-medium">
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

          {/* Vertical Timeline */}
          {sortedRounds.length > 0 ? (
            <div className="space-y-6">
              {sortedRounds.map(([round, decisions]) => (
                <div key={round} className="space-y-3">
                  {/* Round Header */}
                  <div className="flex items-center gap-2">
                    <span className="inline-flex size-6 items-center justify-center rounded-full bg-brand-orange-soft text-2xs font-bold text-brand-orange ring-1 ring-brand-orange/30">
                      R{round}
                    </span>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {t("tasks.review.currentRound", { round })}
                    </h4>
                    <span className="h-px flex-1 bg-border/60" />
                  </div>

                  {/* Decisions inside this round with vertical line */}
                  <div className="relative ml-3 space-y-3 border-l-2 border-border/70 pl-4 sm:pl-5">
                    {decisions.map((decision) => {
                      const isApproved = decision.action === "APPROVE";
                      const actorInitials = (decision.actorDisplayName || "U")
                        .slice(0, 2)
                        .toUpperCase();

                      return (
                        <div
                          key={decision.id}
                          className="relative rounded-xl border border-border/60 bg-muted/15 p-3.5 shadow-2xs transition-all hover:bg-muted/25"
                        >
                          {/* Dot indicator on vertical line */}
                          <span
                            className={cn(
                              "absolute -left-[23px] top-4 size-3 rounded-full border-2 border-background ring-1",
                              isApproved
                                ? "bg-emerald-500 ring-emerald-500/40"
                                : "bg-rose-500 ring-rose-500/40",
                            )}
                          />

                          {/* Top Row: User & Action */}
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-2xs font-bold text-primary">
                                {actorInitials}
                              </div>
                              <div>
                                <span className="font-semibold text-sm text-foreground">
                                  {decision.actorDisplayName ||
                                    t("tasks.review.unknownActor")}
                                </span>
                                <div className="flex items-center gap-1.5 text-2xs text-muted-foreground">
                                  <Badge
                                    variant="outline"
                                    className="py-0 px-1.5 text-2xs font-normal"
                                  >
                                    {t(
                                      ["MANAGER", "CLIENT", "QC"].includes(decision.step)
                                        ? `tasks.review.steps.${decision.step}`
                                        : "tasks.review.legacyStep",
                                    )}
                                  </Badge>
                                  <span>·</span>
                                  <time
                                    dateTime={decision.createdAt}
                                    className="flex items-center gap-0.5"
                                  >
                                    <Clock className="size-2.5 opacity-70" />
                                    {reviewTime(decision.createdAt, i18n.language)}
                                  </time>
                                </div>
                              </div>
                            </div>

                            {/* Action Badge */}
                            <Badge
                              variant="outline"
                              className={cn(
                                "gap-1 py-0.5 px-2.5 font-medium text-xs",
                                isApproved
                                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                                  : "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30",
                              )}
                            >
                              {isApproved ? (
                                <CheckCircle2 className="size-3.5" />
                              ) : (
                                <XCircle className="size-3.5" />
                              )}
                              <span>{t(`tasks.review.decisions.${decision.action}`)}</span>
                            </Badge>
                          </div>

                          {/* Review Note / Feedback Box */}
                          {decision.comment && (
                            <div
                              className={cn(
                                "mt-2.5 rounded-lg border p-3 text-xs leading-relaxed",
                                isApproved
                                  ? "border-border/60 bg-card/60 text-foreground"
                                  : "border-rose-200/80 bg-rose-50/60 text-rose-950 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-200",
                              )}
                            >
                              <div className="mb-1 flex items-center gap-1 font-semibold text-2xs">
                                {isApproved ? (
                                  <MessageSquare className="size-3 text-muted-foreground" />
                                ) : (
                                  <ShieldAlert className="size-3 text-rose-600 dark:text-rose-400" />
                                )}
                                <span>{t("tasks.review.reviewNote")}</span>
                              </div>
                              <p className="break-words whitespace-pre-wrap [overflow-wrap:anywhere]">
                                {decision.comment}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            history.isSuccess && (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/70 p-6 text-center text-muted-foreground">
                <History className="size-8 opacity-40 mb-2" />
                <p className="text-sm">{t("tasks.review.noHistory")}</p>
              </div>
            )
          )}

          {/* Load More Button */}
          {history.hasNextPage && !history.isError && (
            <div className="pt-2">
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                loading={history.isFetchingNextPage}
                onClick={() => void history.fetchNextPage()}
              >
                {t("tasks.review.loadMore")}
              </Button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
