import { useTranslation } from "react-i18next";
import {
  ChevronDown,
  Download,
  RotateCcw,
  Sparkles,
  Stamp,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { MaterialItem } from "@/types/material";

const RASTER_DOWNLOAD_FORMATS = ["png", "jpg", "webp"] as const;

export function MaterialDetailActions({
  material,
  canDelete,
  canPermanentDelete,
  canRestore,
  canPromoteDraft,
  busy,
  onDownload,
  onWatermark,
  onDelete,
  onPermanentDelete,
  onRestore,
  onPromoteDraft,
}: {
  material: MaterialItem;
  previewUrl?: string;
  canDelete: boolean;
  canPermanentDelete?: boolean;
  canRestore: boolean;
  canPromoteDraft?: boolean;
  busy: boolean;
  onDownload: (format?: string) => void;
  onWatermark: (material: MaterialItem) => void;
  onDelete: (material: MaterialItem) => void;
  onPermanentDelete?: (material: MaterialItem) => void;
  onRestore: (material: MaterialItem) => void;
  onPromoteDraft?: (material: MaterialItem) => void;
}) {
  const { t } = useTranslation();
  const isImage =
    material.mediaKind === "IMAGE" || material.mimeType?.startsWith("image/");
  const isRasterConvertible =
    isImage && material.mimeType?.toLowerCase() !== "image/svg+xml";
  const isDeleted = Boolean(material.deletedAt);
  const isPurging = material.status === "PURGE_IN_PROGRESS";
  const isDraft = Boolean(material.draft);

  return (
    <div
      data-slot="material-detail-footer"
      className="shrink-0 border-t border-border/80 bg-card/95 px-5 py-3.5 backdrop-blur-xs"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {!isDeleted && !isPurging && !isRasterConvertible && (
            <Button
              type="button"
              size="sm"
              disabled={busy}
              onClick={() => onDownload()}
              className="h-9 rounded-xl bg-brand-orange px-4 text-xs font-semibold text-white shadow-2xs hover:bg-brand-orange/90"
            >
              <Download className="mr-1.5 h-3.5 w-3.5" />
              {t("common.download", "Tải xuống")}
            </Button>
          )}

          {!isDeleted && !isPurging && isRasterConvertible && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  size="sm"
                  disabled={busy}
                  className="h-9 rounded-xl bg-brand-orange px-3.5 text-xs font-semibold text-white shadow-2xs hover:bg-brand-orange/90"
                >
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                  <span>{t("common.download", "Tải xuống")}</span>
                  <ChevronDown className="ml-1 h-3.5 w-3.5 opacity-85" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="rounded-xl">
                <DropdownMenuItem
                  onSelect={() => onDownload()}
                  className="text-xs font-medium text-foreground focus:bg-brand-orange/10 focus:text-brand-orange"
                >
                  {t("library.repository.download.original", "Định dạng gốc")}
                </DropdownMenuItem>
                {RASTER_DOWNLOAD_FORMATS.map((fmt) => (
                  <DropdownMenuItem
                    key={fmt}
                    onSelect={() => onDownload(fmt)}
                    className="text-xs font-medium text-foreground focus:bg-brand-orange/10 focus:text-brand-orange"
                  >
                    {t(
                      `library.repository.download.${fmt}`,
                      `Tải bản .${fmt.toUpperCase()}`,
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {!isDeleted &&
            !isPurging &&
            isDraft &&
            canPromoteDraft &&
            onPromoteDraft && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={busy}
                onClick={() => onPromoteDraft(material)}
                className="h-9 rounded-xl border-brand-orange/40 bg-brand-orange/10 px-3 text-xs font-semibold text-brand-orange hover:bg-brand-orange hover:text-white"
              >
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                {t(
                  "library.repository.actions.saveToLibrary",
                  "Lưu vào kho chính",
                )}
              </Button>
            )}

          {!isDeleted && !isPurging && isImage && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onWatermark(material)}
              className="h-9 rounded-xl px-3 text-xs font-semibold text-foreground hover:border-brand-orange/50 hover:bg-brand-orange/10 hover:text-brand-orange"
            >
              <Stamp className="mr-1.5 h-3.5 w-3.5" />
              {t("library.media.watermarkAction", "Watermark")}
            </Button>
          )}

          {isDeleted && !isPurging && canRestore && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() => onRestore(material)}
              className="h-9 rounded-xl px-3.5 text-xs font-semibold text-foreground hover:border-brand-orange/50 hover:bg-brand-orange/10 hover:text-brand-orange"
            >
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
              {t("library.repository.actions.restore", "Khôi phục")}
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!isDeleted && !isPurging && canDelete && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() => onDelete(material)}
              className="h-9 rounded-xl border-destructive/30 bg-destructive/5 px-3 text-xs font-semibold text-destructive hover:border-destructive hover:bg-destructive hover:text-white"
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              {t("library.repository.actions.moveToTrash", "Thùng rác")}
            </Button>
          )}

          {isDeleted &&
            !isPurging &&
            canPermanentDelete &&
            onPermanentDelete && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={busy}
                onClick={() => onPermanentDelete(material)}
                className="h-9 rounded-xl px-3.5 text-xs font-semibold text-white"
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                {t(
                  "library.repository.actions.permanentDelete",
                  "Xoá vĩnh viễn",
                )}
              </Button>
            )}
        </div>
      </div>
    </div>
  );
}
