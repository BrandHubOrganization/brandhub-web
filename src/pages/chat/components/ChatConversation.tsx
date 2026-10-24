import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/useDebounce";
import { useChannelMessages } from "@/pages/chat/hooks/useChannelMessages";
import { useChatRealtime } from "@/pages/chat/hooks/useChatRealtime";
import { ChatChannelHeader } from "@/pages/chat/components/ChatChannelHeader";
import { ChatChannelComposer } from "@/pages/chat/components/ChatChannelComposer";
import { ChatTimeline } from "@/pages/chat/components/ChatTimeline";
import { ChatLinkedMessage } from "@/pages/chat/components/ChatLinkedMessage";
import type { ChatContextType, ChatConnectionState } from "@/types/chat";
import type {
  ChatChannel,
  ChatDirectoryMember,
} from "@/types/chatCollaboration";

interface ConversationProps {
  onCall: () => void;
  callDisabled: boolean;
  unavailable?: boolean;
  onRetryChannel?: () => void;
  workspaceId: string;
  userId: string;
  channel: ChatChannel;
  people: ChatDirectoryMember[];
  contextType: ChatContextType;
  contextId: string | null;
  contextValid: boolean;
  onClearContext: () => void;
  onMenu: () => void;
  onSettings: () => void;
  onThread: (rootId: string) => void;
}

export function ChatConversation(props: ConversationProps) {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const linkedMessageId = params.get("message");
  const [connection, setConnection] =
    useState<ChatConnectionState>("CONNECTING");
  const [search, setSearch] = useState("");
  const [pinned, setPinned] = useState(false);
  const debouncedSearch = useDebounce(search);
  const contextFilter =
    props.contextType !== "GENERAL" && props.contextValid
      ? {
          contextType: props.contextType,
          contextId: props.contextId ?? undefined,
        }
      : {};
  const chat = useChannelMessages(props.workspaceId, props.channel.id, {
    q: debouncedSearch || undefined,
    pinned: pinned || undefined,
    ...contextFilter,
  });
  useChatRealtime({
    workspaceId: props.workspaceId,
    channelId: props.channel.id,
    onState: setConnection,
  });
  const filtered = Boolean(search || pinned || props.contextType !== "GENERAL");
  return (
    <div className="bg-card flex h-full min-h-0 min-w-0 flex-1 flex-col">
      {props.unavailable && (
        <div
          role="alert"
          className="border-border flex items-center justify-between gap-2 border-b p-3 text-sm"
        >
          <p>{t("chat.errors.channelUnavailable")}</p>
          <Button variant="outline" onClick={props.onRetryChannel}>
            {t("chat.actions.retry")}
          </Button>
        </div>
      )}
      <ChatChannelHeader
        onCall={props.onCall}
        callDisabled={props.callDisabled || Boolean(props.unavailable)}
        workspaceId={props.workspaceId}
        userId={props.userId}
        channel={props.channel}
        connection={connection}
        search={search}
        pinned={pinned}
        onSearch={setSearch}
        onPinned={() => setPinned(!pinned)}
        onMenu={props.onMenu}
        onSettings={props.onSettings}
      />
      {linkedMessageId && !props.unavailable && (
        <ChatLinkedMessage
          key={`${props.channel.id}:${linkedMessageId}`}
          workspaceId={props.workspaceId}
          channelId={props.channel.id}
          userId={props.userId}
          messageId={linkedMessageId}
          onThread={props.onThread}
          onClose={() => {
            const next = new URLSearchParams(params);
            next.delete("message");
            setParams(next);
          }}
        />
      )}
      {(props.contextType !== "GENERAL" || !props.contextValid) && (
        <div className="border-border bg-muted/30 flex items-center justify-between gap-2 border-b px-4 py-2 text-xs">
          <p>
            {props.contextValid
              ? t("chat.composer.contextHint", {
                  context: t(`chat.context.${props.contextType.toLowerCase()}`),
                })
              : t("chat.errors.invalidContext")}
          </p>
          <Button
            variant="ghost"
            size="icon"
            className="size-9"
            aria-label={t("chat.actions.clearContext")}
            onClick={props.onClearContext}
          >
            <X className="size-4" />
          </Button>
        </div>
      )}
      {(search || pinned) && (
        <p
          role="status"
          className="text-muted-foreground border-border border-b px-4 py-2 text-xs"
        >
          {pinned ? t("chat.actions.pins") : t("chat.search.scope")}
          {search !== debouncedSearch ? ` · ${t("chat.search.searching")}` : ""}
        </p>
      )}
      {!props.contextValid ? (
        <p role="alert" className="text-muted-foreground flex-1 p-5 text-sm">
          {t("chat.errors.invalidContext")}
        </p>
      ) : (
        <ChatTimeline
          messages={
            chat.history.isError && !chat.history.isFetchNextPageError
              ? []
              : chat.messages
          }
          userId={props.userId}
          canPost={props.channel.canPost}
          busyId={chat.busyId}
          loading={chat.history.isPending}
          error={chat.history.isError}
          filtered={filtered}
          hasMore={chat.history.hasNextPage}
          loadingMore={chat.history.isFetchingNextPage}
          onLoadMore={() => void chat.history.fetchNextPage()}
          onReload={() => void chat.history.refetch()}
          onThread={(message) =>
            props.onThread(message.threadRootId ?? message.id)
          }
          onRetry={chat.retry}
          onMutate={(message, code) => void chat.mutate(message, code)}
          onRead={filtered || props.unavailable ? undefined : chat.markRead}
        />
      )}
      {!search && !pinned && (
        <ChatChannelComposer
          key={`${props.contextType}:${props.contextId ?? ""}`}
          canPost={props.channel.canPost && props.contextValid}
          people={props.people}
          contextType={props.contextType}
          contextId={props.contextId}
          onSend={chat.send}
        />
      )}
    </div>
  );
}
