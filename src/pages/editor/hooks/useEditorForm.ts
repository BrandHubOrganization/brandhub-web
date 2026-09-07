import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { mockEditorService } from "@/services/mock/mockEditorService";
import type { SocialPlatform } from "@/types/editor";
import type { ContentTemplate } from "@/types/template";

type EditorLocationState = {
  prefilledCaption?: string;
  templateTitle?: string;
  prefilledHashtags?: string[];
  prefilledMediaUrls?: string[];
} | null;

export function useEditorForm() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const locationState = location.state as EditorLocationState;

  const [title, setTitle] = useState(
    locationState?.templateTitle || "Nike Air Max Pulse — Mở bán đợt 1",
  );
  const [caption, setCaption] = useState(
    locationState?.prefilledCaption ||
      "Đột phá phong cách với dòng Nike Air Max Pulse hoàn toàn mới! Với đệm khí Air cải tiến mang lại độ đàn hồi vượt trội, đây là sự kết hợp hoàn hảo giữa thời trang đường phố và hiệu năng vận hành.",
  );
  const [hashtags, setHashtags] = useState<string[]>(
    locationState?.prefilledHashtags || [
      "#NikeAirMax",
      "#AirMaxPulse",
      "#Sneakerhead",
      "#BrandHub",
    ],
  );
  const [mediaUrls, setMediaUrls] = useState<string[]>(
    locationState?.prefilledMediaUrls || [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000&q=80",
    ],
  );
  const [targetPlatforms] = useState<SocialPlatform[]>([
    "FACEBOOK",
    "INSTAGRAM",
    "TIKTOK",
    "THREADS",
    "ZALO_OA",
  ]);

  const [isDirty, setIsDirty] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string>(
    new Date().toLocaleTimeString("vi-VN"),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isTemplatePickerOpen, setIsTemplatePickerOpen] = useState(false);

  useEffect(() => {
    if (locationState?.prefilledCaption) {
      setCaption(locationState.prefilledCaption);
    }
    if (locationState?.templateTitle) {
      setTitle(locationState.templateTitle);
    }
    if (
      locationState?.prefilledHashtags &&
      locationState.prefilledHashtags.length > 0
    ) {
      setHashtags(locationState.prefilledHashtags);
    }
    if (
      locationState?.prefilledMediaUrls &&
      locationState.prefilledMediaUrls.length > 0
    ) {
      setMediaUrls(locationState.prefilledMediaUrls);
    }
  }, [locationState]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    setIsDirty(true);
  };
  const handleCaptionChange = (val: string) => {
    setCaption(val);
    setIsDirty(true);
  };
  const handleHashtagsChange = (tags: string[]) => {
    setHashtags(tags);
    setIsDirty(true);
  };
  const handleMediaUrlsChange = (urls: string[]) => {
    setMediaUrls(urls);
    setIsDirty(true);
  };

  const saveDraft = useCallback(async () => {
    if (!isDirty) return;
    setIsSaving(true);
    try {
      const res = await mockEditorService.autoSaveDraft("post-99", {
        title,
        caption,
        hashtags,
        mediaUrls,
        targetPlatforms,
      });
      setLastSavedTime(new Date(res.updatedAt).toLocaleTimeString("vi-VN"));
      setIsDirty(false);
    } catch (err) {
      console.error("Auto-save error:", err);
    } finally {
      setIsSaving(false);
    }
  }, [isDirty, title, caption, hashtags, mediaUrls, targetPlatforms]);

  useEffect(() => {
    const timer = setInterval(() => {
      saveDraft();
    }, 30000);

    return () => clearInterval(timer);
  }, [saveDraft]);

  const handleApplyAIResult = (
    newCaption: string,
    newHashtags: string[],
    imageUrl?: string,
  ) => {
    setCaption(newCaption);
    if (newHashtags.length > 0) {
      const merged = Array.from(new Set([...hashtags, ...newHashtags]));
      setHashtags(merged);
    }
    if (imageUrl && !mediaUrls.includes(imageUrl)) {
      setMediaUrls((prev) => [...prev, imageUrl]);
    }
    setIsDirty(true);
  };

  const handleApplyTemplate = (tpl: ContentTemplate) => {
    setTitle(tpl.title);
    setCaption(tpl.caption);
    if (tpl.hashtags && tpl.hashtags.length > 0) {
      setHashtags(tpl.hashtags);
    }
    if (tpl.mediaUrls && tpl.mediaUrls.length > 0) {
      setMediaUrls(tpl.mediaUrls);
    }
    setIsDirty(true);
  };

  const handleSubmitForReview = async () => {
    if (!caption.trim()) {
      toast.error(t("editor.submitEmptyError"));
      return;
    }

    setIsSubmitting(true);
    try {
      await mockEditorService.submitForReview("post-99");
      toast.success(t("editor.submitSuccess"));
      navigate("/requests");
    } catch (err) {
      toast.error(t("editor.submitError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    title,
    caption,
    hashtags,
    mediaUrls,
    targetPlatforms,
    isDirty,
    lastSavedTime,
    isSaving,
    isSubmitting,
    isPreviewOpen,
    setIsPreviewOpen,
    isTemplatePickerOpen,
    setIsTemplatePickerOpen,
    handleTitleChange,
    handleCaptionChange,
    handleHashtagsChange,
    handleMediaUrlsChange,
    handleApplyAIResult,
    handleApplyTemplate,
    handleSubmitForReview,
  };
}
