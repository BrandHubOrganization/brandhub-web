import {
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  useRef,
  useState,
  useEffect,
} from "react";
import {
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightOpen,
  Sparkles,
  Smartphone,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import PageWrapper from "@/components/layout/PageWrapper";
import { Badge } from "@/components/ui/badge";
import { ContentCreatorAiPanel } from "@/pages/editor/components/ContentCreatorAiPanel";
import { EditorHeaderActions } from "@/pages/editor/components/EditorHeaderActions";
// import { HashtagInputWithSuggestions } from "@/pages/editor/components/HashtagInputWithSuggestions";
import { MediaDropzone } from "@/pages/editor/components/MediaDropzone";
import { PlatformPreviewModal } from "@/pages/editor/components/PlatformPreviewModal";
import { RichTextEditor } from "@/pages/editor/components/RichTextEditor";
import { StudioPreviewPanel } from "@/pages/editor/components/StudioPreviewPanel";
import { TemplatePickerModal } from "@/pages/editor/components/TemplatePickerModal";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useParams, Link } from "react-router-dom";
import { AlertTriangle, CheckCircle, ExternalLink } from "lucide-react";
import { fetchSocialAccounts } from "@/pages/social-accounts/services/socialAccountService";
import { useEditorForm } from "./hooks/useEditorForm";

/**
 * Content Creator workspace based on the approved Figma UI in Uibrandhubs.
 * The editor uses BrandHub components and persists drafts through the Business
 * Service while AI generation is proxied to brandhub-ai-service.
 */
export function EditorPage() {
  const { t } = useTranslation();
  const { id: routeWorkspaceId } = useParams<{ id: string }>();
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
  const workspaceId = routeWorkspaceId ?? currentWorkspace?.id;
  const isClient = currentWorkspace?.myRole === "CLIENT";

  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);
  const [hasLoadedSocial, setHasLoadedSocial] = useState(false);
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(true);
  const [isPreviewPanelOpen, setIsPreviewPanelOpen] = useState(true);
  const [aiPanelWidth, setAiPanelWidth] = useState(280);
  const [previewPanelWidth, setPreviewPanelWidth] = useState(300);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const {
    caption,
    hashtags,
    mediaUrls,
    targetPlatforms,
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
    // handleHashtagsChange,
    handleMediaUrlsChange,
    handleGeneratedMedia,
    handleApplyAIResult,
    handleApplyTemplate,
    handleSubmitForReview,
    handlePublishNow,
  } = useEditorForm();

  const handleApplyGeneratedImage = (imageUrl: string, s3Key?: string) => {
    handleGeneratedMedia(imageUrl, s3Key, "IMAGE");
  };

  const handleApplyGeneratedVideo = (videoUrl: string, s3Key?: string) => {
    handleGeneratedMedia(videoUrl, s3Key, "VIDEO");
  };

  // Fetch danh sách social accounts đã kết nối trong workspace để kiểm tra
  useEffect(() => {
    if (!workspaceId) return;
    fetchSocialAccounts(workspaceId)
      .then((accs) => {
        const active = accs
          .filter((a) => a.status === "CONNECTED")
          .map((a) => a.platform.toUpperCase());
        setConnectedPlatforms(active);
        setHasLoadedSocial(true);
      })
      .catch(() => {
        setHasLoadedSocial(true);
      });
  }, [workspaceId]);

  const unlinkedPlatforms = targetPlatforms.filter(
    (p) => !connectedPlatforms.includes(p),
  );

  const workspaceStyle = {
    "--editor-ai-width": isAiPanelOpen ? `${aiPanelWidth}px` : "44px",
    "--editor-preview-width": isPreviewPanelOpen
      ? `${previewPanelWidth}px`
      : "44px",
  } as CSSProperties;

  const startPanelResize =
    (panel: "ai" | "preview") =>
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      if (window.innerWidth < 1280 || !workspaceRef.current) return;
      event.preventDefault();
      const bounds = workspaceRef.current.getBoundingClientRect();
      const previousCursor = document.body.style.cursor;
      const previousSelection = document.body.style.userSelect;
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";

      const handlePointerMove = (pointerEvent: PointerEvent) => {
        if (panel === "ai") {
          const maxWidth = Math.max(
            240,
            Math.min(
              520,
              bounds.width - (isPreviewPanelOpen ? previewPanelWidth : 0) - 392,
            ),
          );
          setAiPanelWidth(
            Math.min(
              maxWidth,
              Math.max(240, pointerEvent.clientX - bounds.left),
            ),
          );
          return;
        }

        const maxWidth = Math.max(
          260,
          Math.min(
            520,
            bounds.width - (isAiPanelOpen ? aiPanelWidth : 0) - 392,
          ),
        );
        setPreviewPanelWidth(
          Math.min(
            maxWidth,
            Math.max(260, bounds.right - pointerEvent.clientX),
          ),
        );
      };

      const stopResizing = () => {
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", stopResizing);
        document.body.style.cursor = previousCursor;
        document.body.style.userSelect = previousSelection;
      };

      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", stopResizing);
    };

  return (
    <PageWrapper
      title={t("editor.page.title")}
      description={t("editor.page.description")}
      className="max-w-[1800px]"
      compact
      actions={
        <EditorHeaderActions
          isSaving={isSaving}
          isDirty={isDirty}
          lastSavedTime={lastSavedTime}
          isSubmitting={isSubmitting}
          publishStatus={publishStatus}
          onOpenTemplatePicker={() => setIsTemplatePickerOpen(true)}
          onOpenPreview={() => setIsPreviewOpen(true)}
          onSubmitForReview={handleSubmitForReview}
          onPublishNow={handlePublishNow}
        />
      }
    >
      <div
        ref={workspaceRef}
        style={workspaceStyle}
        className="grid items-start gap-4 xl:grid-cols-[var(--editor-ai-width)_minmax(360px,1fr)_var(--editor-preview-width)]"
      >
        <aside className="relative order-2 min-w-0 xl:sticky xl:top-0 xl:order-1 xl:max-h-[calc(100dvh-4.5rem)]">
          {isAiPanelOpen ? (
            <section className="border-border bg-card overflow-hidden rounded-xl border shadow-2xs">
              <div className="border-border bg-muted/40 flex items-center justify-between gap-2 border-b px-3 py-3">
                <div className="flex min-w-0 items-center gap-2">
                  <div className="bg-brand-orange-soft text-brand-orange rounded-lg p-1.5">
                    <Sparkles className="size-4" />
                  </div>
                  <h2 className="text-foreground truncate text-xs font-semibold tracking-wide uppercase">
                    AI Generation Panel
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAiPanelOpen(false)}
                  aria-label="Thu gọn AI Generation Panel"
                  title="Thu gọn AI Generation Panel"
                  className="text-muted-foreground hover:bg-muted hover:text-foreground flex size-8 shrink-0 items-center justify-center rounded-md transition-colors"
                >
                  <PanelLeftClose className="size-4" />
                </button>
              </div>
              <div className="max-h-[calc(100dvh-8.5rem)] overflow-y-auto p-3">
                <ContentCreatorAiPanel
                  topic={caption.slice(0, 180)}
                  targetPlatforms={targetPlatforms}
                  referenceMediaUrls={mediaUrls}
                  onApplyText={handleApplyAIResult}
                  onApplyImage={handleApplyGeneratedImage}
                  onApplyVideo={handleApplyGeneratedVideo}
                />
              </div>
            </section>
          ) : (
            <button
              type="button"
              onClick={() => setIsAiPanelOpen(true)}
              aria-label="Mở AI Generation Panel"
              title="Mở AI Generation Panel"
              className="border-border bg-card text-muted-foreground hover:border-brand-orange/40 hover:text-brand-orange flex h-11 w-full items-center justify-center gap-2 rounded-xl border shadow-2xs transition-colors xl:h-40 xl:flex-col"
            >
              <PanelLeftOpen className="size-4" />
              <Sparkles className="size-4" />
              <span className="text-2xs font-semibold xl:[writing-mode:vertical-rl]">
                AI Panel
              </span>
            </button>
          )}
          {isAiPanelOpen && (
            <button
              type="button"
              aria-label="Điều chỉnh chiều rộng AI Panel"
              onPointerDown={startPanelResize("ai")}
              className="group absolute top-0 -right-3 z-40 hidden h-full w-2 cursor-col-resize items-center justify-center xl:flex"
            >
              <span className="bg-border group-hover:bg-brand-orange h-16 w-1 rounded-full transition-colors" />
            </button>
          )}
        </aside>

        <main className="order-1 min-w-0 xl:order-2">
          <section className="border-border bg-card relative rounded-xl border shadow-2xs">
            <div className="border-border bg-muted/30 border-b p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-muted-foreground text-2xs font-semibold tracking-wider uppercase">
                  Nội dung bài đăng
                </span>
                <Badge variant="secondary" className="text-2xs font-medium">
                  Lưu nháp tự động
                </Badge>
              </div>
              <p className="text-muted-foreground mt-2 text-xs">
                {t("editor.page.postTypeHint.IMAGE")}
              </p>
            </div>

            <div className="space-y-4 p-4 md:p-5">
              {hasLoadedSocial && unlinkedPlatforms.length > 0 && (
                <div className="border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200 flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3.5 text-xs">
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                    <span>
                      Chưa kết nối tài khoản cho các nền tảng:{" "}
                      <strong className="font-semibold text-amber-700 dark:text-amber-300">
                        {unlinkedPlatforms.join(", ")}
                      </strong>
                      .{" "}
                      {isClient
                        ? "Vui lòng kết nối tài khoản mạng xã hội để bài đăng có thể tự động xuất bản."
                        : "Vui lòng nhắc Client của Workspace kết nối tài khoản mạng xã hội để có thể xuất bản."}
                    </span>
                  </div>
                  {isClient && workspaceId && (
                    <Link
                      to={`/workspaces/${workspaceId}/social-accounts`}
                      className="border-amber-500/40 bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 dark:text-amber-100 flex items-center gap-1.5 rounded-lg border px-3 py-1 font-medium transition-colors"
                    >
                      <span>Kết nối ngay</span>
                      <ExternalLink className="size-3" />
                    </Link>
                  )}
                </div>
              )}

              {hasLoadedSocial && unlinkedPlatforms.length === 0 && (
                <div className="border-emerald-500/20 bg-emerald-500/5 text-emerald-800 dark:text-emerald-300 flex items-center gap-2 rounded-xl border px-3.5 py-2 text-2xs">
                  <CheckCircle className="size-3.5 shrink-0 text-emerald-500" />
                  <span>
                    Tất cả các nền tảng ({connectedPlatforms.join(", ")}) đã sẵn sàng để xuất bản.
                  </span>
                </div>
              )}

              {/* Nền tảng mục tiêu xuất bản */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-muted-foreground text-xs font-medium mr-1">
                  Đăng lên:
                </span>
                {(["FACEBOOK", "INSTAGRAM", "TIKTOK", "THREADS"] as const).map((platform) => {
                  const isSelected = targetPlatforms.includes(platform);
                  const isConnected = connectedPlatforms.includes(platform);
                  return (
                    <button
                      key={platform}
                      type="button"
                      onClick={() => toggleTargetPlatform(platform)}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                        isSelected
                          ? "bg-brand-orange text-white shadow-xs"
                          : "border-border bg-card text-muted-foreground hover:bg-muted border"
                      }`}
                    >
                      <span
                        className={`size-2 rounded-full ${
                          isConnected ? "bg-emerald-400" : "bg-zinc-400 opacity-60"
                        }`}
                        title={isConnected ? "Đã liên kết" : "Chưa liên kết"}
                      />
                      <span>{platform}</span>
                      {isConnected && (
                        <span className="text-2xs opacity-80">(Sẵn sàng)</span>
                      )}
                    </button>
                  );
                })}
              </div>

              <RichTextEditor
                value={caption}
                onChange={handleCaptionChange}
                targetPlatforms={targetPlatforms}
              />

              <section className="border-border bg-muted/20 space-y-3 rounded-xl border p-3">
                <div>
                  <h2 className="text-foreground text-xs font-semibold">
                    Tài nguyên bài đăng
                  </h2>
                  <p className="text-muted-foreground text-2xs mt-0.5">
                    Ảnh được chọn sẽ trở thành reference cho AI và phần mô
                    phỏng.
                  </p>
                </div>
                <MediaDropzone
                  mediaUrls={mediaUrls}
                  onChange={handleMediaUrlsChange}
                />
              </section>

              {/* <section className="border-border relative z-10 rounded-xl border p-3">
                <HashtagInputWithSuggestions
                  hashtags={hashtags}
                  onChange={handleHashtagsChange}
                  workspaceId={workspaceId}
                  userId={userId}
                  canApply={role === "CREATOR"}
                />
              </section> */}
            </div>
          </section>
        </main>

        <aside className="relative order-3 min-w-0 xl:sticky xl:top-0 xl:max-h-[calc(100dvh-4.5rem)]">
          {isPreviewPanelOpen ? (
            <>
              <button
                type="button"
                aria-label="Điều chỉnh chiều rộng Live Preview"
                onPointerDown={startPanelResize("preview")}
                className="group absolute top-0 -left-3 z-40 hidden h-full w-2 cursor-col-resize items-center justify-center xl:flex"
              >
                <span className="bg-border group-hover:bg-brand-orange h-16 w-1 rounded-full transition-colors" />
              </button>
              <StudioPreviewPanel
                title={caption.slice(0, 60)}
                caption={caption}
                hashtags={hashtags}
                mediaUrls={mediaUrls}
                targetPlatforms={targetPlatforms}
                onCollapse={() => setIsPreviewPanelOpen(false)}
              />
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsPreviewPanelOpen(true)}
              aria-label="Mở Live Preview"
              title="Mở Live Preview"
              className="border-border bg-card text-muted-foreground hover:border-brand-orange/40 hover:text-brand-orange flex h-11 w-full items-center justify-center gap-2 rounded-xl border shadow-2xs transition-colors xl:h-40 xl:flex-col"
            >
              <Smartphone className="size-4" />
              <PanelRightOpen className="size-4" />
              <span className="text-2xs font-semibold xl:[writing-mode:vertical-rl]">
                Live Preview
              </span>
            </button>
          )}
        </aside>
      </div>

      <PlatformPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        data={{
          title: caption.slice(0, 60),
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
