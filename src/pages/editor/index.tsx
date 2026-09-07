import { useState } from "react";
import { useTranslation } from "react-i18next";
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

type PostType = "TEXT" | "IMAGE" | "VIDEO" | "CAROUSEL";

const POST_TYPES: PostType[] = ["TEXT", "IMAGE", "VIDEO", "CAROUSEL"];

export function EditorPage() {
  const { t } = useTranslation();
  const [postType, setPostType] = useState<PostType>("IMAGE");
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
      title={t("editor.page.title")}
      description={t("editor.page.description")}
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
      <div className="border-border bg-card space-y-3 rounded-xl border p-5 shadow-xs">
        <label className="text-muted-foreground block text-xs font-semibold">
          {t("editor.page.postTypeLabel")}
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {POST_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setPostType(type)}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                postType === type
                  ? "border-brand-orange text-brand-orange bg-brand-orange-soft"
                  : "bg-muted text-foreground hover:opacity-80"
              }`}
            >
              {t(`editor.page.postType.${type}`)}
            </button>
          ))}
        </div>
        <p className="text-muted-foreground text-xs">
          {t(`editor.page.postTypeHint.${postType}`)}
        </p>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="border-border bg-card space-y-2 rounded-xl border p-4 shadow-xs">
            <label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              {t("editor.page.titleLabel")}
            </label>
            <Input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder={t("editor.page.titlePlaceholder")}
              className="border-border text-foreground h-auto rounded-none border-x-0 border-t-0 border-b bg-transparent px-0 pb-2 text-lg font-bold shadow-none focus-visible:ring-0"
            />
          </div>

          <div className="space-y-2">
            <label className="text-muted-foreground text-xs font-semibold">
              {t("editor.page.captionLabel")}
            </label>
            <RichTextEditor
              value={caption}
              onChange={handleCaptionChange}
              targetPlatforms={targetPlatforms}
            />
          </div>

          <div className="border-border bg-card space-y-3 rounded-xl border p-5 shadow-xs">
            <label className="text-muted-foreground block text-xs font-semibold">
              {t("editor.page.mediaLabel")}
            </label>
            <MediaDropzone
              mediaUrls={mediaUrls}
              onChange={handleMediaUrlsChange}
            />
          </div>

          <div className="border-border bg-card rounded-xl border p-5 shadow-xs">
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
