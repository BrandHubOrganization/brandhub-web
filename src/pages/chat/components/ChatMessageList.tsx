import { useEffect, useRef } from "react";
import { MessagesSquare } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { ChatMessage } from "@/types/chat";
import { ChatMessageBubble } from "./ChatMessageBubble";

interface ChatMessageListProps {
  messages: ChatMessage[];
  currentUserId: string;
  hasMore: boolean;
  loading: boolean;
  onLoadOlder: () => void;
}

export function ChatMessageList({
  messages,
  currentUserId,
  hasMore,
  loading,
  onLoadOlder,
}: ChatMessageListProps) {
  const { t, i18n } = useTranslation();
  const bottomRef = useRef<HTMLDivElement>(null);
  const previousLastMessageId = useRef<string | null>(null);
  const lastMessageId = messages.at(-1)?.id ?? null;

  useEffect(() => {
    if (lastMessageId && lastMessageId !== previousLastMessageId.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    previousLastMessageId.current = lastMessageId;
  }, [lastMessageId]);

  if (loading && messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="text-muted-foreground flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="bg-muted mb-3 flex size-14 items-center justify-center rounded-full">
          <MessagesSquare className="size-6" />
        </div>
        <p className="text-foreground font-medium">{t("chat.empty.title")}</p>
        <p className="mt-1 max-w-sm text-sm">{t("chat.empty.description")}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-3 py-4 sm:px-6">
      {hasMore && (
        <div className="mb-4 flex justify-center">
          <Button variant="ghost" size="sm" loading={loading} onClick={onLoadOlder}>
            {t("chat.loadOlder")}
          </Button>
        </div>
      )}
      <div className="space-y-3">
        {messages.map((message) => (
          <ChatMessageBubble
            key={message.id}
            message={message}
            isMine={message.senderUserId === currentUserId}
            locale={i18n.language === "en" ? "en-US" : "vi-VN"}
          />
        ))}
      </div>
      <div ref={bottomRef} />
    </div>
  );
}
