import React from "react";
import { Check, Film, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { MediaRepositoryItemCardProps } from "./types";

export const MediaRepositoryItemCard: React.FC<MediaRepositoryItemCardProps> = ({
  item,
  isSelected,
  onToggle,
}) => {
  const { t } = useTranslation();
  const source = item.previewUrl || item.url;
  const isVideo = item.mediaKind === "VIDEO";
  const isFile = item.mediaKind === "FILE";

  return (
    <div
      onClick={onToggle}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
        }
      }}
      title={item.name}
      className={`group bg-card relative aspect-square cursor-pointer overflow-hidden rounded-xl border transition-all duration-150 active:scale-97 ${
        isSelected
          ? "border-brand-orange ring-brand-orange/30 shadow-xs ring-2"
          : "border-border hover:border-brand-orange/60 hover:shadow-2xs"
      }`}
    >
      {/* Media display */}
      {isVideo ? (
        <>
          <video
            src={source}
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
      ) : isFile ? (
        <div className="bg-muted/30 text-muted-foreground flex size-full flex-col items-center justify-center p-2">
          <FileText className="mb-1 size-7" />
          <span className="text-3xs line-clamp-2 text-center font-medium">
            {item.name}
          </span>
        </div>
      ) : (
        <img
          src={source}
          alt={item.name}
          loading="lazy"
          className="size-full object-cover"
        />
      )}

      {/* Selected badge */}
      {isSelected && (
        <div className="bg-brand-orange absolute top-1.5 right-1.5 flex size-5 items-center justify-center rounded-full text-white shadow-xs">
          <Check className="size-3" strokeWidth={3} />
        </div>
      )}

      {/* Name hover overlay */}
      {!isFile && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent p-1.5 pt-4 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
          <p className="text-3xs truncate font-medium text-white">{item.name}</p>
        </div>
      )}
    </div>
  );
};
