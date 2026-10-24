import { Pin, MessageSquare } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChatMessageActions } from "@/pages/chat/components/ChatMessageActions";
import { CHAT_REACTIONS } from "@/pages/chat/utils/reactions";
import type {
  CollaborationMessage,
  ChatReaction,
} from "@/types/chatCollaboration";

export interface ChatMessageRowProps {
  message: CollaborationMessage;
  userId: string;
  canPost: boolean;
  busy: boolean;
  onThread: (message: CollaborationMessage) => void;
  onRetry: (message: CollaborationMessage) => void;
  onMutate: (message: CollaborationMessage, code?: ChatReaction) => void;
  hideThread?: boolean;
}

export function ChatMessageRow(props: ChatMessageRowProps) {
  const { t, i18n } = useTranslation();
  const { message } = props;
  const mine = message.senderUserId === props.userId;
  return (
    <article className="group hover:bg-muted/30 focus-within:bg-muted/30 flex gap-3 px-3 py-3 sm:px-5">
      <div
        className={cn(
          "bg-secondary text-secondary-foreground mt-1 flex size-9 shrink-0 items-center justify-center rounded-xl text-sm font-semibold",
          mine && "bg-brand-orange-soft text-brand-orange-fg",
        )}
      >
        {message.senderDisplayName.trim().charAt(0).toUpperCase() || "?"}
      </div>
      <div className="min-w-0 flex-1">
        {message.pinned && (
          <p className="text-muted-foreground mb-1 flex items-center gap-1 text-xs">
            <Pin className="size-3" />
            {t("chat.actions.pinned")}
          </p>
        )}
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="text-sm font-semibold">
            {mine ? t("chat.ui.you") : message.senderDisplayName}
          </span>
          <span className="text-muted-foreground text-xs">
            {t(`chat.ui.roles.${message.senderRole}`)}
          </span>
          <time
            dateTime={message.createdAt}
            className="text-muted-foreground text-xs"
          >
            {new Intl.DateTimeFormat(i18n.language, {
              hour: "2-digit",
              minute: "2-digit",
            }).format(new Date(message.createdAt))}
          </time>
          {message.deliveryStatus && (
            <span
              className={cn(
                "text-muted-foreground text-xs",
                message.deliveryStatus === "FAILED" && "text-destructive",
              )}
            >
              {t(`chat.delivery.${message.deliveryStatus.toLowerCase()}`)}
            </span>
          )}
        </div>
        <p className="mt-1 text-sm leading-6 [overflow-wrap:anywhere] whitespace-pre-wrap">
          {message.content}
        </p>
        {message.contextType !== "GENERAL" && (
          <p className="text-muted-foreground mt-1 text-xs">
            {t(`chat.context.${message.contextType.toLowerCase()}`)}
          </p>
        )}
        <div className="mt-1 flex flex-wrap items-center justify-between gap-1">
          <div className="flex flex-wrap gap-1">
            {CHAT_REACTIONS.filter(
              ({ code }) => message.reactions[code]?.length,
            ).map(({ code, Icon }) => (
              <Button
                key={code}
                variant={
                  message.reactions[code]?.includes(props.userId)
                    ? "secondary"
                    : "outline"
                }
                size="sm"
                className="h-8 gap-1.5"
                aria-label={t(`chat.reactions.${code}`)}
                aria-pressed={
                  message.reactions[code]?.includes(props.userId) ?? false
                }
                disabled={!props.canPost || props.busy}
                onClick={() => props.onMutate(message, code)}
              >
                <Icon className="size-3.5" />
                {message.reactions[code]?.length}
              </Button>
            ))}
            {!props.hideThread &&
              (message.replyCount > 0 || message.threadRootId) && (
                <Button
                  variant="link"
                  size="sm"
                  className="text-brand-orange-fg px-0"
                  onClick={() => props.onThread(message)}
                >
                  <MessageSquare className="size-3.5" />
                  {message.threadRootId
                    ? t("chat.thread.view")
                    : t("chat.thread.replies", { count: message.replyCount })}
                </Button>
              )}
          </div>
          <ChatMessageActions {...props} />
        </div>
      </div>
    </article>
  );
}
