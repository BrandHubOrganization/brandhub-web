import { useTranslation } from "react-i18next";
import type { Platform, PlatformTarget } from "@/types/post";
import { Textarea } from "@/components/ui/textarea";
import {
  ALL_PLATFORMS,
  PLATFORM_META,
} from "@/pages/social-accounts/lib/platformMeta";

interface PlatformTargetPickerProps {
  targets: PlatformTarget[];
  onChange: (targets: PlatformTarget[]) => void;
}

export function PlatformTargetPicker({
  targets,
  onChange,
}: PlatformTargetPickerProps) {
  const { t } = useTranslation();

  function togglePlatform(platform: Platform) {
    const exists = targets.some((tgt) => tgt.platform === platform);
    if (exists) {
      onChange(targets.filter((tgt) => tgt.platform !== platform));
    } else {
      onChange([
        ...targets,
        { platform, postType: "FEED", optimizedCaption: "" },
      ]);
    }
  }

  function updateCaption(platform: Platform, optimizedCaption: string) {
    onChange(
      targets.map((tgt) =>
        tgt.platform === platform ? { ...tgt, optimizedCaption } : tgt,
      ),
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {ALL_PLATFORMS.map((platform) => {
          const meta = PLATFORM_META[platform];
          const isSelected = targets.some((tgt) => tgt.platform === platform);
          return (
            <button
              key={platform}
              type="button"
              onClick={() => togglePlatform(platform)}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                isSelected
                  ? `${meta.color} border-current shadow-xs`
                  : "border-border opacity-40 grayscale hover:opacity-70"
              }`}
            >
              {meta.icon}
              <span>{meta.label}</span>
            </button>
          );
        })}
      </div>

      {targets.map((tgt) => (
        <div key={tgt.platform} className="space-y-1">
          <label className="text-muted-foreground text-2xs font-medium">
            {t("publish.composer.captionOverride", {
              platform: PLATFORM_META[tgt.platform].label,
            })}
          </label>
          <Textarea
            value={tgt.optimizedCaption}
            onChange={(e) => updateCaption(tgt.platform, e.target.value)}
            placeholder={t("publish.composer.captionOverridePlaceholder")}
            className="min-h-16 text-xs"
          />
        </div>
      ))}
    </div>
  );
}
