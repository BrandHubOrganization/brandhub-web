import { FileText, RotateCcw, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { cn, formatFileSize } from "@/lib/utils";
import type { MaterialItem } from "@/types/material";
import { retentionDays } from "@/pages/library/hooks/materialTrashPolicy";

interface Props {
  material: MaterialItem;
  deleted: boolean;
  canMutate: boolean;
  pending: boolean;
  onDelete: () => void;
  onRestore: () => void;
  onOpen: () => void;
}

export function MaterialRepositoryCard({
  material,
  deleted,
  canMutate,
  pending,
  onDelete,
  onRestore,
  onOpen,
}: Props) {
  const { t } = useTranslation();
  const days = retentionDays(material);
  return (
    <article
      className={cn(
        "border-border bg-card flex min-w-0 flex-col gap-3 rounded-xl border p-4 shadow-xs",
        deleted && "border-dashed",
      )}
    >
      <div className="bg-muted flex aspect-video items-center justify-center overflow-hidden rounded-md">
        {!deleted &&
        material.previewUrl &&
        material.mimeType?.startsWith("image/") ? (
          <img
            src={material.previewUrl}
            alt={material.name}
            className="size-full object-contain"
          />
        ) : (
          <FileText
            className={cn(
              "text-muted-foreground size-10",
              deleted && "opacity-60",
            )}
          />
        )}
      </div>
      <h3
        className="text-foreground truncate text-sm font-semibold"
        title={material.name}
      >
        {material.name}
      </h3>
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
      <div className="mt-auto flex flex-wrap gap-2">
        {!deleted && (
          <Button variant="outline" size="sm" onClick={onOpen}>
            {t("library.trash.details")}
          </Button>
        )}
        {canMutate &&
          (deleted ? (
            <Button
              variant="outline"
              size="sm"
              disabled={
                pending || days === 0 || material.status === "PURGE_IN_PROGRESS"
              }
              aria-label={t("library.trash.restoreLabel", {
                name: material.name,
              })}
              onClick={onRestore}
            >
              <RotateCcw />
              {t("library.trash.restore")}
            </Button>
          ) : (
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
          ))}
      </div>
    </article>
  );
}
