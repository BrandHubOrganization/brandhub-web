import React, { useState, useEffect } from 'react';
import type { HashtagGroup } from '@/types/hashtagGroup';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Hash, Save } from 'lucide-react';

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
  const [name, setName] = useState('');
  const [hashtagsText, setHashtagsText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setHashtagsText(initialData.hashtags.join(', '));
    } else {
      setName('');
      setHashtagsText('');
    }
    setErrorMsg(null);
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMsg('Vui lòng nhập tên nhóm hashtag.');
      return;
    }

    const parsedHashtags = hashtagsText
      .split(/[\n,]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .map((t) => (t.startsWith('#') ? t : `#${t}`));

    if (parsedHashtags.length === 0) {
      setErrorMsg('Vui lòng nhập ít nhất 1 hashtag.');
      return;
    }

    if (parsedHashtags.length > 50) {
      setErrorMsg('Tối đa 50 hashtags cho mỗi nhóm.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ name: trimmedName, hashtags: parsedHashtags });
      onClose();
    } catch (err: any) {
      if (err.message === 'DUPLICATE_NAME') {
        setErrorMsg('Tên nhóm hashtag này đã tồn tại trong workspace.');
      } else {
        setErrorMsg('Đã xảy ra lỗi khi lưu nhóm hashtag.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-border">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <DialogHeader className="p-4 border-b border-zinc-100 dark:border-zinc-800">
            <DialogTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Hash className="w-5 h-5 text-brand-orange" />
              {initialData ? 'Chỉnh Sửa Nhóm Hashtag' : 'Tạo Nhóm Hashtag Mới'}
            </DialogTitle>
          </DialogHeader>

          {/* Form Content */}
          <div className="p-5 space-y-4 text-left">
            {errorMsg && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl text-xs text-rose-600 dark:text-rose-400 font-medium">
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
                <span className="text-[10px] text-zinc-400">Tối đa 50 hashtags</span>
              </div>
              <textarea
                rows={4}
                value={hashtagsText}
                onChange={(e) => setHashtagsText(e.target.value)}
                placeholder="Nhập các hashtag, phân cách bằng dấu phẩy hoặc xuống dòng...&#10;Ví dụ: #Fashion2026, #SummerVibes, #BrandHub"
                className="w-full p-3 text-xs bg-muted border border-zinc-200 dark:border-zinc-700 rounded-xl text-foreground focus:outline-hidden focus:ring-2 focus:ring-brand-orange/20 font-mono"
              />
              <p className="text-[11px] text-zinc-400">
                Phân cách các hashtag bằng dấu phẩy <code>,</code> hoặc xuống dòng. Dấu <code>#</code> tự động được thêm nếu thiếu.
              </p>
            </div>
          </div>

          {/* Footer with UI Buttons */}
          <DialogFooter className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" size="sm" loading={isSubmitting} className="bg-brand-orange hover:bg-brand-orange/90 text-white">
              <Save className="w-4 h-4 mr-1" />
              <span>{initialData ? 'Cập Nhật' : 'Tạo Mới'}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
