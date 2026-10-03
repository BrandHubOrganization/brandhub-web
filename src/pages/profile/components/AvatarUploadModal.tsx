import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Crop, History, Upload, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { userService } from "@/services/userService";
import { extractErrorMessage } from "@/utils/error";
import { ImageCropperModal } from "@/components/shared/image-editor/ImageCropperModal";
import { RecentAssetsModal } from "@/components/shared/image-editor/RecentAssetsModal";
import { saveRecentAsset } from "@/utils/recentAssetsStorage";

interface AvatarUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (avatarUrl: string) => void;
}

export function AvatarUploadModal({
  isOpen,
  onClose,
  onSave,
}: AvatarUploadModalProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Cropper and Recent Assets Modals
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropperSrc, setCropperSrc] = useState<string | null>(null);
  const [recentModalOpen, setRecentModalOpen] = useState(false);

  const handleFile = (pickedFile: File) => {
    if (!pickedFile.type.startsWith("image/")) return;
    const url = URL.createObjectURL(pickedFile);
    setCropperSrc(url);
    setCropperOpen(true);
  };

  const handleCropConfirm = (croppedFile: File, croppedPreviewUrl: string) => {
    setFile(croppedFile);
    setPreviewUrl(croppedPreviewUrl);
    setCropperOpen(false);
  };

  const handleSelectRecent = (url: string) => {
    setRecentModalOpen(false);
    setCropperSrc(url);
    setCropperOpen(true);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) handleFile(droppedFile);
  };

  const handleClose = () => {
    setPreviewUrl(null);
    setFile(null);
    setCropperOpen(false);
    setRecentModalOpen(false);
    onClose();
  };

  const handleSave = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const res = await userService.uploadAvatar(file);
      const newAvatarUrl = res.data.data.avatarUrl;
      saveRecentAsset("logo", newAvatarUrl);
      onSave(newAvatarUrl);
      toast.success(t("profile.avatar.uploadSuccess"));
      setPreviewUrl(null);
      setFile(null);
      onClose();
    } catch (err) {
      toast.error(extractErrorMessage(err, t("profile.avatar.uploadError")));
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("profile.avatar.modalTitle")}</DialogTitle>
          </DialogHeader>

          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = "";
            }}
            accept="image/*"
            className="hidden"
          />

          {previewUrl ? (
            <div className="flex flex-col items-center gap-3">
              <div className="relative mx-auto size-40">
                <img
                  src={previewUrl}
                  alt="Avatar preview"
                  className="border-border size-40 rounded-full border-2 object-cover shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPreviewUrl(null);
                    setFile(null);
                  }}
                  className="absolute top-0 right-0 rounded-full bg-black/60 p-1.5 text-white transition hover:bg-red-600"
                  title="Hủy ảnh"
                >
                  <X className="size-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCropperSrc(previewUrl);
                    setCropperOpen(true);
                  }}
                  className="gap-1.5 text-xs"
                >
                  <Crop className="size-3.5 text-brand-orange" />
                  Cắt / Đổ màu
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setRecentModalOpen(true)}
                  className="gap-1.5 text-xs"
                >
                  <History className="size-3.5 text-muted-foreground" />
                  Ảnh cũ
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all ${
                  isDragOver
                    ? "border-brand-orange bg-brand-orange/10 dark:bg-brand-orange/20"
                    : "border-border hover:border-brand-orange bg-muted/50"
                }`}
              >
                <div className="bg-brand-orange-soft dark:bg-brand-orange/20 text-brand-orange dark:text-brand-orange/80 mx-auto flex size-10 items-center justify-center rounded-full shadow-xs">
                  <Upload className="size-5" />
                </div>
                <h4 className="text-foreground mt-2 text-xs font-semibold">
                  {t("profile.avatar.dragDropText")}{" "}
                  <span className="text-brand-orange dark:text-brand-orange/80">
                    {t("profile.avatar.browseText")}
                  </span>
                </h4>
                <p className="text-2xs text-muted-foreground mt-1">
                  {t("profile.avatar.supportedFormats")}
                </p>
              </div>

              <div className="flex justify-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setRecentModalOpen(true)}
                  className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  <History className="size-3.5" />
                  Chọn từ ảnh đại diện đã dùng trước đây
                </Button>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={handleClose}>
              {t("profile.avatar.cancel")}
            </Button>
            <Button
              variant="orange"
              disabled={!file || uploading}
              loading={uploading}
              onClick={handleSave}
            >
              {t("profile.avatar.save")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Cropper Modal */}
      <ImageCropperModal
        isOpen={cropperOpen}
        onClose={() => setCropperOpen(false)}
        cropType="logo"
        imageUrl={cropperSrc}
        onConfirm={handleCropConfirm}
      />

      {/* Recent Avatars Modal */}
      <RecentAssetsModal
        isOpen={recentModalOpen}
        onClose={() => setRecentModalOpen(false)}
        category="logo"
        onSelect={handleSelectRecent}
      />
    </>
  );
}

