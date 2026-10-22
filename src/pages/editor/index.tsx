import { AiHashtagSuggestions } from "@/pages/editor/components/AiHashtagSuggestions";
import {
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  useRef,
  useState,
  useEffect,
} from "react";
import { PanelRightOpen, Smartphone } from "lucide-react";
import { useTranslation } from "react-i18next";
import PageWrapper from "@/components/layout/PageWrapper";
import { Badge } from "@/components/ui/badge";
import { AiContentPopover } from "@/pages/editor/components/AiContentPopover";
import { EditorHeaderActions } from "@/pages/editor/components/EditorHeaderActions";
import { HashtagInputWithSuggestions } from "@/pages/editor/components/HashtagInputWithSuggestions";
import { MediaDropzone } from "@/pages/editor/components/MediaDropzone";
import { PlatformPreviewModal } from "@/pages/editor/components/PlatformPreviewModal";
import { RichTextEditor } from "@/pages/editor/components/RichTextEditor";
import { StudioPreviewPanel } from "@/pages/editor/components/StudioPreviewPanel";
import { TemplatePickerModal } from "@/pages/editor/components/TemplatePickerModal";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useAuthStore } from "@/store/authStore";
import { useParams, Link } from "react-router-dom";
import { AlertTriangle, CheckCircle, ExternalLink } from "lucide-react";
import { fetchSocialAccounts } from "@/pages/social-accounts/services/socialAccountService";
import { useEditorForm } from "./hooks/useEditorForm";
import {
  useTaskEditorForm,
  type TaskEditorState,
} from "@/pages/editor/hooks/useTaskEditorForm";
import {
  TaskEditorActions,
  TaskEditorNotice,
} from "@/pages/editor/components/TaskEditorControls";
import { useSearchParams } from "react-router-dom";

type EditorForm = Omit<
  ReturnType<typeof useEditorForm>,
  "handlePublishNow"
> & {
  handlePublishNow?: () => void;
  scheduledAt?: string | null;
  taskEditor?: TaskEditorState;
};

/**
 * Content Creator workspace based on the approved Figma UI in Uibrandhubs.
 * The editor uses BrandHub components and persists drafts through the Business
 * Service while AI generation is proxied to brandhub-ai-service.
 */
function EditorWorkspace({
  form,
  taskId,
}: {
  form: EditorForm;
  taskId?: string;
}) {
  const { t } = useTranslation();
  const { id: routeWorkspaceId } = useParams<{ id: string }>();
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
  const userId = useAuthStore((state) => state.user?.id);
  const role = currentWorkspace?.myRole;
  const workspaceId = routeWorkspaceId ?? currentWorkspace?.id;
  const isClient = currentWorkspace?.myRole === "CLIENT";

  const [socialConnection, setSocialConnection] = useState<{
    workspaceId: string;
    platforms: string[];
    error: boolean;
  } | null>(null);
  const hasLoadedSocial =
    socialConnection?.workspaceId === workspaceId && !socialConnection?.error;
  const socialStatusError =
    socialConnection?.workspaceId === workspaceId && socialConnection?.error;
  const connectedPlatforms = hasLoadedSocial
    ? (socialConnection?.platforms ?? [])
    : [];
  const [isPreviewPanelOpen, setIsPreviewPanelOpen] = useState(true);
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
    handleHashtagsChange,
    handleMediaUrlsChange,
    handleGeneratedMedia,
    handleApplyAIResult,
    handleApplyTemplate,
    handleSubmitForReview,
    handlePublishNow,
    scheduledAt,
    taskEditor,
  } = form;

  const handleApplyGeneratedImage = (imageUrl: string, s3Key?: string) => {
    handleGeneratedMedia(imageUrl, s3Key, "IMAGE");
  };

  const handleApplyGeneratedVideo = (videoUrl: string, s3Key?: string) => {
    handleGeneratedMedia(videoUrl, s3Key, "VIDEO");
  };

  // Fetch danh sách social accounts đã kết nối trong workspace để kiểm tra
  useEffect(() => {
    if (!workspaceId) return;
    let cancelled = false;
    fetchSocialAccounts(workspaceId)
      .then((accs) => {
        if (cancelled) return;
        const active = accs
          .filter((a) => a.status === "CONNECTED")
          .map((a) => a.platform.toUpperCase());
        setSocialConnection({ workspaceId, platforms: active, error: false });
      })
      .catch(() => {
        if (!cancelled)
          setSocialConnection({ workspaceId, platforms: [], error: true });
      });
    return () => {
      cancelled = true;
    };
  }, [workspaceId]);

  const unlinkedPlatforms = targetPlatforms.filter(
    (p) => !connectedPlatforms.includes(p),
  );

  const workspaceStyle = {
    "--editor-preview-width": isPreviewPanelOpen
      ? `${previewPanelWidth}px`
      : "44px",
  } as CSSProperties;

  const startPreviewResize = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (window.innerWidth < 1024 || !workspaceRef.current) return;
    event.preventDefault();
    const bounds = workspaceRef.current.getBoundingClientRect();
    const previousCursor = document.body.style.cursor;
    const previousSelection = document.body.style.userSelect;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const handlePointerMove = (pointerEvent: PointerEvent) => {
      const maxWidth = Math.max(260, Math.min(520, bounds.width - 392));
      setPreviewPanelWidth(
        Math.min(maxWidth, Math.max(260, bounds.right - pointerEvent.clientX)),
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
      actions={
        taskEditor ? null : (
          <EditorHeaderActions
            isSaving={isSaving}
            isDirty={isDirty}
            lastSavedTime={lastSavedTime}
            isSubmitting={isSubmitting}
            publishStatus={publishStatus}
            scheduledTime={scheduledAt ?? undefined}
            onOpenTemplatePicker={() => setIsTemplatePickerOpen(true)}
            onOpenPreview={() => setIsPreviewOpen(true)}
            onSubmitForReview={handleSubmitForReview}
            onPublishNow={handlePublishNow}
          />
        )
      }
    >
      {taskEditor && (
        <div className="mb-4 flex min-w-0 justify-end">
          <TaskEditorActions
            task={taskEditor}
            isSaving={isSaving}
            isDirty={isDirty}
            isSubmitting={isSubmitting}
            onPreview={() => setIsPreviewOpen(true)}
            onTemplate={() => setIsTemplatePickerOpen(true)}
            onSubmit={handleSubmitForReview}
          />
        </div>
      )}
      {taskEditor && workspaceId && taskId && (
        <TaskEditorNotice
          task={taskEditor}
          isDirty={isDirty}
          busy={isSaving || isSubmitting}
          workspaceId={workspaceId}
          taskId={taskId}
        />
      )}
      <div
        ref={workspaceRef}
        style={workspaceStyle}
        className="grid items-start gap-4 lg:grid-cols-[minmax(360px,1fr)_var(--editor-preview-width)]"
      >
        <main className="min-w-0">
          <section className="border-border bg-card relative rounded-xl border shadow-2xs">
            <div className="border-border bg-muted/30 border-b p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-muted-foreground text-2xs font-semibold tracking-wider uppercase">
                  Nội dung bài đăng
                </span>
                <div className="ml-auto flex flex-wrap items-center gap-2">
                  <AiContentPopover
                    disabled={taskEditor?.isReadOnly}
                    topic={caption.slice(0, 180)}
                    targetPlatforms={targetPlatforms}
                    referenceMediaUrls={mediaUrls}
                    onApplyText={handleApplyAIResult}
                    onApplyImage={handleApplyGeneratedImage}
                    onApplyVideo={handleApplyGeneratedVideo}
                  />
                  <Badge variant="secondary" className="text-2xs font-medium">
                    {t("editor.studio.autosaveLabel")}
                  </Badge>
                </div>
              </div>
              <p className="text-muted-foreground mt-2 text-xs">
                {t("editor.page.postTypeHint.IMAGE")}
              </p>
            </div>

            <div className="space-y-4 p-4 md:p-5">
              {socialStatusError && (
                <p role="alert" className="text-destructive text-xs">
                  {t("editor.socialStatusError")}
                </p>
              )}
              {hasLoadedSocial && unlinkedPlatforms.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-900 dark:text-amber-200">
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
                      className="flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/20 px-3 py-1 font-medium text-amber-900 transition-colors hover:bg-amber-500/30 dark:text-amber-100"
                    >
                      <span>Kết nối ngay</span>
                      <ExternalLink className="size-3" />
                    </Link>
                  )}
                </div>
              )}

              {hasLoadedSocial && unlinkedPlatforms.length === 0 && (
                <div className="text-2xs flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3.5 py-2 text-emerald-800 dark:text-emerald-300">
                  <CheckCircle className="size-3.5 shrink-0 text-emerald-500" />
                  <span>
                    Tất cả các nền tảng ({connectedPlatforms.join(", ")}) đã sẵn
                    sàng để xuất bản.
                  </span>
                </div>
              )}

              {/* Nền tảng mục tiêu xuất bản */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-muted-foreground mr-1 text-xs font-medium">
                  Đăng lên:
                </span>
                {(["FACEBOOK", "INSTAGRAM", "TIKTOK", "THREADS"] as const).map(
                  (platform) => {
                    const isSelected = targetPlatforms.includes(platform);
                    const isConnected = connectedPlatforms.includes(platform);
                    return (
                      <button
                        key={platform}
                        type="button"
                        disabled={taskEditor?.isReadOnly}
                        onClick={() => toggleTargetPlatform(platform)}
                        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                          isSelected
                            ? "bg-brand-orange text-white shadow-xs"
                            : "border-border bg-card text-muted-foreground hover:bg-muted border"
                        }`}
                      >
                        <span
                          className={`size-2 rounded-full ${
                            isConnected
                              ? "bg-emerald-400"
                              : "bg-zinc-400 opacity-60"
                          }`}
                          title={
                            !hasLoadedSocial
                              ? t("editor.socialStatusUnknown")
                              : isConnected
                                ? "Đã liên kết"
                                : "Chưa liên kết"
                          }
                        />
                        <span>{platform}</span>
                        {isConnected && (
                          <span className="text-2xs opacity-80">
                            (Sẵn sàng)
                          </span>
                        )}
                      </button>
                    );
                  },
                )}
              </div>

              <RichTextEditor
                value={caption}
                onChange={handleCaptionChange}
                targetPlatforms={targetPlatforms}
                readOnly={taskEditor?.isReadOnly}
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
                <div inert={taskEditor?.isReadOnly}>
                  <MediaDropzone
                    mediaUrls={mediaUrls}
                    onChange={handleMediaUrlsChange}
                    workspaceId={workspaceId}
                  />
                </div>
              </section>

              <section className="border-border relative z-10 rounded-xl border p-3">
                <HashtagInputWithSuggestions
                  hashtags={hashtags}
                  onChange={handleHashtagsChange}
                  workspaceId={workspaceId}
                  userId={userId}
                  canApply={role === "CREATOR"}
                />
                <AiHashtagSuggestions
                  caption={caption}
                  platform={targetPlatforms[0]}
                  workspaceId={workspaceId}
                  userId={userId}
                  hashtags={hashtags}
                  onChange={handleHashtagsChange}
                />
              </section>
            </div>
          </section>
        </main>

        <aside className="relative min-w-0 lg:sticky lg:top-0 lg:max-h-[calc(100dvh-4.5rem)]">
          {isPreviewPanelOpen ? (
            <>
              <button
                type="button"
                aria-label="Điều chỉnh chiều rộng Live Preview"
                onPointerDown={startPreviewResize}
                className="group absolute top-0 -left-3 z-40 hidden h-full w-2 cursor-col-resize items-center justify-center lg:flex"
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
              className="border-border bg-card text-muted-foreground hover:border-brand-orange/40 hover:text-brand-orange flex h-11 w-full items-center justify-center gap-2 rounded-xl border shadow-2xs transition-colors lg:h-40 lg:flex-col"
            >
              <Smartphone className="size-4" />
              <PanelRightOpen className="size-4" />
              <span className="text-2xs font-semibold lg:[writing-mode:vertical-rl]">
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

function StandaloneEditor() {
  const form = useEditorForm();
  return <EditorWorkspace form={form} />;
}

function LinkedTaskEditor({
  workspaceId,
  taskId,
}: {
  workspaceId: string;
  taskId: string;
}) {
  const form = useTaskEditorForm(workspaceId, taskId);
  return <EditorWorkspace form={form} taskId={taskId} />;
}

export function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
  const [params] = useSearchParams();
  const workspaceId = id ?? currentWorkspace?.id;
  const taskId = params.get("taskId");
  if (taskId)
    return workspaceId ? (
      <LinkedTaskEditor
        key={`${workspaceId}:${taskId}`}
        workspaceId={workspaceId}
        taskId={taskId}
      />
    ) : null;
  return <StandaloneEditor key={workspaceId} />;
}

export default EditorPage;
