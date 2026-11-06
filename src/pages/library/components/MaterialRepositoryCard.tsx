import { FolderPlus, MoreHorizontal, RotateCcw, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn, formatFileSize } from "@/lib/utils";
import type { MaterialItem } from "@/types/material";
import {
  draftRetentionDays,
  retentionDays,
} from "@/pages/library/hooks/materialTrashPolicy";
import { MaterialThumbnail } from "@/pages/library/components/MaterialThumbnail";
import { MaterialBadges } from "@/pages/library/components/MaterialBadges";
import { DownloadFormatDropdown } from "@/components/common/DownloadFormatDropdown";
import type { DownloadFormat } from "@/utils/mediaDownloadHelper";

interface Props {
  material: MaterialItem;
  deleted: boolean;
  pending: boolean;
  downloading?: boolean;
  onDownload?: (format?: DownloadFormat) => void;
  onPromote?: () => void;
  onDelete: () => void;
  onRestore: () => void;
  onPurge?: () => void;
  onOpen: () => void;
}

export function MaterialRepositoryCard({
  material,
  deleted,
  pending,
  downloading = false,
  onDownload,
  onPromote,
  onDelete,
  onRestore,
  onPurge,
  onOpen,
}: Props) {
  const { t } = useTranslation();
  const days = retentionDays(material);
  const draftDays = draftRetentionDays(material);
  return (
    <article
      className={cn(
        "border-border bg-card hover:border-brand-orange/40 group flex min-w-0 flex-col gap-2 rounded-xl border p-2.5 shadow-2xs transition-all hover:shadow-xs",
        deleted && "border-dashed",
      )}
    >
      <Button
        variant="ghost"
        className="text-foreground block h-auto w-full min-w-0 space-y-2 p-0 text-left whitespace-normal"
        disabled={deleted}
        onClick={onOpen}
        aria-label={t("library.repository.openLabel", { name: material.name })}
      >
        <MaterialThumbnail
          key={`${material.id}:${material.version}:${material.status}:${!!material.previewUrl}`}
          material={material}
        />
        <div className="flex items-center justify-between gap-2 px-0.5">
          <span
            className="group-hover:text-brand-orange block min-w-0 flex-1 truncate text-xs font-semibold transition-colors"
            title={material.name}
          >
            {material.name}
          </span>
          <span className="text-muted-foreground shrink-0 text-[11px] tabular-nums">
            {formatFileSize(material.fileSize ?? 0)}
          </span>
        </div>
      </Button>
      {(material.draft ||
        material.rawWarning ||
        material.purpose === "BRAND_REFERENCE") && (
        <MaterialBadges material={material} compact />
      )}
      {!deleted && material.draft && draftDays > 0 && (
        <p className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
          {t("library.trash.draftDaysRemaining", { count: draftDays })}
        </p>
      )}
      {deleted && (
        <p className="text-muted-foreground text-[11px]">
          {material.status === "PURGE_IN_PROGRESS"
            ? t("library.trash.purging")
            : material.purgeBlockedReason
              ? t("library.trash.referenced")
              : days > 0
                ? t("library.trash.daysRemaining", { count: days })
                : t("library.trash.retentionExpired")}
        </p>
      )}
      <div className="border-border mt-auto flex flex-wrap items-center gap-1 border-t pt-2">
        {!deleted && (
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={onOpen}
          >
            {t("library.simple.open")}
          </Button>
        )}
        {!deleted &&
          material.status === "READY" &&
          material.capabilities?.canDownload &&
          onDownload && (
            <DownloadFormatDropdown
              mediaKind={material.mediaKind || "IMAGE"}
              disabled={downloading}
              className="h-7 px-2 text-xs"
              label={t(
                downloading
                  ? "library.repository.preparingDownload"
                  : "library.repository.download",
              )}
              onSelectFormat={(format) => onDownload(format)}
            />
          )}
        {!deleted && material.draft && onPromote && (
          <Button
            variant="secondary"
            size="sm"
            className="h-7 px-2 text-xs"
            disabled={pending}
            onClick={onPromote}
            data-testid="promote-draft-btn"
          >
            <FolderPlus className="size-3.5" />
            {t("library.trash.promoteToLibrary")}
          </Button>
        )}
        {deleted && material.capabilities?.canPurge && onPurge && (
          <Button
            variant="destructive"
            size="sm"
            className="ml-auto h-7 px-2 text-xs"
            disabled={pending}
            onClick={onPurge}
          >
            <Trash2 className="size-3.5" />
            {t("library.trash.purge")}
          </Button>
        )}
        {deleted
          ? material.capabilities?.canRestore && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs"
                disabled={pending || days === 0}
                aria-label={t("library.trash.restoreLabel", {
                  name: material.name,
                })}
                onClick={onRestore}
              >
                <RotateCcw className="size-3.5" />
                {t("library.trash.restore")}
              </Button>
            )
          : material.capabilities?.canDelete && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto h-7 w-7 p-0 text-xs"
                    aria-label={t("library.simple.actions", {
                      name: material.name,
                    })}
                  >
                    <MoreHorizontal className="size-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    variant="destructive"
                    disabled={pending}
                    onSelect={onDelete}
                  >
                    <Trash2 className="size-4" />
                    {t("library.trash.moveToTrash")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
      </div>
    </article>
  );
}
