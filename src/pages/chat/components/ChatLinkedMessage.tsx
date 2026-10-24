import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ChatRichMessage } from "@/pages/chat/components/ChatRichMessage";
import { CornerDownRight, MessageSquareQuote, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { chatCollaborationService as service } from "@/services/chatCollaborationService";
import {
  chatReadRetry,
  chatRetryDelay,
} from "@/pages/chat/services/chatTransport";

interface Props {
  workspaceId: string;
  channelId: string;
  userId: string;
  messageId: string;
  onThread: (rootId: string) => void;
  onClose: () => void;
}

export function ChatLinkedMessage(props: Props) {
  const { t } = useTranslation();
  const message = useQuery({
    queryKey: [
      "chat-linked-message",
      props.userId,
      props.workspaceId,
      props.channelId,
      props.messageId,
    ],
    queryFn: ({ signal }) =>
      service.message(
        props.workspaceId,
        props.channelId,
        props.messageId,
        signal,
      ),
    retry: chatReadRetry,
    retryDelay: chatRetryDelay,
  });
  return (
    <section className="border-brand-orange/20 bg-brand-orange-soft/35 max-h-64 shrink-0 overflow-y-auto border-b px-4 py-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span
            aria-hidden="true"
            className="bg-brand-orange/15 text-brand-orange inline-flex size-6 shrink-0 items-center justify-center rounded-md"
          >
            <MessageSquareQuote className="size-3.5" />
          </span>
          <p className="text-foreground truncate text-xs font-semibold tracking-tight">
            {t("chat.notifications.linkedMessage")}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground h-7 gap-1 rounded-full px-2.5 text-xs"
          onClick={props.onClose}
        >
          <X className="size-3.5" aria-hidden="true" />
          {t("chat.actions.close")}
        </Button>
      </div>
      {message.isPending && (
        <p role="status" className="text-muted-foreground mt-2 text-xs">
          {t("chat.ui.loading")}
        </p>
      )}
      {message.isError && (
        <div
          role="alert"
          className="mt-2 flex items-center justify-between gap-2 text-xs"
        >
          <p className="text-destructive">{t("chat.errors.loadHistory")}</p>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => void message.refetch()}
          >
            {t("chat.actions.retry")}
          </Button>
        </div>
      )}
      {message.data && !message.isError && (
        <div className="border-border/70 bg-background/85 mt-2 rounded-lg border p-2.5 shadow-2xs">
          <div className="flex items-center justify-between gap-2">
            <p className="text-foreground text-xs font-semibold">
              {message.data.senderDisplayName}
            </p>
            <Button
              variant="link"
              size="sm"
              className="text-brand-orange h-auto gap-1 p-0 text-xs font-semibold"
              onClick={() =>
                props.onThread(message.data.threadRootId ?? message.data.id)
              }
            >
              <CornerDownRight className="size-3" aria-hidden="true" />
              {t("chat.thread.view")}
            </Button>
          </div>
          <ChatRichMessage
            document={message.data.richContent}
            fallback={message.data.content}
          />
        </div>
      )}
    </section>
  );
}
