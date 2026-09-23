import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface Props {
  onPick: (message: string) => void;
  className?: string;
}

const PRESET_KEYS = ["formal", "casual"] as const;

// Gợi ý lời nhắn mẫu cho lời mời agency/workspace — click điền thẳng vào note field.
export function InviteMessagePresets({ onPick, className }: Props) {
  const { t } = useTranslation();

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {PRESET_KEYS.map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => onPick(t(`common.invitePresets.${key}.message`))}
          className="border-border text-muted-foreground hover:border-brand-orange hover:text-brand-orange cursor-pointer rounded-full border px-2.5 py-1 text-xs font-medium transition-colors"
        >
          {t(`common.invitePresets.${key}.label`)}
        </button>
      ))}
    </div>
  );
}
