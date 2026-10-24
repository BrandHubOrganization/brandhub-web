import { Fragment, useEffect, useLayoutEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { MessagesSquare, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  ChatMessageRow,
  type ChatMessageRowProps,
} from "@/pages/chat/components/ChatMessageRow";
import type { CollaborationMessage } from "@/types/chatCollaboration";
import { chatRetryDelay } from "@/pages/chat/services/chatTransport";

interface TimelineProps extends Omit<ChatMessageRowProps, "message" | "busy"> {
  messages: CollaborationMessage[];
  busyId: string | null;
  loading: boolean;
  error: boolean;
  filtered: boolean;
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  onReload: () => void;
  onRead?: (id: string) => Promise<boolean>;
}

export function ChatTimeline(props: TimelineProps) {
  const { t, i18n } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const previous = useRef({ first: "", last: "", height: 0 });
  const atBottom = useRef(true);
  const lastRead = useRef("");
  const reading = useRef("");
  const attempts = useRef({ id: "", count: 0 });
  const first = props.messages[0]?.id ?? "";
  const last = props.messages.at(-1)?.id ?? "";
  const onRead = props.onRead;
  useLayoutEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    const old = previous.current;
    if (old.first && old.first !== first && old.last === last)
      element.scrollTop += element.scrollHeight - old.height;
    else if (last !== old.last && atBottom.current)
      element.scrollTop = element.scrollHeight;
    previous.current = { first, last, height: element.scrollHeight };
  }, [first, last]);
  useEffect(() => {
    let disposed = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    const acknowledge = () => {
      const element = scrollRef.current;
      if (!element || document.visibilityState !== "visible") return;
      atBottom.current =
        element.scrollHeight - element.scrollTop - element.clientHeight < 40;
      if (
        !atBottom.current ||
        !last ||
        last.startsWith("optimistic:") ||
        props.filtered ||
        props.error
      )
        return;
      if (lastRead.current !== last && reading.current !== last && onRead) {
        if (attempts.current.id !== last)
          attempts.current = { id: last, count: 0 };
        if (attempts.current.count >= 3) return;
        attempts.current.count++;
        reading.current = last;
        void onRead(last).then((success) => {
          reading.current = "";
          if (success) lastRead.current = last;
          if (disposed) return;
          if (!success)
            retryTimer = setTimeout(
              acknowledge,
              Math.max(1500, chatRetryDelay()),
            );
        });
      }
    };
    const element = scrollRef.current;
    acknowledge();
    element?.addEventListener("scroll", acknowledge);
    document.addEventListener("visibilitychange", acknowledge);
    return () => {
      disposed = true;
      clearTimeout(retryTimer);
      element?.removeEventListener("scroll", acknowledge);
      document.removeEventListener("visibilitychange", acknowledge);
    };
  }, [last, onRead, props.error, props.filtered]);
  return (
    <div
      ref={scrollRef}
      className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
    >
      {props.error && (
        <div
          role="alert"
          className="border-destructive/20 bg-destructive/5 m-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3 text-sm"
        >
          <p>{t("chat.errors.loadHistory")}</p>
          <Button variant="outline" size="sm" onClick={props.onReload}>
            <RefreshCw className="size-4" />
            {t("chat.actions.retry")}
          </Button>
        </div>
      )}
      {props.hasMore && (
        <div className="flex justify-center py-4">
          <Button
            variant="outline"
            size="sm"
            loading={props.loadingMore}
            onClick={props.onLoadMore}
          >
            {t("chat.loadOlder")}
          </Button>
        </div>
      )}
      {props.loading && !props.messages.length && (
        <div
          role="status"
          className="flex h-40 items-center justify-center gap-2"
        >
          <Spinner />
          <span className="text-muted-foreground text-sm">
            {t("chat.ui.loading")}
          </span>
        </div>
      )}
      {!props.loading && !props.error && !props.messages.length && (
        <div className="flex min-h-56 flex-col items-center justify-center p-6 text-center">
          <MessagesSquare
            className="text-muted-foreground mb-4 size-8"
            aria-hidden="true"
          />
          <p className="text-sm font-semibold">
            {t(props.filtered ? "chat.search.empty" : "chat.empty.title")}
          </p>
          <p className="text-muted-foreground mt-2 max-w-sm text-sm leading-6">
            {t(
              props.filtered
                ? "chat.search.emptyDescription"
                : "chat.empty.description",
            )}
          </p>
        </div>
      )}
      <div
        role="log"
        aria-label={t("chat.ui.messages")}
        aria-live="polite"
        aria-relevant="additions"
        className="pb-3"
      >
        {props.messages.map((message, index) => (
          <Fragment key={message.id}>
            {(!index ||
              new Date(message.createdAt).toDateString() !==
                new Date(
                  props.messages[index - 1].createdAt,
                ).toDateString()) && (
              <div className="my-3 flex items-center gap-3 px-5">
                <span className="bg-border h-px flex-1" />
                <time
                  dateTime={message.createdAt}
                  className="text-muted-foreground text-xs"
                >
                  {new Intl.DateTimeFormat(i18n.language, {
                    dateStyle: "medium",
                  }).format(new Date(message.createdAt))}
                </time>
                <span className="bg-border h-px flex-1" />
              </div>
            )}
            <ChatMessageRow
              message={message}
              userId={props.userId}
              canPost={props.canPost}
              busy={props.busyId === message.id}
              onThread={props.onThread}
              onRetry={props.onRetry}
              onMutate={props.onMutate}
              hideThread={props.hideThread}
            />
          </Fragment>
        ))}
      </div>
    </div>
  );
}
