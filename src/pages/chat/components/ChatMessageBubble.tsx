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
      <Icon className="size-3.5" />
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
  const initial = message.senderDisplayName.trim().charAt(0).toUpperCase() || "?";
  const time = new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(message.createdAt));

  return (
    <article className={cn("flex items-end gap-2", isMine && "flex-row-reverse")}>
      {!isMine && (
        <div className="bg-secondary text-secondary-foreground flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
          {initial}
        </div>
      )}
      <div className={cn("max-w-[82%] sm:max-w-[68%]", isMine && "text-right")}>
        {!isMine && (
          <p className="text-muted-foreground mb-1 px-1 text-xs font-medium">
            {message.senderDisplayName}
          </p>
        )}
        <div
          className={cn(
            "rounded-2xl px-3.5 py-2 text-left text-sm shadow-sm",
            isMine
              ? "bg-brand-orange rounded-br-md text-white"
              : "border-border bg-card text-card-foreground rounded-bl-md border",
          )}
        >
          <ContextBadge message={message} />
          <p className="break-words whitespace-pre-wrap">{message.content}</p>
          <div
            className={cn(
              "mt-1 flex items-center justify-end gap-1 text-3xs",
              isMine ? "text-white/75" : "text-muted-foreground",
            )}
          >
            <span>{time}</span>
            {isMine && message.deliveryStatus && (
              <span>{t(`chat.delivery.${message.deliveryStatus.toLowerCase()}`)}</span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
