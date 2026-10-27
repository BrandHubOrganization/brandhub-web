import {
  Fragment,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { ArrowDown, MessagesSquare, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  ChatMessageRow,
  type ChatMessageRowProps,
} from "@/pages/chat/components/ChatMessageRow";
import type { CollaborationMessage } from "@/types/chatCollaboration";
import { chatRetryDelay } from "@/pages/chat/services/chatTransport";

interface TimelineProps
  extends Omit<ChatMessageRowProps, "message" | "busy" | "groupedWithPrev"> {
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

const GROUP_WINDOW_MS = 300_000;

export function ChatTimeline(props: TimelineProps) {
  const { t, i18n } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const previous = useRef({ first: "", last: "", height: 0 });
  const atBottom = useRef(true);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
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
      if (!element) return;
      const isAtBottom =
        element.scrollHeight - element.scrollTop - element.clientHeight < 40;
      atBottom.current = isAtBottom;
      setShowScrollBottom((prev) =>
        prev !== !isAtBottom ? !isAtBottom : prev,
      );
      if (document.visibilityState !== "visible") return;
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

  const scrollToBottom = () => {
    const element = scrollRef.current;
    if (!element) return;
    if (typeof element.scrollTo === "function") {
      element.scrollTo({ top: element.scrollHeight, behavior: "smooth" });
    } else {
      element.scrollTop = element.scrollHeight;
    }
    atBottom.current = true;
    setShowScrollBottom(false);
  };

  return (
    <div
      ref={scrollRef}
      className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain"
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
            className="rounded-full px-4 text-xs shadow-2xs"
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
          className="flex flex-col gap-4 p-4 sm:p-5"
        >
          <div className="flex items-center justify-center gap-2 py-2">
            <Spinner />
            <span className="text-muted-foreground text-sm">
              {t("chat.ui.loading")}
            </span>
          </div>
          <div className="space-y-4" aria-hidden="true">
            {[0, 1, 2].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <div className="bg-muted/70 size-8 shrink-0 animate-pulse rounded-lg" />
                <div className="flex-1 space-y-2 pt-0.5">
                  <div className="flex items-center gap-2">
                    <div className="bg-muted/70 h-3.5 w-24 animate-pulse rounded-md" />
                    <div className="bg-muted/50 h-3 w-12 animate-pulse rounded-md" />
                  </div>
                  <div className="bg-muted/60 h-4 w-4/5 animate-pulse rounded-lg" />
                  {item % 2 === 0 && (
                    <div className="bg-muted/40 h-4 w-3/5 animate-pulse rounded-lg" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {!props.loading && !props.error && !props.messages.length && (
        <div className="flex min-h-64 flex-col items-center justify-center p-6 text-center">
          <div className="border-border/60 bg-muted/40 mb-4 rounded-2xl border p-1.5 shadow-2xs">
            <div className="border-border/50 bg-card flex size-12 items-center justify-center rounded-xl border shadow-2xs">
              <MessagesSquare
                className="text-brand-orange size-5"
                aria-hidden="true"
              />
            </div>
          </div>
          <p className="text-foreground text-sm font-semibold tracking-tight">
            {t(props.filtered ? "chat.search.empty" : "chat.empty.title")}
          </p>
          <p className="text-muted-foreground mt-1.5 max-w-sm text-sm leading-6">
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
        className="pb-2"
      >
        {props.messages.map((message, index) => {
          const prev = index > 0 ? props.messages[index - 1] : undefined;
          const sameDay = Boolean(
            prev &&
              new Date(message.createdAt).toDateString() ===
                new Date(prev.createdAt).toDateString(),
          );
          const groupedWithPrev = Boolean(
            prev &&
              sameDay &&
              prev.senderUserId === message.senderUserId &&
              prev.contextType === message.contextType &&
              prev.contextId === message.contextId &&
              !prev.pinned &&
              !message.pinned &&
              Math.abs(
                new Date(message.createdAt).getTime() -
                  new Date(prev.createdAt).getTime(),
              ) < GROUP_WINDOW_MS,
          );
          return (
            <Fragment key={message.id}>
              {!sameDay && (
                <div className="my-2.5 flex items-center gap-3 px-4 sm:px-5">
                  <span className="bg-border/60 h-px flex-1" />
                  <time
                    dateTime={message.createdAt}
                    className="border-border/80 bg-muted/60 text-muted-foreground rounded-full border px-2.5 py-0.5 text-[10px] font-medium shadow-2xs"
                  >
                    {new Intl.DateTimeFormat(i18n.language, {
                      dateStyle: "medium",
                    }).format(new Date(message.createdAt))}
                  </time>
                  <span className="bg-border/60 h-px flex-1" />
                </div>
              )}
              <ChatMessageRow
                message={message}
                userId={props.userId}
                canPost={props.canPost}
                busy={props.busyId === message.id}
                groupedWithPrev={groupedWithPrev}
                people={props.people}
                onThread={props.onThread}
                onRetry={props.onRetry}
                onMutate={props.onMutate}
                hideThread={props.hideThread}
              />
            </Fragment>
          );
        })}
      </div>
      {showScrollBottom && props.messages.length > 0 && (
        <div className="pointer-events-none sticky bottom-3 z-10 flex justify-end px-4">
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="border-border/80 bg-popover/95 text-foreground hover:bg-accent pointer-events-auto size-9 rounded-full border shadow-md backdrop-blur-xs"
            aria-label={t("chat.ui.scrollToBottom", {
              defaultValue: "Scroll to latest messages",
            })}
            onClick={scrollToBottom}
          >
            <ArrowDown className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
