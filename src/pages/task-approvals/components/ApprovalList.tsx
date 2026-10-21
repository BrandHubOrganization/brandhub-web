import { useTranslation } from "react-i18next";
import { CheckCheck, User2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { reviewError } from "@/pages/tasks/utils/taskApprovalView";
import type { useApprovalList } from "@/pages/task-approvals/hooks/useApprovalList";

interface Props {
  query: ReturnType<typeof useApprovalList>;
  selected: string;
  page: number;
  onSelect: (id: string) => void;
  onPage: (page: number) => void;
}
export function ApprovalList({
  query,
  selected,
  page,
  onSelect,
  onPage,
}: Props) {
  const { t } = useTranslation();
  const data = query.data;
  return (
    <section
      aria-label={t("tasks.approvalPage.list")}
      className="bg-card flex h-full min-h-0 flex-col rounded-xl border"
    >
      <div className="border-b p-4 text-sm font-medium" role="status">
        {t("tasks.approvalPage.count", { count: data?.totalElements ?? 0 })}
      </div>
      <div
        className="min-h-0 flex-1 overflow-y-auto"
        aria-busy={query.isFetching}
      >
        {query.isPending && (
          <div role="status" className="flex items-center gap-2 p-5">
            <Spinner />
            {t("tasks.loading")}
          </div>
        )}
        {query.isError && (
          <div role="alert" className="space-y-3 p-5">
            <p>{reviewError(query.error, t)}</p>
            <Button variant="outline" onClick={() => void query.refetch()}>
              {t("tasks.retry")}
            </Button>
          </div>
        )}
        {!query.isPending && !query.isError && !data?.content.length && (
          <div className="flex flex-col items-center justify-center p-8 text-center animate-in fade-in-50 duration-200">
            <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-brand-orange-soft text-brand-orange shadow-xs">
              <CheckCheck className="size-6" />
            </div>
            <h4 className="text-sm font-semibold text-foreground">
              {t("tasks.approvalPage.allCaughtUpTitle")}
            </h4>
            <p className="mt-1 max-w-[200px] text-xs text-muted-foreground">
              {t("tasks.approvalPage.allCaughtUpDesc")}
            </p>
          </div>
        )}
        {!query.isError &&
          data?.content.map((task) => (
            <Button
              key={task.id}
              variant="ghost"
              aria-pressed={selected === task.id}
              onClick={() => onSelect(task.id)}
              className={cn(
                "h-auto w-full justify-start rounded-none border-b p-4 text-left whitespace-normal transition-all duration-150 hover:bg-muted/40",
                selected === task.id
                  ? "bg-brand-orange-soft/60 shadow-xs ring-1 ring-inset ring-brand-orange/30 text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span className="min-w-0 w-full space-y-2.5">
                <span className="block font-semibold text-foreground text-sm leading-snug break-words">
                  {task.name}
                </span>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <Badge
                    variant={
                      task.status === "IN_REVIEW" ? "PENDING_REVIEW" : "outline"
                    }
                    className="font-medium"
                  >
                    {task.status === "IN_REVIEW" && (
                      <span className="relative mr-1.5 flex size-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                        <span className="relative inline-flex size-2 rounded-full bg-amber-500" />
                      </span>
                    )}
                    {t(`tasks.status.${task.status}`)}
                  </Badge>
                  <span className="text-muted-foreground flex items-center gap-1.5 font-normal">
                    <User2 className="size-3.5 text-muted-foreground/70" />
                    {task.assigneeName || t("tasks.approvalPage.unassigned")}
                  </span>
                </div>
              </span>
            </Button>
          ))}
      </div>
      <div className="flex items-center justify-between gap-2 border-t p-3">
        <Button
          variant="outline"
          size="sm"
          disabled={page === 0 || query.isFetching}
          onClick={() => onPage(page - 1)}
        >
          {t("tasks.approvalPage.previous")}
        </Button>
        <span className="text-muted-foreground text-xs">
          {t("tasks.approvalPage.page", {
            page: page + 1,
            total: Math.max(1, data?.totalPages ?? 1),
          })}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={query.isFetching || !data || page + 1 >= data.totalPages}
          onClick={() => onPage(page + 1)}
        >
          {t("tasks.approvalPage.next")}
        </Button>
      </div>
    </section>
  );
}
