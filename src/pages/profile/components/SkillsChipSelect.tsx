import { useTranslation } from "react-i18next";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { SKILLS } from "@/pages/profile/constants";

interface Props {
  value: string[];
  onChange: (value: string[]) => void;
}

export function SkillsChipSelect({ value, onChange }: Props) {
  const { t } = useTranslation();

  const toggle = (slug: string) => {
    onChange(
      value.includes(slug) ? value.filter((s) => s !== slug) : [...value, slug],
    );
  };

  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs font-semibold tracking-wide">
        {t("profile.edit.skillsLabel")}
      </Label>
      <div className="flex flex-wrap gap-1.5">
        {SKILLS.map((slug) => {
          const on = value.includes(slug);
          return (
            <button
              key={slug}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(slug)}
              className={cn(
                "cursor-pointer rounded-full border px-3 py-1 text-xs transition-colors",
                on
                  ? "bg-brand-orange border-transparent text-white"
                  : "border-input bg-input-background text-foreground hover:bg-accent",
              )}
            >
              {t(`profile.skill.${slug}`)}
            </button>
          );
        })}
      </div>
      <p className="text-muted-foreground text-3xs">
        {t("profile.edit.skillsHint")}
      </p>
    </div>
  );
}
