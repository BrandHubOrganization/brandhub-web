import { useTranslation } from "react-i18next";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  LANGUAGES,
  joinLanguages,
  parseLanguages,
} from "@/pages/profile/constants";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function LanguageChipSelect({ value, onChange }: Props) {
  const { t } = useTranslation();
  const selected = parseLanguages(value);

  const toggle = (code: string) => {
    const next = selected.includes(code)
      ? selected.filter((c) => c !== code)
      : [...selected, code];
    onChange(joinLanguages(next));
  };

  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs font-semibold tracking-wide">
        {t("profile.edit.workingLanguageLabel")}
      </Label>
      <div className="flex flex-wrap gap-1.5">
        {LANGUAGES.map((code) => {
          const on = selected.includes(code);
          return (
            <button
              key={code}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(code)}
              className={cn(
                "cursor-pointer rounded-full border px-3 py-1 text-xs transition-colors",
                on
                  ? "bg-brand-orange border-transparent text-white"
                  : "border-input bg-input-background text-foreground hover:bg-accent",
              )}
            >
              {t(`profile.language.${code}`)}
            </button>
          );
        })}
      </div>
      <p className="text-muted-foreground text-3xs">
        {t("profile.edit.workingLanguageHint")}
      </p>
    </div>
  );
}
