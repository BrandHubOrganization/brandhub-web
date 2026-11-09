import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FolderOpen,
  ImagePlus,
  Plus,
  X,
  Loader2,
  FileText,
  RotateCw,
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

export function ChatAttachmentDrafts({
  draft,
  disabled,
}: {
  draft: ReturnType<typeof useChatAttachmentDraft>;
  disabled: boolean;
}) {
  const { t } = useTranslation();
  return (
    <>
      {!!draft.items.length && (
        <div className="flex flex-wrap gap-2 px-3 pt-2" aria-live="polite">
          {draft.items.map((item) => (
            <div
              key={item.key}
              className="border-border bg-muted flex max-w-full items-center gap-2 rounded-md border px-2 py-1.5 text-xs"
            >
              {item.status === "uploading" ? (
                <Loader2 className="size-4 shrink-0 animate-spin" />
              ) : (
                <FileText className="size-4 shrink-0" />
              )}
              <div className="min-w-0">
                <p className="max-w-48 truncate">{item.filename}</p>
                <p className="text-muted-foreground text-[11px]">
                  {item.status === "uploading"
                    ? t("chat.attachments.uploading")
                    : item.status === "error"
                      ? t("chat.attachments.failed")
                      : item.attachment?.source === "REPOSITORY"
                        ? t("chat.attachments.version", {
                            version: item.attachment.versionNumber,
                          })
                        : t("chat.attachments.uploaded")}
                </p>
              </div>
              {item.status === "error" && item.file && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-7"
                  disabled={disabled}
                  onClick={() => draft.retry(item.key)}
                  aria-label={t("chat.actions.retry")}
                >
                  <RotateCw className="size-3.5" />
                </Button>
              )}
              <Button
                size="icon"
                variant="ghost"
                className="size-7"
                disabled={disabled || item.status === "uploading"}
                onClick={() => draft.remove(item.key)}
                aria-label={t("chat.attachments.remove", {
                  name: item.filename,
                })}
              >
                <X className="size-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
      {draft.error && (
        <p role="alert" className="text-destructive px-3 pt-2 text-xs">
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
        accept="image/jpeg,image/png,image/webp,application/pdf"
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
