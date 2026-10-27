import { useState } from "react";
import type { Ref } from "react";
import { useTranslation } from "react-i18next";
import { Download, Pencil, Stamp, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { MaterialUploadForm } from "@/pages/library/components/MaterialUploadForm";
import { WatermarkStudioModal } from "@/pages/library/components/watermark/WatermarkStudioModal";
import type { MaterialItem } from "@/types/material";

interface Props {
  material: MaterialItem;
  quotaExceeded?: boolean;
  downloading?: boolean;
  editRef: Ref<HTMLButtonElement>;
  onDownload?: () => void;
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
            <Button
              variant="default"
              disabled={downloading}
              aria-busy={downloading}
              aria-label={t("library.repository.downloadAriaLabel", {
                name: material.name,
              })}
              onClick={onDownload}
            >
              <Download className="size-4" />
              {label(downloading ? "preparingDownload" : "download")}
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
