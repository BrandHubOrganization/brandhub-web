import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AtSign,
  Calendar,
  Copy,
  Camera,
  Globe2,
  Hash,
  Maximize2,
  Music2,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
    colorClass:
      "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400",
  },
  INSTAGRAM: {
    label: "Instagram",
    icon: Camera,
    colorClass:
      "bg-pink-500/10 text-pink-600 border-pink-500/20 dark:text-pink-400",
  },
  TIKTOK: {
    label: "TikTok",
    icon: Music2,
    colorClass:
      "bg-neutral-500/10 text-neutral-800 border-neutral-500/20 dark:text-neutral-200",
  },
  THREADS: {
    label: "Threads",
    icon: AtSign,
    colorClass:
      "bg-zinc-500/10 text-zinc-700 border-zinc-500/20 dark:text-zinc-300",
  },
};

export function TaskReviewContent({
  post,
}: {
  post: NonNullable<TaskPost["post"]>;
}) {
  const { t, i18n } = useTranslation();
  const [zoomUrl, setZoomUrl] = useState<{ url: string; label: string } | null>(
    null,
  );

  const [copying, setCopying] = useState(false);
  async function copyCaption() {
    const text = [post.caption, post.hashtags.join(" ")]
      .filter(Boolean)
      .join("\n\n");
    if (!text) return;
    setCopying(true);
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t("tasks.review.captionCopied"));
    } catch {
      toast.error(t("tasks.review.copyFailed"));
    } finally {
      setCopying(false);
    }
  }

  const platforms = (post.targetPlatforms || []) as SocialPlatform[];
  const formattedTime = reviewTime(
    post.updatedAt || post.createdAt,
    i18n.language,
  );

  return (
    <div className="space-y-3">
      {/* Eyebrow Label */}
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-muted-foreground flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase">
          <Sparkles className="text-brand-orange size-3.5" />
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
                className={`text-2xs inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-medium ${meta.colorClass}`}
              >
                <Icon className="size-3" />
                {meta.label}
              </span>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        {post.aiGenerated && (
          <span className="text-muted-foreground text-xs">
            {t("tasks.review.aiGenerated")}
          </span>
        )}
        <Button
          variant="ghost"
          size="sm"
          disabled={copying || (!post.caption && !post.hashtags.length)}
          onClick={() => void copyCaption()}
        >
          <Copy aria-hidden className="size-4" />
          {t("tasks.review.copyCaption")}
        </Button>
      </div>
      <article className="border-border/80 bg-card overflow-hidden rounded-2xl border shadow-xs transition-shadow hover:shadow-sm">
        {/* Mockup Header */}
        <header className="border-border/50 bg-muted/15 flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="from-brand-orange relative flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br to-amber-500 text-sm font-bold text-white shadow-xs">
              <span>BH</span>
              <span className="border-card absolute -right-0.5 -bottom-0.5 size-3.5 rounded-full border-2 bg-emerald-500" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-foreground truncate text-sm font-semibold">
                  BrandHub Studio
                </span>
              </div>
              <div className="text-2xs text-muted-foreground flex flex-wrap items-center gap-1.5">
                <span className="flex items-center gap-1">
                  <Calendar className="size-3 opacity-70" />
                  {formattedTime}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Caption */}
        <div className="text-foreground px-4 py-3.5 text-sm leading-relaxed [overflow-wrap:anywhere] break-words whitespace-pre-wrap">
          {post.caption ? (
            post.caption
          ) : (
            <span className="text-muted-foreground italic">
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
                  className="border-brand-orange/20 bg-brand-orange-soft text-2xs text-brand-orange hover:bg-brand-orange/20 inline-flex cursor-default items-center gap-0.5 rounded-full border px-2.5 py-0.5 font-medium transition-colors"
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
                post.media.length === 1
                  ? "grid-cols-1"
                  : "grid-cols-1 sm:grid-cols-2"
              }`}
            >
              {post.media.map((media, index) => {
                const url = reviewMediaUrl(media.url);
                const label = t("tasks.review.media", { index: index + 1 });
                if (!url) {
                  return (
                    <div
                      key={index}
                      className="border-border/80 bg-muted/30 text-muted-foreground flex h-32 items-center justify-center rounded-xl border border-dashed p-4 text-center text-xs"
                    >
                      {t("tasks.review.mediaUnavailable")}
                    </div>
                  );
                }

                if (media.mediaType === "VIDEO") {
                  return (
                    <div
                      key={index}
                      className="border-border/50 overflow-hidden rounded-xl border bg-black/95 shadow-xs"
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
                    className="group border-border/60 bg-muted/20 relative overflow-hidden rounded-xl border shadow-xs"
                  >
                    <img
                      src={url}
                      alt={label}
                      loading="lazy"
                      width={480}
                      height={320}
                      className="max-h-96 w-full object-contain"
                    />
                    {/* Hover Zoom Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-[2px] transition-opacity duration-200 group-focus-within:opacity-100 group-hover:opacity-100">
                      <Button
                        type="button"
                        onClick={() => setZoomUrl({ url, label })}
                        className="bg-background/90 text-foreground flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium shadow-lg transition-transform hover:scale-105 active:scale-95"
                      >
                        <Maximize2 className="text-brand-orange size-3.5" />
                        <span>{t("tasks.review.zoomImage")}</span>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </article>

      {/* Image Lightbox Dialog */}
      {zoomUrl && (
        <Dialog
          open
          onOpenChange={(open) => {
            if (!open) setZoomUrl(null);
          }}
        >
          <DialogContent className="max-w-4xl overflow-hidden border-neutral-800 bg-black/95 p-2 text-white sm:p-3">
            <DialogHeader className="p-2">
              <DialogTitle className="text-sm font-medium text-neutral-300">
                {zoomUrl.label}
              </DialogTitle>
            </DialogHeader>
            <div className="flex max-h-[75vh] items-center justify-center overflow-hidden rounded-lg">
              <img
                src={zoomUrl.url}
                alt={zoomUrl.label}
                className="max-h-[75vh] w-auto max-w-full rounded-lg object-contain"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
