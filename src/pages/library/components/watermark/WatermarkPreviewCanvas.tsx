import React from "react";
import { ZoomIn, ZoomOut, RotateCcw, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface WatermarkPreviewCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isLoading: boolean;
  loadError: string | null;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
}

export const WatermarkPreviewCanvas: React.FC<WatermarkPreviewCanvasProps> = ({
  canvasRef,
  isLoading,
  loadError,
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
}) => {
  const { t } = useTranslation();

  return (
    <div className="relative flex flex-col h-full w-full min-h-[380px] sm:min-h-[460px] rounded-2xl border border-border bg-neutral-900/90 dark:bg-black/80 overflow-hidden select-none">
      {/* Zoom toolbar */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl p-1 text-white shadow-lg">
        <button
          type="button"
          onClick={onZoomOut}
          title={t("materials.watermark.zoomOut")}
          className="p-1.5 hover:bg-white/20 rounded-lg text-white/80 hover:text-white transition-colors cursor-pointer"
        >
          <ZoomOut className="size-4" />
        </button>
        <span className="text-[11px] font-mono px-1.5 min-w-[42px] text-center text-white/90">
          {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          onClick={onZoomIn}
          title={t("materials.watermark.zoomIn")}
          className="p-1.5 hover:bg-white/20 rounded-lg text-white/80 hover:text-white transition-colors cursor-pointer"
        >
          <ZoomIn className="size-4" />
        </button>
        <div className="w-px h-3.5 bg-white/20 mx-0.5" />
        <button
          type="button"
          onClick={onResetZoom}
          title={t("materials.watermark.resetZoom")}
          className="p-1.5 hover:bg-white/20 rounded-lg text-white/80 hover:text-white transition-colors cursor-pointer"
        >
          <RotateCcw className="size-3.5" />
        </button>
      </div>

      {/* Viewport Canvas Container */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
        {isLoading && (
          <div className="flex flex-col items-center gap-2 text-white/70">
            <Loader2 className="size-8 animate-spin text-brand-orange" />
            <span className="text-xs">{t("materials.watermark.preview")}...</span>
          </div>
        )}

        {loadError && (
          <div className="text-red-400 text-xs text-center p-4">
            {loadError}
          </div>
        )}

        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "center center",
            transition: "transform 0.12s ease-out",
          }}
          className="max-h-full max-w-full flex items-center justify-center shadow-2xl rounded-lg overflow-hidden border border-white/10"
        >
          <canvas
            ref={canvasRef}
            className="max-h-[500px] max-w-full object-contain block"
          />
        </div>
      </div>
    </div>
  );
};
