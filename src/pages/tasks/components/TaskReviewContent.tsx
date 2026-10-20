import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AtSign,
  BadgeCheck,
  Bookmark,
  Calendar,
  Camera,
  Globe,
  Globe2,
  Hash,
  Heart,
  Maximize2,
  MessageCircle,
  MoreHorizontal,
  Music2,
  Share2,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { reviewMediaUrl, reviewTime } from "@/pages/tasks/taskApprovalView";
import type { TaskPost } from "@/pages/editor/services/taskPostService";
import type { SocialPlatform } from "@/types/editor";

const PLATFORM_META: Record<
  SocialPlatform,
  { label: string; icon: LucideIcon; colorClass: string }
> = {
  FACEBOOK: {
    label: "Facebook",
    icon: Globe2,
    colorClass: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400",
  },
  INSTAGRAM: {
    label: "Instagram",
    icon: Camera,
    colorClass: "bg-pink-500/10 text-pink-600 border-pink-500/20 dark:text-pink-400",
  },
  TIKTOK: {
    label: "TikTok",
    icon: Music2,
    colorClass: "bg-neutral-500/10 text-neutral-800 border-neutral-500/20 dark:text-neutral-200",
  },
  THREADS: {
    label: "Threads",
    icon: AtSign,
    colorClass: "bg-zinc-500/10 text-zinc-700 border-zinc-500/20 dark:text-zinc-300",
  },
};

export function TaskReviewContent({
  post,
}: {
  post: NonNullable<TaskPost["post"]>;
}) {
  const { t, i18n } = useTranslation();
  const [zoomUrl, setZoomUrl] = useState<{ url: string; label: string } | null>(null);

  const platforms = (post.targetPlatforms || []) as SocialPlatform[];
  const formattedTime = reviewTime(post.updatedAt || post.createdAt, i18n.language);

  return (
    <div className="space-y-3">
      {/* Eyebrow Label */}
      <div className="flex items-center justify-between gap-2">
        <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Sparkles className="size-3.5 text-brand-orange" />
          {t("tasks.review.currentContent")}
        </h4>
        <div className="flex flex-wrap items-center gap-1.5">
          {platforms.map((platform) => {
            const meta = PLATFORM_META[platform];
            if (!meta) return null;
            const Icon = meta.icon;
            return (
              <span
                key={platform}
                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-2xs font-medium ${meta.colorClass}`}
              >
                <Icon className="size-3" />
                {meta.label}
              </span>
            );
          })}
        </div>
      </div>

      {/* Social Post Mockup Card */}
      <article className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs transition-shadow hover:shadow-sm">
        {/* Mockup Header */}
        <header className="flex items-center justify-between border-b border-border/50 px-4 py-3 bg-muted/15">
          <div className="flex items-center gap-3">
            <div className="relative flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-orange to-amber-500 text-sm font-bold text-white shadow-xs">
              <span>BH</span>
              <span className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full border-2 border-card bg-emerald-500" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-sm font-semibold text-foreground">
                  BrandHub Studio
                </span>
                <BadgeCheck className="size-4 shrink-0 text-sky-500" />
              </div>
              <div className="flex flex-wrap items-center gap-1.5 text-2xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="size-3 opacity-70" />
                  {formattedTime}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Globe className="size-3 opacity-70" />
                  {t("editor.mockup.justNow", { defaultValue: "Công khai" })}
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            aria-label="Options"
            className="text-muted-foreground hover:text-foreground rounded-full p-1.5 transition-colors"
          >
            <MoreHorizontal className="size-4" />
          </button>
        </header>

        {/* Caption */}
        <div className="px-4 py-3.5 text-sm leading-relaxed text-foreground [overflow-wrap:anywhere] break-words whitespace-pre-wrap">
          {post.caption ? (
            post.caption
          ) : (
            <span className="italic text-muted-foreground">
              {t("tasks.review.emptyCaption")}
            </span>
          )}
        </div>

        {/* Hashtags Pills */}
        {post.hashtags && post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 px-4 pb-3">
            {post.hashtags.map((tag, idx) => {
              const cleanTag = tag.startsWith("#") ? tag.slice(1) : tag;
              return (
                <span
                  key={idx}
                  className="inline-flex items-center gap-0.5 rounded-full border border-brand-orange/20 bg-brand-orange-soft px-2.5 py-0.5 text-2xs font-medium text-brand-orange hover:bg-brand-orange/20 transition-colors cursor-default"
                >
                  <Hash className="size-2.5 opacity-70" />
                  {cleanTag}
                </span>
              );
            })}
          </div>
        )}

        {/* Media Preview Gallery */}
        {post.media && post.media.length > 0 && (
          <div className="px-4 pb-4">
            <div
              className={`grid gap-2.5 ${
                post.media.length === 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"
              }`}
            >
              {post.media.map((media, index) => {
                const url = reviewMediaUrl(media.url);
                const label = t("tasks.review.media", { index: index + 1 });
                if (!url) {
                  return (
                    <div
                      key={index}
                      className="flex h-32 items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/30 p-4 text-center text-xs text-muted-foreground"
                    >
                      {t("tasks.review.mediaUnavailable")}
                    </div>
                  );
                }

                if (media.mediaType === "VIDEO") {
                  return (
                    <div
                      key={index}
                      className="overflow-hidden rounded-xl border border-border/50 bg-black/95 shadow-xs"
                    >
                      <video
                        src={url}
                        controls
                        preload="metadata"
                        aria-label={label}
                        className="aspect-video w-full rounded-xl object-contain"
                      />
                    </div>
                  );
                }

                return (
                  <div
                    key={index}
                    className="group relative overflow-hidden rounded-xl border border-border/60 bg-muted/20 shadow-xs"
                  >
                    <img
                      src={url}
                      alt={label}
                      loading="lazy"
                      width={480}
                      height={320}
                      className={`w-full object-cover transition-transform duration-300 group-hover:scale-[1.02] ${
                        post.media.length === 1
                          ? "max-h-[380px] aspect-[16/10]"
                          : "max-h-60 aspect-square"
                      }`}
                    />
                    {/* Hover Zoom Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-[2px] transition-opacity duration-200 group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => setZoomUrl({ url, label })}
                        className="flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1.5 text-xs font-medium text-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
                      >
                        <Maximize2 className="size-3.5 text-brand-orange" />
                        <span>Phóng to</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Mockup Interaction Footer */}
        <footer className="flex items-center justify-between border-t border-border/50 px-4 py-2.5 bg-muted/10 text-muted-foreground text-xs">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 hover:text-rose-500 transition-colors cursor-pointer">
              <Heart className="size-4" />
              <span>Thích</span>
            </span>
            <span className="flex items-center gap-1.5 hover:text-foreground transition-colors cursor-pointer">
              <MessageCircle className="size-4" />
              <span>Bình luận</span>
            </span>
            <span className="flex items-center gap-1.5 hover:text-foreground transition-colors cursor-pointer">
              <Share2 className="size-4" />
              <span>Chia sẻ</span>
            </span>
          </div>
          <Bookmark className="size-4 hover:text-foreground transition-colors cursor-pointer" />
        </footer>
      </article>

      {/* Image Lightbox Dialog */}
      {zoomUrl && (
        <Dialog open onOpenChange={(open) => { if (!open) setZoomUrl(null); }}>
          <DialogContent className="max-w-4xl overflow-hidden p-2 sm:p-3 bg-black/95 border-neutral-800 text-white">
            <DialogHeader className="p-2">
              <DialogTitle className="text-sm font-medium text-neutral-300">
                {zoomUrl.label}
              </DialogTitle>
            </DialogHeader>
            <div className="flex items-center justify-center max-h-[75vh] overflow-hidden rounded-lg">
              <img
                src={zoomUrl.url}
                alt={zoomUrl.label}
                className="max-h-[75vh] w-auto max-w-full object-contain rounded-lg"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
