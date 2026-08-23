import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import type { ReportFrequency } from "@/types/workspace";

const REPORT_FREQUENCIES: ReportFrequency[] = ["WEEKLY", "MONTHLY"];

interface Props {
  value: ReportFrequency | null;
  onToggle: (value: ReportFrequency) => void;
}

export function FrequencyToggle({ value, onToggle }: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs font-semibold tracking-wide">
        {t("workspace.settings.reportFrequencyLabel")}
      </Label>
      <div className="flex flex-wrap gap-2">
        {REPORT_FREQUENCIES.map((freq) => {
          const active = value === freq;
          return (
            <button
              key={freq}
              type="button"
              onClick={() => onToggle(freq)}
              className={cn(
                "rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors",
                active
                  ? "border-brand-orange bg-brand-orange-soft text-brand-orange"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {t(`workspace.reportFrequency.${freq}`)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
