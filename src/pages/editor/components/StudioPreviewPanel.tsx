import { useState } from "react";
import {
  AtSign,
  Camera,
  CirclePlay,
  Globe2,
  Music2,
  PanelRightClose,
  Smartphone,
  type LucideIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import type { SocialPlatform } from "@/types/editor";
import { PlatformMockup } from "./PlatformMockups";

interface StudioPreviewPanelProps {
  title: string;
  caption: string;
  hashtags: string[];
  mediaUrls: string[];
  targetPlatforms: SocialPlatform[];
  onCollapse?: () => void;
}

const PLATFORM_ICONS: Record<SocialPlatform, LucideIcon> = {
  FACEBOOK: Globe2,
  INSTAGRAM: Camera,
  TIKTOK: Music2,
  THREADS: AtSign,
  YOUTUBE: CirclePlay,
};

export function StudioPreviewPanel({
  title,
  caption,
  hashtags,
  mediaUrls,
  targetPlatforms,
  onCollapse,
}: StudioPreviewPanelProps) {
  const { t } = useTranslation();
  const platforms =
    targetPlatforms.length > 0
      ? targetPlatforms
      : (["FACEBOOK"] as SocialPlatform[]);
  const [activePlatform, setActivePlatform] = useState<SocialPlatform>(
    platforms.includes("INSTAGRAM") ? "INSTAGRAM" : platforms[0],
  );
  const combinedCaption = [caption, hashtags.join(" ")]
    .filter(Boolean)
    .join("\n\n");
  const wordCount = caption.trim() ? caption.trim().split(/\s+/).length : 0;

  return (
    <section className="border-border bg-card flex max-h-[calc(100dvh-4.5rem)] flex-col overflow-hidden rounded-xl border">
      <div className="border-border flex items-start justify-between gap-2 border-b p-4">
        <div className="flex min-w-0 items-start gap-2">
          <div className="bg-brand-orange-soft text-brand-orange rounded-lg p-1.5">
            <Smartphone className="size-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-foreground text-sm font-semibold">
              {t("editor.studio.preview.title")}
            </h2>
            <p className="text-muted-foreground text-2xs mt-0.5">
              {t("editor.studio.preview.subtitle")}
            </p>
          </div>
        </div>
        {onCollapse && (
          <button
            type="button"
            onClick={onCollapse}
            aria-label="Thu gọn Live Preview"
            title="Thu gọn Live Preview"
            className="text-muted-foreground hover:bg-muted hover:text-foreground flex size-8 shrink-0 items-center justify-center rounded-md transition-colors"
          >
            <PanelRightClose className="size-4" />
          </button>
        )}
      </div>

      <div className="border-border overflow-x-auto border-b p-2">
        <div className="flex min-w-max gap-1">
          {platforms.map((platform) => {
            const Icon = PLATFORM_ICONS[platform];
            return (
              <button
                key={platform}
                type="button"
                onClick={() => setActivePlatform(platform)}
                className={cn(
                  "text-muted-foreground hover:bg-muted flex items-center gap-1.5 rounded-md px-2.5 py-2 text-xs font-medium transition-colors",
                  activePlatform === platform &&
                    "bg-brand-orange-soft text-brand-orange",
                )}
              >
                <Icon className="size-3.5" />
                {t(`editor.studio.preview.platforms.${platform}`)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-muted/50 min-h-0 flex-1 overflow-y-auto p-3 xl:p-4">
        <PlatformMockup
          platform={activePlatform}
          data={{
            title,
            caption: combinedCaption,
            mediaUrls,
            targetPlatforms: platforms,
            authorName: "BrandHub Creator",
          }}
        />
      </div>

      <div className="border-border text-muted-foreground text-2xs flex items-center justify-between border-t px-4 py-3 font-mono">
        <span>{t("editor.studio.preview.liveBadge")}</span>
        <span>
          {t("editor.studio.preview.stats", {
            words: wordCount,
            characters: caption.length,
          })}
        </span>
      </div>
    </section>
  );
}
