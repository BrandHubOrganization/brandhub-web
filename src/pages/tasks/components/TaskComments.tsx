import type { ReactNode } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { MessageSquare, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskCommentComposer } from "@/pages/tasks/components/TaskCommentComposer";
import { TaskCommentImage } from "@/pages/tasks/components/TaskCommentImage";
import { taskCommentService } from "@/pages/tasks/services/taskCommentService";
import { workflowError } from "@/pages/tasks/taskWorkflowErrors";
import { useAuthStore } from "@/store/authStore";

function linkedText(content: string): ReactNode[] {
  return content.split(/(https?:\/\/[^\s<>]+)/g).map((part, index) => {
    try {
      const url = new URL(part);
      if (
        ["http:", "https:"].includes(url.protocol) &&
        !url.username &&
        !url.password
      )
        return (
          <a
            key={index}
            href={url.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-orange break-all underline"
          >
            {part}
          </a>
        );
    } catch {
      /* User text remains plain text, not markup. */
    }
    return part;
  });
}

export function TaskComments({
  workspaceId,
  taskId,
}: {
  workspaceId: string;
  taskId: string;
}) {
  const { t, i18n } = useTranslation();
  const userId = useAuthStore((state) => state.user?.id);
  const client = useQueryClient();
  const key = ["task-comments", userId, workspaceId, taskId];
  const comments = useInfiniteQuery({
    queryKey: key,
    queryFn: ({ pageParam, signal }) =>
      taskCommentService.list(workspaceId, taskId, pageParam, signal),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.nextCursor || undefined,
    retry: false,
    refetchOnWindowFocus: false,
  });
  const items = [
    ...new Map(
      comments.data?.pages
        .flatMap((page) => page.items)
        .map((item) => [item.id, item]) || [],
    ).values(),
  ].sort(
    (left, right) =>
      left.createdAt.localeCompare(right.createdAt) ||
      left.id.localeCompare(right.id),
  );
  return (
    <section
      className="space-y-4 border-t pt-5"
      aria-label={t("tasks.comments.title")}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 font-semibold">
          <MessageSquare aria-hidden className="size-4" />
          {t("tasks.comments.title")}
        </h3>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={comments.isFetching}
          onClick={() => void comments.refetch()}
        >
          <RefreshCw aria-hidden className="size-3.5" />
          {t("tasks.refresh")}
        </Button>
      </div>
      {comments.isPending && (
        <p role="status" className="text-muted-foreground text-sm">
          {t("tasks.loading")}
        </p>
      )}
      {comments.isError ? (
        <div role="alert" className="space-y-2 rounded-xl border p-3">
          <p className="text-sm">{workflowError(comments.error, t)}</p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => void comments.refetch()}
          >
            {t("tasks.retry")}
          </Button>
        </div>
      ) : (
        <>
          {comments.hasNextPage && (
            <Button
              size="sm"
              variant="outline"
              disabled={comments.isFetchingNextPage}
              onClick={() => void comments.fetchNextPage()}
            >
              {t("tasks.comments.loadMore")}
            </Button>
          )}
          {comments.isFetchNextPageError && (
            <p role="alert" className="text-destructive text-sm">
              {t("tasks.comments.historyError")}
            </p>
          )}
          <ol className="space-y-3">
            {items.map((comment) => (
              <li
                key={comment.id}
                className="bg-card/60 hover:bg-card border-border/70 space-y-2.5 rounded-xl border p-3.5 shadow-2xs transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="bg-brand-orange-soft text-brand-orange flex size-6 shrink-0 items-center justify-center rounded-full text-2xs font-semibold">
                      {comment.authorDisplayName?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <span className="text-foreground text-sm font-semibold">
                      {comment.authorDisplayName}
                    </span>
                    <span className="bg-muted text-muted-foreground rounded-md px-1.5 py-0.5 text-2xs font-medium">
                      {t(`tasks.comments.roles.${comment.authorRole}`)}
                    </span>
                  </div>
                  <time
                    className="text-muted-foreground text-2xs"
                    dateTime={comment.createdAt}
                  >
                    {Number.isFinite(Date.parse(comment.createdAt))
                      ? new Intl.DateTimeFormat(i18n.language, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(new Date(comment.createdAt))
                      : "—"}
                  </time>
                </div>
                <p className="text-foreground/90 pl-8 text-sm break-words whitespace-pre-wrap leading-relaxed">
                  {linkedText(comment.content)}
                </p>
                {comment.attachmentIds.length > 0 && (
                  <div className="flex flex-wrap gap-2 pl-8 pt-1">
                    {comment.attachmentIds.map((id) => (
                      <TaskCommentImage
                        key={id}
                        workspaceId={workspaceId}
                        taskId={taskId}
                        id={id}
                      />
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ol>
          {comments.isSuccess && !items.length && (
            <p className="text-muted-foreground text-sm">
              {t("tasks.comments.empty")}
            </p>
          )}
        </>
      )}
      {!comments.isPending && !comments.isError && (
        <TaskCommentComposer
          key={`${userId}:${workspaceId}:${taskId}`}
          workspaceId={workspaceId}
          taskId={taskId}
          onCreated={() => client.invalidateQueries({ queryKey: key })}
        />
      )}
    </section>
  );
}
