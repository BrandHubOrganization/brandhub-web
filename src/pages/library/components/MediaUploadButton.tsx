import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { MaterialUploadForm } from "@/pages/library/components/MaterialUploadForm";
import type { MaterialItem } from "@/types/material";
import type { MediaItem } from "@/types/contentLibrary";

interface Props {
  onUploadSuccess: (material: MediaItem) => void;
  onUploadStart?: () => void;
}

export function MediaUploadButton({ onUploadSuccess, onUploadStart }: Props) {
  const { t } = useTranslation();
  const workspace = useWorkspaceStore((state) => state.currentWorkspace);
  const role = useWorkspaceStore((state) => state.currentMemberRole);
  const [open, setOpen] = useState(false);
  if (!workspace || !role || !["MANAGER", "CREATOR", "CLIENT"].includes(role))
    return null;

  function uploaded(material: MaterialItem) {
    onUploadSuccess({
      id: material.id,
      workspaceId: material.workspaceId,
      filename: material.name,
      url: material.previewUrl ?? material.url ?? "",
      sizeBytes: material.fileSize ?? 0,
      createdAt: material.createdAt,
      type:
        material.mediaKind === "VIDEO"
          ? "video"
          : material.mediaKind === "FILE"
            ? "file"
            : "image",
      source: "repository",
    });
  }

  return (
    <div className="w-full space-y-4">
      <Button
        variant="orange"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <Upload className="size-4" />
        {t("library.media.uploadButton")}
      </Button>
      {open && (
        <MaterialUploadForm
          key={workspace.id}
          workspaceId={workspace.id}
          isClient={role === "CLIENT"}
          onSuccess={uploaded}
          onClose={() => setOpen(false)}
          onStart={onUploadStart}
        />
      )}
    </div>
  );
}
