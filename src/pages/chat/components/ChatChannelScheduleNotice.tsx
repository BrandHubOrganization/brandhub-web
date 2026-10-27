import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Clock3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChannelSchedule } from "@/pages/chat/hooks/useChatSchedules";
import { formatScheduleTime } from "@/pages/chat/utils/chatSchedule";

interface Props {
  workspaceId: string;
  channelId: string;
  onOpen: () => void;
}

export function ChatChannelScheduleNotice({
  workspaceId,
  channelId,
  onOpen,
}: Props) {
  const { t, i18n } = useTranslation();
  const upcoming = useChannelSchedule(workspaceId, channelId);
  const [now, setNow] = useState(() => Date.now());
  const row = upcoming.data;
  const at = row?.scheduledAt;
  useEffect(() => {
    if (!at) return;
    const timer = window.setInterval(() => setNow(Date.now()), 10_000);
    return () => window.clearInterval(timer);
  }, [at]);
  if (upcoming.isError || !at || !row?.timeZone || !row.status) return null;
  const text =
    row.status === "SENDING"
      ? t("chat.schedule.noticeSending")
      : new Date(at).getTime() <= now
        ? t("chat.schedule.noticeWaiting")
        : t("chat.schedule.noticeScheduled", {
            at: formatScheduleTime(at, row.timeZone, i18n.language),
          });
  return (
    <div className="mx-3 mt-1.5 shrink-0 sm:mx-4">
      <Button
        type="button"
        variant="ghost"
        onClick={onOpen}
        className="bg-muted/60 text-foreground hover:bg-muted h-auto min-h-8 w-full justify-start gap-2 rounded-lg px-2.5 py-1 text-left text-xs font-normal whitespace-normal"
      >
        <Clock3
          className="text-muted-foreground size-3.5 shrink-0"
          aria-hidden="true"
        />
        <span className="min-w-0 break-words">
          <span role="status">{text}</span>{" "}
          <span className="text-brand-orange font-medium underline underline-offset-2">
            {t("chat.schedule.viewAll")}
          </span>
        </span>
      </Button>
    </div>
  );
}
