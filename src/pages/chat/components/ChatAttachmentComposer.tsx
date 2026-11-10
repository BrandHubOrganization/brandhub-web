import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FolderOpen,
  ImagePlus,
  Plus,
  X,
  FileText,
  RotateCw,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import { ChatRepositoryPicker } from "@/pages/chat/components/ChatRepositoryPicker";
import type { useChatAttachmentDraft } from "@/pages/chat/hooks/useChatAttachmentDraft";
import type { ChatAttachmentDraft } from "@/pages/chat/types/chatAttachment";
import { cn, formatFileSize } from "@/lib/utils";

export function AdobePdfIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M19.38 12.3c-.6-.7-1.9-1.1-3.6-1.1-1.7 0-3.3.4-4.7 1-1.1-1.4-2-3-2.6-4.7.7-.6 1.3-1.3 1.7-2.1.7-1.3.9-2.5.4-3.2-.5-.7-1.5-.7-2.4-.1-.9.7-1.6 1.9-2.1 3.5-.2.8-.3 1.7-.3 2.5 0 .2 0 .5.1.7-.7 1.7-1.5 3.5-2.4 5.2-1.4.7-2.8 1.6-3.8 2.6-1.3 1.3-1.9 2.5-1.5 3.3.4.8 1.4.9 2.5.4 1.3-.6 2.7-1.7 4.1-3.2 2-.5 4.3-.9 6.7-1 1.3.8 2.6 1.4 3.9 1.6 1.4.2 2.3 0 2.8-.7.6-.8.4-2.2-1.2-3.7zM7.4 12.8c-.8.8-1.8 1.4-2.8 1.8.4-1.3.9-2.7 1.5-4.1.4.8.9 1.6 1.3 2.3zm5.7-6.2c-.3 1.1-.9 2.4-1.7 3.7-.4-.8-.7-1.7-.9-2.6.5-.4 1.1-.8 1.8-1.1.3 0 .5 0 .8 0zm-1.8 7.3c1.3-.8 2.8-1.4 4.5-1.7-.5 1-1.2 1.8-2 2.3-.8.2-1.7-.1-2.5-.6z" />
    </svg>
  );
}

function getDraftKind(
  item: ChatAttachmentDraft,
): "image" | "video" | "pdf" | "document" {
  const type = item.file?.type || item.attachment?.mimeType || "";
  const ext = item.filename.toLowerCase().split(".").pop() || "";
  if (
    type.startsWith("image/") ||
    ["jpg", "jpeg", "png", "webp", "gif"].includes(ext)
  ) {
    return "image";
  }
  if (
    type.startsWith("video/") ||
    ["mp4", "mov", "webm", "quicktime"].includes(ext)
  ) {
    return "video";
  }
  if (type === "application/pdf" || ext === "pdf") {
    return "pdf";
  }
  return "document";
}

function DraftMediaThumbnail({
  item,
  kind,
  disabled,
  onRemove,
  onRetry,
}: {
  item: ChatAttachmentDraft;
  kind: "image" | "video";
  disabled: boolean;
  onRemove: () => void;
  onRetry: () => void;
}) {
  const { t } = useTranslation();
  const [url, setUrl] = useState<string>("");
  const isVideo = kind === "video";

  useEffect(() => {
    if (!item.file) {
      setUrl("");
      return;
    }
    const objectUrl = URL.createObjectURL(item.file);
    setUrl(objectUrl);
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [item.file]);

  if (item.status === "uploading") {
    return (
      <div className="group relative flex size-[76px] shrink-0 flex-col items-center justify-center gap-1.5 overflow-hidden rounded-2xl border border-border/80 bg-muted/40 p-3 shadow-2xs">
        <div className="h-2 w-full animate-pulse rounded-full bg-muted-foreground/15" />
        <div className="h-2 w-4/5 animate-pulse rounded-full bg-muted-foreground/15" />
        <div className="h-2 w-3/5 animate-pulse rounded-full bg-muted-foreground/15" />
        <button
          type="button"
          disabled={disabled}
          className="absolute top-1 right-1 z-10 flex size-5 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white opacity-0 shadow-xs transition-opacity hover:bg-black/80 group-hover:opacity-100"
          onClick={onRemove}
          aria-label={t("chat.attachments.remove", { name: item.filename })}
        >
          <X className="size-3" />
        </button>
      </div>
    );
  }

  if (item.status === "error") {
    return (
      <div className="group relative flex size-[76px] shrink-0 flex-col items-center justify-center gap-1 overflow-hidden rounded-2xl border border-destructive/60 bg-destructive/10 p-2 shadow-2xs">
        {item.file && (
          <button
            type="button"
            disabled={disabled}
            onClick={onRetry}
            className="cursor-pointer p-1 text-destructive transition-transform hover:scale-110"
            aria-label={t("chat.actions.retry")}
          >
            <RotateCw className="size-4" />
          </button>
        )}
        <span className="max-w-full truncate text-[10px] font-medium text-destructive">
          {t("chat.attachments.failed")}
        </span>
        <button
          type="button"
          disabled={disabled}
          className="absolute top-1 right-1 z-10 flex size-5 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white opacity-0 shadow-xs transition-opacity hover:bg-black/80 group-hover:opacity-100"
          onClick={onRemove}
          aria-label={t("chat.attachments.remove", { name: item.filename })}
        >
          <X className="size-3" />
        </button>
      </div>
    );
  }

  return (
    <div className="group relative size-[76px] shrink-0 overflow-hidden rounded-2xl border border-border/80 bg-muted/30 shadow-2xs">
      {isVideo ? (
        url ? (
          <video
            src={url}
            className="size-full rounded-2xl object-cover"
            preload="metadata"
            muted
            playsInline
          />
        ) : (
          <div className="flex size-full items-center justify-center rounded-2xl bg-zinc-900 text-zinc-400">
            <Play className="size-6 text-zinc-400" />
          </div>
        )
      ) : url ? (
        <img
          src={url}
          alt={item.filename}
          className="size-full rounded-2xl object-cover"
        />
      ) : (
        <div className="flex size-full items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <ImagePlus className="size-6" />
        </div>
      )}
      {isVideo && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="flex size-7 items-center justify-center rounded-full bg-black/50 text-white shadow-sm backdrop-blur-xs">
            <Play className="size-3.5 translate-x-0.5 fill-white text-white" />
          </div>
        </div>
      )}
      <button
        type="button"
        disabled={disabled}
        className="absolute top-1 right-1 z-10 flex size-5 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white opacity-0 shadow-xs transition-opacity hover:bg-black/80 group-hover:opacity-100"
        onClick={onRemove}
        aria-label={t("chat.attachments.remove", { name: item.filename })}
      >
        <X className="size-3" />
      </button>
    </div>
  );
}

function DraftDocumentCard({
  item,
  kind,
  disabled,
  onRemove,
  onRetry,
}: {
  item: ChatAttachmentDraft;
  kind: "pdf" | "document";
  disabled: boolean;
  onRemove: () => void;
  onRetry: () => void;
}) {
  const { t } = useTranslation();
  const isPdf = kind === "pdf";
  const ext =
    item.filename.split(".").pop()?.toUpperCase() || (isPdf ? "PDF" : "DOC");

  return (
    <div className="group relative flex h-[76px] min-w-[220px] max-w-[280px] shrink-0 items-center gap-3 rounded-2xl border border-border/80 bg-card p-3 shadow-2xs transition-colors hover:border-border">
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
          className="max-w-[170px] truncate text-xs font-semibold text-foreground"
          title={item.filename}
        >
          {item.filename}
        </p>
        <p className="mt-0.5 text-[11px] font-medium uppercase text-muted-foreground">
          {isPdf ? "PDF" : ext}
          {item.file?.size ? ` · ${formatFileSize(item.file.size)}` : ""}
          {item.status === "uploading" &&
            ` · ${t("chat.attachments.uploading")}`}
          {item.status === "error" && ` · ${t("chat.attachments.failed")}`}
        </p>
      </div>
      {item.status === "error" && (
        <button
          type="button"
          disabled={disabled}
          onClick={onRetry}
          className="mr-1 flex size-6 cursor-pointer items-center justify-center rounded-full text-destructive transition-colors hover:bg-destructive/10"
          title={t("chat.actions.retry")}
          aria-label={t("chat.actions.retry")}
        >
          <RotateCw className="size-3.5" />
        </button>
      )}
      <button
        type="button"
        disabled={disabled}
        onClick={onRemove}
        className="absolute -top-1.5 -right-1.5 z-10 flex size-5 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white opacity-0 shadow-xs transition-opacity hover:bg-black/80 group-hover:opacity-100"
        aria-label={t("chat.attachments.remove", { name: item.filename })}
      >
        <X className="size-3" />
      </button>
    </div>
  );
}

export function ChatAttachmentDrafts({
  draft,
  disabled,
}: {
  draft: ReturnType<typeof useChatAttachmentDraft>;
  disabled: boolean;
}) {
  return (
    <>
      {!!draft.items.length && (
        <div
          className="flex flex-wrap items-center gap-2.5 px-3 pt-1 pb-2.5"
          aria-live="polite"
        >
          {draft.items.map((item) => {
            const kind = getDraftKind(item);
            if (kind === "image" || kind === "video") {
              return (
                <DraftMediaThumbnail
                  key={item.key}
                  item={item}
                  kind={kind}
                  disabled={disabled}
                  onRemove={() => draft.remove(item.key)}
                  onRetry={() => draft.retry(item.key)}
                />
              );
            }
            return (
              <DraftDocumentCard
                key={item.key}
                item={item}
                kind={kind}
                disabled={disabled}
                onRemove={() => draft.remove(item.key)}
                onRetry={() => draft.retry(item.key)}
              />
            );
          })}
        </div>
      )}
      {draft.error && (
        <p role="alert" className="px-3 pt-1 pb-2 text-xs text-destructive">
          {draft.error}
        </p>
      )}
    </>
  );
}

export function ChatAttachmentActions({
  draft,
  workspace,
  disabled,
}: {
  draft: ReturnType<typeof useChatAttachmentDraft>;
  workspace: string;
  disabled: boolean;
}) {
  const { t } = useTranslation();
  const [picker, setPicker] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const openRepository = useRef(false);
  return (
    <Popover open={picker} onOpenChange={setPicker}>
      <input
        ref={input}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,application/pdf"
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          draft.addFiles(Array.from(e.target.files ?? []));
          e.target.value = "";
        }}
      />
      <DropdownMenu>
        <PopoverAnchor asChild>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="secondary"
              className="size-8"
              disabled={disabled || draft.items.length >= 5}
              aria-label={t("chat.attachments.add")}
            >
              <Plus className="size-4" />
            </Button>
          </DropdownMenuTrigger>
        </PopoverAnchor>
        <DropdownMenuContent
          align="start"
          side="top"
          onCloseAutoFocus={(event) => {
            if (openRepository.current) {
              event.preventDefault();
              openRepository.current = false;
              requestAnimationFrame(() => setPicker(true));
            }
          }}
        >
          <DropdownMenuItem onSelect={() => input.current?.click()}>
            <ImagePlus className="size-4" />
            {t("chat.attachments.upload")}
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => {
              openRepository.current = true;
            }}
          >
            <FolderOpen className="size-4" />
            {t("chat.attachments.repository")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {picker && (
        <PopoverContent
          side="top"
          align="start"
          sideOffset={8}
          collisionPadding={12}
          aria-label={t("chat.attachments.repository")}
          className="w-[430px] max-w-[calc(100vw-24px)] overflow-hidden rounded-xl p-0"
        >
          <ChatRepositoryPicker
            workspaceId={workspace}
            remaining={5 - draft.items.length}
            onSelect={draft.addMaterial}
            onClose={() => setPicker(false)}
          />
        </PopoverContent>
      )}
    </Popover>
  );
}
