import { useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function SuggestedPackageText({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { id: string; text: string }[];
}) {
  const id = useId();
  const { t } = useTranslation();
  const [inserted, setInserted] = useState<Record<string, string>>({});
  const lines = value.split("\n");
  return (
    <div className="min-w-0 space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="bg-muted space-y-1 rounded-lg p-2.5">
        {options.map((option) => {
          const previous = inserted[option.id];
          const phrase =
            previous && lines.includes(previous) ? previous : option.text;
          const checked = lines.includes(phrase);
          const next = [value.trimEnd(), option.text]
            .filter(Boolean)
            .join("\n");
          return (
            <label
              key={option.id}
              className="flex min-h-9 cursor-pointer items-start gap-2 rounded px-1 py-2 text-xs leading-5 has-disabled:cursor-not-allowed has-disabled:opacity-50"
            >
              <input
                type="checkbox"
                className="accent-brand-orange mt-0.5 size-4 shrink-0"
                checked={checked}
                disabled={!checked && next.length > 2000}
                onChange={() => {
                  if (checked) {
                    onChange(
                      lines.filter((line) => line !== phrase).join("\n"),
                    );
                    setInserted((previous) => {
                      const next = { ...previous };
                      delete next[option.id];
                      return next;
                    });
                  } else {
                    setInserted((previous) => ({
                      ...previous,
                      [option.id]: option.text,
                    }));
                    onChange(next);
                  }
                }}
              />
              <span>{option.text}</span>
            </label>
          );
        })}
      </div>
      <Textarea
        id={id}
        rows={4}
        maxLength={2000}
        value={value}
        className="min-h-28 text-sm"
        onChange={(e) => onChange(e.target.value)}
      />
      <p className="text-muted-foreground text-right text-xs" aria-live="off">
        {t("mediaPackage.editor.characters", {
          count: value.length,
          max: 2000,
        })}
      </p>
    </div>
  );
}
