import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { materialService } from "@/services/materialService";
import type { MaterialItem } from "@/types/material";

interface Props {
  material: MaterialItem | null;
  workspaceId: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function RenameMaterialModal({
  material,
  workspaceId,
  open,
  onClose,
  onSuccess,
}: Props) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [baseName, setBaseName] = useState("");
  const [extension, setExtension] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!material) return;
    const fullName = material.name || "";
    const lastDot = fullName.lastIndexOf(".");
    if (lastDot > 0) {
      setBaseName(fullName.slice(0, lastDot));
      setExtension(fullName.slice(lastDot + 1));
    } else {
      setBaseName(fullName);
      const extFromMime = material.mimeType?.split("/")[1] || "";
      setExtension(extFromMime === "jpeg" ? "jpg" : extFromMime);
    }
  }, [material]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!material || submitting) return;

    const trimmed = baseName.trim();
    if (!trimmed) {
      toast.error(t("library.repository.nameRequired", "Tên tệp không được để trống"));
      return;
    }

    const finalName = extension ? `${trimmed}.${extension}` : trimmed;
    if (finalName === material.name) {
      onClose();
      return;
    }

    setSubmitting(true);
    try {
      await materialService.update(workspaceId, material.id, {
        expectedVersion: material.version ?? 0,
        name: finalName,
      });
      toast.success(t("library.repository.renameSuccess", "Đã đổi tên tệp thành công"));
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const errorResponse = err as { response?: { data?: { message?: string } } };
      toast.error(
        errorResponse?.response?.data?.message ||
          t("library.repository.renameError", "Không thể đổi tên tệp. Vui lòng thử lại."),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen && !submitting) onClose();
      }}
    >
      <DialogContent
        className="rounded-2xl sm:max-w-md"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          inputRef.current?.focus();
          inputRef.current?.select();
        }}
      >
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-orange/10 text-brand-orange">
              <Pencil className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                {t("library.repository.renameFileTitle", "Đổi tên tệp")}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {t("library.repository.renameFileDesc", "Nhập tên mới cho tệp tin của bạn")}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label htmlFor="rename-input" className="text-xs font-semibold text-foreground">
              {t("library.repository.fileNameLabel", "Tên tệp")}
            </label>
            <div className="flex items-center gap-2">
              <Input
                ref={inputRef}
                id="rename-input"
                value={baseName}
                disabled={submitting}
                onChange={(e) => setBaseName(e.target.value)}
                placeholder={t("library.repository.namePlaceholder", "Nhập tên tệp...")}
                className="h-9 flex-1 rounded-xl text-sm"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              disabled={submitting}
              onClick={onClose}
              className="rounded-xl text-xs font-semibold"
            >
              {t("common.cancel", "Huỷ")}
            </Button>
            <Button
              type="submit"
              disabled={submitting || !baseName.trim()}
              className="rounded-xl bg-brand-orange text-xs font-semibold text-white hover:bg-brand-orange/90"
            >
              {submitting
                ? t("common.saving", "Đang lưu...")
                : t("common.save", "Lưu thay đổi")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
