import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  scheduleLocalInput,
  schedulePreset,
  scheduleTimeZone,
  validScheduleTime,
} from "@/pages/chat/utils/chatSchedule";

interface Props {
  onClose: () => void;
  onConfirm: (at: string, zone: string) => Promise<void>;
  initialAt?: string;
  busy: boolean;
}

export function ChatScheduleTimeDialog({
  onClose,
  onConfirm,
  initialAt,
  busy,
}: Props) {
  const { t } = useTranslation();
  const [value, setValue] = useState(() =>
    scheduleLocalInput(
      initialAt ? new Date(initialAt) : schedulePreset("tomorrow"),
    ),
  );
  const [submitted, setSubmitted] = useState(false);
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 10_000);
    return () => window.clearInterval(timer);
  }, []);
  const zone = scheduleTimeZone();
  const valid = validScheduleTime(value, now);
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !busy) onClose();
      }}
    >
      <DialogContent
        className="sm:max-w-sm"
        onEscapeKeyDown={(event) => {
          if (busy) event.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>{t("chat.schedule.chooseTime")}</DialogTitle>
          <DialogDescription>
            {t("chat.schedule.timeZone", { zone })}
          </DialogDescription>
        </DialogHeader>
        <form
          noValidate
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            setSubmitted(true);
            const submittedAt = Date.now();
            setNow(submittedAt);
            if (validScheduleTime(value, submittedAt) && !busy)
              void onConfirm(new Date(value).toISOString(), zone)
                .then(onClose)
                .catch(() => {});
          }}
        >
          <Input
            type="datetime-local"
            label={t("chat.schedule.dateTime")}
            value={value}
            required
            step="60"
            min={scheduleLocalInput(new Date(now + 60_000))}
            max={scheduleLocalInput(new Date(now + 120 * 86_400_000))}
            disabled={busy}
            onChange={(event) => {
              setValue(event.target.value);
              setSubmitted(true);
            }}
            error={
              (submitted || Boolean(initialAt)) && !valid
                ? t("chat.schedule.invalidTime")
                : undefined
            }
            aria-invalid={(submitted || Boolean(initialAt)) && !valid}
          />
          <p className="text-muted-foreground text-xs">
            {t("chat.schedule.offlineHint")}
          </p>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={onClose}
            >
              {t("chat.schedule.dismiss")}
            </Button>
            <Button
              type="submit"
              variant="orange"
              disabled={!valid || busy}
              loading={busy}
            >
              {t("chat.schedule.confirm")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
