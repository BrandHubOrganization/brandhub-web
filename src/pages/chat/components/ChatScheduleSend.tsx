import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, Clock3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChatScheduleTimeDialog } from "@/pages/chat/components/ChatScheduleTimeDialog";
import {
  formatScheduleTime,
  schedulePreset,
  scheduleTimeZone,
} from "@/pages/chat/utils/chatSchedule";

interface Props {
  disabled: boolean;
  busy: boolean;
  onSchedule: (at: string, zone: string) => Promise<void>;
}
export function ChatScheduleSend({ disabled, busy, onSchedule }: Props) {
  const { t, i18n } = useTranslation();
  const [custom, setCustom] = useState(false);
  const [openedAt, setOpenedAt] = useState(() => new Date());
  const zone = scheduleTimeZone();
  return (
    <>
      <DropdownMenu
        onOpenChange={(open) => {
          if (open) setOpenedAt(new Date());
        }}
      >
        <DropdownMenuTrigger asChild>
          <Button
            variant="orange"
            size="icon"
            className="h-8 w-7 rounded-l-none border-l border-current/20"
            disabled={disabled || busy}
            aria-label={t("chat.schedule.sendLater")}
            title={t("chat.schedule.sendLater")}
          >
            <ChevronDown className="size-3.5" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-72 max-w-[calc(100vw-2rem)]"
        >
          <DropdownMenuLabel>{t("chat.schedule.sendLater")}</DropdownMenuLabel>
          {(["tomorrow", "monday"] as const).map((kind) => {
            const at = schedulePreset(kind, openedAt);
            return (
              <DropdownMenuItem
                key={kind}
                disabled={busy}
                className="min-h-11 flex-col items-start gap-0.5"
                onSelect={() => {
                  void onSchedule(at.toISOString(), zone).catch(() => {});
                }}
              >
                <span>{t(`chat.schedule.${kind}`)}</span>
                <span className="text-muted-foreground text-xs">
                  {formatScheduleTime(at.toISOString(), zone, i18n.language)}
                </span>
              </DropdownMenuItem>
            );
          })}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled={busy}
            className="min-h-11"
            onSelect={() => setCustom(true)}
          >
            <Clock3 className="size-4" aria-hidden="true" />
            {t("chat.schedule.chooseTime")}
          </DropdownMenuItem>
          <p className="text-muted-foreground px-2 py-1 text-xs">{zone}</p>
        </DropdownMenuContent>
      </DropdownMenu>
      {custom && (
        <ChatScheduleTimeDialog
          busy={busy}
          onClose={() => setCustom(false)}
          onConfirm={onSchedule}
        />
      )}
    </>
  );
}
