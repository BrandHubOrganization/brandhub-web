import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Download,
  Eye,
  FileText,
  Film,
  FolderInput,
  GripVertical,
  Image as ImageIcon,
  MoreVertical,
  RotateCcw,
  Sparkles,
  Stamp,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DRAG_MATERIAL_MIME,
  DRAG_MATERIAL_NAME_MIME,
} from "./MaterialFolderSection";
import type { RepositoryViewMode } from "./MaterialToolbar";
import type { MaterialItem } from "@/types/material";
import { stripExtension } from "@/utils/mediaDownloadHelper";

const units = ["B", "KB", "MB", "GB"];

export function formatBytes(bytes = 0) {
  let value = Math.max(0, bytes);
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }
  return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

export function toRepositoryThumbnailUrl(
  url?: string | null,
): string | undefined {
  if (!url) return undefined;
  if (
    url.includes("/api/v1/repository-media?") &&
    !url.includes("thumbnail=")
  ) {
    return `${url}&thumbnail=true`;
  }
  return url;
}

export function MaterialRepositoryCard({
  material,
  canDelete,
  canPermanentDelete,
  canRestore,
  canPromoteDraft,
  canMove = true,
  hideDraftBadge = false,
  viewMode = "grid",
  onSelect,
  onDownload,
  onWatermark,
  onDelete,
  onPermanentDelete,
  onRestore,
  onPromoteDraft,
  onMoveRequest,
}: {
  material: MaterialItem;
  canDelete: boolean;
  canPermanentDelete?: boolean;
  canRestore: boolean;
  canPromoteDraft?: boolean;
  canMove?: boolean;
  canRename?: boolean;
  hideDraftBadge?: boolean;
  viewMode?: RepositoryViewMode;
  onSelect: (material: MaterialItem) => void;
  onDownload: (material: MaterialItem) => void;
  onRename?: (material: MaterialItem) => void;
  onWatermark: (material: MaterialItem) => void;
  onDelete: (material: MaterialItem) => void;
  onPermanentDelete?: (material: MaterialItem) => void;
  onRestore: (material: MaterialItem) => void;
  onPromoteDraft?: (material: MaterialItem) => void;
  onMoveRequest?: (material: MaterialItem) => void;
}) {
  const { t } = useTranslation();
  const [imageBroken, setImageBroken] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [videoHovered, setVideoHovered] = useState(false);

  const isImage =
    material.mediaKind === "IMAGE" || material.mimeType?.startsWith("image/");
  const isVideo =
    material.mediaKind === "VIDEO" || material.mimeType?.startsWith("video/");
  const thumbUrl = toRepositoryThumbnailUrl(
    material.previewUrl || material.url,
  );
  const isDeleted = Boolean(material.deletedAt);
  const isPurging = material.status === "PURGE_IN_PROGRESS";
  const isDraft = Boolean(material.draft);
  const isDraggable = !isDeleted && !isPurging && canMove;

  const handleDragStart = (event: React.DragEvent) => {
    if (!isDraggable) {
      event.preventDefault();
      return;
    }
    event.dataTransfer.setData(DRAG_MATERIAL_MIME, material.id);
    event.dataTransfer.setData(
      DRAG_MATERIAL_NAME_MIME,
      stripExtension(material.name),
    );
    event.dataTransfer.effectAllowed = "move";
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const renderMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          disabled={isPurging}
          aria-label={t("common.actions", "Tác vụ")}
          onClick={(e) => e.stopPropagation()}
          className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-[4px] p-1.5 transition-colors disabled:opacity-40"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="border-border/80 bg-card w-48 rounded-xl border p-1.5 shadow-xl"
      >
        <DropdownMenuItem
          disabled={isPurging}
          onSelect={() => onSelect(material)}
          className="hover:bg-muted/80 focus:bg-muted/80 flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors"
        >
          <Eye className="text-muted-foreground size-3.5" />
          <span>{t("library.media.details", "Xem chi tiết")}</span>
        </DropdownMenuItem>
        {!isDeleted && !isPurging && (
          <DropdownMenuItem
            onSelect={() => onDownload(material)}
            className="hover:bg-muted/80 focus:bg-muted/80 flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors"
          >
            <Download className="text-muted-foreground size-3.5" />
            <span>{t("common.download", "Tải xuống")}</span>
          </DropdownMenuItem>
        )}
        {!isDeleted && !isPurging && canMove && onMoveRequest && (
          <DropdownMenuItem
            onSelect={() => onMoveRequest(material)}
            className="hover:bg-muted/80 focus:bg-muted/80 flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors"
          >
            <FolderInput className="text-brand-orange size-3.5" />
            <span>Di chuyển tới thư mục...</span>
          </DropdownMenuItem>
        )}
        {!isDeleted &&
          !isPurging &&
          isDraft &&
          canPromoteDraft &&
          onPromoteDraft && (
            <DropdownMenuItem
              onSelect={() => onPromoteDraft(material)}
              className="text-brand-orange hover:bg-brand-orange/10 focus:bg-brand-orange/10 focus:text-brand-orange flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors"
            >
              <Sparkles className="size-3.5" />
              <span>
                {t(
                  "library.repository.actions.saveToLibrary",
                  "Lưu vào kho chính",
                )}
              </span>
            </DropdownMenuItem>
          )}
        {!isDeleted && !isPurging && isImage && (
          <DropdownMenuItem
            onSelect={() => onWatermark(material)}
            className="hover:bg-muted/80 focus:bg-muted/80 flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors"
          >
            <Stamp className="text-muted-foreground size-3.5" />
            <span>
              {t("library.media.watermarkAction", "Đóng dấu Watermark")}
            </span>
          </DropdownMenuItem>
        )}
        {!isDeleted && !isPurging && canDelete && (
          <>
            <DropdownMenuSeparator className="bg-border/60 -mx-1 my-1" />
            <DropdownMenuItem
              onSelect={() => onDelete(material)}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 focus:text-destructive flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors"
            >
              <Trash2 className="size-3.5" />
              <span>
                {t(
                  "library.repository.actions.moveToTrash",
                  "Chuyển vào thùng rác",
                )}
              </span>
            </DropdownMenuItem>
          </>
        )}
        {isDeleted && !isPurging && canRestore && (
          <DropdownMenuItem
            onSelect={() => onRestore(material)}
            className="hover:bg-muted/80 focus:bg-muted/80 flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors"
          >
            <RotateCcw className="text-muted-foreground size-3.5" />
            <span>{t("library.repository.actions.restore", "Khôi phục")}</span>
          </DropdownMenuItem>
        )}
        {isDeleted && !isPurging && canPermanentDelete && onPermanentDelete && (
          <DropdownMenuItem
            onSelect={() => onPermanentDelete(material)}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 focus:text-destructive flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors"
          >
            <Trash2 className="size-3.5" />
            <span>
              {t("library.repository.actions.permanentDelete", "Xoá vĩnh viễn")}
            </span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const versionNum = material.currentVersionNumber ?? material.version ?? 1;
  const hasMultipleVersions = versionNum > 1;

  if (viewMode === "list") {
    const modifiedSource = material.updatedAt || material.createdAt;
    const modifiedDate = modifiedSource
      ? new Date(modifiedSource).toLocaleDateString("vi-VN", {
          day: "numeric",
          month: "short",
        })
      : "—";

    return (
      <div
        draggable={isDraggable}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onClick={() => !isPurging && onSelect(material)}
        className={`group bg-card hover:bg-muted/40 flex cursor-pointer items-center gap-3 px-3.5 py-2.5 transition-colors ${
          isDragging ? "ring-brand-orange opacity-50 ring-2" : ""
        }`}
      >
        {/* Drag handle */}
        <div className="w-4 shrink-0">
          {isDraggable && (
            <GripVertical className="text-muted-foreground/50 group-hover:text-muted-foreground h-4 w-4 cursor-grab" />
          )}
        </div>

        {/* Thumbnail */}
        <div className="bg-muted relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg">
          {isImage && thumbUrl && !imageBroken ? (
            <img
              src={thumbUrl}
              alt={stripExtension(material.name)}
              loading="lazy"
              decoding="async"
              draggable={false}
              onError={() => setImageBroken(true)}
              className="h-full w-full object-cover"
            />
          ) : isVideo ? (
            <Film className="text-brand-orange h-4 w-4" />
          ) : (
            <FileText className="text-muted-foreground h-4 w-4" />
          )}
        </div>

        {/* Name */}
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <p className="text-foreground truncate text-xs font-semibold group-hover:underline">
            {stripExtension(material.name)}
          </p>
          {hasMultipleVersions && (
            <span
              className="bg-brand-orange/10 text-brand-orange inline-flex shrink-0 items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold tabular-nums"
              title={`Phiên bản mới nhất: v${versionNum}`}
            >
              v{versionNum}
            </span>
          )}
        </div>

        {/* Owner */}
        <span className="text-muted-foreground hidden w-[130px] shrink-0 truncate text-xs sm:block">
          {material.createdByName || "—"}
        </span>

        {/* Modified date */}
        <span className="text-muted-foreground hidden w-[110px] shrink-0 text-xs tabular-nums sm:block">
          {modifiedDate}
        </span>

        {/* File size */}
        <span className="text-muted-foreground hidden w-[90px] shrink-0 text-right text-xs tabular-nums sm:block">
          {material.fileSize ? formatBytes(material.fileSize) : "—"}
        </span>

        {/* Menu */}
        <div
          className="w-8 shrink-0 text-right"
          onClick={(e) => e.stopPropagation()}
        >
          {renderMenu()}
        </div>
      </div>
    );
  }

  const TypeIcon = isVideo ? Film : isImage ? ImageIcon : FileText;
  const typeIconColor = isVideo
    ? "text-red-500"
    : isImage
      ? "text-blue-500"
      : "text-muted-foreground";

  return (
    <article
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`group bg-muted/60 hover:bg-muted dark:bg-muted/40 dark:hover:bg-muted/70 relative flex flex-col gap-1.5 rounded-2xl p-2 pt-1.5 transition-colors duration-200 ${
        isDragging ? "ring-brand-orange scale-[0.97] opacity-50 ring-2" : ""
      }`}
    >
      <div className="flex items-center gap-2 pl-1.5">
        <button
          type="button"
          onClick={() => !isPurging && onSelect(material)}
          className="flex min-w-0 flex-1 items-center gap-2.5 py-1 text-left"
        >
          <TypeIcon className={`h-4 w-4 shrink-0 ${typeIconColor}`} />
          <p
            className="text-foreground truncate text-[13px] font-medium"
            title={stripExtension(material.name)}
          >
            {stripExtension(material.name)}
          </p>
          {hasMultipleVersions && (
            <span
              className="bg-brand-orange/10 text-brand-orange inline-flex shrink-0 items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold tabular-nums"
              title={`Phiên bản mới nhất: v${versionNum}`}
            >
              v{versionNum}
            </span>
          )}
        </button>
        {renderMenu()}
      </div>

      <button
        type="button"
        disabled={isPurging}
        onClick={() => onSelect(material)}
        onMouseEnter={() => {
          if (isVideo) setVideoHovered(true);
        }}
        onMouseLeave={() => {
          if (isVideo) setVideoHovered(false);
        }}
        className="bg-card relative aspect-[4/3] w-full overflow-hidden rounded-xl text-left disabled:cursor-not-allowed"
      >
        {isImage && thumbUrl && !imageBroken ? (
          <img
            src={thumbUrl}
            alt={stripExtension(material.name)}
            loading="lazy"
            decoding="async"
            draggable={false}
            onError={() => setImageBroken(true)}
            className="h-full w-full object-cover"
          />
        ) : isVideo && material.url && videoHovered ? (
          <video
            src={material.url}
            muted
            playsInline
            autoPlay
            loop
            preload="none"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <TypeIcon
              className={`h-14 w-14 ${typeIconColor}`}
              strokeWidth={1.5}
            />
          </div>
        )}

        {isDraft && !isDeleted && !hideDraftBadge && (
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
            <span className="bg-brand-orange inline-flex items-center gap-1 rounded-[3px] px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
              <Sparkles className="h-2.5 w-2.5" />
              Nháp AI
            </span>
          </div>
        )}

        {isDraggable && (
          <div
            className="absolute top-2.5 right-2.5 rounded-md bg-black/55 p-1 text-white opacity-0 backdrop-blur-xs transition-opacity group-hover:opacity-100"
            title="Kéo thả tệp vào thư mục"
          >
            <GripVertical className="h-3.5 w-3.5" />
          </div>
        )}

        {(isDeleted || isPurging) && (
          <div className="bg-destructive/90 absolute inset-x-0 bottom-0 px-2.5 py-1 text-center text-[10px] font-semibold text-white">
            {isPurging
              ? t("library.repository.badges.purging", "Đang xoá vĩnh viễn...")
              : t("library.repository.badges.trashed", "Trong thùng rác")}
          </div>
        )}
      </button>
    </article>
  );
}
