import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ImagePlus,
  X,
  Eye,
  EyeOff,
  Copy,
  Check,
  Sparkles,
  Send,
  CheckCircle2,
  ExternalLink,
  Loader2,
  FileText,
  FileUp,
  Star,
  CloudCheck,
  Download,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import PageWrapper from "@/components/layout/PageWrapper";
import { CaptionModeration } from "@/pages/editor/components/CaptionModeration";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CanvasTextEditor,
  type CanvasTextEditorHandle,
} from "@/pages/content-writing/components/CanvasTextEditor";
import { VersionHistorySidebar } from "@/pages/content-writing/components/VersionHistorySidebar";
import { SocialPreview } from "@/pages/content-writing/components/SocialPreview";
import { ImportDocumentModal } from "@/pages/content-writing/components/ImportDocumentModal";
import { AiCaptionDialog } from "@/components/ai/AiCaptionDialog";
import { useTaskContentSync } from "@/pages/content-writing/hooks/useTaskContentSync";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/services/api";
import { postService } from "@/services/postService";
import type { SocialPlatform } from "@/types/editor";
import type { DeltaOp } from "@/pages/content-writing/components/richText";
import * as Y from "yjs";
import {
  applySnapshotToDoc,
  copyTextToClipboard,
  CREATIVE_TEMPLATES,
  deltaToDocxZip,
  deltaToMarkdown,
  toPublishText,
} from "@/pages/content-writing/contentUtils";

const TARGET_PLATFORMS: { id: SocialPlatform; label: string }[] = [
  { id: "FACEBOOK", label: "Facebook" },
  { id: "INSTAGRAM", label: "Instagram" },
  { id: "TIKTOK", label: "TikTok" },
  { id: "THREADS", label: "Threads" },
];

/**
 * FR 3.6.10 Content Writing View — Google Docs / Microsoft Word style canvas
 * editor + real-time Yjs sync + Google Docs / .docx / .md file import +
 * enriched Unicode font conversion + creative copywriting studio tools +
 * direct social publishing with preserved Unicode fonts.
 */
export function ContentWritingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id: workspaceId } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [taskId, setTaskId] = useState<string | null>(
    searchParams.get("taskId"),
  );
  const [reloadToken, setReloadToken] = useState(0);
  const editorRef = useRef<CanvasTextEditorHandle>(null);

  // ── Google Docs Document Header state ────────────────────────────────────
  const [docTitle, setDocTitle] = useState("Bản thảo Chiến dịch Nội dung");
  const [isStarred, setIsStarred] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [fileMenuOpen, setFileMenuOpen] = useState(false);
  const [editMenuOpen, setEditMenuOpen] = useState(false);
  const [insertMenuOpen, setInsertMenuOpen] = useState(false);

  // ── Image attachments ────────────────────────────────────────────────────
  const [images, setImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        setImages((prev) => (prev.length < 6 ? [...prev, url] : prev));
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const removeImage = (index: number) =>
    setImages((prev) => prev.filter((_, i) => i !== index));

  // ── Drag-and-drop on whole page ──────────────────────────────────────────
  const [isDragging, setIsDragging] = useState(false);
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleImageFiles(e.dataTransfer.files);
  };

  // ── Social preview panel toggle ──────────────────────────────────────────
  const [showPreview, setShowPreview] = useState(true);
  // FR 3.7.2 AI caption dialog
  const [captionOpen, setCaptionOpen] = useState(false);

  // ── Publish dialog / state ───────────────────────────────────────────────
  const [publishOpen, setPublishOpen] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>([
    "FACEBOOK",
  ]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedRecord, setPublishedRecord] = useState<{
    id: string;
    caption: string;
    platforms: SocialPlatform[];
    status: string;
  } | null>(null);

  // ── Author info from auth store ──────────────────────────────────────────
  const user = useAuthStore((s) => s.user);
  const authorName = user ? user.name || user.email : "BrandHub Creator";

  // ── Task creation on first visit (with offline fallback when backend is unavailable) ──
  useEffect(() => {
    if (taskId || !workspaceId) return;
    api
      .post<{ data: { id: string } }>(
        `/api/v1/workspaces/${workspaceId}/tasks`,
        { title: "Untitled post" },
      )
      .then(({ data }) => {
        const newTaskId = data.data.id;
        setTaskId(newTaskId);
        setSearchParams((prev) => {
          prev.set("taskId", newTaskId);
          return prev;
        });
      })
      .catch(() => {
        const fallbackId = `local-draft-${workspaceId}`;
        setTaskId(fallbackId);
      });
  }, [taskId, workspaceId, setSearchParams]);

  const {
    yDoc,
    isReady,
    isConnected,
    snapshotCount,
    loadError,
    retryLoad,
    enableOfflineMode,
    connectionError,
    retryConnection,
    peers,
    updateLocalCursor,
  } = useTaskContentSync(workspaceId ?? "", taskId);

  // ── Publish text: what actually gets posted (FR 3.6.10 font conversion) ──
  const [publishText, setPublishText] = useState("");
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    const yText = yDoc.getText("content");
    const sync = () => setPublishText(toPublishText(yText.toDelta()));
    sync();
    yText.observe(sync);
    return () => yText.unobserve(sync);
  }, [yDoc, isReady]);

  const copyPublishText = async () => {
    const ok = await copyTextToClipboard(publishText);
    if (ok) {
      setCopied(true);
      toast.success(
        "Đã sao chép bản đăng chuẩn Font Unicode! Dán (Ctrl+V) trực tiếp lên Facebook / MXH.",
        { id: "brandhub-editor-toast" },
      );
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const togglePlatform = (p: SocialPlatform) => {
    setSelectedPlatforms((prev) => {
      if (prev.includes(p)) {
        return prev.length === 1 ? prev : prev.filter((x) => x !== p);
      }
      return [...prev, p];
    });
  };

  const handlePublishPost = async () => {
    if (!workspaceId || !publishText.trim()) return;
    setIsPublishing(true);
    try {
      const draft = await postService.createDraft(workspaceId, {
        caption: publishText,
        hashtags: [],
        media: images
          .filter((u) => /^https?:\/\//i.test(u))
          .map((u) => ({ externalUrl: u, mediaType: "IMAGE" as const })),
        targetPlatforms: selectedPlatforms,
        aiGenerated: false,
        taskId: taskId ?? undefined,
      });
      const published = await postService.publishNow(workspaceId, draft.id);
      setPublishedRecord({
        id: published.id || draft.id,
        caption: published.caption || publishText,
        platforms:
          (published.targetPlatforms as SocialPlatform[]) ?? selectedPlatforms,
        status: published.status || "PUBLISHED",
      });
      setPublishOpen(false);
      toast.success("Đã xuất bản bài viết với định dạng font chữ đã chọn!", {
        id: "brandhub-editor-toast",
      });
    } catch {
      toast.error("Không thể xuất bản bài viết. Vui lòng thử lại.", {
        id: "brandhub-editor-toast",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleOpenInStudio = () => {
    if (!workspaceId) return;
    navigate(`/workspaces/${workspaceId}/editor`, {
      state: {
        prefilledCaption: publishText,
        prefilledMediaUrls: images,
      },
    });
  };

  const handleRestored = (snapshot: string | null) => {
    if (!snapshot) return;
    applySnapshotToDoc(yDoc, snapshot);
    setReloadToken((v) => v + 1);
  };

  // Replacing goes through the shared Yjs text so collaborators see one change.
  const replaceContent = (text: string) => {
    const doc = yDoc as Y.Doc;
    const content = doc.getText("content");
    doc.transact(() => {
      content.delete(0, content.length);
      content.insert(0, text);
    });
  };

  const handleImportDocument = (
    ops: DeltaOp[],
    mode: "replace" | "append",
    importedTitle?: string,
  ) => {
    if (importedTitle) {
      setDocTitle(importedTitle);
    }
    if (editorRef.current) {
      editorRef.current.applyDeltaOps(ops, mode);
    } else {
      const doc = yDoc as Y.Doc;
      const content = doc.getText("content");
      doc.transact(() => {
        if (mode === "replace") {
          content.delete(0, content.length);
        } else if (content.length > 0) {
          content.insert(content.length, "\n\n");
        }
        let cursor = content.length;
        for (const op of ops) {
          if (!op.insert) continue;
          if (op.attributes && Object.keys(op.attributes).length > 0) {
            content.insert(cursor, op.insert, op.attributes);
          } else {
            content.insert(cursor, op.insert);
          }
          cursor += op.insert.length;
        }
      });
    }
    toast.success("Đã tự động điền nội dung tài liệu vào trình soạn thảo!");
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([publishText || ""], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${docTitle.trim() || "brandhub-content"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Đã xuất tệp văn bản Unicode (.txt)!");
  };

  const handleDownloadMd = () => {
    const doc = yDoc as Y.Doc;
    const md = deltaToMarkdown(doc.getText("content").toDelta());
    const blob = new Blob([md], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${docTitle.trim() || "brandhub-content"}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Đã xuất tệp Markdown (.md)!");
  };

  const handleDownloadDocx = () => {
    const doc = yDoc as Y.Doc;
    const zipBytes = deltaToDocxZip(doc.getText("content").toDelta());
    const blob = new Blob([zipBytes.buffer as ArrayBuffer], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${docTitle.trim() || "brandhub-content"}.docx`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Đã xuất tệp Microsoft Word / Google Docs (.docx)!");
  };

  return (
    <PageWrapper
      title={t("editor.contentWritingPage.title")}
      description={t("editor.contentWritingPage.description")}
    >
      {/* Published Post Confirmation Banner (verifies published font matches chosen font) */}
      {publishedRecord && (
        <div
          data-testid="published-post-banner"
          className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-semibold text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="size-4 shrink-0" />
              <span>
                Bài viết đã được đăng ({publishedRecord.platforms.join(", ")}) —
                Giữ nguyên định dạng font chữ:
              </span>
            </div>
            <div className="flex items-center gap-2">
              {workspaceId && (
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/workspaces/${workspaceId}/posts/${publishedRecord.id}`,
                    )
                  }
                  className="flex items-center gap-1 rounded-md border border-emerald-500/40 bg-emerald-500/20 px-2.5 py-1 text-[11px] font-medium text-emerald-900 hover:bg-emerald-500/30 dark:text-emerald-100"
                >
                  <span>Xem chi tiết bài đăng</span>
                  <ExternalLink className="size-3" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setPublishedRecord(null)}
                className="text-muted-foreground hover:text-foreground p-1"
                aria-label="Đóng thông báo đăng bài"
              >
                <X className="size-3.5" />
              </button>
            </div>
          </div>
          <p
            data-testid="published-post-caption"
            className="border-border bg-card text-foreground mt-2 rounded-lg border p-2.5 text-sm leading-relaxed whitespace-pre-wrap"
          >
            {publishedRecord.caption}
          </p>
        </div>
      )}

      {/* Drag-and-drop overlay */}
      {isDragging && (
        <div className="border-primary bg-primary/5 fixed inset-0 z-50 flex items-center justify-center border-4 border-dashed">
          <div className="text-primary text-center">
            <ImagePlus className="mx-auto mb-2 size-12" />
            <p className="text-lg font-semibold">Thả ảnh vào đây</p>
          </div>
        </div>
      )}

      <div
        className="flex flex-col gap-4 lg:flex-row"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* ── Left: Authentic Google Docs Chrome + Editor + Image strip ── */}
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          {/* Moderation status bar */}
          <CaptionModeration
            key={workspaceId}
            workspaceId={workspaceId}
            text={publishText}
          />

          {/* Attached images strip */}
          {images.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {images.map((src, i) => (
                <div key={i} className="group relative">
                  <img
                    src={src}
                    alt={`ảnh ${i + 1}`}
                    className="border-border h-20 w-20 rounded-lg border object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="bg-destructive text-destructive-foreground absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
              {images.length < 6 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="border-border text-muted-foreground hover:border-primary hover:text-primary flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed transition-colors"
                >
                  <ImagePlus className="size-6" />
                </button>
              )}
            </div>
          )}

          {connectionError && (
            <div
              role="alert"
              className="border-border bg-card rounded-xl border p-3"
            >
              <p className="text-destructive text-sm">
                {t("editor.contentWritingPage.connectionFailed")}
              </p>
              <Button
                variant="outline"
                className="mt-2"
                onClick={retryConnection}
              >
                {t("editor.emojiPicker.retry")}
              </Button>
            </div>
          )}

          {/* ── Google Docs Unified Document Header + Menu Bar + Canvas ── */}
          <div className="flex flex-col">
            <div className="border-border rounded-t-xl border border-b-0 bg-[#f9fbfd] px-3.5 pt-2.5 pb-2 dark:bg-zinc-900">
              {/* Row 1: Google Docs Icon + Document Title + Cloud Sync + Primary CTAs */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <div
                    className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#2684fc] text-white shadow-2xs"
                    title="BrandHub Docs Editor"
                  >
                    <FileText className="size-4.5" />
                  </div>

                  <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                    <input
                      type="text"
                      data-testid="doc-title-input"
                      value={docTitle}
                      onChange={(e) => setDocTitle(e.target.value)}
                      aria-label="Tiêu đề tài liệu"
                      className="text-foreground hover:border-border focus:border-blue-600 w-36 truncate rounded border border-transparent bg-transparent px-1 py-0.5 text-xs font-semibold focus:bg-white focus:outline-hidden sm:w-44 dark:focus:bg-zinc-800"
                    />
                    <button
                      type="button"
                      onClick={() => setIsStarred((s) => !s)}
                      title="Đánh dấu sao tài liệu"
                      aria-label="Đánh dấu sao tài liệu"
                      className={`rounded p-1 transition-colors ${
                        isStarred
                          ? "text-amber-500"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Star
                        className="size-3.5"
                        fill={isStarred ? "currentColor" : "none"}
                      />
                    </button>

                    {/* Live Yjs Cloud Status */}
                    <div className="flex items-center gap-1.5 rounded-full bg-black/[0.04] px-2 py-0.5 dark:bg-white/[0.06]">
                      <span
                        className={`inline-block size-2 rounded-full ${
                          isConnected
                            ? "bg-green-500"
                            : "bg-muted-foreground/40"
                        }`}
                      />
                      <CloudCheck className="text-muted-foreground size-3" />
                      <span className="text-muted-foreground text-[11px] font-medium whitespace-nowrap">
                        {isConnected
                          ? t("editor.contentWritingPage.connected", "Live")
                          : t(
                              "editor.contentWritingPage.connecting",
                              "Connecting…",
                            )}
                      </span>
                    </div>

                    {/* Collaborator Presence Avatars */}
                    {peers.length > 0 && (
                      <div className="ml-1 flex items-center -space-x-1.5">
                        {peers.map((p) => (
                          <div
                            key={p.clientId}
                            title={p.name}
                            className="border-card flex size-6 items-center justify-center rounded-full border-2 text-[10px] font-bold text-white shadow-2xs"
                            style={{ backgroundColor: p.color }}
                          >
                            {p.name.slice(0, 1).toUpperCase()}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Primary CTAs */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    data-testid="open-import-doc-btn"
                    onClick={() => setImportModalOpen(true)}
                    className="flex items-center gap-1 rounded-full border border-blue-600/30 bg-blue-600/10 px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap text-blue-700 transition-colors hover:bg-blue-600/20 dark:border-blue-400/30 dark:bg-blue-500/20 dark:text-blue-300"
                    title="Nhập nội dung từ link Google Docs hoặc file .docx, .txt, .md"
                  >
                    <FileUp className="size-3.5" />
                    Nhập Google Docs / File
                  </button>

                  {isReady && workspaceId && (
                    <button
                      type="button"
                      onClick={() => setCaptionOpen(true)}
                      className="bg-brand-orange hover:bg-brand-orange/90 flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium whitespace-nowrap text-white transition-colors"
                    >
                      <Sparkles className="size-3.5" />
                      {t("editor.aiCaption.open")}
                    </button>
                  )}

                  <button
                    type="button"
                    data-testid="open-publish-dialog-btn"
                    onClick={() => setPublishOpen(true)}
                    disabled={publishText.trim() === ""}
                    className="bg-brand-orange hover:bg-brand-orange/90 flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold whitespace-nowrap text-white shadow-xs transition-colors disabled:opacity-50"
                    title="Xuất bản bài viết với đúng định dạng font chữ đã chọn"
                  >
                    <Send className="size-3.5" />
                    Đăng bài
                  </button>
                </div>
              </div>

              {/* Row 2: Classic Google Docs Menu Bar (Left) + Quick Utility Actions (Right) */}
              <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 border-t border-black/[0.06] pt-1.5 dark:border-white/[0.06]">
                <div className="flex flex-wrap items-center gap-1 text-[11px] text-[#444746] dark:text-zinc-300">
                  <DropdownMenu
                    open={fileMenuOpen}
                    onOpenChange={setFileMenuOpen}
                  >
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        data-testid="doc-menu-file"
                        className="rounded px-1.5 py-0.5 font-medium hover:bg-black/5 dark:hover:bg-white/10"
                      >
                        Tệp
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      side="bottom"
                      className="bg-card border-border w-64 p-1.5 text-xs shadow-xl"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setFileMenuOpen(false);
                          setImportModalOpen(true);
                        }}
                        className="hover:bg-muted flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-left"
                      >
                        <FileUp className="size-3.5 text-blue-600" />
                        <span>Nhập từ Google Docs / Word (.docx)…</span>
                      </button>
                      <button
                        type="button"
                        data-testid="export-docx-btn"
                        onClick={() => {
                          setFileMenuOpen(false);
                          handleDownloadDocx();
                        }}
                        className="hover:bg-muted flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-left"
                      >
                        <Download className="size-3.5 text-blue-600" />
                        <span>Xuất tệp Word / Google Docs (.docx)</span>
                      </button>
                      <button
                        type="button"
                        data-testid="export-md-btn"
                        onClick={() => {
                          setFileMenuOpen(false);
                          handleDownloadMd();
                        }}
                        className="hover:bg-muted flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-left"
                      >
                        <Download className="size-3.5" />
                        <span>Xuất tệp Markdown (.md)</span>
                      </button>
                      <button
                        type="button"
                        data-testid="export-txt-btn"
                        onClick={() => {
                          setFileMenuOpen(false);
                          handleDownloadTxt();
                        }}
                        className="hover:bg-muted flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-left"
                      >
                        <Download className="size-3.5" />
                        <span>Tải xuống bản đăng Unicode (.txt)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFileMenuOpen(false);
                          replaceContent("");
                        }}
                        className="hover:bg-muted flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-red-600"
                      >
                        <Trash2 className="size-3.5" />
                        <span>Xóa toàn bộ nội dung</span>
                      </button>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu
                    open={editMenuOpen}
                    onOpenChange={setEditMenuOpen}
                  >
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="rounded px-1.5 py-0.5 font-medium hover:bg-black/5 dark:hover:bg-white/10"
                      >
                        Chỉnh sửa
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      side="bottom"
                      className="bg-card border-border w-52 p-1.5 text-xs shadow-xl"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setEditMenuOpen(false);
                          editorRef.current?.transformCase("upper");
                        }}
                        className="hover:bg-muted flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-left"
                      >
                        <span>Chuyển sang CHỮ IN HOA</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditMenuOpen(false);
                          editorRef.current?.transformCase("title");
                        }}
                        className="hover:bg-muted flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-left"
                      >
                        <span>Viết Hoa Chữ Cái Đầu Từ</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditMenuOpen(false);
                          editorRef.current?.transformCase("lower");
                        }}
                        className="hover:bg-muted flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-left"
                      >
                        <span>Chuyển sang chữ thường</span>
                      </button>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu
                    open={insertMenuOpen}
                    onOpenChange={setInsertMenuOpen}
                  >
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="rounded px-1.5 py-0.5 font-medium hover:bg-black/5 dark:hover:bg-white/10"
                      >
                        Chèn
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      side="bottom"
                      className="bg-card border-border w-60 p-1.5 text-xs shadow-xl"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setInsertMenuOpen(false);
                          setImportModalOpen(true);
                        }}
                        className="hover:bg-muted flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-left font-medium text-blue-600 dark:text-blue-400"
                      >
                        <FileUp className="size-3.5" />
                        <span>Chèn nội dung từ Google Docs / File…</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setInsertMenuOpen(false);
                          fileInputRef.current?.click();
                        }}
                        className="hover:bg-muted flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-left"
                      >
                        <ImagePlus className="size-3.5" />
                        <span>Đính kèm hình ảnh bài đăng</span>
                      </button>
                      {CREATIVE_TEMPLATES.map((tpl) => (
                        <button
                          key={tpl.id}
                          type="button"
                          onClick={() => {
                            setInsertMenuOpen(false);
                            editorRef.current?.applyDeltaOps(tpl.ops, "append");
                          }}
                          className="hover:bg-muted flex w-full cursor-pointer items-center justify-between rounded-md px-2.5 py-1.5 text-left"
                        >
                          <span className="truncate">{tpl.label}</span>
                          <span className="bg-brand-orange/15 text-brand-orange ml-2 rounded px-1 py-0.5 text-[9px] font-bold">
                            {tpl.badge}
                          </span>
                        </button>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Secondary Utility Actions */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="border-border bg-card hover:bg-muted flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium whitespace-nowrap transition-colors"
                    title="Đính kèm ảnh (tối đa 6 ảnh)"
                  >
                    <ImagePlus className="size-3" />
                    Đính kèm ảnh
                    {images.length > 0 && (
                      <span className="bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 text-[10px] font-bold">
                        {images.length}
                      </span>
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleImageFiles(e.target.files)}
                  />

                  <button
                    type="button"
                    data-testid="copy-publish-text-btn"
                    onClick={copyPublishText}
                    disabled={publishText === ""}
                    className="border-border bg-card hover:bg-muted flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium whitespace-nowrap transition-colors disabled:opacity-50"
                    title="Sao chép nội dung đã chuyển font chuẩn để đăng"
                  >
                    {copied ? (
                      <Check className="size-3 text-emerald-600" />
                    ) : (
                      <Copy className="size-3" />
                    )}
                    {copied ? "Đã sao chép" : "Sao chép bản đăng"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowPreview((v) => !v)}
                    className="border-border bg-card hover:bg-muted flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium whitespace-nowrap transition-colors"
                    title={
                      showPreview
                        ? "Ẩn preview mạng xã hội"
                        : "Xem preview mạng xã hội"
                    }
                  >
                    {showPreview ? (
                      <EyeOff className="size-3" />
                    ) : (
                      <Eye className="size-3" />
                    )}
                    {showPreview ? "Ẩn Preview" : "Xem Preview"}
                  </button>
                </div>
              </div>
            </div>

            {loadError ? (
              <div
                role="alert"
                className="border-border bg-card flex h-48 flex-col items-center justify-center gap-3 rounded-b-xl border"
              >
                <p className="text-destructive text-sm">
                  {t("editor.contentWritingPage.loadFailed")}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="outline" onClick={retryLoad}>
                    {t("editor.emojiPicker.retry")}
                  </Button>
                  <Button
                    variant="secondary"
                    data-testid="continue-offline-btn"
                    onClick={enableOfflineMode}
                  >
                    Soạn thảo ngoại tuyến
                  </Button>
                </div>
              </div>
            ) : isReady ? (
              <CanvasTextEditor
                key={reloadToken}
                ref={editorRef}
                yDoc={yDoc as Y.Doc}
                peers={peers}
                onCursorChange={updateLocalCursor}
              />
            ) : (
              <div className="border-border bg-card flex h-48 w-full items-center justify-center rounded-b-xl border">
                <span className="text-muted-foreground text-xs">
                  {t("editor.contentWritingPage.loading", "Loading content…")}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Social preview + version history ──────────────────── */}
        <div className="flex w-full shrink-0 flex-col gap-4 lg:w-[320px]">
          {showPreview && (
            <div className="flex flex-col gap-2">
              <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                Preview mạng xã hội
              </p>
              <SocialPreview
                text={publishText}
                images={images}
                authorName={authorName}
              />
            </div>
          )}

          {taskId && workspaceId && (
            <VersionHistorySidebar
              workspaceId={workspaceId}
              taskId={taskId}
              onRestored={handleRestored}
              refreshKey={snapshotCount}
            />
          )}
        </div>
      </div>

      {/* Import Google Docs / Word / Markdown / Text Modal */}
      <ImportDocumentModal
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImport={handleImportDocument}
      />

      {/* Publish Modal */}
      {publishOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Xuất bản bài viết lên mạng xã hội"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
        >
          <div className="border-border bg-card w-full max-w-lg space-y-4 rounded-2xl border p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-foreground text-base font-bold">
                Đăng bài lên mạng xã hội
              </h3>
              <button
                type="button"
                onClick={() => setPublishOpen(false)}
                className="text-muted-foreground hover:text-foreground rounded-lg p-1"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-muted-foreground text-xs font-medium">
                Chọn nền tảng xuất bản:
              </p>
              <div className="flex flex-wrap gap-2">
                {TARGET_PLATFORMS.map((p) => {
                  const active = selectedPlatforms.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => togglePlatform(p.id)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
                        active
                          ? "bg-brand-orange border-brand-orange text-white shadow-xs"
                          : "border-border bg-muted/40 text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-muted-foreground text-xs font-medium">
                Nội dung xuất bản (đã chuyển đổi font chữ Unicode chuẩn):
              </p>
              <div
                data-testid="publish-modal-preview-text"
                className="border-border bg-muted/30 text-foreground max-h-48 overflow-y-auto rounded-xl border p-3 text-sm leading-relaxed whitespace-pre-wrap"
              >
                {publishText}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                data-testid="publish-modal-copy-btn"
                onClick={copyPublishText}
                className="gap-1.5"
              >
                {copied ? (
                  <Check className="size-3.5 text-emerald-600" />
                ) : (
                  <Copy className="size-3.5" />
                )}
                {copied ? "Đã copy Font!" : "Copy dán Facebook"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleOpenInStudio}
              >
                Mở trong Studio nâng cao
              </Button>
              <Button
                type="button"
                data-testid="confirm-publish-now-btn"
                size="sm"
                className="bg-brand-orange hover:bg-brand-orange/90 gap-1.5 text-white"
                disabled={isPublishing}
                onClick={handlePublishPost}
              >
                {isPublishing ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Send className="size-3.5" />
                )}
                Đăng ngay
              </Button>
            </div>
          </div>
        </div>
      )}

      {captionOpen && workspaceId && (
        <AiCaptionDialog
          workspaceId={workspaceId}
          initialTopic={publishText}
          taskId={taskId}
          onInsert={(pick) => editorRef.current?.insertText(pick.text)}
          onReplace={(pick) => replaceContent(pick.text)}
          onClose={() => setCaptionOpen(false)}
        />
      )}
    </PageWrapper>
  );
}

export default ContentWritingPage;
