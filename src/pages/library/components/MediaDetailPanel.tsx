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
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa file "${media.filename}"?`)) {
      setIsDeleting(true);
      try {
        await onDelete(media.id);
        toast.success(t("library.media.deleteFileSuccess"));
        onClose();
      } catch (err) {
        toast.error("Lỗi khi xóa file");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
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
            Chi tiết Media
          </h3>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-lg p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
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
          <div className="bg-muted/50 space-y-3 rounded-xl border border-zinc-100 p-4 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-300">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-2 text-xs">
                <HardDrive className="size-4" /> Dung lượng
              </span>
              <span className="text-foreground font-mono font-medium">
                {formatBytes(media.sizeBytes)}
              </span>
            </div>

            {media.width && media.height && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2 text-xs">
                  <Maximize2 className="size-4" /> Độ phân giải
                </span>
                <span className="text-foreground font-mono font-medium">
                  {media.width} × {media.height} px
                </span>
              </div>
            )}

            {media.durationSeconds && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2 text-xs">
                  <Film className="size-4" /> Thời lượng
                </span>
                <span className="text-foreground font-mono font-medium">
                  {media.durationSeconds} giây
                </span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-2 text-xs">
                <Calendar className="size-4" /> Ngày tải lên
              </span>
              <span className="text-foreground text-xs">
                {formatDate(media.createdAt)}
              </span>
            </div>
          </div>

          {/* S3 Direct Link Input Box */}
          <div className="space-y-1.5">
            <label className="text-muted-foreground text-xs font-semibold">
              S3 Direct URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={media.url}
                className="bg-muted flex-1 rounded-lg border border-zinc-200 px-3 py-2 font-mono text-xs text-zinc-600 focus:outline-hidden dark:border-zinc-700 dark:text-zinc-300"
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
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-border flex items-center justify-between border-t bg-zinc-50 p-4 dark:bg-zinc-900">
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
            className="cursor-pointer rounded-xl border border-zinc-300 px-4 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
