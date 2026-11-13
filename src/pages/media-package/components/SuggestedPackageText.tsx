import { useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { Label } from "@/components/ui/label";
import {
  RichTextInput,
  stripRichTextHtml,
} from "@/components/ui/rich-text-input";

function toParagraphs(raw: string): string[] {
  return stripRichTextHtml(raw)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function removePhraseFromHtml(raw: string, phrase: string): string {
  const remaining = toParagraphs(raw).filter((line) => line !== phrase);
  if (remaining.length === 0) return "";
  return remaining.map((line) => `<p>${escapeHtml(line)}</p>`).join("");
}

function appendPhraseToHtml(raw: string, phrase: string): string {
  const existing = raw.trim();
  const block = `<p>${escapeHtml(phrase)}</p>`;
  if (!existing) return block;
  if (/<[a-z][\s\S]*>/i.test(existing)) return `${existing}${block}`;
  return `${toParagraphs(existing)
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join("")}${block}`;
}

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
  const lines = toParagraphs(value);
  const plainLength = stripRichTextHtml(value).length;
  return (
    <div className="min-w-0 space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="bg-muted space-y-1 rounded-lg p-2.5">
        {options.map((option) => {
          const previous = inserted[option.id];
          const phrase =
            previous && lines.includes(previous) ? previous : option.text;
          const checked = lines.includes(phrase);
          const next = appendPhraseToHtml(value, option.text);
          const nextLength = stripRichTextHtml(next).length;
          return (
            <label
              key={option.id}
              className="flex min-h-9 cursor-pointer items-start gap-2 rounded px-1 py-2 text-xs leading-5 has-disabled:cursor-not-allowed has-disabled:opacity-50"
            >
              <input
                type="checkbox"
                className="accent-brand-orange mt-0.5 size-4 shrink-0"
                checked={checked}
                disabled={!checked && nextLength > 2000}
                onChange={() => {
                  if (checked) {
                    onChange(removePhraseFromHtml(value, phrase));
                    setInserted((previous) => {
                      const nextMap = { ...previous };
                      delete nextMap[option.id];
                      return nextMap;
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
      <RichTextInput id={id} value={value} onChange={onChange} />
      <p className="text-muted-foreground text-right text-xs" aria-live="off">
        {t("mediaPackage.editor.characters", {
          count: plainLength,
          max: 2000,
        })}
      </p>
    </div>
  );
}
