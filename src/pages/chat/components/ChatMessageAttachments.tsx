import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { isAxiosError } from "axios";
import { Download, FileText, LockKeyhole, ImageIcon } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { chatAttachmentService as service } from "@/pages/chat/services/chatAttachmentService";
import { formatFileSize } from "@/lib/utils";

function Attachment({
  workspace,
  channel,
  id,
}: {
  workspace: string;
  channel: string;
  id: string;
}) {
  const { t } = useTranslation();
  const actor = useAuthStore((s) => s.user?.id);
  const host = useRef<HTMLDivElement>(null);
  const image = useRef<HTMLImageElement>(null);
  const [visible, setVisible] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");
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
  const previewable =
    !!meta.data &&
    ["image/jpeg", "image/png", "image/webp"].includes(meta.data.mimeType) &&
    meta.data.byteSize <= 10 * 1024 * 1024;
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
    const element = image.current;
    if (!allowed || !preview.data || !element) return;
    const url = URL.createObjectURL(preview.data);
    element.src = url;
    return () => {
      element.removeAttribute("src");
      URL.revokeObjectURL(url);
    };
  }, [allowed, preview.data]);
  const download = async () => {
    setDownloading(true);
    setDownloadError("");
    try {
      // Re-authorize both metadata and binary on every explicit open/download.
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
    (meta.isError &&
      isAxiosError(meta.error) &&
      meta.error.response?.status === 403);
  return (
    <div
      ref={host}
      className="border-border bg-card mt-2 w-full max-w-sm rounded-lg border p-3"
    >
      {meta.isPending ? (
        <Skeleton className="h-20 w-full" />
      ) : !allowed ? (
        <div
          className="text-muted-foreground flex items-center gap-2 text-xs"
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
      ) : (
        <>
          {previewable && !preview.isError && (
            <div className="bg-muted relative mb-2 overflow-hidden rounded-md">
              {preview.isPending && <Skeleton className="h-32 w-full" />}
              <img
                ref={image}
                alt={meta.data.filename}
                className="max-h-64 w-full object-contain"
                loading="lazy"
              />
            </div>
          )}
          <div className="flex min-w-0 items-center gap-2">
            {previewable ? (
              <ImageIcon className="text-muted-foreground size-4 shrink-0" />
            ) : (
              <FileText className="text-muted-foreground size-4 shrink-0" />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium">
                {meta.data.filename}
              </p>
              <p className="text-muted-foreground text-[11px]">
                {formatFileSize(meta.data.byteSize)}
                {meta.data.source === "REPOSITORY"
                  ? ` · ${t("chat.attachments.version", { version: meta.data.versionNumber })}`
                  : ""}
              </p>
            </div>
            <Button
              variant="secondary"
              size="icon"
              className="size-8"
              loading={downloading}
              disabled={downloading}
              onClick={() => void download()}
              aria-label={t("chat.attachments.download")}
            >
              <Download className="size-4" />
            </Button>
          </div>
          {downloadError && (
            <p role="alert" className="text-destructive mt-2 text-xs">
              {downloadError}
            </p>
          )}
        </>
      )}
    </div>
  );
}

export function ChatMessageAttachments({
  workspace,
  channel,
  ids,
}: {
  workspace: string;
  channel: string;
  ids?: string[];
}) {
  return (
    <>
      {ids?.slice(0, 5).map((id) => (
        <Attachment key={id} workspace={workspace} channel={channel} id={id} />
      ))}
    </>
  );
}
