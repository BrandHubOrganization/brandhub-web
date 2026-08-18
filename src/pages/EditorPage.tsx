import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PageWrapper from '@/components/layout/PageWrapper';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { MediaDropzone } from '@/components/editor/MediaDropzone';
import { HashtagInputWithSuggestions } from '@/components/editor/HashtagInputWithSuggestions';
import { AIGeneratePanel } from '@/components/editor/AIGeneratePanel';
import { PlatformPreviewModal } from '@/components/preview/PlatformPreviewModal';
import { mockEditorService } from '@/services/mockEditorService';
import type { SocialPlatform } from '@/types/editor';
import { Eye, Send, Save, CheckCircle2, Clock } from 'lucide-react';
import { toast } from 'sonner';

export function EditorPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const locationState = location.state as { prefilledCaption?: string; templateTitle?: string } | null;

  // Editor Form States
  const [title, setTitle] = useState(locationState?.templateTitle || 'Nike Air Max Pulse — Mở bán đợt 1');
  const [caption, setCaption] = useState(
    locationState?.prefilledCaption ||
      'Đột phá phong cách với dòng Nike Air Max Pulse hoàn toàn mới! Với đệm khí Air cải tiến mang lại độ đàn hồi vượt trội, đây là sự kết hợp hoàn hảo giữa thời trang đường phố và hiệu năng vận hành.'
  );
  const [hashtags, setHashtags] = useState<string[]>([
    '#NikeAirMax',
    '#AirMaxPulse',
    '#Sneakerhead',
    '#BrandHub',
  ]);
  const [mediaUrls, setMediaUrls] = useState<string[]>([
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000&q=80',
  ]);
  const [targetPlatforms] = useState<SocialPlatform[]>(['FACEBOOK', 'INSTAGRAM', 'TIKTOK']);

  // Auto-Save & Sync States
  const [isDirty, setIsDirty] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string>(new Date().toLocaleTimeString('vi-VN'));
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Preview Modal State
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Sync state if coming from Content Library or Request list
  useEffect(() => {
    if (locationState?.prefilledCaption) {
      setCaption(locationState.prefilledCaption);
    }
    if (locationState?.templateTitle) {
      setTitle(locationState.templateTitle);
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
      const res = await mockEditorService.autoSaveDraft('post-99', {
        title,
        caption,
        hashtags,
        mediaUrls,
        targetPlatforms,
      });
      setLastSavedTime(new Date(res.updatedAt).toLocaleTimeString('vi-VN'));
      setIsDirty(false);
    } catch (err) {
      console.error('Auto-save error:', err);
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
  const handleApplyAIResult = (newCaption: string, newHashtags: string[], imageUrl?: string) => {
    setCaption(newCaption);
    if (newHashtags.length > 0) {
      // Merge unique hashtags
      const merged = Array.from(new Set([...hashtags, ...newHashtags]));
      setHashtags(merged);
    }
    if (imageUrl && !mediaUrls.includes(imageUrl)) {
      setMediaUrls((prev) => [...prev, imageUrl]);
    }
    setIsDirty(true);
  };

  // Submit for Review
  const handleSubmitForReview = async () => {
    if (!caption.trim()) {
      toast.error('Vui lòng soạn thảo nội dung caption trước khi gửi duyệt');
      return;
    }

    setIsSubmitting(true);
    try {
      await mockEditorService.submitForReview('post-99');
      toast.success('Đã gửi bài viết để phê duyệt thành công!');
      navigate('/requests');
    } catch (err) {
      toast.error('Lỗi khi gửi bài duyệt');
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
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 rounded-xl">
            {isSaving ? (
              <>
                <Clock className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                <span>Đang tự động lưu...</span>
              </>
            ) : isDirty ? (
              <>
                <Save className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-amber-600 dark:text-amber-400 font-medium">Chưa lưu nháp</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Đã lưu nháp lúc {lastSavedTime}</span>
              </>
            )}
          </div>

          {/* Platform Preview Button */}
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="px-3.5 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Eye className="w-4 h-4 text-indigo-500" />
            <span>Preview Post</span>
          </button>

          {/* Submit for Review Button */}
          <button
            type="button"
            onClick={handleSubmitForReview}
            disabled={isSubmitting}
            className="px-4 py-1.5 bg-[#f05a28] hover:bg-[#f05a28]/90 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Đang gửi...' : 'Gửi phê duyệt'}</span>
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Panel — Main Editor (2 Columns wide) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title Input */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-4 shadow-xs space-y-2">
            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Tiêu đề nội dung / Yêu cầu
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Nhập tiêu đề bài viết..."
              className="w-full text-lg font-bold bg-transparent border-b border-zinc-200 dark:border-zinc-800 pb-2 text-zinc-900 dark:text-zinc-100 outline-none focus:border-indigo-500 transition-colors"
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
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-3">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
              Hình ảnh & Video đính kèm
            </label>
            <MediaDropzone mediaUrls={mediaUrls} onChange={handleMediaUrlsChange} />
          </div>

          {/* Hashtag Input with Suggestions */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
            <HashtagInputWithSuggestions hashtags={hashtags} onChange={handleHashtagsChange} />
          </div>
        </div>

        {/* Right Panel — AI Co-Pilot & Generate Panel (1 Column wide) */}
        <div className="lg:col-span-1 sticky top-6">
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
          caption: `${caption}\n\n${hashtags.join(' ')}`,
          mediaUrls,
          targetPlatforms,
          authorName: 'BrandHub Creator',
        }}
      />
    </PageWrapper>
  );
}

export default EditorPage;
