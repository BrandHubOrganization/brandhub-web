import { useTranslation } from "react-i18next";
import { reviewMediaUrl } from "@/pages/tasks/taskApprovalView";
import type { TaskPost } from "@/pages/editor/services/taskPostService";

export function TaskReviewContent({
  post,
}: {
  post: NonNullable<TaskPost["post"]>;
}) {
  const { t } = useTranslation();
  return (
    <div className="bg-muted/20 min-w-0 space-y-3 rounded-xl border p-3 sm:p-4">
      <h4 className="text-sm font-semibold">
        {t("tasks.review.currentContent")}
      </h4>
      <p className="text-sm [overflow-wrap:anywhere] break-words whitespace-pre-wrap">
        {post.caption || t("tasks.review.emptyCaption")}
      </p>
      {post.hashtags.length > 0 && (
        <p className="text-muted-foreground text-sm [overflow-wrap:anywhere] break-words">
          {post.hashtags.join(" ")}
        </p>
      )}
      <p className="text-muted-foreground text-xs break-words">
        {t("tasks.review.channels", {
          channels: post.targetPlatforms.join(", ") || "—",
        })}
      </p>
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
