import { useRef, useState } from "react";
import { isAxiosError } from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useAuthStore } from "@/store/authStore";
import { useMaterialDetail } from "@/pages/library/hooks/useMaterialDetail";
import { MaterialBadges } from "@/pages/library/components/MaterialBadges";
import { MaterialPreview } from "@/pages/library/components/MaterialPreview";
import { MaterialMetadataEditForm } from "@/pages/library/components/MaterialMetadataEditForm";
import { MaterialDetailFacts } from "@/pages/library/components/MaterialDetailFacts";
import { MaterialDetailActions } from "@/pages/library/components/MaterialDetailActions";
import type { MaterialItem } from "@/types/material";

interface Props {
  material: MaterialItem | null;
  quotaExceeded?: boolean;
  downloading?: boolean;
  onDownload?: (material: MaterialItem) => void;
  onClose: () => void;
  onDelete: (material: MaterialItem) => void;
  onWatermarked: () => void;
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
  material: selected,
  quotaExceeded,
  downloading,
  onDownload,
  onClose,
  onDelete,
  onWatermarked,
}: Props & { material: MaterialItem }) {
  const { t } = useTranslation();
  const client = useQueryClient();
  const actor = useAuthStore((state) => state.user?.id);
  const query = useMaterialDetail(selected.workspaceId, selected.id);
  const [editing, setEditing] = useState(false);
  const editButton = useRef<HTMLButtonElement>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const material = query.data;
  const label = (key: string) => t(`library.repository.${key}`);
  const detailKey = [
    "material-detail",
    selected.workspaceId,
    actor,
    selected.id,
  ];
  const endEdit = () => {
    setEditing(false);
    requestAnimationFrame(() => editButton.current?.focus());
  };
  function saved(updated: MaterialItem) {
    client.setQueryData(detailKey, updated);
    void client.invalidateQueries({
      queryKey: ["materials", selected.workspaceId, actor],
    });
    toast.success(label("updateSuccess"));
    endEdit();
  }
  function resetUnavailable() {
    endEdit();
    void client.resetQueries({ queryKey: detailKey, exact: true });
    void client.invalidateQueries({
      queryKey: ["materials", selected.workspaceId, actor],
    });
  }
  const unavailable =
    isAxiosError(query.error) &&
    [403, 404].includes(query.error.response?.status ?? 0);
  return (
    <Sheet
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent
        className="w-full overflow-y-auto sm:max-w-md lg:max-w-lg [&>button:last-child]:hidden"
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
        <SheetHeader className="border-border border-b pr-14">
          <SheetTitle>{material?.name ?? selected.name}</SheetTitle>
          <SheetDescription>{label("detailDescription")}</SheetDescription>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3"
            aria-label={label("close")}
            onClick={onClose}
          >
            <X />
          </Button>
        </SheetHeader>
        <div className="space-y-5 p-4">
          {query.isPending && (
            <p role="status" className="text-muted-foreground text-sm">
              {t("library.trash.loading")}
            </p>
          )}
          {query.isError ? (
            <div role="alert" className="space-y-3 text-sm">
              <p>{label(unavailable ? "unavailable" : "loadError")}</p>
              {!unavailable && (
                <Button variant="outline" onClick={() => void query.refetch()}>
                  {label("retry")}
                </Button>
              )}
            </div>
          ) : (
            material && (
              <>
                <MaterialBadges material={material} />
                {material.rawWarning && (
                  <p
                    role="note"
                    className="bg-muted text-foreground border-border rounded-md border p-3 text-sm"
                  >
                    {label("rawWarning")}
                  </p>
                )}
                {editing ? (
                  <MaterialMetadataEditForm
                    key={`${material.id}:${material.version}`}
                    material={material}
                    onSaved={saved}
                    onCancel={endEdit}
                    onReload={() => void query.refetch()}
                    onUnavailable={resetUnavailable}
                  />
                ) : (
                  <>
                    <MaterialPreview
                      key={`${material.id}:${material.version}:${material.previewExpiresAt}`}
                      material={material}
                      onUnavailable={resetUnavailable}
                    />
                    <MaterialDetailFacts material={material} />
                    <MaterialDetailActions
                      material={material}
                      quotaExceeded={quotaExceeded}
                      downloading={downloading}
                      editRef={editButton}
                      onDownload={
                        onDownload ? () => onDownload(material) : undefined
                      }
                      onEdit={() => setEditing(true)}
                      onDelete={() => onDelete(material)}
                      onChanged={onWatermarked}
                    />
                  </>
                )}
              </>
            )
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
