import { useTranslation } from "react-i18next";
import { Gauge } from "lucide-react";
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

// ponytail: fixed demo usage/limit per platform, no metrics backend wired yet
const RATE_LIMIT_USAGE: Record<Platform, { used: number; max: number }> = {
  FACEBOOK: { used: 180, max: 200 },
  INSTAGRAM: { used: 42, max: 200 },
  TIKTOK: { used: 8, max: 50 },
  THREADS: { used: 15, max: 250 },
  ZALO_OA: { used: 95, max: 100 },
  YOUTUBE: { used: 3, max: 6 },
};

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

      {targets.length > 0 && (
        <div className="border-border bg-card space-y-2 rounded-xl border p-3">
          <div className="text-muted-foreground flex items-center gap-1.5 text-2xs font-semibold tracking-wider uppercase">
            <Gauge className="size-3.5" />
            {t("publish.composer.rateLimitLabel")}
          </div>
          {targets.map((tgt) => {
            const usage = RATE_LIMIT_USAGE[tgt.platform];
            const pct = Math.round((usage.used / usage.max) * 100);
            const isOverLimit = usage.used >= usage.max;
            return (
              <div key={tgt.platform} className="space-y-1">
                <div className="flex items-center justify-between text-2xs">
                  <span className="text-foreground font-medium">
                    {PLATFORM_META[tgt.platform].label}
                  </span>
                  <span
                    className={
                      isOverLimit
                        ? "font-semibold text-rose-600 dark:text-rose-400"
                        : "text-muted-foreground"
                    }
                  >
                    {usage.used} / {usage.max}
                  </span>
                </div>
                <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
                  <div
                    className={`h-full rounded-full ${isOverLimit ? "bg-rose-500" : "bg-brand-orange"}`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
                {isOverLimit && (
                  <p className="text-3xs text-rose-600 dark:text-rose-400">
                    {t("publish.composer.rateLimitExceeded")}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

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
