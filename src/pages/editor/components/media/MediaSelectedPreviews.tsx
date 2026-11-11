import React from "react";
import { X, Film } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { MediaSelectedPreviewsProps } from "./types";

function isVideoUrl(url: string): boolean {
  return (
    url.endsWith(".mp4") ||
    url.endsWith(".webm") ||
    url.endsWith(".mov") ||
    url.includes("mixkit")
  );
}

export const MediaSelectedPreviews: React.FC<MediaSelectedPreviewsProps> = ({
  mediaUrls,
  onRemove,
}) => {
  const { t } = useTranslation();

  if (mediaUrls.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2 pt-1">
      <div className="flex items-center justify-between text-2xs font-semibold text-muted-foreground">
        <span>
          {t("editor.mediaDropzone.selectedMedia", "Tài nguyên đã chọn")} (
          {mediaUrls.length})
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
        {mediaUrls.map((url, idx) => {
          const isVideo = isVideoUrl(url);
          return (
            <div
              key={`${url}-${idx}`}
              className="group border-border bg-card relative aspect-square overflow-hidden rounded-xl border shadow-2xs transition-all duration-150"
            >
              {isVideo ? (
                <>
                  <video
                    src={url}
                    preload="metadata"
                    muted
                    playsInline
                    className="size-full object-cover"
                  />
                  <span className="absolute bottom-1.5 left-1.5 flex items-center gap-1 rounded bg-black/60 px-1.5 py-0.5 text-3xs font-medium text-white">
                    <Film className="size-2.5" />
                    <span>{t("editor.mediaDropzone.repository.videoBadge", "Video")}</span>
                  </span>
                </>
              ) : (
                <img
                  src={url}
                  alt={`Selected media ${idx + 1}`}
                  loading="lazy"
                  className="size-full object-cover"
                />
              )}

              <button
                type="button"
                onClick={() => onRemove(idx)}
                aria-label={t("editor.mediaDropzone.removeMedia", "Gỡ bỏ")}
                className="hover:bg-destructive absolute top-1.5 right-1.5 cursor-pointer rounded-full bg-black/60 p-1 text-white shadow-xs transition-colors"
              >
                <X className="size-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
