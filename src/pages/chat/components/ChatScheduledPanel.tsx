import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Clock3, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useChatSchedules } from "@/pages/chat/hooks/useChatSchedules";
import { ChatScheduleTimeDialog } from "@/pages/chat/components/ChatScheduleTimeDialog";
import { ChatScheduledMessageCard } from "@/pages/chat/components/ChatScheduledMessageCard";
import { scheduleErrorKey } from "@/pages/chat/utils/chatSchedule";
import type { ScheduledChatMessage } from "@/pages/chat/types/chatSchedule";
import type { ChatChannel } from "@/types/chatCollaboration";

interface Props {
  workspaceId: string;
  channels: ChatChannel[];
  onClose: () => void;
  onNavigate: (channelId: string, root: string | null) => void;
}

export function ChatScheduledPanel(props: Props) {
  const { t } = useTranslation();
  const queue = useChatSchedules(props.workspaceId);
  const [editing, setEditing] = useState<ScheduledChatMessage | null>(null);
  const busy =
    queue.change.isPending || queue.cancel.isPending || queue.history.isError;
  return (
    <section
      className="bg-card flex h-full min-h-0 flex-col"
      aria-label={t("chat.schedule.title")}
    >
      <header className="border-border flex shrink-0 items-center gap-2 border-b px-4 py-3">
        <Clock3
          className="text-brand-orange size-4 shrink-0"
          aria-hidden="true"
        />
        <h2 className="flex-1 text-sm font-semibold">
          {t("chat.schedule.title")}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          className="size-9"
          aria-label={t("chat.actions.close")}
          onClick={props.onClose}
        >
          <X className="size-4" />
        </Button>
      </header>
      <div className="border-border shrink-0 space-y-2 border-b p-3">
        <p className="text-muted-foreground text-xs">
          {t("chat.schedule.privateHint")}
        </p>
        <div className="flex items-center justify-between gap-2">
          <Button
            variant={queue.includeCompleted ? "secondary" : "ghost"}
            size="sm"
            className="h-auto min-h-9 text-left text-xs whitespace-normal"
            aria-pressed={queue.includeCompleted}
            onClick={() => queue.setIncludeCompleted(!queue.includeCompleted)}
          >
            {t("chat.schedule.showHistory")}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-9 shrink-0"
            disabled={queue.history.isFetching}
            aria-label={t("chat.actions.retry")}
            onClick={() => void queue.history.refetch()}
          >
            <RefreshCw className="size-4" />
          </Button>
        </div>
      </div>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
        {queue.history.isPending && (
          <div className="flex justify-center py-6" role="status">
            <Spinner />
          </div>
        )}
        {queue.history.isError && (
          <div role="alert" className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              {t(scheduleErrorKey(queue.history.error))}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void queue.history.refetch()}
            >
              {t("chat.actions.retry")}
            </Button>
          </div>
        )}
        {!queue.history.isPending &&
          !queue.history.isError &&
          !queue.items.length && (
            <p className="text-muted-foreground py-6 text-center text-sm">
              {t("chat.schedule.empty")}
            </p>
          )}
        {queue.items.map((message) => (
          <ChatScheduledMessageCard
            key={message.id}
            message={message}
            busy={busy}
            channelName={
              message.channelId === "general"
                ? t("chat.channels.general")
                : props.channels.find(
                    (channel) => channel.id === message.channelId,
                  )?.name ||
                  t("chat.schedule.conversation", {
                    id: message.channelId.slice(0, 8),
                  })
            }
            onChange={() => setEditing(message)}
            onCancel={() => queue.cancel.mutate(message)}
            onNavigate={() =>
              props.onNavigate(message.channelId, message.threadRootId)
            }
          />
        ))}
        {queue.history.hasNextPage && (
          <Button
            variant="outline"
            className="w-full"
            loading={queue.history.isFetchingNextPage}
            disabled={queue.history.isFetchingNextPage}
            onClick={() => void queue.history.fetchNextPage()}
          >
            {t("chat.schedule.loadMore")}
          </Button>
        )}
      </div>
      {editing && (
        <ChatScheduleTimeDialog
          key={`${editing.id}:${editing.revision}`}
          initialAt={editing.scheduledAt}
          busy={queue.change.isPending}
          onClose={() => setEditing(null)}
          onConfirm={async (scheduledAt, timeZone) => {
            try {
              await queue.change.mutateAsync({
                row: editing,
                body: { revision: editing.revision, scheduledAt, timeZone },
              });
            } catch (error) {
              if (
                ["chat.schedule.conflict", "chat.schedule.denied"].includes(
                  scheduleErrorKey(error),
                )
              )
                setEditing(null);
              throw error;
            }
          }}
        />
      )}
    </section>
  );
}
