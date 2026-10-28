import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import {
  postService,
  type SavePostMedia,
  type SavePostInput,
  type PostResponse,
} from "@/services/postService";
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
  storageKeys: Record<string, SavePostMedia>,
): SavePostMedia[] {
  return urls.reduce<SavePostMedia[]>((items, url) => {
    const stored = storageKeys[url];
    if (stored) {
      items.push(stored);
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

  const [caption, setCaption] = useState(locationState?.prefilledCaption ?? "");
  const [hashtags, setHashtags] = useState<string[]>(
    locationState?.prefilledHashtags ?? [],
  );
  const [mediaUrls, setMediaUrls] = useState<string[]>(
    locationState?.prefilledMediaUrls ?? [],
  );
  const [mediaStorageKeys, setMediaStorageKeys] = useState<
    Record<string, SavePostMedia>
  >({});
  const [draftId, setDraftId] = useState<string>();
  const [containsAiContent, setContainsAiContent] = useState(false);
  const [targetPlatforms, setTargetPlatforms] = useState<SocialPlatform[]>([
    "FACEBOOK",
  ]);

  const [publishStatus, setPublishStatus] = useState<
    "IDLE" | "PUBLISHING" | "PUBLISHED" | "FAILED"
  >("IDLE");

  const [isDirty, setIsDirty] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string>(
    new Date().toLocaleTimeString("vi-VN"),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isTemplatePickerOpen, setIsTemplatePickerOpen] = useState(false);

  const [searchParams] = useSearchParams();
  const taskIdParam = searchParams.get("taskId");

  const markDirty = () => {
    setIsDirty(true);
    setPublishStatus((prev) => (prev === "PUBLISHING" ? prev : "IDLE"));
  };

  const toggleTargetPlatform = (platform: SocialPlatform) => {
    setTargetPlatforms((prev) => {
      if (prev.includes(platform)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter((p) => p !== platform);
      } else {
        return [...prev, platform];
      }
    });
    markDirty();
  };

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

  // Tự động load nội dung Task thật từ backend khi có taskId trên URL
  useEffect(() => {
    if (!taskIdParam || !currentWorkspace) return;
    import("@/lib/axios").then(({ api }) => {
      api
        .get(`/api/v1/workspaces/${currentWorkspace.id}/tasks/${taskIdParam}`)
        .then((res) => {
          const task = res.data?.data;
          if (task) {
            const taskContent = task.description || task.name || task.title;
            if (taskContent) {
              setCaption(taskContent);
              setIsDirty(true);
              toast.info(
                `Đã nạp nội dung từ Task: "${task.name || task.title}"`,
              );
            }
          }
        })
        .catch(() => {
          // ignore if task not found or mock fallback
        });
    });
  }, [taskIdParam, currentWorkspace]);

  const handleCaptionChange = (val: string) => {
    setCaption(val);
    markDirty();
  };
  const handleHashtagsChange = (tags: string[]) => {
    setHashtags(tags);
    markDirty();
  };
  const handleMediaUrlsChange = (urls: string[]) => {
    setMediaUrls(urls);
    markDirty();
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
    markDirty();
  };

  const handleRepositoryMedia = (
    url: string,
    materialId: string,
    mediaType: "IMAGE" | "VIDEO",
  ) => {
    setMediaUrls((current) =>
      current.includes(url) ? current : [...current, url],
    );
    setMediaStorageKeys((current) => ({
      ...current,
      [url]: { materialId, mediaType },
    }));
    markDirty();
  };

  const saveOrUpdateDraft = async (
    workspaceId: string,
    currentDraftId: string | undefined,
    payload: SavePostInput,
  ): Promise<PostResponse> => {
    if (currentDraftId) {
      try {
        return await postService.updateDraft(
          workspaceId,
          currentDraftId,
          payload,
        );
      } catch (err: unknown) {
        const isNotEditable =
          typeof err === "object" &&
          err !== null &&
          "response" in err &&
          (err as { response?: { status?: number; data?: { code?: string } } })
            .response?.status === 400;
        if (isNotEditable) {
          return await postService.createDraft(workspaceId, payload);
        }
        throw err;
      }
    }
    return await postService.createDraft(workspaceId, payload);
  };

  const scheduledAt: string | undefined = undefined;

  const saveDraft = useCallback(async () => {
    if (
      !isDirty ||
      publishStatus === "PUBLISHING" ||
      publishStatus === "PUBLISHED"
    )
      return;
    setIsSaving(true);
    try {
      if (!currentWorkspace) return;
      const payload: SavePostInput = {
        caption,
        hashtags,
        media: toPostMedia(mediaUrls, mediaStorageKeys),
        targetPlatforms,
        aiGenerated: containsAiContent,
        taskId: taskIdParam || undefined,
        scheduledAt: scheduledAt || undefined,
      };
      const res = await saveOrUpdateDraft(
        currentWorkspace.id,
        draftId,
        payload,
      );
      setDraftId(res.id);
      setLastSavedTime(new Date(res.updatedAt).toLocaleTimeString("vi-VN"));
      setIsDirty(false);
    } catch {
      setIsDirty(false);
    } finally {
      setIsSaving(false);
    }
  }, [
    isDirty,
    publishStatus,
    caption,
    hashtags,
    mediaUrls,
    targetPlatforms,
    currentWorkspace,
    mediaStorageKeys,
    containsAiContent,
    draftId,
    taskIdParam,
    scheduledAt,
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
    markDirty();
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
    markDirty();
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
        const payload: SavePostInput = {
          caption,
          hashtags,
          media,
          targetPlatforms,
          aiGenerated: containsAiContent,
        };
        const saved = await saveOrUpdateDraft(
          currentWorkspace.id,
          postId,
          payload,
        );
        postId = saved.id;
        setDraftId(saved.id);
      }
      await postService.submitForReview(currentWorkspace.id, postId);
      toast.success(t("editor.submitSuccess"));
      setDraftId(undefined);
      if (currentWorkspace) {
        navigate(`/workspaces/${currentWorkspace.id}/requests`);
      }
    } catch {
      toast.error(t("editor.submitError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublishNow = async () => {
    if (!caption.trim()) {
      toast.error(t("editor.submitEmptyError"));
      return;
    }
    if (targetPlatforms.length === 0) {
      toast.error(
        t(
          "editor.header.platformRequired",
          "Vui lòng chọn ít nhất 1 nền tảng mạng xã hội để đăng!",
        ),
      );
      return;
    }

    setIsSubmitting(true);
    try {
      if (!currentWorkspace) {
        throw new Error("Workspace is required");
      }
      let postId = draftId;
      const media = toPostMedia(mediaUrls, mediaStorageKeys);
      const payload: SavePostInput = {
        caption,
        hashtags,
        media,
        targetPlatforms,
        aiGenerated: containsAiContent,
      };
      const saved = await saveOrUpdateDraft(
        currentWorkspace.id,
        postId,
        payload,
      );
      postId = saved.id;
      setDraftId(saved.id);

      setPublishStatus("PUBLISHING");
      const publishRes = await postService.publishNow(
        currentWorkspace.id,
        postId,
      );
      toast.success(
        t("editor.header.publishing", "Đang xuất bản lên Facebook..."),
      );

      // Đã gửi lệnh xuất bản thành công - xóa draftId để những lần sửa tiếp theo tạo draft mới
      setDraftId(undefined);

      // Polling kiểm tra trạng thái bài viết hoặc nhận kết quả IN_PROGRESS
      const activePostId = postId;
      if (
        publishRes.status === "IN_PROGRESS" ||
        publishRes.status === "PUBLISHED"
      ) {
        setPublishStatus("PUBLISHED");
        toast.success(
          t(
            "editor.header.publishedSuccess",
            "Bài viết đã được tiếp nhận và xuất bản lên Facebook!",
          ),
        );
        return;
      }

      let attempts = 0;
      const pollTimer = setInterval(async () => {
        attempts++;
        if (attempts > 10 || !currentWorkspace) {
          clearInterval(pollTimer);
          setPublishStatus("PUBLISHED");
          return;
        }
        try {
          const updated = await postService.get(
            currentWorkspace.id,
            activePostId,
          );
          if (
            updated.status === "PUBLISHED" ||
            updated.status === "APPROVED" ||
            updated.status === "IN_PROGRESS"
          ) {
            setPublishStatus("PUBLISHED");
            toast.success(
              t(
                "editor.header.publishedSuccess",
                "Bài viết đã được tiếp nhận và xuất bản lên Facebook!",
              ),
            );
            clearInterval(pollTimer);
          } else if (
            updated.status === "REJECTED" ||
            updated.status === "FAILED"
          ) {
            setPublishStatus("FAILED");
            toast.error(
              t(
                "editor.header.publishFailed",
                "Đăng thất bại. Vui lòng kiểm tra nhật ký xuất bản!",
              ),
            );
            clearInterval(pollTimer);
          }
        } catch {
          // ignore transient poll error
        }
      }, 2000);
    } catch (err: unknown) {
      setPublishStatus("FAILED");
      const msg =
        err instanceof Error
          ? err.message
          : t("editor.header.publishFailed", "Đăng bài thất bại");
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    caption,
    hashtags,
    mediaUrls,
    targetPlatforms,
    setTargetPlatforms,
    toggleTargetPlatform,
    publishStatus,
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
    handleRepositoryMedia,
    handleApplyAIResult,
    handleApplyTemplate,
    handleSubmitForReview,
    handlePublishNow,
  };
}
