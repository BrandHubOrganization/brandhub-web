import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { isAxiosError } from "axios";
import {
  Download,
  FileText,
  LockKeyhole,
  Maximize2,
  Play,
  Film,
  Image as ImageIcon,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { chatAttachmentService as service } from "@/pages/chat/services/chatAttachmentService";
import { AdobePdfIcon } from "@/pages/chat/components/ChatAttachmentComposer";
import { useChatMediaLightbox } from "@/pages/chat/hooks/useChatMediaLightbox";
import { cn, formatFileSize } from "@/lib/utils";

// In-memory cache for Blob URLs across channel switches and re-renders
const blobUrlCache = new Map<string, string>();

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
  const [visible, setVisible] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const [contentUrl, setContentUrl] = useState<string>(
    () => blobUrlCache.get(id) ?? "",
  );
  const [imgLoaded, setImgLoaded] = useState(false);

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
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });

  const metadataAllowed = meta.isSuccess && !meta.isError;
  const isImage =
    !!meta.data &&
    ["image/jpeg", "image/png", "image/webp"].includes(meta.data.mimeType);
  const isVideo =
    !!meta.data &&
    ["video/mp4", "video/quicktime"].includes(meta.data.mimeType);
  const isPdf = !!meta.data && meta.data.mimeType === "application/pdf";

  // Pre-download binary only for visual media (images & videos).
  // PDFs only need metadata to display the Acrobat card instantly!
  const previewable =
    (isImage || isVideo) &&
    (meta.data?.byteSize ?? 0) <= 50 * 1024 * 1024;

  const preview = useQuery({
    queryKey: ["chat-attachment-content", actor, workspace, channel, id],
    enabled: visible && metadataAllowed && previewable,
    queryFn: ({ signal }) => service.content(workspace, channel, id, signal),
    retry: false,
    staleTime: Infinity, // Keep in memory while session is active
    gcTime: 1000 * 60 * 60 * 2, // 2 hours
  });

  const binaryDenied =
    preview.isError &&
    isAxiosError(preview.error) &&
    preview.error.response?.status === 403;
  const allowed = metadataAllowed && !binaryDenied;

  useEffect(() => {
    if (!allowed) {
      setContentUrl("");
      return;
    }
    if (blobUrlCache.has(id)) {
      setContentUrl(blobUrlCache.get(id)!);
      return;
    }
    if (preview.data) {
      const url = URL.createObjectURL(preview.data);
      blobUrlCache.set(id, url);
      setContentUrl(url);
    }
  }, [allowed, preview.data, id]);

  const handlePreview = async () => {
    if (!meta.data) return;

    let targetUrl = contentUrl;
    // For PDF, fetch blob lazily if not fetched yet
    if (!targetUrl) {
      try {
        const blob = await service.content(workspace, channel, id);
        targetUrl = URL.createObjectURL(blob);
        blobUrlCache.set(id, targetUrl);
        setContentUrl(targetUrl);
      } catch {
        // Fallback
        void download();
        return;
      }
    }

    openLightbox({
      url: targetUrl,
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
      const current = await service.inspect(workspace, channel, id);
      const blob = await service.content(workspace, channel, id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = current.filename;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
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
        <div className="flex h-48 w-72 max-w-full animate-pulse items-center justify-center rounded-2xl border border-border/60 bg-muted/30">
          <div className="flex flex-col items-center gap-2 text-muted-foreground/50">
            <div className="h-2 w-28 rounded-full bg-muted-foreground/20" />
            <div className="h-2 w-16 rounded-full bg-muted-foreground/15" />
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
          {/* Skeleton loading while downloading binary or decoding image */}
          {(!contentUrl || !imgLoaded) && (
            <div className="flex h-52 w-80 max-w-full animate-pulse flex-col items-center justify-center gap-2.5 rounded-xl bg-muted/40 text-muted-foreground">
              <div className="flex size-10 items-center justify-center rounded-xl bg-muted-foreground/15">
                <ImageIcon className="size-5 text-muted-foreground/60" />
              </div>
              <p className="font-mono text-xs text-muted-foreground/80">
                Đang tải ảnh...
                {meta.data?.byteSize
                  ? ` (${formatFileSize(meta.data.byteSize)})`
                  : ""}
              </p>
            </div>
          )}

          {contentUrl && (
            <img
              src={contentUrl}
              alt={meta.data.filename}
              className={cn(
                "max-h-80 w-auto cursor-pointer rounded-xl object-contain transition-transform hover:scale-[1.01]",
                !imgLoaded && "hidden",
              )}
              loading="lazy"
              onLoad={() => setImgLoaded(true)}
              onClick={() => void handlePreview()}
              title={`${meta.data.filename} - Bấm để phóng to`}
            />
          )}

          {imgLoaded && (
            <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                variant="secondary"
                size="icon"
                className="size-7 rounded-full border-0 bg-black/60 text-white shadow-sm hover:bg-black/80"
                onClick={() => void handlePreview()}
                aria-label="Xem trước phóng to"
                title="Xem ảnh phóng to (Slack Lightbox)"
              >
                <Maximize2 className="size-3.5" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="size-7 rounded-full border-0 bg-black/60 text-white shadow-sm hover:bg-black/80"
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
          )}
        </div>
      ) : isVideo ? (
        <div className="group relative max-w-md overflow-hidden rounded-xl border border-border/70 bg-black shadow-md">
          {/* Skeleton loading while downloading video binary */}
          {!contentUrl && (
            <div className="flex h-56 w-84 max-w-full animate-pulse flex-col items-center justify-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-400">
              <div className="flex size-12 items-center justify-center rounded-full bg-zinc-800/80">
                <Play className="ml-0.5 size-6 fill-zinc-500 text-zinc-500" />
              </div>
              <p className="font-mono text-xs text-zinc-400">
                Đang tải video...
                {meta.data?.byteSize
                  ? ` (${formatFileSize(meta.data.byteSize)})`
                  : ""}
              </p>
            </div>
          )}

          {contentUrl && (
            <div
              className="relative cursor-pointer"
              onClick={() => void handlePreview()}
            >
              <video
                preload="metadata"
                playsInline
                src={contentUrl}
                className="max-h-76 w-full max-w-md rounded-xl bg-black object-contain"
                onLoadedMetadata={(e) => {
                  try {
                    // Seek slightly forward to generate a sharp preview poster frame
                    e.currentTarget.currentTime = 0.05;
                  } catch {}
                }}
              />

              {/* Slack-style Center Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/25 transition-all group-hover:bg-black/40">
                <div className="flex size-14 items-center justify-center rounded-full bg-black/60 text-white shadow-xl backdrop-blur-xs transition-transform group-hover:scale-110 group-hover:bg-black/80">
                  <Play className="ml-1 size-7 fill-current" />
                </div>
              </div>

              {/* Video Badge */}
              <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 rounded-md bg-black/70 px-2 py-0.5 text-[11px] font-medium text-white/90 backdrop-blur-xs">
                <Film className="size-3" />
                <span>VIDEO</span>
                <span className="text-white/40">·</span>
                <span>{formatFileSize(meta.data.byteSize)}</span>
              </div>

              {/* Hover Action Bar */}
              <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  variant="secondary"
                  size="icon"
                  className="size-7 rounded-full border-0 bg-black/60 text-white shadow-sm hover:bg-black/80"
                  onClick={(e) => {
                    e.stopPropagation();
                    void handlePreview();
                  }}
                  aria-label="Xem toàn màn hình"
                  title="Xem toàn màn hình (Slack Lightbox)"
                >
                  <Maximize2 className="size-3.5" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="size-7 rounded-full border-0 bg-black/60 text-white shadow-sm hover:bg-black/80"
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
                variant="ghost"
                size="icon"
                className="size-8 shrink-0 rounded-lg text-muted-foreground hover:text-foreground"
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
