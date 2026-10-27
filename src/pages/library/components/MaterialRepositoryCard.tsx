import { Download, RotateCcw, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { cn, formatFileSize } from "@/lib/utils";
import type { MaterialItem } from "@/types/material";
import { retentionDays } from "@/pages/library/hooks/materialTrashPolicy";
import { MaterialThumbnail } from "@/pages/library/components/MaterialThumbnail";
import { MaterialBadges } from "@/pages/library/components/MaterialBadges";

interface Props {
  material: MaterialItem;
  deleted: boolean;
  pending: boolean;
  downloading?: boolean;
  onDownload?: () => void;
  onDelete: () => void;
  onRestore: () => void;
  onOpen: () => void;
}

export function MaterialRepositoryCard({
  material,
  deleted,
  pending,
  downloading = false,
  onDownload,
  onDelete,
  onRestore,
  onOpen,
}: Props) {
  const { t } = useTranslation();
  const days = retentionDays(material);
  return (
    <article
      className={cn(
        "border-border bg-card min-w-0 space-y-3 rounded-xl border p-3 shadow-xs",
        deleted && "border-dashed",
      )}
    >
      <Button
        variant="ghost"
        className="text-foreground block h-auto w-full min-w-0 space-y-3 p-0 text-left whitespace-normal"
        disabled={deleted}
        onClick={onOpen}
        aria-label={t("library.repository.openLabel", { name: material.name })}
      >
        <MaterialThumbnail
          key={material.previewUrl ?? material.id}
          material={material}
        />
        <span
          className="block truncate text-sm font-semibold"
          title={material.name}
        >
          {material.name}
        </span>
      </Button>
      <MaterialBadges material={material} />
      <p className="text-muted-foreground text-xs">
        {formatFileSize(material.fileSize ?? 0)}
      </p>
      {deleted && (
        <p className="text-muted-foreground text-xs">
          {material.status === "PURGE_IN_PROGRESS"
            ? t("library.trash.purging")
            : material.purgeBlockedReason
              ? t("library.trash.referenced")
              : days > 0
                ? t("library.trash.daysRemaining", { count: days })
                : t("library.trash.retentionExpired")}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {!deleted && (
          <Button variant="outline" size="sm" onClick={onOpen}>
            {t("library.trash.details")}
          </Button>
        )}
        {!deleted &&
          material.status === "READY" &&
          material.capabilities?.canDownload &&
          onDownload && (
            <Button
              variant="outline"
              size="sm"
              disabled={downloading}
              aria-busy={downloading}
              aria-label={t("library.repository.downloadAriaLabel", {
                name: material.name,
              })}
              onClick={onDownload}
            >
              <Download className="size-4" />
              {t(
                downloading
                  ? "library.repository.preparingDownload"
                  : "library.repository.download",
              )}
            </Button>
          )}
        {deleted
          ? material.capabilities?.canRestore && (
              <Button
                variant="outline"
                size="sm"
                disabled={pending || days === 0}
                aria-label={t("library.trash.restoreLabel", {
                  name: material.name,
                })}
                onClick={onRestore}
              >
                <RotateCcw />
                {t("library.trash.restore")}
              </Button>
            )
          : material.capabilities?.canDelete && (
              <Button
                variant="ghost"
                size="sm"
                disabled={pending}
                aria-label={t("library.trash.deleteLabel", {
                  name: material.name,
                })}
                onClick={onDelete}
              >
                <Trash2 />
                {t("library.trash.moveToTrash")}
              </Button>
            )}
      </div>
    </article>
  );
}
