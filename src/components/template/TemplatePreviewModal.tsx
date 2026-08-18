import React from 'react';
import type { ContentTemplate } from '@/types/template';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowRight, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface TemplatePreviewModalProps {
  isOpen: boolean;
  template: ContentTemplate | null;
  onClose: () => void;
}

export const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  isOpen,
  template,
  onClose,
}) => {
  const navigate = useNavigate();

  if (!template) return null;

  const handleUseTemplate = () => {
    navigate('/editor', {
      state: {
        prefilledCaption: template.caption,
        templateTitle: template.title,
        prefilledHashtags: template.hashtags,
        prefilledMediaUrls: template.mediaUrls,
      },
    });

    toast.success(`Đã tải mẫu bài viết "${template.title}" vào Content Editor!`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden border-zinc-200 dark:border-zinc-800">
        {/* Header */}
        <DialogHeader className="p-4 border-b border-zinc-100 dark:border-zinc-800">
          <DialogTitle className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Chi Tiết Mẫu Bài Viết
          </DialogTitle>
        </DialogHeader>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-left">
          {/* Title */}
          <div>
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block mb-1">
              Tiêu Đề Template:
            </span>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              {template.title}
            </h2>
          </div>

          {/* Full Caption */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
              Nội Dung Caption Đầy Đủ:
            </span>
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-100 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed">
              {template.caption}
            </div>
          </div>

          {/* Target Platforms & Hashtags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Target Platforms */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                Nền Tảng Áp Dụng:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {template.targetPlatforms.map((p) => (
                  <span
                    key={p}
                    className="px-2.5 py-1 text-xs font-mono font-semibold rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>

            {/* Hashtags */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                Hashtags Đính Kèm:
              </span>
              <div className="flex flex-wrap gap-1">
                {template.hashtags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 text-xs font-mono rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Media Images Preview */}
          {template.mediaUrls.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                Hình Ảnh Xem Trước:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {template.mediaUrls.map((url, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl overflow-hidden aspect-video border border-zinc-200 dark:border-zinc-800 bg-zinc-900"
                  >
                    <img src={url} alt={`Template media ${idx}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <DialogFooter className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 sm:justify-between flex items-center">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Đóng
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleUseTemplate}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <span>Use Template</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
