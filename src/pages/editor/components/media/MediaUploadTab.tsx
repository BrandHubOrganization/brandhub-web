import React, { useRef, useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { isAxiosError } from "axios";
import { MAX_MEDIA_UPLOAD_SIZE } from "@/lib/constants";
import { useMaterialUpload } from "@/pages/library/hooks/useMaterialUpload";
import { DuplicateResolutionModal } from "@/pages/library/components/DuplicateResolutionModal";
import type { MediaUploadTabProps } from "./types";

export const MediaUploadTab: React.FC<MediaUploadTabProps> = ({
  effectiveWorkspaceId,
  onUploaded,
  onAppendUrls,
}) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploader = useMaterialUpload(effectiveWorkspaceId);

  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const isUploading = uploadProgress !== null;

  const uploadSingleFile = async (file: File): Promise<string | null> => {
    if (file.size > MAX_MEDIA_UPLOAD_SIZE) {
      toast.error(
        t("editor.mediaDropzone.sizeExceededError", { fileName: file.name }),
      );
      return null;
    }
    try {
      const item = await uploader.upload(file, {
        type: "RAW",
        purpose: "MATERIAL",
        visibility: "INTERNAL",
      });
      if (item?.url) {
        onUploaded(
          item.url,
          item.id,
          item.mediaKind === "VIDEO" ? "VIDEO" : "IMAGE",
        );
        toast.success(
          t("editor.mediaDropzone.uploadSuccess"),
        );
        return item.url;
      }
    } catch (failure: unknown) {
      const responseData = isAxiosError(failure) ? failure.response?.data : undefined;
      console.error(`[MediaUploadTab] Upload failed for ${file.name}:`, failure, responseData);
      const code = isAxiosError<{ error?: { code?: string; message?: string } }>(failure)
        ? failure.response?.data?.error?.code
        : undefined;
      const backendMessage = isAxiosError<{ error?: { code?: string; message?: string } }>(failure)
        ? failure.response?.data?.error?.message
        : undefined;
      const key =
        code === "DRIVE_NOT_CONNECTED"
          ? "library.repositoryUpload.driveNotConnected"
          : code === "STORAGE_QUOTA_EXCEEDED"
            ? "library.repositoryUpload.quotaExceeded"
            : code === "STORAGE_POOL_CAPACITY_EXCEEDED"
              ? "library.repositoryUpload.poolFull"
              : code === "MATERIAL_STORAGE_UNAVAILABLE" ||
                  code === "STORAGE_SCHEMA_NOT_READY"
                ? "library.repositoryUpload.unavailable"
                : null;
      const errorMessage = key
        ? t(key)
        : backendMessage || t("editor.mediaDropzone.uploadError");
      toast.error(errorMessage, { duration: 5000 });
    }
    return null;
  };

  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;
    if (!effectiveWorkspaceId) {
      toast.error(t("editor.mediaDropzone.selectWorkspaceWarning"));
      return;
    }
    setUploadProgress(10);
    const newUrls: string[] = [];
    for (let i = 0; i < fileArray.length; i++) {
      setUploadProgress(Math.round(((i + 1) / fileArray.length) * 90));
      const url = await uploadSingleFile(fileArray[i]);
      if (url) newUrls.push(url);
    }
    setUploadProgress(100);
    setTimeout(() => setUploadProgress(null), 300);
    if (newUrls.length > 0) onAppendUrls(newUrls);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      void handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => e.target.files && void handleFiles(e.target.files)}
        accept="image/*,video/*"
        multiple
        className="hidden"
      />

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
        className={`border-border bg-muted/40 hover:border-brand-orange cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-all duration-150 ${
          isUploading ? "pointer-events-none opacity-75" : ""
        } ${
          isDragOver
            ? "border-brand-orange bg-brand-orange/10 dark:bg-brand-orange/20"
            : ""
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

      <DuplicateResolutionModal
        conflict={uploader.conflict}
        onChoose={uploader.resolveConflict}
      />
    </div>
  );
};
