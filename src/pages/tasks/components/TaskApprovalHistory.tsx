import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
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
    <details className="rounded-xl border p-3">
      <summary className="focus-visible:ring-ring cursor-pointer rounded-md text-sm font-semibold focus-visible:ring-2">
        {t("tasks.review.history")}
      </summary>
      <div className="mt-3 space-y-3">
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
              className="space-y-2"
              aria-label={t("tasks.review.currentRound", { round })}
            >
              <h4 className="text-sm font-medium">
                {t("tasks.review.currentRound", { round })}
              </h4>
              <ol className="space-y-2">
                {decisions.map((decision) => (
                  <li
                    key={decision.id}
                    className="bg-muted/20 space-y-2 rounded-md border p-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                      <span className="font-medium">
                        {decision.actorDisplayName ||
                          t("tasks.review.unknownActor")}
                      </span>
                      <span>
                        {t(`tasks.review.decisions.${decision.action}`)}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-xs">
                      {t(
                        ["MANAGER", "CLIENT", "QC"].includes(decision.step)
                          ? `tasks.review.steps.${decision.step}`
                          : "tasks.review.legacyStep",
                      )}
                      {" · "}
                      <time dateTime={decision.createdAt}>
                        {reviewTime(decision.createdAt, i18n.language)}
                      </time>
                    </p>
                    {decision.comment && (
                      <div className="space-y-1">
                        <p className="text-muted-foreground text-xs">
                          {t("tasks.review.reviewNote")}
                        </p>
                        <p className="text-sm [overflow-wrap:anywhere] break-words whitespace-pre-wrap">
                          {decision.comment}
                        </p>
                      </div>
                    )}
                  </li>
                ))}
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
