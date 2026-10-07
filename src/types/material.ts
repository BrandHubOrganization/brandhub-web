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
  parentMaterialId?: string;
  watermarkMeta?: WatermarkMetadata;
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
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
