import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/** Recognize daily schedules without silently flattening weekly/custom cron. */
function dailyTime(cron: string): string | null {
  const match = /^(\d{1,2})\s+(\d{1,2})\s+\*\s+\*\s+\*$/.exec(cron.trim());
  if (!match || Number(match[1]) > 59 || Number(match[2]) > 23) return null;
  return `${match[2].padStart(2, "0")}:${match[1].padStart(2, "0")}`;
}

export function AdminTrendScheduleField({
  id,
  cron,
  onChange,
}: {
  id: string;
  cron: string;
  onChange: (cron: string) => void;
}) {
  const { t } = useTranslation();
  const time = dailyTime(cron);
  if (time === null && cron !== "") {
    return (
      <div className="min-w-0 space-y-2">
        <p className="text-sm font-medium">
          {t("admin.trendSettings.customSchedule")}
        </p>
        <code className="bg-muted block rounded-md p-2 text-sm break-all">
          {cron}
        </code>
        <Button type="button" variant="outline" onClick={() => onChange("")}>
          {t("admin.trendSettings.switchDaily")}
        </Button>
      </div>
    );
  }
  return (
    <Input
      id={id}
      type="time"
      step={60}
      label={t("admin.trendSettings.dailyTime")}
      className="text-foreground [color-scheme:light] dark:[color-scheme:dark]"
      value={time ?? ""}
      required
      onChange={(event) => {
        const value = event.target.value;
        if (!/^\d{2}:\d{2}$/.test(value)) {
          onChange("");
          return;
        }
        const [hour, minute] = value.split(":").map(Number);
        onChange(hour <= 23 && minute <= 59 ? `${minute} ${hour} * * *` : "");
      }}
    />
  );
}
