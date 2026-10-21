import { useTranslation } from "react-i18next";
import {
  CheckCircle2,
  CheckCheck,
  CircleDashed,
  Clock,
  PlayCircle,
  User,
  XCircle,
} from "lucide-react";
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

function getTaskStatusConfig(status: string) {
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
      className="bg-card flex h-full min-h-0 flex-col rounded-xl border shadow-xs"
    >
      <div className="border-b p-4 text-sm font-medium" role="status">
        {t("tasks.approvalPage.count", { count: data?.totalElements ?? 0 })}
      </div>
      <div
        className="min-h-0 flex-1 divide-y overflow-y-auto overscroll-contain"
        aria-busy={query.isFetching}
      >
        {query.isPending && (
          <div
            role="status"
            className="text-muted-foreground flex items-center gap-2 p-5 text-sm"
          >
            <Spinner />
            {t("tasks.loading")}
          </div>
        )}
        {query.isError && (
          <div role="alert" className="space-y-3 p-5">
            <p className="text-destructive text-sm">
              {reviewError(query.error, t)}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void query.refetch()}
            >
              {t("tasks.retry")}
            </Button>
          </div>
        )}
        {!query.isPending && !query.isError && !data?.content.length && (
          <div className="text-muted-foreground flex flex-col items-center gap-3 p-6 text-center">
            <CheckCheck aria-hidden className="size-8" />
            <p className="text-sm">{t("tasks.approvalPage.empty")}</p>
          </div>
        )}
        {!query.isError &&
          data?.content.map((task) => {
            const statusConfig = getTaskStatusConfig(task.status);
            const StatusIcon = statusConfig.icon;
            const isSelected = selected === task.id;
            return (
              <Button
                key={task.id}
                variant="ghost"
                aria-pressed={isSelected}
                onClick={() => onSelect(task.id)}
                className={cn(
                  "hover:bg-muted/50 h-auto w-full justify-start rounded-none border-b-0 px-4 py-3.5 text-left whitespace-normal transition-colors",
                  isSelected &&
                    "bg-brand-orange/10 border-l-brand-orange text-foreground border-l-3 font-medium",
                )}
              >
                <span className="w-full min-w-0 space-y-2">
                  <span className="text-foreground line-clamp-2 block text-sm font-medium break-words">
                    {task.name}
                  </span>
                  <span className="flex flex-wrap items-center gap-2 text-xs">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-2xs gap-1 px-2 py-0.5 font-medium",
                        statusConfig.className,
                      )}
                    >
                      <StatusIcon className="size-3 shrink-0" />
                      <span>{t(`tasks.status.${task.status}`)}</span>
                    </Badge>
                    <span className="text-muted-foreground text-2xs flex items-center gap-1">
                      <User className="size-3 shrink-0 opacity-70" />
                      <span className="max-w-[120px] truncate">
                        {task.assigneeName ||
                          t("tasks.approvalPage.unassigned")}
                      </span>
                    </span>
                  </span>
                </span>
              </Button>
            );
          })}
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
