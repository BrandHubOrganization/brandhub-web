import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useTranslation } from "react-i18next";

const TIMEZONES = [
  "Asia/Ho_Chi_Minh",
  "Asia/Bangkok",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Asia/Shanghai",
  "Asia/Kolkata",
  "Europe/London",
  "Europe/Paris",
  "America/New_York",
  "America/Los_Angeles",
  "UTC",
] as const;

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function TimezoneSelect({ value, onChange }: Props) {
  const { t } = useTranslation();
  const options = TIMEZONES.includes(value as (typeof TIMEZONES)[number])
    ? TIMEZONES
    : [value, ...TIMEZONES];

  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs font-semibold tracking-wide">
        {t("workspace.settings.timezoneLabel")}
      </Label>
      <Select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((tz) => (
          <option key={tz} value={tz}>
            {tz}
          </option>
        ))}
      </Select>
    </div>
  );
}
