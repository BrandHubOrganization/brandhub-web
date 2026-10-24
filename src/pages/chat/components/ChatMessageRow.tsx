import { useState } from "react";
import { Pin, MessageSquare, SmilePlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChatMessageActions } from "@/pages/chat/components/ChatMessageActions";
import { ChatRichMessage } from "@/pages/chat/components/ChatRichMessage";
import {
  CHAT_REACTIONS,
  REACTION_ICON_MAP,
  TwemojiLikeIcon,
} from "@/pages/chat/utils/reactions";
import type {
  CollaborationMessage,
  ChatDirectoryMember,
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
  groupedWithPrev?: boolean;
  people?: ChatDirectoryMember[];
}

function splitMessageMentions(
  content: string,
  people?: ChatDirectoryMember[],
): string[] {
  if (!content.includes("@")) return [content];
  const escapedNames = (people ?? [])
    .map((person) => person.displayName.trim())
    .filter(Boolean)
    .sort((a, b) => b.length - a.length)
    .map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const nameBranch = escapedNames.length
    ? `@(?:${escapedNames.join("|")})(?=$|\\s|[.,!?;:)])|`
    : "";
  const regex = new RegExp(
    `(${nameBranch}@\\p{Lu}[^\\s@]*(?:\\s+\\p{Lu}[^\\s@]*){0,3}|@[^\\s@]+)`,
    "gu",
  );
  return content.split(regex);
}

export function ChatMessageRow(props: ChatMessageRowProps) {
  const { t, i18n } = useTranslation();
  const [footerPickerOpen, setFooterPickerOpen] = useState(false);
  const { message } = props;
  const mine = message.senderUserId === props.userId;
  const grouped = Boolean(props.groupedWithPrev);
  const pending = message.id.startsWith("optimistic:");
  const formattedTime = new Intl.DateTimeFormat(i18n.language, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(message.createdAt));
  const knownCodes = new Set<ChatReaction>(
    CHAT_REACTIONS.map((item) => item.code),
  );
  const extraReactions = (Object.keys(message.reactions) as ChatReaction[])
    .filter((code) => !knownCodes.has(code) && message.reactions[code]?.length)
    .map((code) => ({
      code,
      emoji: "",
      Icon: REACTION_ICON_MAP[code] ?? TwemojiLikeIcon,
    }));
  const activeReactions = [
    ...CHAT_REACTIONS.filter(({ code }) => message.reactions[code]?.length),
    ...extraReactions,
  ];
  const showThread =
    !props.hideThread &&
    Boolean(message.replyCount > 0 || message.threadRootId);
  const hasFooterItems = activeReactions.length > 0 || showThread;
  const addReactionLabel = t("chat.reactions.add", {
    defaultValue: "Thả biểu cảm",
  });

  return (
    <article
      className={cn(
        "group relative flex gap-3 px-3 transition-colors sm:px-5",
        grouped ? "py-1" : "py-2.5",
        mine
          ? "border-l-brand-orange bg-brand-orange-soft/25 hover:bg-brand-orange-soft/40 focus-within:bg-brand-orange-soft/40 border-l-2"
          : "hover:bg-muted/40 focus-within:bg-muted/40",
        message.pinned && !mine && "bg-amber-500/5",
      )}
    >
      {grouped ? (
        <div className="flex w-9 shrink-0 items-start justify-center pt-1 select-none">
          <time
            dateTime={message.createdAt}
            className="text-muted-foreground font-mono text-[10px] leading-4 tabular-nums opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100"
          >
            {formattedTime}
          </time>
        </div>
      ) : (
        <div
          className={cn(
            "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl text-sm font-semibold shadow-2xs",
            mine
              ? "bg-brand-orange-soft text-brand-orange ring-brand-orange/30 ring-1"
              : "border-border/60 bg-secondary text-secondary-foreground border",
          )}
        >
          {message.senderDisplayName.trim().charAt(0).toUpperCase() || "?"}
        </div>
      )}
      <div className="min-w-0 flex-1">
        {message.pinned && (
          <p className="text-brand-orange mb-1 flex items-center gap-1 text-xs font-medium">
            <Pin className="size-3" />
            {t("chat.actions.pinned")}
          </p>
        )}
        {!grouped && (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span
              className={cn(
                "text-sm font-semibold tracking-tight",
                mine ? "text-brand-orange" : "text-foreground",
              )}
            >
              {mine ? t("chat.ui.you") : message.senderDisplayName}
            </span>
            <span
              className={cn(
                "inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] leading-none font-medium tracking-wide",
                message.senderRole === "MANAGER"
                  ? "border-brand-orange/30 bg-brand-orange-soft/60 text-brand-orange"
                  : message.senderRole === "CREATOR"
                    ? "border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-300"
                    : "border-border/80 bg-muted/60 text-muted-foreground",
              )}
            >
              {t(`chat.ui.roles.${message.senderRole}`)}
            </span>
            <time
              dateTime={message.createdAt}
              className="text-muted-foreground font-mono text-[11px] tabular-nums"
            >
              {formattedTime}
            </time>
            {message.deliveryStatus && (
              <span
                className={cn(
                  "text-muted-foreground font-mono text-[11px]",
                  message.deliveryStatus === "FAILED" &&
                    "text-destructive font-medium",
                )}
              >
                {t(`chat.delivery.${message.deliveryStatus.toLowerCase()}`)}
              </span>
            )}
          </div>
        )}
        {grouped && message.deliveryStatus && (
          <div className="mb-0.5 flex items-center gap-2">
            <span
              className={cn(
                "text-muted-foreground font-mono text-[11px]",
                message.deliveryStatus === "FAILED" &&
                  "text-destructive font-medium",
              )}
            >
              {t(`chat.delivery.${message.deliveryStatus.toLowerCase()}`)}
            </span>
          </div>
        )}
        <div
          className={cn(
            "text-sm leading-6 [overflow-wrap:anywhere] whitespace-pre-wrap",
            !grouped && "mt-0.5",
          )}
        >
          <ChatRichMessage
            document={message.richContent}
            fallback={
              message.content.includes("@")
                ? splitMessageMentions(message.content, props.people).map(
                    (part, index) =>
                      part.startsWith("@") && part.length > 1 ? (
                        <span
                          key={index}
                          className="inline-flex items-center rounded-[4px] bg-[#1d9bd1]/15 px-1 py-0.5 font-medium text-[#1264a3] dark:bg-sky-400/20 dark:text-sky-300"
                        >
                          {part}
                        </span>
                      ) : (
                        part
                      ),
                  )
                : message.content
            }
          />
        </div>
        {message.contextType !== "GENERAL" && (
          <p className="border-border/70 bg-muted/40 text-muted-foreground mt-1 inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium">
            {t(`chat.context.${message.contextType.toLowerCase()}`)}
          </p>
        )}
        <div
          className={cn(
            "flex flex-wrap items-center justify-between gap-1.5",
            hasFooterItems ? "mt-1.5" : "max-sm:mt-1",
          )}
        >
          {hasFooterItems && (
            <div className="flex flex-wrap items-center gap-1.5">
              {activeReactions.map((item) => {
                const { code } = item;
                const Icon =
                  item.Icon ?? REACTION_ICON_MAP[code] ?? TwemojiLikeIcon;
                const reacted =
                  message.reactions[code]?.includes(props.userId) ?? false;
                return (
                  <Button
                    key={code}
                    variant={reacted ? "secondary" : "outline"}
                    size="sm"
                    className={cn(
                      "h-7 gap-1.5 rounded-full px-2.5 font-mono text-xs tabular-nums shadow-2xs transition-all",
                      reacted &&
                        "border-brand-orange/40 bg-brand-orange-soft/80 text-brand-orange hover:bg-brand-orange-soft ring-brand-orange/20 ring-1",
                    )}
                    title={t(`chat.reactions.${code}`)}
                    aria-label={t(`chat.reactions.${code}`)}
                    aria-pressed={reacted}
                    disabled={!props.canPost || props.busy}
                    onClick={() => props.onMutate(message, code)}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span className="font-mono tabular-nums">
                      {message.reactions[code]?.length}
                    </span>
                  </Button>
                );
              })}
              {activeReactions.length > 0 && !pending && (
                <div
                  className="group/footer-picker relative inline-flex"
                  onMouseEnter={() => setFooterPickerOpen(true)}
                  onMouseLeave={() => setFooterPickerOpen(false)}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "text-muted-foreground hover:text-foreground h-7 w-7 rounded-full p-0 shadow-2xs transition-colors",
                      footerPickerOpen && "bg-muted/70 text-foreground",
                    )}
                    disabled={!props.canPost || props.busy}
                    aria-label={addReactionLabel}
                    title={addReactionLabel}
                    aria-expanded={footerPickerOpen}
                    aria-haspopup="true"
                    onClick={() => setFooterPickerOpen((prev) => !prev)}
                  >
                    <SmilePlus className="size-3.5" />
                  </Button>
                  {footerPickerOpen && (
                    <div className="absolute bottom-full left-0 z-30 pb-1.5">
                      <div
                        role="toolbar"
                        aria-label={addReactionLabel}
                        className="border-border/80 bg-popover/95 flex items-center gap-1 rounded-full border px-2 py-1 shadow-lg backdrop-blur-md"
                      >
                        {CHAT_REACTIONS.map((item) => {
                          const { code } = item;
                          const Icon =
                            item.Icon ??
                            REACTION_ICON_MAP[code] ??
                            TwemojiLikeIcon;
                          const active =
                            message.reactions[code]?.includes(props.userId) ??
                            false;
                          return (
                            <button
                              key={code}
                              type="button"
                              className={cn(
                                "hover:bg-muted/80 flex size-8 items-center justify-center rounded-full transition-transform duration-150 hover:scale-125 focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
                                active &&
                                  "bg-brand-orange-soft text-brand-orange ring-brand-orange/30 ring-1",
                              )}
                              disabled={!props.canPost || props.busy}
                              aria-label={t(`chat.reactions.${code}`)}
                              title={t(`chat.reactions.${code}`)}
                              aria-pressed={active}
                              onClick={() => {
                                props.onMutate(message, code);
                                setFooterPickerOpen(false);
                              }}
                            >
                              <Icon className="size-4.5 shrink-0" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {showThread && (
                <Button
                  variant="link"
                  size="sm"
                  className="border-brand-orange/25 bg-brand-orange-soft/40 text-brand-orange hover:bg-brand-orange-soft/80 h-7 gap-1.5 rounded-full border px-2.5 font-mono text-xs font-medium tabular-nums no-underline hover:no-underline"
                  onClick={() => props.onThread(message)}
                >
                  <MessageSquare className="size-3.5" />
                  {message.threadRootId
                    ? t("chat.thread.view")
                    : t("chat.thread.replies", { count: message.replyCount })}
                </Button>
              )}
            </div>
          )}
          <div
            className={cn(
              "max-sm:ml-auto",
              message.deliveryStatus === "FAILED"
                ? "ml-auto"
                : "sm:absolute sm:top-1.5 sm:right-4 sm:z-10",
            )}
          >
            <ChatMessageActions {...props} />
          </div>
        </div>
      </div>
    </article>
  );
}
