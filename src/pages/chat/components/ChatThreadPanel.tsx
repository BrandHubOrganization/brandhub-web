import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useAuthStore } from "@/store/authStore";
import { chatCollaborationService } from "@/services/chatCollaborationService";
import { useChannelMessages } from "@/pages/chat/hooks/useChannelMessages";
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
}

export function ChatThreadPanel(props: ThreadProps) {
  const { t } = useTranslation();
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
  return (
    <section className="bg-card flex h-full min-h-0 flex-col">
      <div className="border-border flex items-center justify-between border-b p-4">
        <h2 className="text-base font-semibold">{t("chat.thread.title")}</h2>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t("chat.actions.close")}
          onClick={props.onClose}
        >
          <X className="size-4" />
        </Button>
      </div>
      {root.isPending && (
        <div className="p-5">
          <Spinner />
        </div>
      )}
      {root.isError && (
        <div role="alert" className="p-4 text-sm">
          <p>{t("chat.errors.loadHistory")}</p>
          <Button variant="outline" onClick={() => void root.refetch()}>
            {t("chat.actions.retry")}
          </Button>
        </div>
      )}
      {root.data && !root.isError && (
        <div className="border-border max-h-56 shrink-0 overflow-y-auto border-b">
          <ChatMessageRow
            message={root.data}
            userId={userId}
            canPost={props.channel.canPost}
            busy={thread.busyId === root.data.id}
            hideThread
            onThread={() => undefined}
            onRetry={thread.retry}
            onMutate={(message, code) => void thread.mutate(message, code)}
          />
        </div>
      )}
      <ChatTimeline
        messages={thread.history.isError ? [] : thread.messages}
        userId={userId}
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
        />
      )}
    </section>
  );
}
