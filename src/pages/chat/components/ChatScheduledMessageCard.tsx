import { useTranslation } from "react-i18next";
import { Clock3, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChatRichMessage } from "@/pages/chat/components/ChatRichMessage";
import { formatScheduleTime } from "@/pages/chat/utils/chatSchedule";
import type { ScheduledChatMessage } from "@/pages/chat/types/chatSchedule";

interface Props {
  message: ScheduledChatMessage;
  channelName: string;
  busy: boolean;
  onChange: () => void;
  onCancel: () => void;
  onNavigate: () => void;
}

export function ChatScheduledMessageCard({
  message,
  channelName,
  busy,
  onChange,
  onCancel,
  onNavigate,
}: Props) {
  const { t, i18n } = useTranslation();
  const editable = message.status === "PENDING" || message.status === "FAILED";
  const reason = message.errorCode;
  const failure =
    reason === "CHAT_MESSAGE_NOT_FOUND"
      ? "missingRoot"
      : reason === "CHAT_CONTEXT_INVALID"
        ? "invalidContext"
        : reason === "CHAT_CHANNEL_NOT_FOUND" ||
            reason === "CHAT_CHANNEL_READ_ONLY" ||
            reason === "WORKSPACE_ACCESS_DENIED" ||
            reason === "FORBIDDEN" ||
            reason === "ACCOUNT_SUSPENDED"
          ? "permission"
          : "temporary";
  return (
    <article className="border-border bg-card min-w-0 space-y-3 rounded-xl border p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button
          variant="link"
          className="h-auto max-w-full min-w-0 p-0 text-left"
          onClick={onNavigate}
        >
          <span className="truncate">{channelName}</span>
        </Button>
        <Badge
          variant={message.status === "FAILED" ? "destructive" : "outline"}
        >
          {t(`chat.schedule.status.${message.status}`)}
        </Badge>
      </div>
      {message.threadRootId && (
        <p className="text-muted-foreground flex items-center gap-1 text-xs">
          <MessageSquare className="size-3" aria-hidden="true" />
          {t("chat.schedule.threadReply")}
        </p>
      )}
      <div
        className="text-foreground max-h-40 overflow-auto text-sm break-words whitespace-pre-wrap"
        data-chat-rich-lists="true"
      >
        <ChatRichMessage
          document={message.richContent}
          fallback={message.content}
        />
      </div>
      <p className="text-muted-foreground flex items-start gap-1.5 text-xs">
        <Clock3 className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
        <span>
          <time dateTime={message.scheduledAt}>
            {formatScheduleTime(
              message.scheduledAt,
              message.timeZone,
              i18n.language,
            )}
          </time>
          <span className="mt-0.5 block">{message.timeZone}</span>
        </span>
      </p>
      {reason && editable && (
        <p className="text-destructive text-xs" role="status">
          {message.status === "PENDING"
            ? t("chat.schedule.retrying")
            : t(`chat.schedule.failure.${failure}`)}
        </p>
      )}
      {editable && (
        <div className="flex flex-wrap items-center justify-end gap-1">
          <Button
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={onChange}
          >
            {t("chat.schedule.changeTime")}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive"
            disabled={busy}
            onClick={onCancel}
          >
            {t("chat.schedule.cancelSend")}
          </Button>
        </div>
      )}
    </article>
  );
}
