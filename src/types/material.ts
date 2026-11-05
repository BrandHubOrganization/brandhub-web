export type MaterialType = "RAW" | "RETOUCHED" | "WATERMARKED";

export type WatermarkMode = "SINGLE" | "TILED";

export type WatermarkPosition =
  | "TOP_LEFT"
  | "TOP_CENTER"
  | "TOP_RIGHT"
  | "MIDDLE_LEFT"
  | "CENTER"
  | "MIDDLE_RIGHT"
  | "BOTTOM_LEFT"
  | "BOTTOM_CENTER"
  | "BOTTOM_RIGHT";

export interface WatermarkMetadata {
  logoAssetId?: string;
  logoUrl?: string;
  mode: WatermarkMode;
  position: WatermarkPosition;
  opacity: number;
  scale: number;
  paddingPercent?: number;
  rotationAngle?: number;
  autoContrast?: boolean;
  dropShadow?: boolean;
}

export interface MaterialItem {
  folderId?: string | null;
  scopeType?: "WORKSPACE" | "CLIENT_VAULT";
  ownerUserId?: string;
  currentVersionNumber?: number;
  id: string;
  workspaceId: string;
  name: string;
  originalName?: string;
  type: MaterialType;
  mimeType?: string;
  fileSize?: number;
  url: string;
  previewUrl?: string;
  previewExpiresAt?: string;
  status?:
    | "UPLOADING"
    | "VALIDATING"
    | "READY"
    | "REJECTED"
    | "FAILED"
    | "DELETED"
    | "PURGE_IN_PROGRESS"
    | "PURGED";
  deletedAt?: string;
  deletedBy?: string;
  purgeAfter?: string;
  purgeBlockedReason?: string;
  mediaKind?: "IMAGE" | "VIDEO" | "FILE";
  purpose?: "MATERIAL" | "BRAND_REFERENCE";
  visibility?: "INTERNAL" | "CLIENT";
  clientProfileId?: string;
  version?: number;
  rawWarning?: boolean;
  createdByName?: string;
  clientDisplayName?: string;
  updatedBy?: string;
  previewUnavailableReason?: string;
  capabilities?: MaterialCapabilities;
  parentMaterialId?: string;
  watermarkMeta?: WatermarkMetadata;
  draft?: boolean;
  aiSource?: string;
  storageProvider?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface MaterialCapabilities {
  canPreview: boolean;
  canDownload: boolean;
  canRename: boolean;
  canUpdateType: boolean;
  canChangeAudience: boolean;
  canWatermark: boolean;
  canDelete: boolean;
  canRestore: boolean;
}

export interface MaterialFilters {
  taskId?: string;
  mediaKind?: "IMAGE" | "VIDEO" | "FILE";
  type?: MaterialType;
  purpose?: "MATERIAL" | "BRAND_REFERENCE";
  clientProfileId?: string;
  sort?: MaterialSort;
  folderId?: string;
  tab?: "LIBRARY" | "CLIENT_VAULT";
  draft?: boolean;
}

export interface MaterialPage {
  folders?: MaterialFolderItem[];
  breadcrumbs?: MaterialFolderItem[];
  currentFolder?: MaterialFolderItem | null;
  items: MaterialItem[];
  total: number;
  page: number;
  size: number;
}
export interface MaterialPreview {
  materialId: string;
  previewUrl: string;
  previewExpiresAt: string;
  mimeType: string;
}
export interface DownloadMaterialResponse {
  materialId: string;
  downloadUrl: string;
  expiresAt: string;
  filename: string;
  mimeType: string;
  fileSize: number;
}
export interface MaterialStorageUsage {
  workspaceUsedBytes: string;
  agencyUsedBytes: string;
  agencyReservedBytes: string;
  agencyQuotaBytes: string;
  storageMode: string;
  isQuotaExceeded: boolean;
  canExpandWithSubscription: boolean;
}
export interface UpdateMaterialRequest {
  expectedVersion: number;
  name?: string;
  type?: "RAW" | "RETOUCHED";
  purpose?: "MATERIAL" | "BRAND_REFERENCE";
  visibility?: "INTERNAL" | "CLIENT";
  clientProfileId?: string;
}

export interface MaterialUploadOptions {
  folderId?: string;
  contentHash?: string;
  conflictResolution?: "ASK" | "SKIP" | "KEEP_BOTH" | "OVERWRITE";
  overwriteMaterialId?: string;
  type: "RAW" | "RETOUCHED";
  purpose: "MATERIAL" | "BRAND_REFERENCE";
  visibility: "INTERNAL" | "CLIENT";
  clientProfileId?: string;
  parentMaterialId?: string;
}

export interface MaterialUploadSession {
  skipped?: boolean;
  sessionId: string;
  materialId: string;
  uploadUrl: string;
  uploadHeaders?: Record<string, string>;
  s3Key: string;
  expiresAt: string;
}

export interface ApplyWatermarkRequest {
  logoAssetId?: string;
  logoUrl?: string;
  mode: WatermarkMode;
  position: WatermarkPosition;
  opacity: number;
  scale: number;
  paddingPercent?: number;
  rotationAngle?: number;
  autoContrast?: boolean;
  dropShadow?: boolean;
}

export interface BrandAssetItem {
  id: string;
  name: string;
  url: string;
  assetType: string;
  source: string;
}

export interface WatermarkPreset {
  id: string;
  workspaceId: string;
  clientProfileId?: string;
  name: string;
  isDefault?: boolean;
  config: WatermarkMetadata;
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateWatermarkPresetRequest {
  clientProfileId?: string;
  name: string;
  isDefault?: boolean;
  config: WatermarkMetadata;
}

export type MaterialSort = "newest" | "oldest" | "name_asc" | "name_desc";
export interface MaterialFolderItem {
  id: string;
  name: string;
  parentFolderId?: string | null;
  createdAt?: string;
  updatedAt?: string;
  itemCount: number;
}
export interface MaterialBrowserResponse {
  currentFolder: MaterialFolderItem | null;
  breadcrumbs: MaterialFolderItem[];
  folders: MaterialFolderItem[];
  files: {
    items: MaterialItem[];
    meta: { page: number; size: number; total: number };
  };
}
export interface MaterialVersionItem {
  id: string;
  versionNumber: number;
  fileSize: number;
  mimeType: string;
  createdBy: string;
  createdAt: string;
}
export interface MaterialDuplicateConflict {
  existingMaterialId: string;
  existingName: string;
  existingFolderId?: string;
  conflictType: string;
}
export interface DriveImportJob {
  jobId: string;
  status: "RUNNING" | "COMPLETED" | "FAILED";
  totalFiles: number;
  importedFolders: number;
  importedFiles: number;
  skippedFiles: number;
  totalBytesImported: number;
  errorMessage?: string;
}
export interface StorageAddonPlan {
  code: string;
  extraBytes: number;
  priceMonthlyVnd: string;
}
export interface StorageAddonOrder {
  orderId: string;
  planCode: string;
  status: string;
  amount: string;
  currency: string;
  transferContent: string;
  qrUrl: string;
  expiresAt: string;
}
