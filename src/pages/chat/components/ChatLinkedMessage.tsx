import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
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
    <section className="border-border bg-muted/30 max-h-64 shrink-0 overflow-y-auto border-b p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold">
          {t("chat.notifications.linkedMessage")}
        </p>
        <Button variant="ghost" size="sm" onClick={props.onClose}>
          {t("chat.actions.close")}
        </Button>
      </div>
      {message.isPending && <p role="status">{t("chat.ui.loading")}</p>}
      {message.isError && (
        <div role="alert">
          <p>{t("chat.errors.loadHistory")}</p>
          <Button variant="outline" onClick={() => void message.refetch()}>
            {t("chat.actions.retry")}
          </Button>
        </div>
      )}
      {message.data && !message.isError && (
        <>
          <p className="text-muted-foreground text-xs">
            {message.data.senderDisplayName}
          </p>
          <p className="text-sm [overflow-wrap:anywhere] whitespace-pre-wrap">
            {message.data.content}
          </p>
          <Button
            variant="link"
            onClick={() =>
              props.onThread(message.data.threadRootId ?? message.data.id)
            }
          >
            {t("chat.thread.view")}
          </Button>
        </>
      )}
    </section>
  );
}
