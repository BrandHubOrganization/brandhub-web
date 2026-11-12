export type ProductRecipe = "auto" | "review" | "unboxing" | "product_showcase";
export interface ProductVideoBrief {
  recipeId: ProductRecipe;
  productName: string;
  productFacts: string;
  reviewScript?: string | null;
  requirements: string;
  durationSeconds: 15 | 20;
  aspectRatio: "9:16" | "16:9";
  productImageAssetId: string | null;
  packagingImageAssetId: string | null;
  logoAssetId: string | null;
  allowGenericPackaging: boolean;
  cta: string;
  musicId: string | null;
  preserveSourceAudio: boolean;
  language: "vi" | "en";
}
export interface ProductVideoQuote {
  quoteId: string;
  units: number;
  unitCredits: number;
  totalCredits: number;
  expiresAt: string;
}
export interface ProductVideoScene {
  sceneId: string;
  ordinal: number;
  role: string;
  title?: string | null;
  action?: string | null;
  narration?: string | null;
  prompt: string;
  sourceDurationSeconds: number;
  status?: string;
  attempt?: number;
  canRetry?: boolean;
  errorCode?: string | null;
}
export type ProductVideoState =
  | "NEEDS_INPUT"
  | "PLAN_READY"
  | "GENERATING"
  | "RECONCILIATION_REQUIRED"
  | "SCENE_FAILED"
  | "EDITING"
  | "VALIDATING"
  | "RENDER_FAILED"
  | "COMPLETED";
export interface ProductVideoProduction {
  productionId: string;
  projectId: string;
  state: ProductVideoState;
  revision: number;
  brief: ProductVideoBrief;
  recipeId: Exclude<ProductRecipe, "auto">;
  selectionReason: string;
  scenes: ProductVideoScene[];
  providerReady: boolean;
  missingInputs: string[];
  quote: ProductVideoQuote | null;
  sourceConfigDisplay?: {
    model: string;
    sourceDurationSeconds: number;
    resolution: string;
  };
  creditsHeld?: number;
  creditsCharged?: number;
  canRetryRender?: boolean;
  hasResult?: boolean;
  errorCode?: string | null;
}
export interface ProductVideoPlanRequest {
  productionId: string | null;
  projectId: string;
  expectedRevision: number;
  brief: ProductVideoBrief;
  sceneEdits: { sceneId: string; prompt: string }[];
}
export type ProductImageSlot =
  "productImageAssetId" | "packagingImageAssetId" | "logoAssetId";
export type ProductImageFiles = Partial<Record<ProductImageSlot, File | null>>;
export const editableProductionStates: ProductVideoState[] = [
  "PLAN_READY",
  "NEEDS_INPUT",
];
export const activeProductionStates: ProductVideoState[] = [
  "GENERATING",
  "EDITING",
  "VALIDATING",
  "RECONCILIATION_REQUIRED",
];
