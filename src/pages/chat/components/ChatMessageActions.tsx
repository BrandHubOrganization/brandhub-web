import { useState } from "react";
import { Copy, MessageSquare, Pin, PinOff, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type {
  ChatReaction,
  CollaborationMessage,
} from "@/types/chatCollaboration";
import { CHAT_REACTIONS } from "@/pages/chat/utils/reactions";

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
  return (
    <div className="flex flex-wrap items-center gap-0.5">
      <Button
        variant="ghost"
        size="icon"
        className="size-9"
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
              className="size-9"
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
            className="size-9"
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
          {CHAT_REACTIONS.map(({ code, Icon }) => (
            <Button
              key={code}
              variant="ghost"
              size="icon"
              className="size-9"
              disabled={!props.canPost || props.busy}
              aria-label={t(`chat.reactions.${code}`)}
              title={t(`chat.reactions.${code}`)}
              aria-pressed={
                props.message.reactions[code]?.includes(props.userId) ?? false
              }
              onClick={() => props.onMutate(props.message, code)}
            >
              <Icon className="size-3.5" />
            </Button>
          ))}
        </>
      )}
      {props.message.deliveryStatus === "FAILED" && (
        <Button
          variant="ghost"
          size="sm"
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
