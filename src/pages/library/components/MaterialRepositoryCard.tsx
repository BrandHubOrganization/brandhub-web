import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Download,
  Eye,
  FileText,
  Film,
  FolderInput,
  Globe,
  GripVertical,
  Image as ImageIcon,
  Lock,
  MoreVertical,
  Pencil,
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

function KindBadge({ material }: { material: MaterialItem }) {
  const isVideo =
    material.mediaKind === "VIDEO" || material.mimeType?.startsWith("video/");
  const isImage =
    material.mediaKind === "IMAGE" || material.mimeType?.startsWith("image/");
  const ext =
    material.name.split(".").pop()?.toUpperCase() ||
    material.mimeType?.split("/").pop()?.toUpperCase() ||
    "FILE";

  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-black/65 px-2 py-0.5 text-[10px] font-bold tracking-wider text-white backdrop-blur-md">
      {isVideo ? (
        <Film className="h-3 w-3 text-brand-orange" />
      ) : isImage ? (
        <ImageIcon className="h-3 w-3 text-emerald-400" />
      ) : (
        <FileText className="h-3 w-3 text-sky-400" />
      )}
      {ext.slice(0, 5)}
    </span>
  );
}

export function MaterialRepositoryCard({
  material,
  canDelete,
  canPermanentDelete,
  canRestore,
  canPromoteDraft,
  canMove = true,
  canRename = false,
  viewMode = "grid",
  onSelect,
  onDownload,
  onRename,
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
    event.dataTransfer.setData(DRAG_MATERIAL_NAME_MIME, material.name);
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
          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 rounded-xl p-1">
        <DropdownMenuItem
          disabled={isPurging}
          onSelect={() => onSelect(material)}
          className="gap-2 rounded-lg text-xs font-medium"
        >
          <Eye className="h-3.5 w-3.5 text-muted-foreground" />
          <span>{t("library.media.details", "Xem chi tiết")}</span>
        </DropdownMenuItem>
        {!isDeleted && !isPurging && (
          <DropdownMenuItem
            onSelect={() => onDownload(material)}
            className="gap-2 rounded-lg text-xs font-medium"
          >
            <Download className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{t("common.download", "Tải xuống")}</span>
          </DropdownMenuItem>
        )}
        {!isDeleted && !isPurging && canRename && onRename && (
          <DropdownMenuItem
            onSelect={() => onRename(material)}
            className="gap-2 rounded-lg text-xs font-medium"
          >
            <Pencil className="h-3.5 w-3.5 text-brand-orange" />
            <span>{t("common.rename", "Đổi tên")}</span>
          </DropdownMenuItem>
        )}
        {!isDeleted && !isPurging && canMove && onMoveRequest && (
          <DropdownMenuItem
            onSelect={() => onMoveRequest(material)}
            className="gap-2 rounded-lg text-xs font-medium"
          >
            <FolderInput className="h-3.5 w-3.5 text-brand-orange" />
            <span>Di chuyển tới thư mục...</span>
          </DropdownMenuItem>
        )}
        {!isDeleted && !isPurging && isDraft && canPromoteDraft && onPromoteDraft && (
          <DropdownMenuItem
            onSelect={() => onPromoteDraft(material)}
            className="gap-2 rounded-lg text-xs font-medium text-brand-orange focus:text-brand-orange"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>
              {t("library.repository.actions.saveToLibrary", "Lưu vào kho chính")}
            </span>
          </DropdownMenuItem>
        )}
        {!isDeleted && !isPurging && isImage && (
          <DropdownMenuItem
            onSelect={() => onWatermark(material)}
            className="gap-2 rounded-lg text-xs font-medium"
          >
            <Stamp className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{t("library.media.watermarkAction", "Đóng dấu Watermark")}</span>
          </DropdownMenuItem>
        )}
        {!isDeleted && !isPurging && canDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => onDelete(material)}
              className="gap-2 rounded-lg text-xs font-medium text-destructive focus:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>{t("library.repository.actions.moveToTrash", "Chuyển vào thùng rác")}</span>
            </DropdownMenuItem>
          </>
        )}
        {isDeleted && !isPurging && canRestore && (
          <DropdownMenuItem
            onSelect={() => onRestore(material)}
            className="gap-2 rounded-lg text-xs font-medium"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>{t("library.repository.actions.restore", "Khôi phục")}</span>
          </DropdownMenuItem>
        )}
        {isDeleted && !isPurging && canPermanentDelete && onPermanentDelete && (
          <DropdownMenuItem
            onSelect={() => onPermanentDelete(material)}
            className="gap-2 rounded-lg text-xs font-medium text-destructive focus:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>
              {t("library.repository.actions.permanentDelete", "Xoá vĩnh viễn")}
            </span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (viewMode === "list") {
    return (
      <div
        draggable={isDraggable}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onClick={() => !isPurging && onSelect(material)}
        className={`group flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-border/70 bg-card px-3.5 py-2.5 transition-all hover:border-brand-orange/40 hover:bg-muted/20 ${
          isDragging ? "opacity-50 ring-2 ring-brand-orange" : ""
        }`}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {isDraggable && (
            <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-muted-foreground/50 group-hover:text-muted-foreground" />
          )}
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
            {isImage && thumbUrl && !imageBroken ? (
              <img
                src={thumbUrl}
                alt={material.name}
                loading="lazy"
                decoding="async"
                draggable={false}
                onError={() => setImageBroken(true)}
                className="h-full w-full object-cover"
              />
            ) : isVideo ? (
              <Film className="h-4 w-4 text-brand-orange" />
            ) : (
              <FileText className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-foreground">
              {material.name}
            </p>
            <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
              <span>{formatBytes(material.fileSize)}</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                {material.visibility === "CLIENT" ? (
                  <>
                    <Globe className="h-3 w-3 text-brand-orange" />
                    <span className="text-brand-orange font-medium">Client</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-3 w-3" />
                    <span>Nội bộ</span>
                  </>
                )}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {renderMenu()}
        </div>
      </div>
    );
  }

  return (
    <article
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-orange/45 hover:shadow-md ${
        isDragging ? "scale-[0.97] opacity-50 ring-2 ring-brand-orange" : ""
      }`}
    >
      {/* Thumbnail Preview Container */}
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
        className="relative aspect-[4/3] w-full overflow-hidden bg-muted/60 text-left disabled:cursor-not-allowed"
      >
        {isImage && thumbUrl && !imageBroken ? (
          <img
            src={thumbUrl}
            alt={material.name}
            loading="lazy"
            decoding="async"
            draggable={false}
            onError={() => setImageBroken(true)}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
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
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-muted/50 to-muted text-muted-foreground">
            {isVideo ? (
              <Film className="h-9 w-9 text-brand-orange/80" />
            ) : (
              <FileText className="h-9 w-9 text-muted-foreground/70" />
            )}
          </div>
        )}

        {/* Top-left file kind badge */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <KindBadge material={material} />
          {isDraft && !isDeleted && (
            <span className="inline-flex items-center gap-1 rounded-md bg-brand-orange px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
              <Sparkles className="h-2.5 w-2.5" />
              Nháp AI
            </span>
          )}
        </div>

        {/* Top-right drag handle hint on hover */}
        {isDraggable && (
          <div
            className="absolute top-2.5 right-2.5 rounded-md bg-black/55 p-1 text-white opacity-0 backdrop-blur-xs transition-opacity group-hover:opacity-100"
            title="Kéo thả tệp vào thư mục"
          >
            <GripVertical className="h-3.5 w-3.5" />
          </div>
        )}

        {/* Status banner if deleted or purging */}
        {(isDeleted || isPurging) && (
          <div className="absolute inset-x-0 bottom-0 bg-destructive/90 px-2.5 py-1 text-center text-[10px] font-semibold text-white">
            {isPurging
              ? t("library.repository.badges.purging", "Đang xoá vĩnh viễn...")
              : t("library.repository.badges.trashed", "Trong thùng rác")}
          </div>
        )}
      </button>

      {/* Card Footer */}
      <div className="flex items-center justify-between gap-2 p-3">
        <button
          type="button"
          onClick={() => !isPurging && onSelect(material)}
          className="min-w-0 flex-1 text-left"
        >
          <p
            className="truncate text-xs font-semibold text-foreground group-hover:text-brand-orange transition-colors"
            title={material.name}
          >
            {material.name}
          </p>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="font-medium tabular-nums">
              {formatBytes(material.fileSize)}
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              {material.visibility === "CLIENT" ? (
                <>
                  <Globe className="h-3 w-3 text-brand-orange" />
                  <span className="font-medium text-brand-orange">Client</span>
                </>
              ) : (
                <>
                  <Lock className="h-3 w-3" />
                  <span>Nội bộ</span>
                </>
              )}
            </span>
          </div>
        </button>

        {renderMenu()}
      </div>
    </article>
  );
}
