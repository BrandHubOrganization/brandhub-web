import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { isAxiosError } from "axios";
import { Download, FileText, LockKeyhole, Maximize2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { chatAttachmentService as service } from "@/pages/chat/services/chatAttachmentService";
import { AdobePdfIcon } from "@/pages/chat/components/ChatAttachmentComposer";
import { useChatMediaLightbox } from "@/pages/chat/hooks/useChatMediaLightbox";
import { cn, formatFileSize } from "@/lib/utils";

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
  const [contentUrl, setContentUrl] = useState("");

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
      { rootMargin: "100px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const meta = useQuery({
    queryKey: ["chat-attachment", actor, workspace, channel, id],
    enabled: visible && !!actor,
    queryFn: ({ signal }) => service.inspect(workspace, channel, id, signal),
    retry: false,
    staleTime: 0,
  });

  const metadataAllowed = meta.isSuccess && !meta.isError;
  const isImage =
    !!meta.data &&
    ["image/jpeg", "image/png", "image/webp"].includes(meta.data.mimeType);
  const isVideo =
    !!meta.data &&
    ["video/mp4", "video/quicktime"].includes(meta.data.mimeType);
  const isPdf = !!meta.data && meta.data.mimeType === "application/pdf";
  const previewable =
    (isImage || isVideo || isPdf) &&
    (meta.data?.byteSize ?? 0) <= 50 * 1024 * 1024;

  const preview = useQuery({
    queryKey: ["chat-attachment-content", actor, workspace, channel, id],
    enabled: visible && metadataAllowed && previewable,
    queryFn: ({ signal }) => service.content(workspace, channel, id, signal),
    retry: false,
    gcTime: 0,
    staleTime: 0,
  });

  const binaryDenied =
    preview.isError &&
    isAxiosError(preview.error) &&
    preview.error.response?.status === 403;
  const allowed = metadataAllowed && !binaryDenied;

  useEffect(() => {
    if (!allowed || !preview.data) {
      setContentUrl("");
      return;
    }
    const url = URL.createObjectURL(preview.data);
    setContentUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [allowed, preview.data]);

  const handlePreview = () => {
    if (!contentUrl || !meta.data) return;
    openLightbox({
      url: contentUrl,
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
        <Skeleton className="h-[76px] w-64 rounded-2xl" />
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
          {preview.isPending && (
            <Skeleton className="h-48 w-72 rounded-xl" />
          )}
          {contentUrl && (
            <img
              src={contentUrl}
              alt={meta.data.filename}
              className="max-h-80 w-auto cursor-pointer rounded-xl object-contain transition-transform hover:scale-[1.01]"
              loading="lazy"
              onClick={handlePreview}
              title={`${meta.data.filename} - Bấm để phóng to`}
            />
          )}
          <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              variant="secondary"
              size="icon"
              className="size-7 rounded-full border-0 bg-black/60 text-white shadow-sm hover:bg-black/80"
              onClick={handlePreview}
              aria-label="Xem trước phóng to"
              title="Xem ảnh phóng to"
            >
              <Maximize2 className="size-3.5" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="size-7 rounded-full border-0 bg-black/60 text-white shadow-sm hover:bg-black/80"
              loading={downloading}
              disabled={downloading}
              onClick={() => void download()}
              aria-label={t("chat.attachments.download")}
              title="Tải về máy"
            >
              <Download className="size-3.5" />
            </Button>
          </div>
        </div>
      ) : isVideo ? (
        <div className="group relative max-w-md overflow-hidden rounded-xl border border-border/70 bg-black shadow-2xs">
          {preview.isPending && (
            <Skeleton className="h-56 w-80 rounded-xl bg-zinc-900" />
          )}
          {contentUrl && (
            <video
              controls
              preload="metadata"
              src={contentUrl}
              className="max-h-72 w-full max-w-md rounded-xl border border-border/70 bg-black"
            />
          )}
          <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              variant="secondary"
              size="icon"
              className="size-7 rounded-full border-0 bg-black/60 text-white shadow-sm hover:bg-black/80"
              onClick={handlePreview}
              aria-label="Xem trước video toàn màn hình"
              title="Xem toàn màn hình"
            >
              <Maximize2 className="size-3.5" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="size-7 rounded-full border-0 bg-black/60 text-white shadow-sm hover:bg-black/80"
              loading={downloading}
              disabled={downloading}
              onClick={() => void download()}
              aria-label={t("chat.attachments.download")}
              title="Tải về máy"
            >
              <Download className="size-3.5" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={cn(
            "group relative flex h-[76px] min-w-[220px] max-w-sm items-center gap-3 rounded-2xl border border-border/80 bg-card p-3 shadow-2xs transition-colors hover:border-border",
            isPdf && contentUrl && "cursor-pointer hover:bg-muted/30",
          )}
          onClick={() => {
            if (isPdf && contentUrl) handlePreview();
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
            {isPdf && contentUrl && (
              <Button
                variant="ghost"
                size="icon"
                className="size-8 shrink-0 rounded-lg text-muted-foreground hover:text-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePreview();
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
