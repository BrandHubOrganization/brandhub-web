import React, { useState } from "react";
import type { MediaItem } from "@/types/contentLibrary";
import {
  X,
  Copy,
  Trash2,
  Calendar,
  HardDrive,
  Maximize2,
  Film,
  Image as ImageIcon,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { COPY_FEEDBACK_DURATION_MS } from "@/lib/constants";
import { formatFileSize } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface MediaDetailPanelProps {
  media: MediaItem | null;
  onClose: () => void;
  onDelete: (id: string) => Promise<void>;
}

export const MediaDetailPanel: React.FC<MediaDetailPanelProps> = ({
  media,
  onClose,
  onDelete,
}) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!media) return null;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(media.url);
    setCopied(true);
    toast.success(t("library.media.copyUrlSuccess"));
    setTimeout(() => setCopied(false), COPY_FEEDBACK_DURATION_MS);
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        t("library.media.deleteConfirm", { filename: media.filename }),
      )
    ) {
      setIsDeleting(true);
      try {
        await onDelete(media.id);
        toast.success(t("library.media.deleteFileSuccess"));
        onClose();
      } catch (err) {
        toast.error(t("library.media.deleteError"));
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end overflow-hidden bg-black/40 backdrop-blur-xs transition-opacity">
      <div className="bg-card border-border flex h-full w-full max-w-md transform flex-col border-l shadow-2xl transition-transform">
        {/* Header */}
        <div className="border-border flex items-center justify-between border-b p-4">
          <h3 className="text-foreground flex items-center gap-2 text-sm font-semibold">
            {media.type === "video" ? (
              <Film className="text-brand-orange size-4" />
            ) : (
              <ImageIcon className="text-brand-orange size-4" />
            )}
            {t("library.media.detailTitle")}
          </h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer rounded-lg p-1 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 space-y-6 overflow-y-auto p-5">
          {/* Media Preview Box */}
          <div className="border-border group relative flex min-h-[220px] items-center justify-center overflow-hidden rounded-xl border bg-zinc-950">
            {media.type === "video" ? (
              <video
                src={media.url}
                controls
                className="max-h-[300px] w-full object-contain"
                poster={media.thumbnailUrl}
              />
            ) : (
              <img
                src={media.url}
                alt={media.filename}
                className="max-h-[300px] w-full object-contain"
              />
            )}
          </div>

          {/* Title & Badge */}
          <div>
            <span className="bg-brand-orange-soft text-brand-orange mb-2 inline-block rounded-full px-2.5 py-1 text-xs font-bold tracking-wide uppercase">
              {media.type}
            </span>
            <h4 className="text-foreground text-base leading-snug font-medium break-all">
              {media.filename}
            </h4>
          </div>

          {/* Metadata Grid */}
          <div className="bg-muted/50 border-border text-muted-foreground space-y-3 rounded-xl border p-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-2 text-xs">
                <HardDrive className="size-4" /> {t("library.media.sizeLabel")}
              </span>
              <span className="text-foreground font-mono font-medium">
                {formatFileSize(media.sizeBytes)}
              </span>
            </div>

            {media.width && media.height && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2 text-xs">
                  <Maximize2 className="size-4" />{" "}
                  {t("library.media.resolutionLabel")}
                </span>
                <span className="text-foreground font-mono font-medium">
                  {media.width} × {media.height} px
                </span>
              </div>
            )}

            {media.durationSeconds && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2 text-xs">
                  <Film className="size-4" /> {t("library.media.durationLabel")}
                </span>
                <span className="text-foreground font-mono font-medium">
                  {t("library.media.durationSeconds", {
                    seconds: media.durationSeconds,
                  })}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-2 text-xs">
                <Calendar className="size-4" />{" "}
                {t("library.media.uploadedAtLabel")}
              </span>
              <span className="text-foreground text-xs">
                {formatDate(media.createdAt)}
              </span>
            </div>
          </div>

          {/* S3 Direct Link Input Box */}
          <div className="space-y-1.5">
            <label className="text-muted-foreground text-xs font-semibold">
              {t("library.media.directUrlLabel")}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={media.url}
                className="bg-muted border-border text-muted-foreground flex-1 rounded-lg border px-3 py-2 font-mono text-xs focus:outline-hidden"
              />
              <button
                onClick={handleCopyUrl}
                className="bg-brand-orange hover:bg-brand-orange/90 flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-white shadow-xs transition-colors"
              >
                {copied ? (
                  <Check className="size-4" />
                ) : (
                  <Copy className="size-4" />
                )}
                {copied ? t("library.media.copied") : t("library.media.copy")}
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-border bg-muted flex items-center justify-between border-t p-4">
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-900/60"
          >
            <Trash2 className="size-4" />
            {isDeleting
              ? t("library.media.deleting")
              : t("library.media.deleteFileButton")}
          </button>

          <button
            onClick={onClose}
            className="border-border text-foreground hover:bg-muted cursor-pointer rounded-xl border px-4 py-2 text-xs font-medium transition-colors"
          >
            {t("library.media.close")}
          </button>
        </div>
      </div>
    </div>
  );
};
