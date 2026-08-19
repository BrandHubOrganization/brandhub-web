import React from "react";
import type { ContentTemplate } from "@/types/template";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

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
    navigate("/editor", {
      state: {
        prefilledCaption: template.caption,
        templateTitle: template.title,
        prefilledHashtags: template.hashtags,
        prefilledMediaUrls: template.mediaUrls,
      },
    });

    toast.success(
      `Đã tải mẫu bài viết "${template.title}" vào Content Editor!`,
    );
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border-border flex max-h-[90vh] flex-col overflow-hidden p-0 sm:max-w-2xl">
        {/* Header */}
        <DialogHeader className="border-b border-zinc-100 p-4 dark:border-zinc-800">
          <DialogTitle className="text-foreground flex items-center gap-2 text-sm font-semibold">
            <FileText className="text-brand-orange size-5" />
            Chi Tiết Mẫu Bài Viết
          </DialogTitle>
        </DialogHeader>

        {/* Content Body */}
        <div className="flex-1 space-y-5 overflow-y-auto p-6 text-left">
          {/* Title */}
          <div>
            <span className="text-brand-orange mb-1 block text-3xs font-bold tracking-wider uppercase">
              Tiêu Đề Template:
            </span>
            <h2 className="text-foreground text-base font-bold">
              {template.title}
            </h2>
          </div>

          {/* Full Caption */}
          <div className="space-y-1">
            <span className="block text-3xs font-bold tracking-wider text-zinc-400 uppercase">
              Nội Dung Caption Đầy Đủ:
            </span>
            <div className="bg-muted/40 text-foreground rounded-xl border border-zinc-100 p-4 text-xs leading-relaxed whitespace-pre-wrap dark:border-zinc-800">
              {template.caption}
            </div>
          </div>

          {/* Target Platforms & Hashtags */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Target Platforms */}
            <div className="space-y-1.5">
              <span className="block text-3xs font-bold tracking-wider text-zinc-400 uppercase">
                Nền Tảng Áp Dụng:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {template.targetPlatforms.map((p) => (
                  <span
                    key={p}
                    className="bg-muted rounded-lg px-2.5 py-1 font-mono text-xs font-semibold text-zinc-700 dark:text-zinc-300"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>

            {/* Hashtags */}
            <div className="space-y-1.5">
              <span className="block text-3xs font-bold tracking-wider text-zinc-400 uppercase">
                Hashtags Đính Kèm:
              </span>
              <div className="flex flex-wrap gap-1">
                {template.hashtags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-brand-orange-soft text-brand-orange rounded-xl px-2 py-0.5 font-mono text-xs font-semibold"
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
              <span className="block text-3xs font-bold tracking-wider text-zinc-400 uppercase">
                Hình Ảnh Xem Trước:
              </span>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {template.mediaUrls.map((url, idx) => (
                  <div
                    key={idx}
                    className="border-border aspect-video overflow-hidden rounded-xl border bg-zinc-900"
                  >
                    <img
                      src={url}
                      alt={`Template media ${idx}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <DialogFooter className="flex items-center border-t border-zinc-100 bg-zinc-50 p-4 sm:justify-between dark:border-zinc-800 dark:bg-zinc-900">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="cursor-pointer"
          >
            Đóng
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleUseTemplate}
            className="bg-brand-orange hover:bg-brand-orange/90 cursor-pointer font-semibold text-white"
          >
            <span>Use Template</span>
            <ArrowRight className="ml-1 size-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
