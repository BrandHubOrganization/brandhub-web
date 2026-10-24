import { useId, useRef, useState, type KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import { AtSign, SendHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  editMentionRanges,
  mentionTrigger,
  type ChatMentionRange,
} from "@/pages/chat/utils/chatMentions";
import type { ChatContextType } from "@/types/chat";
import type {
  ChannelMessageRequest,
  ChatDirectoryMember,
} from "@/types/chatCollaboration";

interface ComposerProps {
  canPost: boolean;
  people: ChatDirectoryMember[];
  contextType: ChatContextType;
  contextId: string | null;
  threadRootId?: string;
  onSend: (request: ChannelMessageRequest) => boolean;
}

export function ChatChannelComposer(props: ComposerProps) {
  const { t } = useTranslation();
  const [content, setContent] = useState("");
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [ranges, setRanges] = useState<ChatMentionRange[]>([]);
  const [active, setActive] = useState(0);
  const [trigger, setTrigger] =
    useState<ReturnType<typeof mentionTrigger>>(null);
  const listId = useId();
  const matches = props.people
    .filter((person) =>
      person.displayName
        .toLocaleLowerCase()
        .includes(mentionQuery.toLocaleLowerCase()),
    )
    .slice(0, 20);
  const canMention = new Set(ranges.map((range) => range.userId)).size < 20;
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const send = () => {
    if (!props.canPost || !content.trim()) return;
    const sent = props.onSend({
      clientMessageId: crypto.randomUUID(),
      content: content.trim(),
      contextType: props.contextType,
      contextId: props.contextId,
      threadRootId: props.threadRootId ?? null,
      mentionUserIds: [...new Set(ranges.map((range) => range.userId))],
    });
    if (sent) {
      setContent("");
      setRanges([]);
      setMentionOpen(false);
      inputRef.current?.focus();
    }
  };
  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.nativeEvent.isComposing) return;
    if (mentionOpen && event.key === "Escape") {
      event.preventDefault();
      setMentionOpen(false);
      return;
    }
    if (mentionOpen && ["ArrowDown", "ArrowUp"].includes(event.key)) {
      event.preventDefault();
      setActive(
        (index) =>
          (index + (event.key === "ArrowDown" ? 1 : -1) + matches.length) %
          Math.max(matches.length, 1),
      );
      return;
    }
    if (mentionOpen && event.key === "Enter") {
      event.preventDefault();
      if (matches[active] && canMention) mention(matches[active]);
      return;
    }
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      send();
    }
  };
  const mention = (person: ChatDirectoryMember) => {
    const input = inputRef.current;
    if (!canMention) return;
    const start = trigger?.start ?? input?.selectionStart ?? content.length;
    const end = trigger?.end ?? input?.selectionEnd ?? start;
    const next = `${content.slice(0, start)}@${person.displayName} ${content.slice(end)}`;
    if (next.length > 4000) return;
    setContent(next);
    const delta = next.length - content.length;
    setRanges([
      ...ranges.flatMap((range) => {
        if (range.end <= start) return [range];
        if (range.start >= end)
          return [
            { ...range, start: range.start + delta, end: range.end + delta },
          ];
        return [];
      }),
      {
        start,
        end: start + person.displayName.length + 1,
        userId: person.userId,
      },
    ]);
    setTrigger(null);
    setMentionOpen(false);
    requestAnimationFrame(() => {
      input?.focus();
      input?.setSelectionRange(
        start + person.displayName.length + 2,
        start + person.displayName.length + 2,
      );
    });
  };
  return (
    <footer className="border-border bg-card relative shrink-0 border-t p-3 sm:p-4">
      {!props.canPost && (
        <p
          role="status"
          className="text-muted-foreground py-3 text-center text-sm"
        >
          {t("chat.channels.readOnly")}
        </p>
      )}
      <div hidden={!props.canPost}>
        {props.contextType !== "GENERAL" && (
          <p className="text-muted-foreground mb-2 text-xs">
            {t("chat.composer.contextHint", {
              context: t(`chat.context.${props.contextType.toLowerCase()}`),
            })}
          </p>
        )}
        {mentionOpen && (
          <section
            aria-label={t("chat.composer.mention")}
            className="border-border bg-card mb-3 rounded-xl border p-3 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Input
                aria-label={t("chat.composer.findMember")}
                placeholder={t("chat.composer.findMember")}
                value={mentionQuery}
                onChange={(event) => setMentionQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setMentionOpen(false);
                    inputRef.current?.focus();
                  }
                }}
              />
              <Button
                variant="ghost"
                size="icon"
                aria-label={t("chat.actions.close")}
                onClick={() => setMentionOpen(false)}
              >
                <X className="size-4" />
              </Button>
            </div>
            <div
              id={listId}
              role="listbox"
              aria-label={t("chat.composer.mention")}
              className="mt-2 max-h-32 overflow-y-auto"
            >
              {matches.map((person, index) => (
                <Button
                  id={`${listId}-${index}`}
                  role="option"
                  aria-selected={active === index}
                  disabled={!canMention}
                  key={person.userId}
                  variant={active === index ? "secondary" : "ghost"}
                  className="min-h-11 w-full justify-start"
                  onClick={() => mention(person)}
                >
                  {person.displayName}
                  <span className="text-muted-foreground text-xs">
                    {t(`chat.ui.roles.${person.role}`)}
                  </span>
                </Button>
              ))}
              {!matches.length && (
                <p role="status" className="p-2 text-sm">
                  {t("chat.composer.noMembers")}
                </p>
              )}
              {!canMention && (
                <p role="status" className="p-2 text-sm">
                  {t("chat.composer.mentionLimit")}
                </p>
              )}
            </div>
          </section>
        )}
        <div className="border-border focus-within:border-ring rounded-xl border">
          {ranges.length > 0 && (
            <div className="flex flex-wrap gap-1 px-3 pt-2">
              {[...new Set(ranges.map((range) => range.userId))].map(
                (userId) => (
                  <Button
                    key={userId}
                    size="sm"
                    variant="secondary"
                    className="text-brand-orange-fg h-8 gap-1"
                    aria-label={t("chat.composer.removeMention", {
                      name:
                        props.people.find((person) => person.userId === userId)
                          ?.displayName ?? userId,
                    })}
                    onClick={() =>
                      setRanges((current) =>
                        current.filter((range) => range.userId !== userId),
                      )
                    }
                  >
                    @
                    {props.people.find((person) => person.userId === userId)
                      ?.displayName ?? userId}
                    <X className="size-3" aria-hidden="true" />
                  </Button>
                ),
              )}
            </div>
          )}
          <Textarea
            ref={inputRef}
            rows={2}
            value={content}
            maxLength={4000}
            aria-label={t("chat.composer.ariaLabel")}
            aria-controls={mentionOpen ? listId : undefined}
            aria-activedescendant={
              mentionOpen && matches[active] ? `${listId}-${active}` : undefined
            }
            placeholder={t(
              props.threadRootId
                ? "chat.composer.threadPlaceholder"
                : "chat.composer.placeholder",
            )}
            className="min-h-20 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0"
            onChange={(event) => {
              const next = event.target.value;
              setRanges(editMentionRanges(content, next, ranges));
              setContent(next);
              const found = mentionTrigger(next, event.target.selectionStart);
              setTrigger(found);
              setMentionOpen(Boolean(found));
              setMentionQuery(found?.query ?? "");
              setActive(0);
            }}
            onClick={() => {
              setMentionOpen(false);
              setTrigger(null);
            }}
            onKeyDown={handleKeyDown}
          />
          <div className="flex items-center justify-between gap-2 px-2 pb-2">
            <div className="flex min-w-0 items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="size-11"
                aria-label={t("chat.composer.mention")}
                aria-expanded={mentionOpen}
                onClick={() => {
                  setTrigger(null);
                  setMentionQuery("");
                  setActive(0);
                  setMentionOpen(!mentionOpen);
                }}
              >
                <AtSign className="size-4" />
              </Button>
              <p className="text-muted-foreground hidden truncate text-xs sm:block">
                {t("chat.ui.keyboardHint")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-xs">
                {content.length}/4000
              </span>
              <Button
                variant="orange"
                size="icon"
                className="size-11"
                disabled={!content.trim()}
                aria-label={t("chat.composer.send")}
                onClick={send}
              >
                <SendHorizontal className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
