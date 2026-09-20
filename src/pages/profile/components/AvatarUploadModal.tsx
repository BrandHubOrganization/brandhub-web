import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { userService } from "@/services/userService";
import { extractErrorMessage } from "@/utils/error";

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

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleClose = () => {
    setPreviewUrl(null);
    setFile(null);
    onClose();
  };

  const handleSave = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const res = await userService.uploadAvatar(file);
      onSave(res.data.data.avatarUrl);
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("profile.avatar.modalTitle")}</DialogTitle>
        </DialogHeader>

        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          accept="image/*"
          className="hidden"
        />

        {previewUrl ? (
          <div className="relative mx-auto size-40">
            <img
              src={previewUrl}
              alt="Avatar preview"
              className="border-border size-40 rounded-full border object-cover"
            />
            <button
              type="button"
              onClick={() => setPreviewUrl(null)}
              className="absolute top-0 right-0 rounded-full bg-black/60 p-1.5 text-white hover:bg-red-600"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ) : (
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
        )}

        <div className="flex justify-end gap-2">
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
  );
}
