import { useState } from "react";
import { useTranslation } from "react-i18next";
import { reviewMediaUrl } from "@/pages/tasks/utils/taskApprovalView";
import { Check, Copy, Globe2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { TaskPost } from "@/pages/editor/services/taskPostService";

export function TaskReviewContent({
  post,
}: {
  post: NonNullable<TaskPost["post"]>;
}) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const fullText = [post.caption, post.hashtags.join(" ")].filter(Boolean).join("\n\n");
    if (!fullText) return;
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      toast.success(t("tasks.review.captionCopied"));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="bg-background min-w-0 space-y-4 rounded-2xl border p-5 shadow-sm">
      <div className="flex items-center justify-between border-b pb-3">
        <div className="flex items-center gap-2.5">
          <div className="size-9 rounded-full bg-brand-orange-soft text-brand-orange flex items-center justify-center font-bold text-sm">
            BH
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">BrandHub Post Preview</h4>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Globe2 className="size-3" />
              <span>{post.targetPlatforms.join(" · ") || "Social Media"}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            {copied ? (
              <>
                <Check className="size-3.5 text-emerald-500 animate-in zoom-in-75 duration-150" />
                <span className="text-emerald-600 font-medium">{t("tasks.review.copied")}</span>
              </>
            ) : (
              <>
                <Copy className="size-3.5" />
                <span>{t("tasks.review.copyCaption")}</span>
              </>
            )}
          </Button>
          {post.aiGenerated && (
            <span className="flex items-center gap-1 rounded-full bg-brand-orange-soft/60 px-2.5 py-1 text-xs font-medium text-brand-orange">
              <Sparkles className="size-3" />
              AI Generated
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-foreground [overflow-wrap:anywhere] break-words whitespace-pre-wrap leading-relaxed">
          {post.caption || t("tasks.review.emptyCaption")}
        </p>
        {post.hashtags.length > 0 && (
          <p className="text-sm font-medium text-brand-orange [overflow-wrap:anywhere] break-words flex flex-wrap gap-1.5">
            {post.hashtags.map((h, i) => (
              <span key={i} className="hover:underline cursor-pointer">{h}</span>
            ))}
          </p>
        )}
      </div>
      {post.media.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {post.media.map((media, index) => {
            const url = reviewMediaUrl(media.url);
            const label = t("tasks.review.media", { index: index + 1 });
            if (!url)
              return (
                <p key={index} className="text-muted-foreground text-sm">
                  {t("tasks.review.mediaUnavailable")}
                </p>
              );
            return media.mediaType === "VIDEO" ? (
              <video
                key={index}
                src={url}
                controls
                preload="metadata"
                aria-label={label}
                className="bg-muted aspect-video w-full rounded-md"
              />
            ) : (
              <a
                key={index}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
              >
                <img
                  src={url}
                  alt={label}
                  loading="lazy"
                  width={480}
                  height={320}
                  className="bg-muted max-h-64 w-full rounded-md object-contain"
                />
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
