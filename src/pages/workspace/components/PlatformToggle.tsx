import { Globe, Camera, Video, Hash } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const PLATFORMS = [
  { key: "facebook", label: "Facebook", icon: Globe },
  { key: "instagram", label: "Instagram", icon: Camera },
  { key: "tiktok", label: "TikTok", icon: Video },
  { key: "linkedin", label: "LinkedIn", icon: Hash },
] as const;

interface Props {
  value: string[];
  onToggle: (platform: string) => void;
}

export function PlatformToggle({ value, onToggle }: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs font-semibold tracking-wide">
        {t("workspace.settings.defaultPlatformsLabel")}
      </Label>
      <div className="flex flex-wrap gap-2">
        {PLATFORMS.map(({ key, label, icon: Icon }) => {
          const active = value.includes(key);
          return (
            <button
              key={key}
              type="button"
              onClick={() => onToggle(key)}
              className={cn(
                "flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-colors",
                active
                  ? "border-brand-orange bg-brand-orange-soft text-brand-orange"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
