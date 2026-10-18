import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { reviewError } from "@/pages/tasks/taskApprovalView";
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
      className="bg-card flex min-h-0 flex-col rounded-xl border"
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
          <p className="text-muted-foreground p-5 text-sm">
            {t("tasks.approvalPage.empty")}
          </p>
        )}
        {!query.isError &&
          data?.content.map((task) => (
            <Button
              key={task.id}
              variant="ghost"
              aria-pressed={selected === task.id}
              onClick={() => onSelect(task.id)}
              className={cn(
                "h-auto w-full justify-start rounded-none border-b px-4 py-4 text-left whitespace-normal",
                selected === task.id && "bg-brand-orange-soft",
              )}
            >
              <span className="min-w-0 space-y-2">
                <span className="block font-medium break-words">
                  {task.name}
                </span>
                <span className="flex flex-wrap items-center gap-2 text-xs">
                  <Badge variant="outline">
                    {t(`tasks.status.${task.status}`)}
                  </Badge>
                  <span className="text-muted-foreground">
                    {task.assigneeName || t("tasks.approvalPage.unassigned")}
                  </span>
                </span>
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
