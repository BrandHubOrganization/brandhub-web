import React from "react";
import { Upload, FolderOpen } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useWorkspaceStore } from "@/store/workspaceStore";
import type { MaterialItem } from "@/types/material";
import type { MediaDropzoneProps } from "./media/types";
import { MediaUploadTab } from "./media/MediaUploadTab";
import { MediaRepositoryTab } from "./media/MediaRepositoryTab";
import { MediaSelectedPreviews } from "./media/MediaSelectedPreviews";

export const MediaDropzone: React.FC<MediaDropzoneProps> = ({
  mediaUrls,
  onChange,
  workspaceId,
  onUploaded,
}) => {
  const { t } = useTranslation();
  const currentWorkspace = useWorkspaceStore((s) => s.currentWorkspace);
  const effectiveWorkspaceId = workspaceId ?? currentWorkspace?.id;

  const handleToggleItem = (item: MaterialItem) => {
    const isSelected =
      mediaUrls.includes(item.url) ||
      Boolean(item.previewUrl && mediaUrls.includes(item.previewUrl));

    if (isSelected) {
      onChange(
        mediaUrls.filter(
          (url) => url !== item.url && url !== item.previewUrl,
        ),
      );
    } else {
      onUploaded(
        item.url,
        item.id,
        item.mediaKind === "VIDEO" ? "VIDEO" : "IMAGE",
      );
      if (!mediaUrls.includes(item.url)) {
        onChange([...mediaUrls, item.url]);
      }
    }
  };

  const handleRemoveMedia = (index: number) => {
    const next = [...mediaUrls];
    next.splice(index, 1);
    onChange(next);
  };

  const handleAppendUrls = (newUrls: string[]) => {
    onChange([...mediaUrls, ...newUrls]);
  };

  return (
    <div className="space-y-3">
      <Tabs defaultValue="upload" className="w-full space-y-3">
        <TabsList className="bg-muted/60 border-border/60 grid h-10 w-full grid-cols-2 rounded-xl border p-1 shadow-2xs">
          <TabsTrigger
            value="upload"
            className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs flex items-center justify-center gap-2 rounded-lg py-1.5 text-xs font-semibold transition-all"
          >
            <Upload className="size-3.5" />
            <span>{t("editor.mediaDropzone.tabs.upload", "Tải lên từ máy")}</span>
          </TabsTrigger>
          <TabsTrigger
            value="repository"
            className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs flex items-center justify-center gap-2 rounded-lg py-1.5 text-xs font-semibold transition-all"
          >
            <FolderOpen className="size-3.5" />
            <span>
              {t("editor.mediaDropzone.tabs.repository", "Kho tài nguyên")}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-0">
          <MediaUploadTab
            effectiveWorkspaceId={effectiveWorkspaceId}
            onUploaded={onUploaded}
            onAppendUrls={handleAppendUrls}
          />
        </TabsContent>

        <TabsContent value="repository" className="mt-0">
          <MediaRepositoryTab
            mediaUrls={mediaUrls}
            onToggleSelect={handleToggleItem}
            workspaceId={effectiveWorkspaceId}
          />
        </TabsContent>
      </Tabs>

      <MediaSelectedPreviews
        mediaUrls={mediaUrls}
        onRemove={handleRemoveMedia}
      />
    </div>
  );
};
