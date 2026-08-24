import React from "react";
import type { PlatformType } from "@/types/calendar";
import type { PostPreviewData } from "@/types/preview";
import { PLATFORM_LIMITS } from "@/types/preview";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  ThumbsUp,
  Globe,
} from "lucide-react";
import { useTranslation } from "react-i18next";

interface PlatformMockupProps {
  platform: PlatformType;
  data: PostPreviewData;
}

export const PlatformMockup: React.FC<PlatformMockupProps> = ({
  platform,
  data,
}) => {
  const { t } = useTranslation();
  const {
    caption,
    mediaUrls = [],
    authorName = "BrandHub Official",
    authorAvatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
  } = data;

  const defaultMedia =
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80";
  const mediaSrc = mediaUrls[0] || defaultMedia;
  const config = PLATFORM_LIMITS[platform];

  if (platform === "FACEBOOK") {
    return (
      <div className="border-border bg-card mx-auto max-w-md overflow-hidden rounded-xl border shadow-xs">
        <div className="flex items-center justify-between p-3.5">
          <div className="flex items-center gap-2.5">
            <img
              src={authorAvatar}
              alt="avatar"
              className="border-border size-10 rounded-full border object-cover"
            />
            <div>
              <h4 className="text-foreground text-sm font-semibold">
                {authorName}
              </h4>
              <p className="text-muted-foreground flex items-center gap-1 text-xs">
                {t("editor.mockup.justNow")} · <Globe className="size-3" />
              </p>
            </div>
          </div>
          <MoreHorizontal className="text-muted-foreground size-5" />
        </div>

        <p className="text-foreground px-3.5 pb-3 text-sm whitespace-pre-wrap">
          {caption}
        </p>

        <div
          className={`bg-muted w-full overflow-hidden ${config.aspectRatioClass}`}
        >
          <img
            src={mediaSrc}
            alt="Post content"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="border-border text-muted-foreground flex items-center justify-between border-t p-3 text-xs font-medium">
          <button className="flex items-center gap-1.5 hover:text-blue-600">
            <ThumbsUp className="size-4" /> {t("editor.mockup.like")}
          </button>
          <button className="flex items-center gap-1.5 hover:text-blue-600">
            <MessageCircle className="size-4" /> {t("editor.mockup.comment")}
          </button>
          <button className="flex items-center gap-1.5 hover:text-blue-600">
            <Share2 className="size-4" /> {t("editor.mockup.share")}
          </button>
        </div>
      </div>
    );
  }

  if (platform === "INSTAGRAM") {
    return (
      <div className="border-border bg-card mx-auto max-w-md overflow-hidden rounded-xl border shadow-xs">
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-[2px]">
              <img
                src={authorAvatar}
                alt="avatar"
                className="h-full w-full rounded-full border-2 border-white object-cover dark:border-slate-900"
              />
            </div>
            <span className="text-foreground text-xs font-semibold">
              {authorName.toLowerCase().replace(/\s+/g, "_")}
            </span>
          </div>
          <MoreHorizontal className="text-muted-foreground size-5" />
        </div>

        <div
          className={`bg-muted w-full overflow-hidden ${config.aspectRatioClass}`}
        >
          <img
            src={mediaSrc}
            alt="Post content"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="space-y-2 p-3">
          <div className="text-muted-foreground flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Heart className="size-5 cursor-pointer hover:text-rose-500" />
              <MessageCircle className="hover:text-foreground size-5 cursor-pointer" />
              <Share2 className="hover:text-foreground size-5 cursor-pointer" />
            </div>
            <Bookmark className="size-5 cursor-pointer" />
          </div>

          <p className="text-foreground line-clamp-3 text-xs">
            <span className="mr-1.5 font-semibold">
              {authorName.toLowerCase().replace(/\s+/g, "_")}
            </span>
            {caption}
          </p>
        </div>
      </div>
    );
  }

  if (platform === "TIKTOK") {
    return (
      <div className="relative mx-auto aspect-[9/16] max-w-[280px] overflow-hidden rounded-xl border border-slate-800 bg-slate-950 text-white shadow-2xl">
        <img
          src={mediaSrc}
          alt="TikTok"
          className="h-full w-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80" />

        <div className="absolute right-3 bottom-12 flex flex-col items-center gap-4 text-xs">
          <div className="size-10 overflow-hidden rounded-full border-2 border-white">
            <img
              src={authorAvatar}
              alt="avatar"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-col items-center">
            <Heart className="size-6 fill-white" />
            <span>12.4K</span>
          </div>
          <div className="flex flex-col items-center">
            <MessageCircle className="size-6 fill-white" />
            <span>342</span>
          </div>
          <div className="flex flex-col items-center">
            <Bookmark className="size-6 fill-white" />
            <span>1.2K</span>
          </div>
        </div>

        <div className="absolute right-14 bottom-4 left-3 space-y-1">
          <h5 className="text-xs font-semibold text-white">
            @{authorName.toLowerCase().replace(/\s+/g, "")}
          </h5>
          <p className="text-2xs line-clamp-2 text-slate-200">{caption}</p>
        </div>
      </div>
    );
  }

  // Default fallback for Threads & Youtube
  return (
    <div className="border-border bg-card mx-auto max-w-md space-y-3 rounded-xl border p-4">
      <div className="flex items-center gap-2">
        <img
          src={authorAvatar}
          alt="avatar"
          className="size-8 rounded-full object-cover"
        />
        <span className="text-foreground text-xs font-semibold">
          {authorName}
        </span>
      </div>
      <p className="text-foreground text-xs whitespace-pre-wrap">{caption}</p>
      <div
        className={`bg-muted w-full overflow-hidden rounded-lg ${config.aspectRatioClass}`}
      >
        <img
          src={mediaSrc}
          alt="Media preview"
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
};
