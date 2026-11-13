import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { isAxiosError } from "axios";
import {
  Download,
  FileText,
  Image as ImageIcon,
  Loader2,
  LockKeyhole,
  Maximize2,
  Play,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { chatAttachmentService as service } from "@/pages/chat/services/chatAttachmentService";
import { AdobePdfIcon } from "@/pages/chat/components/ChatAttachmentComposer";
import { useChatMediaLightbox } from "@/pages/chat/hooks/useChatMediaLightbox";
import { cn, formatFileSize } from "@/lib/utils";

/**
 * In-memory Blob URL cache to enable instant (0ms) media rendering
 * across channel switches, pagination, and message scrolling.
 */
const blobUrlCache = new Map<string, string>();

function formatVideoDuration(seconds: number): string {
  if (isNaN(seconds) || seconds <= 0) return "";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

function Attachment({
  workspace,
  channel,
  id,
  senderName,
  senderAvatar,
  sentAt,
  channelName,
}: {
  workspace: string;
  channel: string;
  id: string;
  senderName?: string;
  senderAvatar?: string;
  sentAt?: string;
  channelName?: string;
}) {
  const { t } = useTranslation();
  const actor = useAuthStore((s) => s.user?.id);
  const openLightbox = useChatMediaLightbox((s) => s.openLightbox);
  const host = useRef<HTMLDivElement>(null);

  const cacheKey = `${workspace}:${channel}:${id}`;
  const [visible, setVisible] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [contentUrl, setContentUrl] = useState<string>(
    () => blobUrlCache.get(cacheKey) || "",
  );

  useEffect(() => {
    const cached = blobUrlCache.get(cacheKey);
    if (cached && contentUrl !== cached) {
      setContentUrl(cached);
    }
  }, [cacheKey, contentUrl]);

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "150px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const meta = useQuery({
    queryKey: ["chat-attachment", actor, workspace, channel, id],
    enabled: visible && !!actor,
    queryFn: ({ signal }) => service.inspect(workspace, channel, id, signal),
    retry: false,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours - attachment metadata is immutable
    gcTime: 1000 * 60 * 60 * 24,
  });

  const metadataAllowed = meta.isSuccess && !meta.isError;
  const isImage =
    !!meta.data &&
    ["image/jpeg", "image/png", "image/webp"].includes(meta.data.mimeType);
  const isVideo =
    !!meta.data &&
    ["video/mp4", "video/quicktime"].includes(meta.data.mimeType);
  const isPdf = !!meta.data && meta.data.mimeType === "application/pdf";

  // PDF is NOT previewable automatically in the message feed;
  // only Image & Video fetch blob preview upfront to save bandwidth and memory.
  const previewable =
    (isImage || isVideo) &&
    (meta.data?.byteSize ?? 0) <= 50 * 1024 * 1024;

  const hasCachedUrl = Boolean(contentUrl || blobUrlCache.has(cacheKey));

  const preview = useQuery({
    queryKey: ["chat-attachment-content", actor, workspace, channel, id],
    enabled: visible && metadataAllowed && previewable && !hasCachedUrl,
    queryFn: ({ signal }) => service.content(workspace, channel, id, signal),
    retry: false,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours - binary content is immutable
    gcTime: 1000 * 60 * 60 * 24,
  });

  const binaryDenied =
    preview.isError &&
    isAxiosError(preview.error) &&
    preview.error.response?.status === 403;
  const allowed = metadataAllowed && !binaryDenied;

  useEffect(() => {
    if (blobUrlCache.has(cacheKey)) {
      const cached = blobUrlCache.get(cacheKey)!;
      if (contentUrl !== cached) {
        setContentUrl(cached);
      }
      return;
    }
    if (!allowed || !preview.data) {
      if (!blobUrlCache.has(cacheKey)) {
        setContentUrl("");
      }
      return;
    }
    const url = URL.createObjectURL(preview.data);
    blobUrlCache.set(cacheKey, url);
    setContentUrl(url);
  }, [allowed, preview.data, cacheKey, contentUrl]);

  const handlePreview = async () => {
    if (!meta.data) return;
    let url = contentUrl || blobUrlCache.get(cacheKey) || "";
    if (!url) {
      try {
        setLoadingMedia(true);
        const blob = await service.content(workspace, channel, id);
        url = URL.createObjectURL(blob);
        blobUrlCache.set(cacheKey, url);
        setContentUrl(url);
      } catch (err) {
        console.error("Failed to load media preview:", err);
        return;
      } finally {
        setLoadingMedia(false);
      }
    }
    openLightbox({
      url,
      filename: meta.data.filename,
      mimeType: meta.data.mimeType,
      byteSize: meta.data.byteSize,
      senderName,
      senderAvatar,
      sentAt,
      channelName,
      workspaceId: workspace,
      channelId: channel,
      attachmentId: id,
    });
  };

  const download = async () => {
    setDownloading(true);
    setDownloadError("");
    try {
      let url = contentUrl || blobUrlCache.get(cacheKey);
      let filename = meta.data?.filename;
      if (!url || !filename) {
        const current = await service.inspect(workspace, channel, id);
        filename = current.filename;
        const blob = await service.content(workspace, channel, id);
        url = URL.createObjectURL(blob);
        blobUrlCache.set(cacheKey, url);
        setContentUrl(url);
      }
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
    } catch {
      setDownloadError(t("chat.attachments.unavailable"));
      void meta.refetch();
    } finally {
      setDownloading(false);
    }
  };

  const denied =
    binaryDenied ||
    (meta.error &&
      isAxiosError(meta.error) &&
      meta.error.response?.status === 403);

  return (
    <div ref={host} className="w-fit max-w-full">
      {meta.isPending ? (
        <div className="flex h-[76px] w-64 items-center gap-3 rounded-2xl border border-border/60 bg-card/60 p-3 shadow-2xs animate-pulse">
          <div className="size-12 shrink-0 rounded-xl bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-3/4 rounded-md bg-muted" />
            <div className="h-2.5 w-1/2 rounded-md bg-muted/60" />
          </div>
        </div>
      ) : !allowed ? (
        <div
          className="flex h-[76px] items-center gap-2 rounded-2xl border border-border/80 bg-card p-3 text-xs text-muted-foreground shadow-2xs"
          role="status"
        >
          <LockKeyhole className="size-4 shrink-0" />
          <span>
            {t(
              denied
                ? "chat.attachments.denied"
                : "chat.attachments.unavailable",
            )}
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              void meta.refetch();
              if (binaryDenied) void preview.refetch();
            }}
          >
            {t("chat.actions.retry")}
          </Button>
        </div>
      ) : isImage ? (
        <div className="group relative max-w-sm overflow-hidden rounded-xl border border-border/70 bg-muted/20 shadow-2xs">
          {!contentUrl ? (
            <div className="flex h-52 w-72 sm:w-80 flex-col items-center justify-center gap-2 rounded-xl border border-border/50 bg-muted/30 p-4 text-center animate-pulse">
              <div className="flex size-12 items-center justify-center rounded-xl bg-muted/70 text-muted-foreground shadow-2xs">
                <ImageIcon className="size-6 text-muted-foreground/80" />
              </div>
              <p className="text-xs font-medium text-muted-foreground">
                {t("chat.attachments.loadingImage", "Đang tải hình ảnh...")}
              </p>
              {meta.data?.byteSize ? (
                <span className="rounded-full bg-muted/60 px-2 py-0.5 text-[10px] font-mono text-muted-foreground/80">
                  {formatFileSize(meta.data.byteSize)}
                </span>
              ) : null}
            </div>
          ) : (
            <>
              <img
                src={contentUrl}
                alt={meta.data.filename}
                className="max-h-80 w-auto cursor-pointer rounded-xl object-contain transition-transform hover:scale-[1.01]"
                loading="lazy"
                onClick={handlePreview}
                title={`${meta.data.filename} - Bấm để phóng to`}
              />
              <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="size-7 rounded-full border-0 bg-black/60 text-white shadow-sm hover:bg-black/80 hover:text-white"
                  onClick={handlePreview}
                  aria-label="Xem trước phóng to"
                  title="Xem ảnh phóng to"
                >
                  <Maximize2 className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="size-7 rounded-full border-0 bg-black/60 text-white shadow-sm hover:bg-black/80 hover:text-white"
                  loading={downloading}
                  disabled={downloading}
                  onClick={() => void download()}
                  aria-label={t("chat.attachments.download")}
                  title="Tải về máy"
                >
                  <Download className="size-3.5" />
                </Button>
              </div>
            </>
          )}
        </div>
      ) : isVideo ? (
        <div className="w-full max-w-md">
          {!contentUrl ? (
            <div className="relative flex aspect-video max-h-72 w-full max-w-md flex-col items-center justify-center overflow-hidden rounded-xl border border-border/70 bg-zinc-950 p-4 shadow-2xs">
              <div className="flex size-14 items-center justify-center rounded-full bg-zinc-900/90 text-zinc-400 ring-1 ring-white/10 shadow-lg">
                <Play className="ml-1 size-7 fill-zinc-600 text-zinc-600 animate-pulse" />
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs font-medium text-zinc-400">
                <Loader2 className="size-3.5 animate-spin text-zinc-400" />
                <span>
                  {t("chat.attachments.loadingVideo", "Đang tải video...")}
                </span>
                {meta.data?.byteSize ? (
                  <span className="font-mono text-zinc-500">
                    ({formatFileSize(meta.data.byteSize)})
                  </span>
                ) : null}
              </div>
            </div>
          ) : (
            <div
              className="group relative aspect-video max-h-72 w-full max-w-md cursor-pointer overflow-hidden rounded-xl border border-border/70 bg-black shadow-2xs transition-shadow hover:shadow-md"
              onClick={handlePreview}
            >
              <video
                src={contentUrl}
                preload="metadata"
                playsInline
                muted
                onLoadedMetadata={(e) => {
                  if (e.currentTarget.duration) {
                    setVideoDuration(e.currentTarget.duration);
                  }
                }}
                className="h-full w-full object-contain pointer-events-none"
              />

              {/* Slack-Standard Center Big Play Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex size-14 items-center justify-center rounded-full bg-black/60 text-white shadow-xl backdrop-blur-md transition-all duration-200 group-hover:scale-110 group-hover:bg-black/80 ring-1 ring-white/20">
                  <Play className="ml-1 size-7 fill-white text-white drop-shadow-sm" />
                </div>
              </div>

              {/* Slack-Standard Duration / File Size Badge */}
              <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 rounded-md bg-black/70 px-2 py-0.5 text-[11px] font-medium tracking-wide text-white/90 backdrop-blur-xs shadow-xs">
                <span className="inline-block size-1.5 rounded-full bg-red-500" />
                <span>
                  {videoDuration > 0
                    ? `${formatVideoDuration(videoDuration)} · ${formatFileSize(meta.data.byteSize)}`
                    : `VIDEO · ${formatFileSize(meta.data.byteSize)}`}
                </span>
              </div>

              {/* Floating Action Bar on Top-Right */}
              <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="size-7 rounded-full border-0 bg-black/60 text-white shadow-sm hover:bg-black/80 hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    void handlePreview();
                  }}
                  aria-label="Xem trước video toàn màn hình"
                  title="Xem toàn màn hình"
                >
                  <Maximize2 className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="size-7 rounded-full border-0 bg-black/60 text-white shadow-sm hover:bg-black/80 hover:text-white"
                  loading={downloading}
                  disabled={downloading}
                  onClick={(e) => {
                    e.stopPropagation();
                    void download();
                  }}
                  aria-label={t("chat.attachments.download")}
                  title="Tải về máy"
                >
                  <Download className="size-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          className={cn(
            "group relative flex h-[76px] min-w-[220px] max-w-sm items-center gap-3 rounded-2xl border border-border/80 bg-card p-3 shadow-2xs transition-colors hover:border-border",
            isPdf && "cursor-pointer hover:bg-muted/30",
          )}
          onClick={() => {
            if (isPdf) void handlePreview();
          }}
        >
          <div
            className={cn(
              "flex size-12 shrink-0 items-center justify-center rounded-xl font-bold text-white shadow-2xs",
              isPdf ? "bg-[#e01e5a]" : "bg-blue-600",
            )}
          >
            {isPdf ? (
              <AdobePdfIcon className="size-6 text-white" />
            ) : (
              <FileText className="size-6 text-white" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p
              className="truncate text-xs font-semibold text-foreground"
              title={meta.data.filename}
            >
              {meta.data.filename}
            </p>
            <p className="mt-0.5 text-[11px] font-medium uppercase text-muted-foreground">
              {isPdf
                ? "PDF"
                : meta.data.filename.split(".").pop()?.toUpperCase() || "FILE"}
              {" · "}
              {formatFileSize(meta.data.byteSize)}
              {meta.data.source === "REPOSITORY" && meta.data.versionNumber
                ? ` · v${meta.data.versionNumber}`
                : ""}
            </p>
          </div>
          <div className="flex items-center gap-1">
            {isPdf && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 shrink-0 rounded-lg text-muted-foreground hover:text-foreground"
                loading={loadingMedia}
                disabled={loadingMedia}
                onClick={(e) => {
                  e.stopPropagation();
                  void handlePreview();
                }}
                aria-label="Xem trước PDF"
                title="Xem trước PDF"
              >
                <Maximize2 className="size-4" />
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 shrink-0 rounded-lg text-muted-foreground hover:text-foreground"
              loading={downloading}
              disabled={downloading}
              onClick={(e) => {
                e.stopPropagation();
                void download();
              }}
              aria-label={t("chat.attachments.download")}
              title="Tải về máy"
            >
              <Download className="size-4" />
            </Button>
          </div>
        </div>
      )}
      {downloadError && (
        <p role="alert" className="mt-1 text-xs text-destructive">
          {downloadError}
        </p>
      )}
    </div>
  );
}

export function ChatMessageAttachments({
  workspace,
  channel,
  ids,
  senderName,
  senderAvatar,
  sentAt,
  channelName,
}: {
  workspace: string;
  channel: string;
  ids?: string[];
  senderName?: string;
  senderAvatar?: string;
  sentAt?: string;
  channelName?: string;
}) {
  if (!ids?.length) return null;
  return (
    <div className="mt-2 flex flex-wrap items-start gap-2.5">
      {ids.slice(0, 5).map((id) => (
        <Attachment
          key={id}
          workspace={workspace}
          channel={channel}
          id={id}
          senderName={senderName}
          senderAvatar={senderAvatar}
          sentAt={sentAt}
          channelName={channelName}
        />
      ))}
    </div>
  );
}
