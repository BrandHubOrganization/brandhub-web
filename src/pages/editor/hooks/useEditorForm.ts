import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { postService, type SavePostMedia } from "@/services/postService";
import { useWorkspaceStore } from "@/store/workspaceStore";
import type { SocialPlatform } from "@/types/editor";
import type { ContentTemplate } from "@/types/template";

type EditorLocationState = {
  prefilledCaption?: string;
  prefilledHashtags?: string[];
  prefilledMediaUrls?: string[];
} | null;

function toPostMedia(
  urls: string[],
  storageKeys: Record<string, { s3Key: string; mediaType: "IMAGE" | "VIDEO" }>,
): SavePostMedia[] {
  return urls.reduce<SavePostMedia[]>((items, url) => {
    const stored = storageKeys[url];
    if (stored) {
      items.push({ s3Key: stored.s3Key, mediaType: stored.mediaType });
    } else if (/^https?:\/\//i.test(url)) {
      items.push({
        externalUrl: url,
        mediaType: /\.mp4(?:$|\?)/i.test(url) ? "VIDEO" : "IMAGE",
      });
    }
    return items;
  }, []);
}

export function useEditorForm() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const currentWorkspace = useWorkspaceStore((s) => s.currentWorkspace);
  const locationState = location.state as EditorLocationState;

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
  const [mediaStorageKeys, setMediaStorageKeys] = useState<
    Record<string, { s3Key: string; mediaType: "IMAGE" | "VIDEO" }>
  >({});
  const [draftId, setDraftId] = useState<string>();
  const [containsAiContent, setContainsAiContent] = useState(false);
  const [targetPlatforms] = useState<SocialPlatform[]>([
    "FACEBOOK",
    "INSTAGRAM",
    "TIKTOK",
    "THREADS",
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

  const handleGeneratedMedia = (
    url: string,
    s3Key: string | undefined,
    mediaType: "IMAGE" | "VIDEO",
  ) => {
    setMediaUrls((current) =>
      current.includes(url) ? current : [...current, url],
    );
    if (s3Key) {
      setMediaStorageKeys((current) => ({
        ...current,
        [url]: { s3Key, mediaType },
      }));
    }
    setContainsAiContent(true);
    setIsDirty(true);
  };

  const saveDraft = useCallback(async () => {
    if (!isDirty) return;
    setIsSaving(true);
    try {
      if (!currentWorkspace) return;
      const payload = {
        caption,
        hashtags,
        media: toPostMedia(mediaUrls, mediaStorageKeys),
        targetPlatforms,
        aiGenerated: containsAiContent,
      };
      const res = draftId
        ? await postService.updateDraft(currentWorkspace.id, draftId, payload)
        : await postService.createDraft(currentWorkspace.id, payload);
      setDraftId(res.id);
      setLastSavedTime(new Date(res.updatedAt).toLocaleTimeString("vi-VN"));
      setIsDirty(false);
    } catch (err) {
      console.error("Auto-save error:", err);
    } finally {
      setIsSaving(false);
    }
  }, [
    isDirty,
    caption,
    hashtags,
    mediaUrls,
    targetPlatforms,
    currentWorkspace,
    mediaStorageKeys,
    containsAiContent,
    draftId,
  ]);

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
    setContainsAiContent(true);
    setIsDirty(true);
  };

  const handleApplyTemplate = (tpl: ContentTemplate) => {
    setCaption(tpl.caption);
    if (tpl.hashtags && tpl.hashtags.length > 0) {
      setHashtags(tpl.hashtags);
    }
    if (tpl.mediaUrls && tpl.mediaUrls.length > 0) {
      setMediaUrls(tpl.mediaUrls);
      setMediaStorageKeys({});
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
      if (!currentWorkspace) {
        throw new Error("Workspace is required");
      }
      let postId = draftId;
      if (!postId || isDirty) {
        const media = toPostMedia(mediaUrls, mediaStorageKeys);
        const payload = {
          caption,
          hashtags,
          media,
          targetPlatforms,
          aiGenerated: containsAiContent,
        };
        const saved = postId
          ? await postService.updateDraft(currentWorkspace.id, postId, payload)
          : await postService.createDraft(currentWorkspace.id, payload);
        postId = saved.id;
        setDraftId(saved.id);
      }
      await postService.submitForReview(currentWorkspace.id, postId);
      toast.success(t("editor.submitSuccess"));
      if (currentWorkspace) {
        navigate(`/workspaces/${currentWorkspace.id}/requests`);
      }
    } catch {
      toast.error(t("editor.submitError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
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
    handleCaptionChange,
    handleHashtagsChange,
    handleMediaUrlsChange,
    handleGeneratedMedia,
    handleApplyAIResult,
    handleApplyTemplate,
    handleSubmitForReview,
  };
}
