import { useState } from "react";
import {
  Copy,
  MessageSquare,
  Pin,
  PinOff,
  RotateCcw,
  SmilePlus,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  ChatReaction,
  CollaborationMessage,
} from "@/types/chatCollaboration";
import {
  CHAT_REACTIONS,
  REACTION_ICON_MAP,
  TwemojiLikeIcon,
} from "@/pages/chat/utils/reactions";

interface ActionsProps {
  message: CollaborationMessage;
  userId: string;
  canPost: boolean;
  busy: boolean;
  onThread: (message: CollaborationMessage) => void;
  onRetry: (message: CollaborationMessage) => void;
  onMutate: (message: CollaborationMessage, code?: ChatReaction) => void;
  hideThread?: boolean;
}

export function ChatMessageActions(props: ActionsProps) {
  const { t } = useTranslation();
  const [copying, setCopying] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const copy = async () => {
    setCopying(true);
    try {
      await navigator.clipboard.writeText(props.message.content);
      toast.success(t("chat.actions.copied"));
    } catch {
      toast.error(t("chat.errors.copy"));
    } finally {
      setCopying(false);
    }
  };
  const pending = props.message.id.startsWith("optimistic:");
  const failed = props.message.deliveryStatus === "FAILED";
  const addReactionLabel = t("chat.reactions.add", {
    defaultValue: "Thả biểu cảm",
  });

  return (
    <div
      className={cn(
        "border-border/80 bg-popover/95 flex flex-wrap items-center gap-0.5 rounded-lg border p-0.5 shadow-xs backdrop-blur-xs transition-opacity duration-150",
        failed
          ? "opacity-100"
          : "opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 max-sm:opacity-100",
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-foreground size-7 rounded-md"
        title={t("chat.actions.copy")}
        aria-label={t("chat.actions.copy")}
        loading={copying}
        onClick={() => void copy()}
      >
        <Copy className="size-3.5" />
      </Button>
      {!pending && (
        <>
          {!props.hideThread && (
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground size-7 rounded-md"
              title={t("chat.actions.thread")}
              aria-label={t("chat.actions.thread")}
              onClick={() => props.onThread(props.message)}
            >
              <MessageSquare className="size-3.5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "text-muted-foreground hover:text-foreground size-7 rounded-md",
              props.message.pinned &&
                "bg-brand-orange-soft/50 text-brand-orange hover:bg-brand-orange-soft/80 hover:text-brand-orange",
            )}
            disabled={!props.canPost || props.busy}
            aria-label={t(
              props.message.pinned ? "chat.actions.unpin" : "chat.actions.pin",
            )}
            title={t(
              props.message.pinned ? "chat.actions.unpin" : "chat.actions.pin",
            )}
            onClick={() => props.onMutate(props.message)}
          >
            {props.message.pinned ? (
              <PinOff className="size-3.5" />
            ) : (
              <Pin className="size-3.5" />
            )}
          </Button>
          <div
            className="group/picker relative inline-flex"
            onMouseEnter={() => setPickerOpen(true)}
            onMouseLeave={() => setPickerOpen(false)}
          >
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "text-muted-foreground hover:text-foreground size-7 rounded-md",
                pickerOpen && "bg-muted/70 text-foreground",
              )}
              disabled={!props.canPost || props.busy}
              aria-label={addReactionLabel}
              title={addReactionLabel}
              aria-expanded={pickerOpen}
              aria-haspopup="true"
              onClick={() => setPickerOpen((prev) => !prev)}
            >
              <SmilePlus className="size-3.5" />
            </Button>
            <div
              className={cn(
                "absolute right-0 bottom-full z-30 pb-1.5 transition-all duration-150",
                pickerOpen
                  ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                  : "pointer-events-none translate-y-1 scale-95 opacity-0 group-focus-within/picker:pointer-events-auto group-focus-within/picker:translate-y-0 group-focus-within/picker:scale-100 group-focus-within/picker:opacity-100 group-hover/picker:pointer-events-auto group-hover/picker:translate-y-0 group-hover/picker:scale-100 group-hover/picker:opacity-100",
              )}
            >
              <div
                role="toolbar"
                aria-label={addReactionLabel}
                className="border-border/80 bg-popover/95 flex items-center gap-1 rounded-full border px-2 py-1 shadow-lg backdrop-blur-md"
              >
                {CHAT_REACTIONS.map((item) => {
                  const { code } = item;
                  const Icon =
                    item.Icon ?? REACTION_ICON_MAP[code] ?? TwemojiLikeIcon;
                  const active =
                    props.message.reactions[code]?.includes(props.userId) ??
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
                        props.onMutate(props.message, code);
                        setPickerOpen(false);
                      }}
                    >
                      <Icon className="size-4.5 shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
      {failed && (
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive h-7 rounded-md px-2 text-xs"
          disabled={!props.canPost}
          onClick={() => props.onRetry(props.message)}
        >
          <RotateCcw className="size-3.5" />
          {t("chat.actions.retry")}
        </Button>
      )}
    </div>
  );
}
