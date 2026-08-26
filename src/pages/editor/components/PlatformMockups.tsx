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
    const igFormat = data.instagramFormat ?? "IMAGE";
    const igHandle = authorName.toLowerCase().replace(/\s+/g, "_");

    if (igFormat === "REEL") {
      return (
        <div className="relative mx-auto aspect-[9/16] max-w-[280px] overflow-hidden rounded-xl border border-slate-800 bg-slate-950 text-white shadow-2xl">
          <img
            src={mediaSrc}
            alt="Reel"
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
              <span>8.7K</span>
            </div>
            <div className="flex flex-col items-center">
              <MessageCircle className="size-6 fill-white" />
              <span>210</span>
            </div>
            <Share2 className="size-6" />
          </div>
          <div className="absolute right-14 bottom-4 left-3 space-y-1">
            <h5 className="text-xs font-semibold text-white">@{igHandle}</h5>
            <p className="text-2xs line-clamp-2 text-slate-200">{caption}</p>
          </div>
        </div>
      );
    }

    if (igFormat === "CAROUSEL") {
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
                {igHandle}
              </span>
            </div>
            <MoreHorizontal className="text-muted-foreground size-5" />
          </div>

          <div
            className={`bg-muted relative w-full overflow-hidden ${config.aspectRatioClass}`}
          >
            <img
              src={mediaSrc}
              alt="Post content"
              className="h-full w-full object-cover"
            />
            <span className="bg-background/80 text-foreground absolute top-2 right-2 rounded-full px-2 py-0.5 text-3xs font-semibold">
              1/{Math.max(mediaUrls.length, 3)}
            </span>
            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
              {Array.from({ length: Math.max(mediaUrls.length, 3) }).map(
                (_, i) => (
                  <span
                    key={i}
                    className={`size-1.5 rounded-full ${i === 0 ? "bg-white" : "bg-white/40"}`}
                  />
                ),
              )}
            </div>
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
              <span className="mr-1.5 font-semibold">{igHandle}</span>
              {caption}
            </p>
          </div>
        </div>
      );
    }

    if (igFormat === "STORY") {
      return (
        <div className="relative mx-auto aspect-[9/16] max-w-[280px] overflow-hidden rounded-xl bg-slate-950 text-white shadow-2xl">
          <div className="absolute top-2 right-2 left-2 z-10 flex gap-1">
            <span className="h-0.5 flex-1 rounded-full bg-white" />
          </div>
          <div className="absolute top-5 right-3 left-3 z-10 flex items-center gap-2">
            <img
              src={authorAvatar}
              alt="avatar"
              className="size-7 rounded-full border border-white object-cover"
            />
            <span className="text-xs font-semibold">{igHandle}</span>
          </div>
          <img
            src={mediaSrc}
            alt="Story"
            className="h-full w-full object-cover"
          />
          <p className="absolute right-3 bottom-4 left-3 text-center text-xs font-medium text-white drop-shadow-md">
            {caption}
          </p>
        </div>
      );
    }

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
              {igHandle}
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
            <span className="mr-1.5 font-semibold">{igHandle}</span>
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

  if (platform === "THREADS") {
    return (
      <div className="border-border bg-card mx-auto max-w-md space-y-3 rounded-xl border p-4">
        <div className="flex items-start gap-2.5">
          <img
            src={authorAvatar}
            alt="avatar"
            className="size-8 rounded-full object-cover"
          />
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-foreground text-xs font-semibold">
                {authorName.toLowerCase().replace(/\s+/g, "")}
              </span>
              <AtSign className="text-muted-foreground size-3" />
            </div>
            <p className="text-foreground text-xs whitespace-pre-wrap">
              {caption}
            </p>
            {mediaUrls.length > 0 && (
              <div
                className={`bg-muted w-full overflow-hidden rounded-xl ${config.aspectRatioClass}`}
              >
                <img
                  src={mediaSrc}
                  alt="Post content"
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <div className="text-muted-foreground flex items-center gap-4 pt-1">
              <Heart className="size-4 cursor-pointer hover:text-rose-500" />
              <MessageCircle className="hover:text-foreground size-4 cursor-pointer" />
              <Repeat2 className="hover:text-foreground size-4 cursor-pointer" />
              <Send className="hover:text-foreground size-4 cursor-pointer" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (platform === "YOUTUBE") {
    return (
      <div className="mx-auto max-w-md space-y-2">
        <div
          className={`bg-muted relative w-full overflow-hidden rounded-xl ${config.aspectRatioClass}`}
        >
          <img
            src={mediaSrc}
            alt="Video thumbnail"
            className="h-full w-full object-cover"
          />
          <PlayCircle className="absolute inset-0 m-auto size-12 text-white drop-shadow-lg" />
        </div>
        <div className="flex items-start gap-2.5">
          <img
            src={authorAvatar}
            alt="avatar"
            className="size-9 shrink-0 rounded-full object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="text-foreground line-clamp-2 text-sm font-semibold">
              {data.title || caption.slice(0, 60)}
            </p>
            <p className="text-muted-foreground text-xs">{authorName}</p>
            <p className="text-foreground mt-1 line-clamp-2 text-xs whitespace-pre-wrap">
              {caption}
            </p>
          </div>
        </div>
        <div className="text-muted-foreground flex items-center gap-4 pl-11 text-xs">
          <span className="flex items-center gap-1">
            <ThumbsUp className="size-3.5" /> 1.2K
          </span>
          <span className="flex items-center gap-1">
            <ThumbsDown className="size-3.5" />
          </span>
        </div>
      </div>
    );
  }

  // ZALO_OA
  return (
    <div className="border-border bg-card mx-auto max-w-md space-y-3 rounded-xl border p-4">
      <div className="flex items-center gap-2">
        <div className="bg-sky-500/10 text-sky-600 flex size-8 items-center justify-center rounded-full">
          <MessageCircle className="size-4" />
        </div>
        <div>
          <span className="text-foreground block text-xs font-semibold">
            {authorName}
          </span>
          <span className="text-muted-foreground text-2xs">Zalo OA</span>
        </div>
      </div>
      <div className="border-border bg-muted/40 space-y-2 rounded-lg border p-3">
        {mediaUrls.length > 0 && (
          <div
            className={`bg-muted w-full overflow-hidden rounded-lg ${config.aspectRatioClass}`}
          >
            <img
              src={mediaSrc}
              alt="Zalo OA content"
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <p className="text-foreground text-xs whitespace-pre-wrap">
          {caption}
        </p>
      </div>
    </div>
  );
};
