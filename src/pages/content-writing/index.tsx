import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ImagePlus, X, Eye, EyeOff } from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
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

  // ── Text mirror for social preview ──────────────────────────────────────
  const [previewText, setPreviewText] = useState("");

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
  const authorName =
    user
      ? [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email
      : "BrandHub Creator";

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

  const { yDoc, isReady, isConnected } = useTaskContentSync(
    workspaceId ?? "",
    taskId,
  );

  const handleRestored = () => {
    setReloadToken((v) => v + 1);
  };

  return (
    <PageWrapper
      title={t("editor.contentWritingPage.title")}
      description={t("editor.contentWritingPage.description")}
      compact
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

          {/* Toggle preview */}
          <button
            type="button"
            onClick={() => setShowPreview((v) => !v)}
            className="border-border bg-card hover:bg-muted flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors"
            title={showPreview ? "Ẩn preview mạng xã hội" : "Xem preview mạng xã hội"}
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
        <div className="min-w-0 flex-1 flex flex-col gap-3">
          {/* Attached images strip */}
          {images.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {images.map((src, i) => (
                <div key={i} className="relative group">
                  <img
                    src={src}
                    alt={`ảnh ${i + 1}`}
                    className="h-20 w-20 rounded-lg object-cover border border-border"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
              {images.length < 6 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-20 w-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  <ImagePlus className="size-6" />
                </button>
              )}
            </div>
          )}

          {/* Canvas editor */}
          {isReady ? (
            <CanvasTextEditor
              key={reloadToken}
              ref={editorRef}
              yDoc={yDoc as Y.Doc}
              onTextChange={setPreviewText}
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
        <div className="flex flex-col gap-4" style={{ width: 320, flexShrink: 0 }}>
          {showPreview && (
            <div className="flex flex-col gap-2">
              <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
                Preview mạng xã hội
              </p>
              <SocialPreview
                text={previewText}
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
            />
          )}
        </div>
      </div>
    </PageWrapper>
  );
}

export default ContentWritingPage;
