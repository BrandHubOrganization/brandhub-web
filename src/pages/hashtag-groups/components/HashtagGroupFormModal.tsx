import React, { useState, useEffect } from "react";
import type { HashtagGroup } from "@/types/hashtagGroup";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Hash, Save } from "lucide-react";

interface HashtagGroupFormModalProps {
  isOpen: boolean;
  initialData?: HashtagGroup | null;
  onClose: () => void;
  onSubmit: (data: { name: string; hashtags: string[] }) => Promise<void>;
}

export const HashtagGroupFormModal: React.FC<HashtagGroupFormModalProps> = ({
  isOpen,
  initialData,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState("");
  const [hashtagsText, setHashtagsText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setHashtagsText(initialData.hashtags.join(", "));
    } else {
      setName("");
      setHashtagsText("");
    }
    setErrorMsg(null);
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMsg("Vui lòng nhập tên nhóm hashtag.");
      return;
    }

    const parsedHashtags = hashtagsText
      .split(/[\n,]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .map((t) => (t.startsWith("#") ? t : `#${t}`));

    if (parsedHashtags.length === 0) {
      setErrorMsg("Vui lòng nhập ít nhất 1 hashtag.");
      return;
    }

    if (parsedHashtags.length > 50) {
      setErrorMsg("Tối đa 50 hashtags cho mỗi nhóm.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ name: trimmedName, hashtags: parsedHashtags });
      onClose();
    } catch (err: any) {
      if (err.message === "DUPLICATE_NAME") {
        setErrorMsg("Tên nhóm hashtag này đã tồn tại trong workspace.");
      } else {
        setErrorMsg("Đã xảy ra lỗi khi lưu nhóm hashtag.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border-border overflow-hidden p-0 sm:max-w-md">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <DialogHeader className="border-b border-zinc-100 p-4 dark:border-zinc-800">
            <DialogTitle className="text-foreground flex items-center gap-2 text-sm font-semibold">
              <Hash className="text-brand-orange size-5" />
              {initialData ? "Chỉnh Sửa Nhóm Hashtag" : "Tạo Nhóm Hashtag Mới"}
            </DialogTitle>
          </DialogHeader>

          {/* Form Content */}
          <div className="space-y-4 p-5 text-left">
            {errorMsg && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-600 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-400">
                {errorMsg}
              </div>
            )}

            {/* Group Name Input (reusing UI Input) */}
            <Input
              label="Tên nhóm Hashtag *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: Chiến Dịch Mùa Hè 2026"
            />

            {/* Hashtags Textarea */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Danh sách Hashtags <span className="text-rose-500">*</span>
                </label>
                <span className="text-3xs text-zinc-400">
                  Tối đa 50 hashtags
                </span>
              </div>
              <textarea
                rows={4}
                value={hashtagsText}
                onChange={(e) => setHashtagsText(e.target.value)}
                placeholder="Nhập các hashtag, phân cách bằng dấu phẩy hoặc xuống dòng...&#10;Ví dụ: #Fashion2026, #SummerVibes, #BrandHub"
                className="bg-muted text-foreground focus:ring-brand-orange/20 w-full rounded-xl border border-zinc-200 p-3 font-mono text-xs focus:ring-2 focus:outline-hidden dark:border-zinc-700"
              />
              <p className="text-2xs text-zinc-400">
                Phân cách các hashtag bằng dấu phẩy <code>,</code> hoặc xuống
                dòng. Dấu <code>#</code> tự động được thêm nếu thiếu.
              </p>
            </div>
          </div>

          {/* Footer with UI Buttons */}
          <DialogFooter className="flex justify-end gap-2 border-t border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Hủy
            </Button>
            <Button
              type="submit"
              size="sm"
              loading={isSubmitting}
              className="bg-brand-orange hover:bg-brand-orange/90 text-white"
            >
              <Save className="mr-1 size-4" />
              <span>{initialData ? "Cập Nhật" : "Tạo Mới"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
