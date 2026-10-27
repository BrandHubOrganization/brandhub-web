import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useAuthStore } from "@/store/authStore";
import { chatCollaborationService } from "@/services/chatCollaborationService";
import { useChannelMessages } from "@/pages/chat/hooks/useChannelMessages";
import { useScheduleMessage } from "@/pages/chat/hooks/useChatSchedules";
import { ChatTimeline } from "@/pages/chat/components/ChatTimeline";
import { ChatMessageRow } from "@/pages/chat/components/ChatMessageRow";
import { ChatChannelComposer } from "@/pages/chat/components/ChatChannelComposer";
import type {
  ChatChannel,
  ChatDirectoryMember,
} from "@/types/chatCollaboration";

interface ThreadProps {
  workspaceId: string;
  channel: ChatChannel;
  rootId: string;
  people: ChatDirectoryMember[];
  onClose: () => void;
  widthControl?: ReactNode;
}

export function ChatThreadPanel(props: ThreadProps) {
  const { t } = useTranslation();
  const schedule = useScheduleMessage(props.workspaceId, props.channel.id);
  const userId = useAuthStore((state) => state.user?.id ?? "");
  const thread = useChannelMessages(props.workspaceId, props.channel.id, {
    root: props.rootId,
  });
  const root = useQuery({
    queryKey: [
      "chat-root",
      userId,
      props.workspaceId,
      props.channel.id,
      props.rootId,
    ],
    queryFn: ({ signal }) =>
      chatCollaborationService.message(
        props.workspaceId,
        props.channel.id,
        props.rootId,
        signal,
      ),
    retry: false,
  });
  const replyCount = Math.max(
    root.data?.replyCount ?? 0,
    thread.messages.length,
  );
  return (
    <section className="bg-card flex h-full min-h-0 flex-col">
      <div className="border-border/80 flex min-h-12 items-center justify-between gap-2 border-b px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <span
            aria-hidden="true"
            className="bg-brand-orange-soft text-brand-orange flex size-7.5 shrink-0 items-center justify-center rounded-lg"
          >
            <MessageSquare className="size-4" />
          </span>
          <h2 className="truncate text-sm font-semibold tracking-tight">
            {t("chat.thread.title")}
          </h2>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {props.widthControl}
          <Button
            variant="ghost"
            size="icon"
            className="size-8 shrink-0 rounded-lg"
            aria-label={t("chat.actions.close")}
            onClick={props.onClose}
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>
      {root.isPending && (
        <div className="flex items-center justify-center p-5">
          <Spinner />
        </div>
      )}
      {root.isError && (
        <div role="alert" className="space-y-3 p-4 text-sm">
          <p className="text-muted-foreground">
            {t("chat.errors.loadHistory")}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void root.refetch()}
          >
            {t("chat.actions.retry")}
          </Button>
        </div>
      )}
      {root.data && !root.isError && (
        <div className="border-border/80 bg-muted/25 shrink-0 border-b">
          <div className="max-h-56 overflow-y-auto">
            <ChatMessageRow
              message={root.data}
              userId={userId}
              people={props.people}
              canPost={props.channel.canPost}
              busy={thread.busyId === root.data.id}
              hideThread
              onThread={() => undefined}
              onRetry={thread.retry}
              onMutate={(message, code) => void thread.mutate(message, code)}
            />
          </div>
          <div className="border-border/60 bg-background/60 flex items-center gap-2 border-t px-3 py-1">
            <span className="text-muted-foreground font-mono text-[10px] font-medium tabular-nums">
              {t("chat.thread.replies", { count: replyCount })}
            </span>
            <span className="bg-border/70 h-px flex-1" aria-hidden="true" />
          </div>
        </div>
      )}
      <ChatTimeline
        messages={thread.history.isError ? [] : thread.messages}
        userId={userId}
        people={props.people}
        canPost={props.channel.canPost}
        hideThread
        busyId={thread.busyId}
        loading={thread.history.isPending}
        error={thread.history.isError}
        filtered={false}
        hasMore={thread.history.hasNextPage}
        loadingMore={thread.history.isFetchingNextPage}
        onLoadMore={() => void thread.history.fetchNextPage()}
        onReload={() => void thread.history.refetch()}
        onThread={() => undefined}
        onRetry={thread.retry}
        onRead={thread.markRead}
        onMutate={(message, code) => void thread.mutate(message, code)}
      />
      {root.data && !root.isError && (
        <ChatChannelComposer
          key={props.rootId}
          canPost={props.channel.canPost}
          people={props.people}
          contextType={root.data.contextType}
          contextId={root.data.contextId}
          threadRootId={props.rootId}
          onSend={thread.send}
          onSchedule={schedule}
        />
      )}
    </section>
  );
}
