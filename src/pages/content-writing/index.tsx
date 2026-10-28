import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ImagePlus, X, Eye, EyeOff, Copy, Check } from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import { CaptionModeration } from "@/pages/editor/components/CaptionModeration";
import { Button } from "@/components/ui/button";
import {
  CanvasTextEditor,
  type CanvasTextEditorHandle,
} from "@/pages/content-writing/components/CanvasTextEditor";
import { VersionHistorySidebar } from "@/pages/content-writing/components/VersionHistorySidebar";
import { SocialPreview } from "@/pages/content-writing/components/SocialPreview";
import { useTaskContentSync } from "@/pages/content-writing/hooks/useTaskContentSync";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/services/api";
import * as Y from "yjs";
import {
  applySnapshotToDoc,
  toPublishText,
} from "@/pages/content-writing/contentUtils";

/**
 * FR 3.6.10 Content Writing View — canvas editor + real-time Yjs sync +
 * version history + social media preview + image attachment + emoji picker.
 */
export function ContentWritingPage() {
  const { t } = useTranslation();
  const { id: workspaceId } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [taskId, setTaskId] = useState<string | null>(
    searchParams.get("taskId"),
  );
  const [reloadToken, setReloadToken] = useState(0);
  const editorRef = useRef<CanvasTextEditorHandle>(null);

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

  // ── Author info from auth store ──────────────────────────────────────────
  const user = useAuthStore((s) => s.user);
  const authorName = user ? user.name || user.email : "BrandHub Creator";

  // ── Task creation on first visit ─────────────────────────────────────────
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
      });
  }, [taskId, workspaceId, setSearchParams]);

  const {
    yDoc,
    isReady,
    isConnected,
    snapshotCount,
    loadError,
    retryLoad,
    connectionError,
    retryConnection,
    peers,
    updateLocalCursor,
  } = useTaskContentSync(workspaceId ?? "", taskId);

  // ── Publish text: what actually gets posted (FR 3.6.10 font conversion) ──
  // Bold/italic become Unicode styled letters and Vietnamese is NFC-normalized,
  // so the social preview shows exactly what the platform will display and
  // the Creator can copy it without a Unikey/Yantext round-trip. The publish
  // flow (E52) should call toPublishText() on the same delta.
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
    try {
      await navigator.clipboard.writeText(publishText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard can be blocked (permissions / insecure context) — nothing to recover.
    }
  };

  const handleRestored = (snapshot: string | null) => {
    if (!snapshot) return;
    applySnapshotToDoc(yDoc, snapshot);
    setReloadToken((v) => v + 1);
  };

  return (
    <PageWrapper
      title={t("editor.contentWritingPage.title")}
      description={t("editor.contentWritingPage.description")}
    >
      {/* Top status bar */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={`inline-block size-2 rounded-full ${isConnected ? "bg-green-500" : "bg-muted-foreground/40"}`}
          />
          <span className="text-muted-foreground text-xs">
            {isConnected
              ? t("editor.contentWritingPage.connected", "Live")
              : t("editor.contentWritingPage.connecting", "Connecting…")}
          </span>
          {/* Peer presence: who else is viewing/editing this document right now. */}
          {peers.length > 0 && (
            <div className="ml-2 flex items-center -space-x-2">
              {peers.map((p) => (
                <div
                  key={p.clientId}
                  title={p.name}
                  className="border-card flex size-6 items-center justify-center rounded-full border-2 text-[10px] font-bold text-white"
                  style={{ backgroundColor: p.color }}
                >
                  {p.name.slice(0, 1).toUpperCase()}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Image upload button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="border-border bg-card hover:bg-muted flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors"
            title="Đính kèm ảnh (tối đa 6 ảnh)"
          >
            <ImagePlus className="size-3.5" />
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

          {/* Copy converted publish text */}
          <button
            type="button"
            onClick={copyPublishText}
            disabled={publishText === ""}
            className="border-border bg-card hover:bg-muted flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50"
            title="Sao chép nội dung đã chuyển font chuẩn để đăng"
          >
            {copied ? (
              <Check className="size-3.5" />
            ) : (
              <Copy className="size-3.5" />
            )}
            {copied ? "Đã sao chép" : "Sao chép bản đăng"}
          </button>

          {/* Toggle preview */}
          <button
            type="button"
            onClick={() => setShowPreview((v) => !v)}
            className="border-border bg-card hover:bg-muted flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors"
            title={
              showPreview ? "Ẩn preview mạng xã hội" : "Xem preview mạng xã hội"
            }
          >
            {showPreview ? (
              <EyeOff className="size-3.5" />
            ) : (
              <Eye className="size-3.5" />
            )}
            {showPreview ? "Ẩn Preview" : "Xem Preview"}
          </button>
        </div>
      </div>

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
        className="flex gap-4"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* ── Left: Editor + image strip ──────────────────────────────── */}
        <div className="flex min-w-0 flex-1 flex-col gap-3">
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
              className="border-border bg-card mb-3 rounded-xl border p-3"
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
          {/* Canvas editor */}
          <CaptionModeration key={workspaceId} workspaceId={workspaceId} text={publishText} />
          {loadError ? (
            <div
              role="alert"
              className="border-border bg-card flex h-48 flex-col items-center justify-center gap-3 rounded-xl border"
            >
              <p className="text-destructive text-sm">
                {t("editor.contentWritingPage.loadFailed")}
              </p>
              <Button variant="outline" onClick={retryLoad}>
                {t("editor.emojiPicker.retry")}
              </Button>
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
            <div className="border-border bg-card flex h-48 w-full items-center justify-center rounded-xl border">
              <span className="text-muted-foreground text-xs">
                {t("editor.contentWritingPage.loading", "Loading content…")}
              </span>
            </div>
          )}
        </div>

        {/* ── Right: Social preview + version history ──────────────────── */}
        <div
          className="flex flex-col gap-4"
          style={{ width: 320, flexShrink: 0 }}
        >
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
    </PageWrapper>
  );
}

export default ContentWritingPage;
