import type { MaterialItem, MaterialSort } from "@/types/material";

export type MediaCategory = "ALL" | "IMAGE" | "VIDEO" | "FILE";

export type MediaSortOption =
  | "CREATED_DESC"
  | "CREATED_ASC"
  | "NAME_ASC"
  | "NAME_DESC";

export const SORT_TO_API: Record<MediaSortOption, MaterialSort> = {
  CREATED_DESC: "newest",
  CREATED_ASC: "oldest",
  NAME_ASC: "name_asc",
  NAME_DESC: "name_desc",
};

export interface StoredMediaEntry {
  materialId?: string;
  s3Key?: string;
  externalUrl?: string;
  mediaType?: "IMAGE" | "VIDEO";
}

export interface MediaDropzoneProps {
  mediaUrls: string[];
  onChange: (urls: string[]) => void;
  workspaceId?: string;
  onUploaded: (
    url: string,
    materialId: string,
    mediaType: "IMAGE" | "VIDEO",
  ) => void;
  storedMedia?: Record<string, StoredMediaEntry>;
  onWatermarked?: (
    oldUrl: string,
    newMaterial: MaterialItem,
    mediaType: "IMAGE" | "VIDEO",
  ) => void;
}

export interface MediaUploadTabProps {
  effectiveWorkspaceId?: string;
  onUploaded: (
    url: string,
    materialId: string,
    mediaType: "IMAGE" | "VIDEO",
  ) => void;
  onAppendUrls: (urls: string[]) => void;
}

export interface MediaRepositoryTabProps {
  mediaUrls: string[];
  onToggleSelect: (item: MaterialItem) => void;
  workspaceId?: string;
}

export interface MediaSelectedPreviewsProps {
  mediaUrls: string[];
  onRemove: (index: number) => void;
  storedMedia?: Record<string, StoredMediaEntry>;
  onWatermark?: (url: string, materialId: string) => void;
}

export interface MediaRepositoryItemCardProps {
  item: MaterialItem;
  isSelected: boolean;
  onToggle: () => void;
}
