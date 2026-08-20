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
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

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
      t("templates.preview.loadSuccess", { title: template.title }),
    );
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border-border flex max-h-[90vh] flex-col overflow-hidden p-0 sm:max-w-2xl">
        {/* Header */}
        <DialogHeader className="border-border border-b p-4">
          <DialogTitle className="text-foreground flex items-center gap-2 text-sm font-semibold">
            <FileText className="text-brand-orange size-5" />
            {t("templates.preview.title")}
          </DialogTitle>
        </DialogHeader>

        {/* Content Body */}
        <div className="flex-1 space-y-5 overflow-y-auto p-6 text-left">
          {/* Title */}
          <div>
            <span className="text-brand-orange text-3xs mb-1 block font-bold tracking-wider uppercase">
              {t("templates.preview.titleLabel")}
            </span>
            <h2 className="text-foreground text-base font-bold">
              {template.title}
            </h2>
          </div>

          {/* Full Caption */}
          <div className="space-y-1">
            <span className="text-3xs text-muted-foreground block font-bold tracking-wider uppercase">
              {t("templates.preview.captionLabel")}
            </span>
            <div className="bg-muted/40 text-foreground border-border rounded-xl border p-4 text-xs leading-relaxed whitespace-pre-wrap">
              {template.caption}
            </div>
          </div>

          {/* Target Platforms & Hashtags */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Target Platforms */}
            <div className="space-y-1.5">
              <span className="text-3xs text-muted-foreground block font-bold tracking-wider uppercase">
                {t("templates.preview.platformsLabel")}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {template.targetPlatforms.map((p) => (
                  <span
                    key={p}
                    className="bg-muted text-muted-foreground rounded-lg px-2.5 py-1 font-mono text-xs font-semibold"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>

            {/* Hashtags */}
            <div className="space-y-1.5">
              <span className="text-3xs text-muted-foreground block font-bold tracking-wider uppercase">
                {t("templates.preview.hashtagsLabel")}
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
              <span className="text-3xs text-muted-foreground block font-bold tracking-wider uppercase">
                {t("templates.preview.mediaLabel")}
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
        <DialogFooter className="border-border bg-muted flex items-center border-t p-4 sm:justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="cursor-pointer"
          >
            {t("templates.preview.close")}
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleUseTemplate}
            className="bg-brand-orange hover:bg-brand-orange/90 cursor-pointer font-semibold text-white"
          >
            <span>{t("templates.preview.useTemplate")}</span>
            <ArrowRight className="ml-1 size-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
