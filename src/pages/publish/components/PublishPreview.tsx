import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Eye } from "lucide-react";
import type { PlatformTarget } from "@/types/post";
import type { PlatformType } from "@/types/calendar";
import type { PostPreviewData } from "@/types/preview";
import { PlatformMockup } from "@/pages/editor/components/PlatformMockups";
import { PLATFORM_META } from "@/pages/social-accounts/lib/platformMeta";

const MOCKUP_SUPPORTED: PlatformType[] = [
  "FACEBOOK",
  "INSTAGRAM",
  "TIKTOK",
  "THREADS",
  "YOUTUBE",
];

function isMockupSupported(platform: string): platform is PlatformType {
  return (MOCKUP_SUPPORTED as string[]).includes(platform);
}

interface PublishPreviewProps {
  title: string;
  caption: string;
  mediaUrls: string[];
  platformTargets: PlatformTarget[];
}

export function PublishPreview({
  title,
  caption,
  mediaUrls,
  platformTargets,
}: PublishPreviewProps) {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);

  if (platformTargets.length === 0) {
    return (
      <div className="border-border bg-muted/30 text-muted-foreground flex h-full min-h-[300px] items-center justify-center rounded-xl border border-dashed p-6 text-center text-xs">
        <div className="flex flex-col items-center gap-2">
          <Eye className="size-6 opacity-50" />
          <span>{t("publish.preview.empty")}</span>
        </div>
      </div>
    );
  }

  const active =
    platformTargets[Math.min(activeIndex, platformTargets.length - 1)];
  const meta = PLATFORM_META[active.platform];

  const previewData: PostPreviewData = {
    title,
    caption: active.optimizedCaption || caption,
    mediaUrls,
    targetPlatforms: MOCKUP_SUPPORTED,
  };

  return (
    <div className="border-border bg-card space-y-3 rounded-xl border p-4">
      <div className="flex flex-wrap gap-1.5">
        {platformTargets.map((tgt, idx) => {
          const tgtMeta = PLATFORM_META[tgt.platform];
          return (
            <button
              key={tgt.platform}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`text-2xs flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-medium ${
                idx === activeIndex
                  ? `${tgtMeta.color} border-current`
                  : "border-border text-muted-foreground"
              }`}
            >
              {tgtMeta.icon}
              <span>{tgtMeta.label}</span>
            </button>
          );
        })}
      </div>

      {isMockupSupported(active.platform) ? (
        <PlatformMockup platform={active.platform} data={previewData} />
      ) : (
        <div className="border-border bg-card mx-auto max-w-md space-y-3 rounded-xl border p-4">
          <div className="flex items-center gap-2">
            <span
              className={`flex size-6 items-center justify-center rounded-md ${meta.color}`}
            >
              {meta.icon}
            </span>
            <span className="text-foreground text-xs font-semibold">
              {meta.label} {t("publish.preview.genericLabel")}
            </span>
          </div>
          <p className="text-foreground text-xs whitespace-pre-wrap">
            {previewData.caption}
          </p>
        </div>
      )}
    </div>
  );
}
