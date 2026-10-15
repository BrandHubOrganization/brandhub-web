import { BriefcaseBusiness, Megaphone } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types/chat";

interface ChatMessageBubbleProps {
  message: ChatMessage;
  isMine: boolean;
  locale: string;
}

function ContextBadge({ message }: { message: ChatMessage }) {
  const { t } = useTranslation();
  if (message.contextType === "GENERAL") return null;
  const Icon =
    message.contextType === "MEDIA_PACKAGE" ? BriefcaseBusiness : Megaphone;
  return (
    <div className="mb-1.5 flex items-center gap-1 border-b border-current/15 pb-1.5 text-xs font-medium opacity-90">
      <Icon className="size-3.5" aria-hidden="true" />
      {t(`chat.context.${message.contextType.toLowerCase()}`)}
    </div>
  );
}

export function ChatMessageBubble({
  message,
  isMine,
  locale,
}: ChatMessageBubbleProps) {
  const { t } = useTranslation();
  const initial =
    message.senderDisplayName.trim().charAt(0).toUpperCase() || "?";
  const time = new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(message.createdAt));

  return (
    <article
      className={cn("flex items-end gap-2", isMine && "flex-row-reverse")}
    >
      {!isMine && (
        <div className="bg-secondary text-secondary-foreground flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
          {initial}
        </div>
      )}
      <div
        className={cn(
          "max-w-[85%] min-w-0 sm:max-w-[72%]",
          isMine && "text-right",
        )}
      >
        {!isMine && (
          <p className="text-muted-foreground mb-1 px-1 text-xs font-medium">
            {message.senderDisplayName}{" "}
            <span className="ml-1 font-normal">
              · {t(`chat.ui.roles.${message.senderRole}`)}
            </span>
          </p>
        )}
        <div
          className={cn(
            "rounded-2xl border px-4 py-3 text-left text-sm",
            isMine
              ? "border-brand-orange/20 bg-brand-orange-soft text-foreground rounded-br-md"
              : "border-border bg-card text-card-foreground rounded-bl-md border",
          )}
        >
          <ContextBadge message={message} />
          <p className="leading-6 [overflow-wrap:anywhere] whitespace-pre-wrap">
            {message.content}
          </p>
          <div
            className={cn(
              "text-muted-foreground mt-2 flex flex-wrap items-center justify-end gap-2 text-xs",
            )}
          >
            <time dateTime={message.createdAt}>{time}</time>
            {isMine && message.deliveryStatus && (
              <span
                className={
                  message.deliveryStatus === "FAILED"
                    ? "text-destructive font-medium"
                    : undefined
                }
              >
                {t(`chat.delivery.${message.deliveryStatus.toLowerCase()}`)}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
