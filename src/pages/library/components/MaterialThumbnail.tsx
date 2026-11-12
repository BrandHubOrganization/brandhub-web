import { useState } from "react";
import { AlertCircle, FileText, Film, ImageIcon, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toRepositoryThumbnailUrl } from "./MaterialRepositoryCard";
import type { MaterialItem } from "@/types/material";

export function MaterialThumbnail({ material }: { material: MaterialItem }) {
  const { t } = useTranslation();
  const [failed, setFailed] = useState(false);
  const thumbUrl = toRepositoryThumbnailUrl(material.previewUrl);
  // A new signed URL from polling does not change an already loaded thumbnail.
  // The card remounts us when the material revision/status changes. If a load
  // failed, allow the next fresh URL to recover it without refreshing the page.
  const [source, setSource] = useState(thumbUrl);
  if (failed && source !== thumbUrl) {
    setSource(thumbUrl);
    setFailed(false);
  }
  const pending =
    material.status === "UPLOADING" || material.status === "VALIDATING";
  const rejected =
    material.status === "REJECTED" || material.status === "FAILED";
  const ready = material.status === "READY" && !material.deletedAt;
  return (
    <div className="bg-muted text-muted-foreground flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-lg">
      {pending ? (
        <div role="status" className="p-2 text-xs">
          <Loader2 className="mx-auto size-6 animate-spin" />
          {t(
            `library.repository.${material.status === "UPLOADING" ? "uploading" : "validating"}`,
          )}
        </div>
      ) : rejected ? (
        <div className="text-destructive p-2 text-xs">
          <AlertCircle className="mx-auto size-6" />
          {t(
            `library.repository.${material.status === "REJECTED" ? "uploadRejected" : "uploadFailed"}`,
          )}
        </div>
      ) : ready &&
        thumbUrl &&
        !failed &&
        material.mediaKind === "IMAGE" ? (
        <img
          src={source}
          loading="lazy"
          decoding="async"
          alt={material.name}
          className="size-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : ready &&
        material.previewUrl &&
        !failed &&
        material.mediaKind === "VIDEO" ? (
        <video
          src={material.previewUrl}
          preload="none"
          muted
          playsInline
          className="size-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : material.mediaKind === "VIDEO" ? (
        <Film className="size-8" />
      ) : material.mediaKind === "IMAGE" ? (
        <ImageIcon className="size-8" />
      ) : (
        <FileText className="size-8" />
      )}
    </div>
  );
}
