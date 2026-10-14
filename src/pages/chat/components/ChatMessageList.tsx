import { Fragment, useEffect, useLayoutEffect, useRef } from "react";
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const previousLast = useRef<string | null>(null);
  const previousFirst = useRef<string | null>(null);
  const previousHeight = useRef(0);
  const nearBottom = useRef(true);
  const lastId = messages.at(-1)?.id ?? null;
  const firstId = messages[0]?.id ?? null;
  useLayoutEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    if (
      previousFirst.current &&
      firstId !== previousFirst.current &&
      lastId === previousLast.current
    ) {
      element.scrollTop += element.scrollHeight - previousHeight.current;
    }
    previousFirst.current = firstId;
    previousHeight.current = element.scrollHeight;
  }, [firstId, lastId]);
  useEffect(() => {
    const element = scrollRef.current;
    if (
      element &&
      lastId &&
      lastId !== previousLast.current &&
      (nearBottom.current || messages.at(-1)?.senderUserId === currentUserId)
    ) {
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      element.scrollTo({
        top: element.scrollHeight,
        behavior: reduced || !previousLast.current ? "instant" : "smooth",
      });
    }
    previousLast.current = lastId;
  }, [lastId, messages, currentUserId]);
  if (loading && !messages.length)
    return (
      <div
        role="status"
        className="flex min-h-0 flex-1 items-center justify-center"
      >
        <Spinner />
        <span className="sr-only">{t("chat.ui.loading")}</span>
      </div>
    );
  if (!messages.length)
    return (
      <div className="text-muted-foreground flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-8 text-center">
        <MessagesSquare className="mb-4 size-8" aria-hidden="true" />
        <p className="text-foreground font-medium">{t("chat.empty.title")}</p>
        <p className="mt-2 max-w-sm text-sm leading-6">
          {t("chat.empty.description")}
        </p>
      </div>
    );
  const day = (value: string) => new Date(value).toDateString();
  return (
    <div
      ref={scrollRef}
      onScroll={(event) => {
        const element = event.currentTarget;
        nearBottom.current =
          element.scrollHeight - element.scrollTop - element.clientHeight < 100;
      }}
      className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-5 sm:px-6"
    >
      {hasMore && (
        <div className="mb-5 flex justify-center">
          <Button
            variant="outline"
            size="sm"
            loading={loading}
            onClick={onLoadOlder}
          >
            {t("chat.loadOlder")}
          </Button>
        </div>
      )}
      <div
        role="log"
        aria-label={t("chat.ui.messages")}
        aria-live="polite"
        aria-relevant="additions"
        className="space-y-4"
      >
        {messages.map((message, index) => (
          <Fragment key={message.id}>
            {(!index ||
              day(message.createdAt) !==
                day(messages[index - 1].createdAt)) && (
              <div className="flex items-center gap-3 py-2">
                <span className="bg-border h-px flex-1" aria-hidden="true" />
                <time
                  dateTime={message.createdAt.slice(0, 10)}
                  className="text-muted-foreground text-xs"
                >
                  {new Intl.DateTimeFormat(i18n.language, {
                    dateStyle: "medium",
                  }).format(new Date(message.createdAt))}
                </time>
                <span className="bg-border h-px flex-1" aria-hidden="true" />
              </div>
            )}
            <ChatMessageBubble
              message={message}
              isMine={message.senderUserId === currentUserId}
              locale={i18n.language}
            />
          </Fragment>
        ))}
      </div>
    </div>
  );
}
