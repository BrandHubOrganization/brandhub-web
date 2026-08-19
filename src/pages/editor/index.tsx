import PageWrapper from "@/components/layout/PageWrapper";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/pages/editor/components/RichTextEditor";
import { MediaDropzone } from "@/pages/editor/components/MediaDropzone";
import { HashtagInputWithSuggestions } from "@/pages/editor/components/HashtagInputWithSuggestions";
import { AIGeneratePanel } from "@/pages/editor/components/AIGeneratePanel";
import { PlatformPreviewModal } from "@/pages/editor/components/PlatformPreviewModal";
import { TemplatePickerModal } from "@/pages/editor/components/TemplatePickerModal";
import { useEditorForm } from "./hooks/useEditorForm";
import { EditorHeaderActions } from "./components/EditorHeaderActions";

export function EditorPage() {
  const {
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
  } = useEditorForm();

  return (
    <PageWrapper
      title="Content Editor"
      description="Biên tập bài viết đa nền tảng kết hợp Trợ lý AI Co-Pilot."
      actions={
        <EditorHeaderActions
          isSaving={isSaving}
          isDirty={isDirty}
          lastSavedTime={lastSavedTime}
          isSubmitting={isSubmitting}
          onOpenTemplatePicker={() => setIsTemplatePickerOpen(true)}
          onOpenPreview={() => setIsPreviewOpen(true)}
          onSubmitForReview={handleSubmitForReview}
        />
      }
    >
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="space-y-2 rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <label className="text-xs font-semibold tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
              Tiêu đề nội dung / Yêu cầu
            </label>
            <Input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Nhập tiêu đề bài viết..."
              className="h-auto rounded-none border-x-0 border-t-0 border-b border-zinc-200 bg-transparent px-0 pb-2 text-lg font-bold text-zinc-900 shadow-none focus-visible:ring-0 dark:border-zinc-800 dark:text-zinc-100"
            />
          </div>

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

          <div className="space-y-3 rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Hình ảnh & Video đính kèm
            </label>
            <MediaDropzone
              mediaUrls={mediaUrls}
              onChange={handleMediaUrlsChange}
            />
          </div>

          <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <HashtagInputWithSuggestions
              hashtags={hashtags}
              onChange={handleHashtagsChange}
            />
          </div>
        </div>

        <div className="sticky top-6 lg:col-span-1">
          <AIGeneratePanel
            topic={title}
            targetPlatforms={targetPlatforms}
            onApplyAIResult={handleApplyAIResult}
          />
        </div>
      </div>

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

      <TemplatePickerModal
        isOpen={isTemplatePickerOpen}
        onClose={() => setIsTemplatePickerOpen(false)}
        onSelectTemplate={handleApplyTemplate}
      />
    </PageWrapper>
  );
}

export default EditorPage;
