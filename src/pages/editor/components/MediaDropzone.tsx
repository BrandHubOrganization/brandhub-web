import React, { useRef, useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { MAX_MEDIA_UPLOAD_SIZE } from "@/lib/constants";
import { materialService } from "@/services/materialService";
import { useWorkspaceStore } from "@/store/workspaceStore";

interface MediaDropzoneProps {
  mediaUrls: string[];
  onChange: (urls: string[]) => void;
  workspaceId?: string;
}

export const MediaDropzone: React.FC<MediaDropzoneProps> = ({
  mediaUrls,
  onChange,
  workspaceId,
}) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentWorkspace = useWorkspaceStore((s) => s.currentWorkspace);
  const effectiveWorkspaceId = workspaceId ?? currentWorkspace?.id;

  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    if (!effectiveWorkspaceId) {
      toast.error("Vui lòng chọn Workspace trước khi tải tệp lên!");
      return;
    }

    setUploadProgress(10);
    const newUploadedUrls: string[] = [];

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      if (file.size > MAX_MEDIA_UPLOAD_SIZE) {
        toast.error(
          t("editor.mediaDropzone.sizeExceededError", {
            fileName: file.name,
          }),
        );
        continue;
      }

      try {
        setUploadProgress(Math.round(((i + 1) / fileArray.length) * 90));
        const item = await materialService.upload(effectiveWorkspaceId, file);
        if (item && item.url) {
          newUploadedUrls.push(item.url);
          toast.success(
            t("editor.mediaDropzone.uploadSuccess", { fileName: file.name }),
          );
        }
      } catch {
        toast.error(
          t("editor.mediaDropzone.uploadError", { fileName: file.name }),
        );
      }
    }

    setUploadProgress(100);
    setTimeout(() => {
      setUploadProgress(null);
    }, 300);

    if (newUploadedUrls.length > 0) {
      onChange([...mediaUrls, ...newUploadedUrls]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveMedia = (index: number) => {
    const next = [...mediaUrls];
    next.splice(index, 1);
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
        accept="image/*,video/*"
        multiple
        className="hidden"
      />

      {/* Drag & Drop Box */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => {
          if (!isUploading) fileInputRef.current?.click();
        }}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-all ${
          isUploading ? "pointer-events-none opacity-75" : ""
        } ${
          isDragOver
            ? "border-brand-orange bg-brand-orange/10 dark:bg-brand-orange/20"
            : "border-border hover:border-brand-orange bg-muted/50"
        }`}
      >
        {uploadProgress !== null ? (
          <div className="mx-auto max-w-xs space-y-3 py-2">
            <div className="text-muted-foreground flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-1.5">
                <Loader2 className="text-brand-orange size-4 animate-spin" />
                {t("editor.mediaDropzone.uploading")}
              </span>
              <span className="font-mono">{uploadProgress}%</span>
            </div>
            <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
              <div
                className="bg-brand-orange h-full rounded-full transition-all duration-150"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="bg-brand-orange-soft dark:bg-brand-orange/20 text-brand-orange dark:text-brand-orange/80 mx-auto flex size-10 items-center justify-center rounded-full shadow-xs">
              <Upload className="size-5" />
            </div>
            <h4 className="text-foreground text-xs font-semibold">
              {t("editor.mediaDropzone.dragDropText")}{" "}
              <span className="text-brand-orange dark:text-brand-orange/80">
                {t("editor.mediaDropzone.browseText")}
              </span>
            </h4>
            <p className="text-2xs text-muted-foreground">
              {t("editor.mediaDropzone.supportedFormats")}
            </p>
          </div>
        )}
      </div>

      {/* Uploaded Media Previews */}
      {mediaUrls.length > 0 && (
        <div className="grid grid-cols-3 gap-3 pt-1 sm:grid-cols-4">
          {mediaUrls.map((url, idx) => {
            const isVideo = url.endsWith(".mp4") || url.includes("mixkit");
            return (
              <div
                key={idx}
                className="group border-border relative aspect-square overflow-hidden rounded-xl border bg-zinc-900 shadow-2xs"
              >
                {isVideo ? (
                  <video src={url} className="h-full w-full object-cover" />
                ) : (
                  <img
                    src={url}
                    alt={`Media ${idx}`}
                    className="h-full w-full object-cover"
                  />
                )}

                <button
                  type="button"
                  onClick={() => handleRemoveMedia(idx)}
                  className="absolute top-1.5 right-1.5 rounded-full bg-black/60 p-1 text-white transition-colors hover:bg-red-600"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
