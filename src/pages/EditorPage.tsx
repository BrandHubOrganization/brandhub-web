import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PageWrapper from "@/components/layout/PageWrapper";
import { RichTextEditor } from "@/components/editor/RichTextEditor";
import { MediaDropzone } from "@/components/editor/MediaDropzone";
import { HashtagInputWithSuggestions } from "@/components/editor/HashtagInputWithSuggestions";
import { AIGeneratePanel } from "@/components/editor/AIGeneratePanel";
import { PlatformPreviewModal } from "@/components/preview/PlatformPreviewModal";
import { TemplatePickerModal } from "@/components/editor/TemplatePickerModal";
import { mockEditorService } from "@/services/mockEditorService";
import type { SocialPlatform } from "@/types/editor";
import type { ContentTemplate } from "@/types/template";
import { Eye, Send, Save, CheckCircle2, Clock, LayoutTemplate } from "lucide-react";
import { toast } from "sonner";

export function EditorPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const locationState = location.state as {
    prefilledCaption?: string;
    templateTitle?: string;
    prefilledHashtags?: string[];
    prefilledMediaUrls?: string[];
  } | null;

  // Editor Form States
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
  ]);

  // Auto-Save & Sync States
  const [isDirty, setIsDirty] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string>(
    new Date().toLocaleTimeString("vi-VN"),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modals States
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isTemplatePickerOpen, setIsTemplatePickerOpen] = useState(false);

  // Sync state if coming from Content Library, Request list, or Template Browser
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

  // Mark dirty on changes
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

  // Auto-save draft every 30 seconds
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
    }, 30000); // 30 seconds auto save

    return () => clearInterval(timer);
  }, [saveDraft]);

  // AI Auto-Populate Action
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

  // Apply Template Action
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

  // Submit for Review
  const handleSubmitForReview = async () => {
    if (!caption.trim()) {
      toast.error("Vui lòng soạn thảo nội dung caption trước khi gửi duyệt");
      return;
    }

    setIsSubmitting(true);
    try {
      await mockEditorService.submitForReview("post-99");
      toast.success("Đã gửi bài viết để phê duyệt thành công!");
      navigate("/requests");
    } catch (err) {
      toast.error("Lỗi khi gửi bài duyệt");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageWrapper
      title="Content Editor"
      description="Biên tập bài viết đa nền tảng kết hợp Trợ lý AI Co-Pilot."
      actions={
        <div className="flex items-center gap-3">
          {/* Auto-Save Status Indicator */}
          <div className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
            {isSaving ? (
              <>
                <Clock className="h-3.5 w-3.5 animate-spin text-amber-500" />
                <span>Đang tự động lưu...</span>
              </>
            ) : isDirty ? (
              <>
                <Save className="h-3.5 w-3.5 text-amber-500" />
                <span className="font-medium text-amber-600 dark:text-amber-400">
                  Chưa lưu nháp
                </span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Đã lưu nháp lúc {lastSavedTime}</span>
              </>
            )}
          </div>

          {/* Template Picker Button */}
          <button
            type="button"
            onClick={() => setIsTemplatePickerOpen(true)}
            className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3.5 py-1.5 text-xs font-medium text-zinc-700 shadow-2xs transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
          >
            <LayoutTemplate className="h-4 w-4 text-brand-orange" />
            <span>Mẫu Bài Đăng</span>
          </button>

          {/* Platform Preview Button */}
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3.5 py-1.5 text-xs font-medium text-zinc-700 shadow-2xs transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
          >
            <Eye className="h-4 w-4 text-brand-orange" />
            <span>Preview Post</span>
          </button>

          {/* Submit for Review Button */}
          <button
            type="button"
            onClick={handleSubmitForReview}
            disabled={isSubmitting}
            className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#f05a28] px-4 py-1.5 text-xs font-medium text-white shadow-xs transition-colors hover:bg-[#f05a28]/90 disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" />
            <span>{isSubmitting ? "Đang gửi..." : "Gửi phê duyệt"}</span>
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        {/* Left Panel — Main Editor (2 Columns wide) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Title Input */}
          <div className="space-y-2 rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <label className="text-xs font-semibold tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
              Tiêu đề nội dung / Yêu cầu
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Nhập tiêu đề bài viết..."
              className="focus:border-brand-orange w-full border-b border-zinc-200 bg-transparent pb-2 text-lg font-bold text-zinc-900 transition-colors outline-none dark:border-zinc-800 dark:text-zinc-100"
            />
          </div>

          {/* Rich Text Editor (@tiptap/react) */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Nội dung Caption chính
            </label>
            <RichTextEditor
              value={caption}
              onChange={handleCaptionChange}
              targetPlatforms={targetPlatforms}
            />
          </div>

          {/* Media Dropzone (Drag & Drop + Progress Bar) */}
          <div className="space-y-3 rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Hình ảnh & Video đính kèm
            </label>
            <MediaDropzone
              mediaUrls={mediaUrls}
              onChange={handleMediaUrlsChange}
            />
          </div>

          {/* Hashtag Input with Suggestions */}
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <HashtagInputWithSuggestions
              hashtags={hashtags}
              onChange={handleHashtagsChange}
            />
          </div>
        </div>

        {/* Right Panel — AI Co-Pilot & Generate Panel (1 Column wide) */}
        <div className="sticky top-6 lg:col-span-1">
          <AIGeneratePanel
            topic={title}
            targetPlatforms={targetPlatforms}
            onApplyAIResult={handleApplyAIResult}
          />
        </div>
      </div>

      {/* Platform Preview Modal */}
      <PlatformPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        data={{
          title,
          caption: `${caption}\n\n${hashtags.join(" ")}`,
          mediaUrls,
          targetPlatforms,
          authorName: "BrandHub Creator",
        }}
      />

      {/* Template Picker Modal */}
      <TemplatePickerModal
        isOpen={isTemplatePickerOpen}
        onClose={() => setIsTemplatePickerOpen(false)}
        onSelectTemplate={handleApplyTemplate}
      />
    </PageWrapper>
  );
}

export default EditorPage;
