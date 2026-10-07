import React, { useState, useEffect } from "react";
import type {
  BrandAssetItem,
  MaterialItem,
  WatermarkMetadata,
  WatermarkMode,
  WatermarkPosition,
} from "@/types/material";
import { materialService } from "@/services/materialService";
import { useWatermarkCanvas } from "./useWatermarkCanvas";
import { WatermarkPositionGrid } from "./WatermarkPositionGrid";
import { BrandLogoSelector } from "./BrandLogoSelector";
import { WatermarkPreviewCanvas } from "./WatermarkPreviewCanvas";
import { WatermarkPresetSelector } from "./WatermarkPresetSelector";
import { X, Stamp, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface WatermarkStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  material: {
    id: string;
    url: string;
    filename?: string;
    name?: string;
  };
  workspaceId: string;
  onSuccess?: (newMaterial: MaterialItem) => void;
}

export const WatermarkStudioModal: React.FC<WatermarkStudioModalProps> = ({
  isOpen,
  onClose,
  material,
  workspaceId,
  onSuccess,
}) => {
  const { t } = useTranslation();

  const [mode, setMode] = useState<WatermarkMode>("SINGLE");
  const [position, setPosition] = useState<WatermarkPosition>("BOTTOM_RIGHT");
  const [opacity, setOpacity] = useState<number>(0.85);
  const [scale, setScale] = useState<number>(0.15);
  const [autoContrast, setAutoContrast] = useState<boolean>(true);
  const [dropShadow, setDropShadow] = useState<boolean>(false);

  const [brandAssets, setBrandAssets] = useState<BrandAssetItem[]>([]);
  const [selectedLogoId, setSelectedLogoId] = useState<string | null>(null);
  const [selectedLogoUrl, setSelectedLogoUrl] = useState<string | null>(null);

  const [isApplying, setIsApplying] = useState(false);

  // Fetch available brand assets for this workspace
  useEffect(() => {
    if (!isOpen || !workspaceId) return;

    let isMounted = true;
    materialService
      .listBrandAssets(workspaceId)
      .then((assets) => {
        if (!isMounted) return;
        setBrandAssets(assets);
        if (assets.length > 0 && !selectedLogoUrl) {
          setSelectedLogoId(assets[0].id);
          setSelectedLogoUrl(assets[0].url);
        }
      })
      .catch((err) => {
        console.warn("Could not fetch brand assets:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, workspaceId, selectedLogoUrl]);

  const {
    canvasRef,
    isLoading,
    loadError,
    zoom,
    lumaAnalysis,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
  } = useWatermarkCanvas({
    baseImageUrl: material.url,
    logoUrl: selectedLogoUrl,
    mode,
    position,
    opacity,
    scale,
    autoContrast,
    dropShadow,
  });

  if (!isOpen) return null;

  const handleLogoSelect = (logoId: string | null, logoUrl: string) => {
    setSelectedLogoId(logoId);
    setSelectedLogoUrl(logoUrl);
  };

  const currentConfig: WatermarkMetadata = {
    logoAssetId: selectedLogoId || undefined,
    logoUrl: selectedLogoUrl || undefined,
    mode,
    position,
    opacity,
    scale,
    autoContrast,
    dropShadow,
  };

  const handleApplyPreset = (config: WatermarkMetadata) => {
    if (config.mode) setMode(config.mode);
    if (config.position) setPosition(config.position);
    if (config.opacity !== undefined) setOpacity(config.opacity);
    if (config.scale !== undefined) setScale(config.scale);
    if (config.autoContrast !== undefined) setAutoContrast(config.autoContrast);
    if (config.dropShadow !== undefined) setDropShadow(config.dropShadow);
    if (config.logoAssetId) {
      const found = brandAssets.find((a) => a.id === config.logoAssetId);
      if (found) {
        setSelectedLogoId(found.id);
        setSelectedLogoUrl(found.url);
      }
    } else if (config.logoUrl) {
      setSelectedLogoId(null);
      setSelectedLogoUrl(config.logoUrl);
    }
  };

  const handleApply = async () => {
    if (!selectedLogoUrl && !selectedLogoId) {
      toast.error(t("materials.watermark.noLogoWarning"));
      return;
    }

    setIsApplying(true);
    try {
      const result = await materialService.applyWatermark(
        workspaceId,
        material.id,
        {
          logoAssetId: selectedLogoId || undefined,
          logoUrl: selectedLogoUrl || undefined,
          mode,
          position,
          opacity,
          scale,
          autoContrast,
          dropShadow,
        },
      );

      toast.success(t("materials.watermark.successToast"));
      onSuccess?.(result);
      onClose();
    } catch (err: unknown) {
      console.error("Failed to apply watermark:", err);
      toast.error(t("materials.watermark.failedToast"));
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-5xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-brand-orange/10 border border-brand-orange/20 flex items-center justify-center text-brand-orange">
              <Stamp className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                {t("materials.watermark.title")}
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-orange/10 text-brand-orange border border-brand-orange/20">
                  FR 3.6.15
                </span>
              </h2>
              <p className="text-xs text-muted-foreground">
                {t("materials.watermark.subtitle")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Live Preview Canvas (7 cols) */}
            <div className="lg:col-span-7 h-full flex flex-col min-h-[420px]">
              <div className="flex items-center justify-between pb-2 text-xs font-semibold text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-brand-orange" />
                  {t("materials.watermark.preview")}
                </span>
                <span className="font-mono text-[11px] truncate max-w-[200px]">
                  {material.name || material.filename || "Original Image"}
                </span>
              </div>
              <WatermarkPreviewCanvas
                canvasRef={canvasRef}
                isLoading={isLoading}
                loadError={loadError}
                zoom={zoom}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onResetZoom={handleResetZoom}
              />
            </div>

            {/* Right Column: Controllers (5 cols) */}
            <div className="lg:col-span-5 space-y-5 bg-muted/30 border border-border/60 rounded-2xl p-4 sm:p-5">
              {/* Brand Presets (Advanced Suite) */}
              <WatermarkPresetSelector
                workspaceId={workspaceId}
                currentConfig={currentConfig}
                onApplyPreset={handleApplyPreset}
              />

              <div className="h-px bg-border/60" />

              {/* Logo Selection */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-2">
                  {t("materials.watermark.selectLogo")}
                </label>
                <BrandLogoSelector
                  brandAssets={brandAssets}
                  selectedLogoId={selectedLogoId}
                  selectedLogoUrl={selectedLogoUrl}
                  onSelect={handleLogoSelect}
                />
              </div>

              {/* Watermark Mode */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-2">
                  Chế độ Watermark
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMode("SINGLE")}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                      mode === "SINGLE"
                        ? "border-brand-orange bg-brand-orange text-white shadow-xs font-semibold"
                        : "border-border bg-card text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {t("materials.watermark.modeSingle")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("TILED")}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                      mode === "TILED"
                        ? "border-brand-orange bg-brand-orange text-white shadow-xs font-semibold"
                        : "border-border bg-card text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {t("materials.watermark.modeTiled")}
                  </button>
                </div>
              </div>

              {/* 3x3 Position Grid (Single mode only) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-foreground">
                    {t("materials.watermark.position")}
                  </label>
                  {mode === "TILED" && (
                    <span className="text-[10px] text-muted-foreground italic">
                      (Chế độ lưới lặp tự động)
                    </span>
                  )}
                </div>
                <div className="flex justify-center">
                  <WatermarkPositionGrid
                    value={position}
                    onChange={setPosition}
                    disabled={mode === "TILED"}
                  />
                </div>
              </div>

              {/* Sliders: Opacity & Scale */}
              <div className="space-y-4 pt-1">
                {/* Opacity Slider */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-foreground">
                      {t("materials.watermark.opacity")}
                    </span>
                    <span className="font-mono text-muted-foreground">
                      {Math.round(opacity * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={opacity}
                    onChange={(e) => setOpacity(parseFloat(e.target.value))}
                    className="w-full accent-brand-orange cursor-pointer"
                  />
                </div>

                {/* Scale Slider */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-foreground">
                      {t("materials.watermark.scale")}
                    </span>
                    <span className="font-mono text-muted-foreground">
                      {Math.round(scale * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="0.40"
                    step="0.01"
                    value={scale}
                    onChange={(e) => setScale(parseFloat(e.target.value))}
                    className="w-full accent-brand-orange cursor-pointer"
                  />
                </div>

                {/* Smart Contrast & Drop Shadow (Advanced Suite) */}
                <div className="rounded-2xl border border-border/70 bg-muted/20 p-3 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                      <Sparkles className="size-3.5 text-brand-orange" />
                      <span>{t("materials.watermark.smartContrast", "Tương phản thông minh")}</span>
                    </div>
                    {lumaAnalysis && mode === "SINGLE" && (
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          lumaAnalysis.isDarkBackground
                            ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {lumaAnalysis.isDarkBackground
                          ? `Nền tối (${lumaAnalysis.averageLuminance}) • Gợi ý Logo Trắng`
                          : `Nền sáng (${lumaAnalysis.averageLuminance}) • Gợi ý Logo Đậm`}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={autoContrast}
                        onChange={(e) => setAutoContrast(e.target.checked)}
                        className="rounded border-border text-brand-orange focus:ring-brand-orange"
                      />
                      <span className="text-muted-foreground text-[11px]">
                        Tự động đổi màu logo
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={dropShadow}
                        onChange={(e) => setDropShadow(e.target.checked)}
                        className="rounded border-border text-brand-orange focus:ring-brand-orange"
                      />
                      <span className="text-muted-foreground text-[11px]">
                        Bóng mờ (Drop Shadow)
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/40">
          <button
            type="button"
            onClick={onClose}
            disabled={isApplying}
            className="px-4 py-2.5 rounded-xl border border-border text-xs font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            {t("materials.watermark.cancelBtn")}
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={isApplying || !selectedLogoUrl}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-orange hover:bg-brand-orange/90 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
          >
            {isApplying ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>{t("materials.watermark.applying")}</span>
              </>
            ) : (
              <>
                <Stamp className="size-4" />
                <span>{t("materials.watermark.applyBtn")}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
