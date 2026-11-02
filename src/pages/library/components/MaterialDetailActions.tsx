import { useState } from "react";
import type { Ref } from "react";
import { useTranslation } from "react-i18next";
import { FolderPlus, Pencil, Stamp, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { MaterialUploadForm } from "@/pages/library/components/MaterialUploadForm";
import { WatermarkStudioModal } from "@/pages/library/components/watermark/WatermarkStudioModal";
import { DownloadFormatDropdown } from "@/components/common/DownloadFormatDropdown";
import type { DownloadFormat } from "@/utils/mediaDownloadHelper";
import type { MaterialItem } from "@/types/material";

interface Props {
  material: MaterialItem;
  quotaExceeded?: boolean;
  downloading?: boolean;
  editRef: Ref<HTMLButtonElement>;
  onDownload?: (format?: DownloadFormat) => void;
  onPromote?: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onChanged: () => void;
}

export function MaterialDetailActions({
  material,
  quotaExceeded,
  downloading = false,
  editRef,
  onDownload,
  onPromote,
  onEdit,
  onDelete,
  onChanged,
}: Props) {
  const { t } = useTranslation();
  const role = useWorkspaceStore((state) => state.currentMemberRole);
  const [watermark, setWatermark] = useState(false);
  const [retouch, setRetouch] = useState(false);
  const label = (key: string) => t(`library.repository.${key}`);
  const canEdit =
    material.capabilities?.canRename ||
    material.capabilities?.canUpdateType ||
    material.capabilities?.canChangeAudience;
  return (
    <>
      <div className="flex flex-wrap gap-2">
        {material.status === "READY" &&
          material.capabilities?.canDownload &&
          onDownload && (
            <DownloadFormatDropdown
              mediaKind={material.mediaKind || "IMAGE"}
              variant="default"
              size="default"
              disabled={downloading}
              label={label(downloading ? "preparingDownload" : "download")}
              onSelectFormat={(format) => onDownload(format)}
            />
          )}
        {material.draft && onPromote && (
          <Button variant="secondary" onClick={onPromote}>
            <FolderPlus className="size-4" />
            {t("library.trash.promoteToLibrary")}
          </Button>
        )}
        {canEdit && (
          <Button ref={editRef} variant="outline" onClick={onEdit}>
            <Pencil />
            {label("editMetadata")}
          </Button>
        )}
        {material.capabilities?.canWatermark && (
          <Button
            variant="outline"
            disabled={quotaExceeded}
            onClick={() => setWatermark(true)}
          >
            <Stamp />
            {label("watermark")}
          </Button>
        )}
        {material.capabilities?.canDelete && (
          <Button variant="destructive" onClick={onDelete}>
            <Trash2 />
            {t("library.trash.moveToTrash")}
          </Button>
        )}
        {role === "CREATOR" &&
          material.type === "RAW" &&
          material.status === "READY" && (
            <Button
              variant="outline"
              disabled={quotaExceeded}
              onClick={() => setRetouch(!retouch)}
            >
              {label("uploadRetouched")}
            </Button>
          )}
      </div>
      {retouch && (
        <MaterialUploadForm
          workspaceId={material.workspaceId}
          isClient={false}
          initialOptions={{
            type: "RETOUCHED",
            parentMaterialId: material.id,
            visibility: material.visibility,
            clientProfileId: material.clientProfileId,
          }}
          onSuccess={() => {
            setRetouch(false);
            onChanged();
          }}
          onClose={() => setRetouch(false)}
        />
      )}
      {watermark && (
        <WatermarkStudioModal
          isOpen
          onClose={() => setWatermark(false)}
          workspaceId={material.workspaceId}
          material={{ ...material, url: material.previewUrl ?? "" }}
          onSuccess={() => {
            setWatermark(false);
            onChanged();
          }}
        />
      )}
    </>
  );
}
