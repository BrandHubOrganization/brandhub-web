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
  mediaKind?: "IMAGE" | "VIDEO" | "FILE";
  type?: MaterialType;
  purpose?: "MATERIAL" | "BRAND_REFERENCE";
  clientProfileId?: string;
  sort?: "newest" | "oldest";
}

export interface MaterialPage {
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
  type: "RAW" | "RETOUCHED";
  purpose: "MATERIAL" | "BRAND_REFERENCE";
  visibility: "INTERNAL" | "CLIENT";
  clientProfileId?: string;
  parentMaterialId?: string;
}

export interface MaterialUploadSession {
  sessionId: string;
  materialId: string;
  uploadUrl: string;
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
