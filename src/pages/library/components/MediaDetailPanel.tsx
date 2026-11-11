import { useRef, useState } from "react";
import { isAxiosError } from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  FileText,
  Film,
  Image as ImageIcon,
  Loader2,
  Pencil,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { formatFileSize } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { useMaterialDetail } from "@/pages/library/hooks/useMaterialDetail";
import { MaterialBadges } from "@/pages/library/components/MaterialBadges";
import { MaterialPreview } from "@/pages/library/components/MaterialPreview";
import { MaterialMetadataEditForm } from "@/pages/library/components/MaterialMetadataEditForm";
import { MaterialVersionHistoryPanel } from "@/pages/library/components/MaterialVersionHistoryPanel";
import { MaterialDetailFacts } from "@/pages/library/components/MaterialDetailFacts";
import { MaterialDetailActions } from "@/pages/library/components/MaterialDetailActions";
import { materialService } from "@/services/materialService";
import type { DownloadFormat } from "@/utils/mediaDownloadHelper";
import type { MaterialItem } from "@/types/material";

interface Props {
  workspaceId?: string;
  material: MaterialItem | null;
  open?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canPermanentDelete?: boolean;
  canRestore?: boolean;
  canPromoteDraft?: boolean;
  quotaExceeded?: boolean;
  downloading?: boolean;
  onDownload?: (material: MaterialItem, format?: DownloadFormat) => void;
  onPromote?: (material: MaterialItem) => void;
  onPromoteDraft?: (material: MaterialItem) => void;
  onUpdated?: (updated: MaterialItem) => void;
  onWatermark?: (material: MaterialItem) => void;
  onWatermarked?: () => void;
  onPermanentDelete?: (material: MaterialItem) => void;
  onRestore?: (material: MaterialItem) => void;
  onClose: () => void;
  onDelete: (material: MaterialItem) => void;
}

export function MediaDetailPanel(props: Props) {
  return props.material ? (
    <DetailView
      key={`${props.material.workspaceId}:${props.material.id}`}
      {...props}
      material={props.material}
    />
  ) : null;
}

function DetailView({
  workspaceId,
  material: selected,
  canEdit = true,
  canDelete = true,
  canPermanentDelete = false,
  canRestore = false,
  canPromoteDraft = false,
  downloading = false,
  onDownload,
  onPromote,
  onPromoteDraft,
  onUpdated,
  onWatermark,
  onWatermarked,
  onPermanentDelete,
  onRestore,
  onClose,
  onDelete,
}: Props & { material: MaterialItem }) {
  const { t } = useTranslation();
  const client = useQueryClient();
  const actor = useAuthStore((state) => state.user?.id);
  const wsId = workspaceId || selected.workspaceId;
  const query = useMaterialDetail(wsId, selected.id);
  const [editing, setEditing] = useState(false);
  const editButton = useRef<HTMLButtonElement>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const material = query.data ?? selected;
  const label = (key: string, fallback?: string) =>
    t(`library.repository.${key}`, fallback ?? key);
  const detailKey = ["material-detail", wsId, actor, selected.id];

  const endEdit = () => {
    setEditing(false);
    requestAnimationFrame(() => editButton.current?.focus());
  };

  function saved(updated: MaterialItem) {
    client.setQueryData(detailKey, updated);
    void client.invalidateQueries({
      queryKey: ["materials", wsId],
    });
    onUpdated?.(updated);
    toast.success(label("updateSuccess", "Đã cập nhật thông tin tệp"));
    endEdit();
  }

  function resetUnavailable() {
    endEdit();
    void client.resetQueries({ queryKey: detailKey, exact: true });
    void client.invalidateQueries({
      queryKey: ["materials", wsId],
    });
  }

  const handleDownloadInternal = async (format?: string) => {
    if (onDownload) {
      onDownload(material, format as DownloadFormat | undefined);
      return;
    }
    try {
      const target = await materialService.download(
        wsId,
        material.id,
        undefined,
        undefined,
        format,
      );
      window.open(target.downloadUrl, "_blank", "noopener,noreferrer");
    } catch {
      toast.error(label("toast.downloadError", "Không thể tải tệp xuống"));
    }
  };

  const unavailable =
    isAxiosError(query.error) &&
    [403, 404].includes(query.error.response?.status ?? 0);

  const isVideo =
    material.mediaKind === "VIDEO" || material.mimeType?.startsWith("video/");
  const isImage =
    material.mediaKind === "IMAGE" || material.mimeType?.startsWith("image/");
  const KindIcon = isVideo ? Film : isImage ? ImageIcon : FileText;
  const extLabel = (
    material.name?.split(".").pop() ||
    material.mimeType?.split("/").pop() ||
    "FILE"
  ).toUpperCase();

  return (
    <Sheet
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent
        className="flex h-full w-full flex-col gap-0 overflow-hidden border-l border-border bg-background p-0 text-foreground shadow-2xl sm:max-w-md lg:max-w-lg [&>button:last-child]:hidden"
        onOpenAutoFocus={() => {
          trigger.current =
            document.activeElement instanceof HTMLElement
              ? document.activeElement
              : null;
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          if (trigger.current?.isConnected) trigger.current.focus();
        }}
        onEscapeKeyDown={(event) => {
          if (editing) {
            event.preventDefault();
            endEdit();
          }
        }}
      >
        {/* Clean Web-aligned Light/Card Header */}
        <SheetHeader className="shrink-0 flex-row items-center justify-between gap-3 border-b border-border/80 bg-card px-5 py-4 text-left">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-orange/10 text-brand-orange">
              <KindIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <SheetTitle className="truncate text-sm font-bold text-foreground sm:text-base">
                {material?.name ?? selected.name}
              </SheetTitle>
              <SheetDescription className="truncate text-xs text-muted-foreground">
                {extLabel}
                {material.fileSize != null
                  ? ` • ${formatFileSize(material.fileSize)}`
                  : ""}{" "}
                • {label("detailDescription", "Thông tin và bản xem trước tư liệu")}
              </SheetDescription>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            {canEdit && !material.deletedAt && !editing && (
              <Button
                ref={editButton}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditing(true)}
                className="h-8 gap-1.5 rounded-xl px-2.5 text-xs font-semibold text-foreground hover:border-brand-orange/50 hover:bg-brand-orange/10 hover:text-brand-orange"
              >
                <Pencil className="h-3.5 w-3.5" />
                <span>Chỉnh sửa</span>
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label={label("close", "Đóng")}
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        {/* Scrollable Content Body */}
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-5">
          {query.isPending && !query.data && (
            <div
              role="status"
              className="flex items-center gap-2 rounded-xl border border-border/60 bg-card px-3.5 py-2.5 text-xs text-muted-foreground"
            >
              <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-orange" />
              <span>{t("library.trash.loading", "Đang tải chi tiết tệp...")}</span>
            </div>
          )}

          {query.isError ? (
            <div
              role="alert"
              className="space-y-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm"
            >
              <p className="font-medium text-destructive">
                {label(
                  unavailable ? "unavailable" : "loadError",
                  "Không thể tải chi tiết tệp",
                )}
              </p>
              {!unavailable && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void query.refetch()}
                  className="rounded-xl text-xs font-semibold text-foreground hover:border-brand-orange hover:text-brand-orange"
                >
                  {label("retry", "Thử lại")}
                </Button>
              )}
            </div>
          ) : (
            material && (
              <>
                {editing ? (
                  <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-2xs">
                    <MaterialMetadataEditForm
                      key={`${material.id}:${material.version}`}
                      material={material}
                      onSaved={saved}
                      onCancel={endEdit}
                      onReload={() => void query.refetch()}
                      onUnavailable={resetUnavailable}
                    />
                  </div>
                ) : (
                  <>
                    {/* 1. Hero Visual Preview */}
                    <MaterialPreview
                      key={`${material.id}:${material.version}:${material.previewExpiresAt}`}
                      material={material}
                      onUnavailable={resetUnavailable}
                    />

                    {/* 2. Concise Status Pills */}
                    <MaterialBadges material={material} />

                    {/* 3. Structured File Facts Card */}
                    <MaterialDetailFacts material={material} />

                    {/* 4. Folder Move & Version History Card */}
                    <MaterialVersionHistoryPanel
                      workspaceId={wsId}
                      material={material}
                      canEdit={canEdit}
                      onChanged={() => {
                        void query.refetch();
                        onWatermarked?.();
                      }}
                    />
                  </>
                )}
              </>
            )
          )}
        </div>

        {/* Sticky Bottom Action Bar */}
        {!query.isError && material && !editing && (
          <MaterialDetailActions
            material={material}
            previewUrl={material.url}
            canDelete={canDelete}
            canPermanentDelete={canPermanentDelete}
            canRestore={canRestore}
            canPromoteDraft={
              canPromoteDraft || Boolean(onPromote || onPromoteDraft)
            }
            busy={downloading}
            onDownload={(fmt) => void handleDownloadInternal(fmt)}
            onWatermark={(target) => onWatermark?.(target)}
            onDelete={() => onDelete(material)}
            onPermanentDelete={onPermanentDelete}
            onRestore={(target) => onRestore?.(target)}
            onPromoteDraft={(target) => {
              if (onPromoteDraft) onPromoteDraft(target);
              else onPromote?.(target);
            }}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
