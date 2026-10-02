import { useState, type KeyboardEvent } from "react";
import { SendHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { ChatContextType, SendChatMessage } from "@/types/chat";

const MAX_MESSAGE_LENGTH = 4000;

interface ChatComposerProps {
  connected: boolean;
  contextType: ChatContextType;
  contextId: string | null;
  onSend: (message: SendChatMessage) => boolean;
}

export function ChatComposer({
  connected,
  contextType,
  contextId,
  onSend,
}: ChatComposerProps) {
  const { t } = useTranslation();
  const [content, setContent] = useState("");

  const send = () => {
    const normalized = content.trim();
    if (!normalized || !connected) return;
    const didSend = onSend({
      clientMessageId: crypto.randomUUID(),
      content: normalized,
      contextType,
      contextId,
    });
    if (didSend) setContent("");
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      send();
    }
  };

  return (
    <footer className="border-border bg-card shrink-0 border-t p-3 sm:p-4">
      {contextType !== "GENERAL" && (
        <p className="text-muted-foreground mb-2 text-xs">
          {t("chat.composer.contextHint", {
            context: t(`chat.context.${contextType.toLowerCase()}`),
          })}
        </p>
      )}
      <div className="flex items-end gap-2">
        <Textarea
          value={content}
          maxLength={MAX_MESSAGE_LENGTH}
          rows={1}
          disabled={!connected}
          placeholder={
            connected
              ? t("chat.composer.placeholder")
              : t("chat.composer.offlinePlaceholder")
          }
          aria-label={t("chat.composer.ariaLabel")}
          className="max-h-32 min-h-10 resize-none rounded-2xl py-2.5"
          onChange={(event) => setContent(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button
          variant="orange"
          size="icon"
          className="size-10 rounded-full"
          aria-label={t("chat.composer.send")}
          disabled={!connected || !content.trim()}
          onClick={send}
        >
          <SendHorizontal className="size-4" />
        </Button>
      </div>
      {content.length > 3500 && (
        <p className="text-muted-foreground mt-1 text-right text-3xs">
          {content.length}/{MAX_MESSAGE_LENGTH}
        </p>
      )}
    </footer>
  );
}
