import { useEffect, useRef, useState, useCallback } from "react";
import type { WatermarkMode, WatermarkPosition } from "@/types/material";

export interface LumaAnalysis {
  averageLuminance: number;
  isDarkBackground: boolean;
  recommendedVariant: "NEGATIVE_WHITE" | "POSITIVE_DARK";
  recommendDropShadow: boolean;
}

interface UseWatermarkCanvasOptions {
  baseImageUrl: string;
  logoUrl: string | null;
  mode: WatermarkMode;
  position: WatermarkPosition;
  opacity: number;
  scale: number;
  paddingPercent?: number;
  rotationAngle?: number;
  autoContrast?: boolean;
  dropShadow?: boolean;
}

export function useWatermarkCanvas({
  baseImageUrl,
  logoUrl,
  mode,
  position,
  opacity,
  scale,
  paddingPercent = 0.03,
  rotationAngle = -45,
  autoContrast = false,
  dropShadow = false,
}: UseWatermarkCanvasOptions) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const baseImgRef = useRef<HTMLImageElement | null>(null);
  const logoImgRef = useRef<HTMLImageElement | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [lumaAnalysis, setLumaAnalysis] = useState<LumaAnalysis | null>(null);

  // Main render loop
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const baseImg = baseImgRef.current;
    if (!canvas || !baseImg) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const baseW = baseImg.naturalWidth || baseImg.width;
    const baseH = baseImg.naturalHeight || baseImg.height;

    if (canvas.width !== baseW || canvas.height !== baseH) {
      canvas.width = baseW;
      canvas.height = baseH;
    }

    ctx.clearRect(0, 0, baseW, baseH);
    ctx.drawImage(baseImg, 0, 0, baseW, baseH);

    const logoImg = logoImgRef.current;
    if (!logoImg) return;

    const logoW = logoImg.naturalWidth || logoImg.width;
    const logoH = logoImg.naturalHeight || logoImg.height;
    if (!logoW || !logoH) return;

    ctx.save();
    ctx.globalAlpha = Math.max(0.05, Math.min(1.0, opacity));

    let targetLogoW = Math.max(16, Math.round(baseW * scale));
    let targetLogoH = Math.max(
      16,
      Math.round(targetLogoW * (logoH / logoW)),
    );

    const maxAllowedH = Math.max(16, Math.round(baseH * 0.8));
    if (targetLogoH > maxAllowedH) {
      targetLogoH = maxAllowedH;
      targetLogoW = Math.max(16, Math.round(targetLogoH * (logoW / logoH)));
    }

    if (mode === "TILED") {
      const stepX = Math.round(targetLogoW * 2.2);
      const stepY = Math.round(targetLogoH * 2.2);
      const diagonal = Math.hypot(baseW, baseH);
      const range = Math.ceil(diagonal * 1.2);

      ctx.save();
      const centerX = baseW / 2;
      const centerY = baseH / 2;
      ctx.translate(centerX, centerY);
      ctx.rotate((rotationAngle * Math.PI) / 180);

      for (let x = -range; x < range; x += stepX) {
        for (let y = -range; y < range; y += stepY) {
          ctx.drawImage(logoImg, x, y, targetLogoW, targetLogoH);
        }
      }
      ctx.restore();
    } else {
      const padX = Math.max(8, Math.round(baseW * paddingPercent));
      const padY = Math.max(8, Math.round(baseH * paddingPercent));

      let x: number;
      let y: number;

      switch (position) {
        case "TOP_LEFT":
          x = padX;
          y = padY;
          break;
        case "TOP_CENTER":
          x = (baseW - targetLogoW) / 2;
          y = padY;
          break;
        case "TOP_RIGHT":
          x = baseW - targetLogoW - padX;
          y = padY;
          break;
        case "MIDDLE_LEFT":
          x = padX;
          y = (baseH - targetLogoH) / 2;
          break;
        case "CENTER":
          x = (baseW - targetLogoW) / 2;
          y = (baseH - targetLogoH) / 2;
          break;
        case "MIDDLE_RIGHT":
          x = baseW - targetLogoW - padX;
          y = (baseH - targetLogoH) / 2;
          break;
        case "BOTTOM_LEFT":
          x = padX;
          y = baseH - targetLogoH - padY;
          break;
        case "BOTTOM_CENTER":
          x = (baseW - targetLogoW) / 2;
          y = baseH - targetLogoH - padY;
          break;
        case "BOTTOM_RIGHT":
        default:
          x = baseW - targetLogoW - padX;
          y = baseH - targetLogoH - padY;
          break;
      }

      // Analyze background luminance at selected bounding box
      try {
        const sampleX = Math.max(0, Math.min(x, baseW - 1));
        const sampleY = Math.max(0, Math.min(y, baseH - 1));
        const sampleW = Math.min(targetLogoW, baseW - sampleX);
        const sampleH = Math.min(targetLogoH, baseH - sampleY);
        if (sampleW > 0 && sampleH > 0) {
          const imgData = ctx.getImageData(sampleX, sampleY, sampleW, sampleH);
          const data = imgData.data;
          let totalLuma = 0;
          let sampleCount = 0;
          const step = Math.max(1, Math.floor((sampleW * sampleH) / 400));
          for (let i = 0; i < data.length; i += 4 * step) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            totalLuma += 0.299 * r + 0.587 * g + 0.114 * b;
            sampleCount++;
          }
          const avgLuma = sampleCount > 0 ? totalLuma / sampleCount : 128;
          let totalDiff = 0;
          for (let i = 0; i < data.length; i += 4 * step) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const luma = 0.299 * r + 0.587 * g + 0.114 * b;
            totalDiff += Math.pow(luma - avgLuma, 2);
          }
          const variance = sampleCount > 0 ? totalDiff / sampleCount : 0;
          const isDark = avgLuma < 128;
          setLumaAnalysis({
            averageLuminance: Math.round(avgLuma),
            isDarkBackground: isDark,
            recommendedVariant: isDark ? "NEGATIVE_WHITE" : "POSITIVE_DARK",
            recommendDropShadow: variance >= 2500,
          });
        }
      } catch {
        // Ignore cross-origin canvas security limitations gracefully
      }

      // Apply drop shadow if requested or auto-suggested
      const needShadow = dropShadow || (autoContrast && lumaAnalysis?.recommendDropShadow);
      if (needShadow) {
        ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
      } else {
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      }

      ctx.drawImage(logoImg, x, y, targetLogoW, targetLogoH);
    }

    ctx.restore();
  }, [mode, position, opacity, scale, paddingPercent, rotationAngle, autoContrast, dropShadow, lumaAnalysis?.recommendDropShadow]);

  // Load base image
  useEffect(() => {
    if (!baseImageUrl) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      baseImgRef.current = img;
      setIsLoading(false);
      renderCanvas();
    };
    img.onerror = () => {
      setLoadError("Failed to load base image");
      setIsLoading(false);
    };
    img.src = baseImageUrl;
  }, [baseImageUrl, renderCanvas]);

  // Load logo image
  useEffect(() => {
    if (!logoUrl) {
      logoImgRef.current = null;
      renderCanvas();
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      logoImgRef.current = img;
      renderCanvas();
    };
    img.onerror = () => {
      logoImgRef.current = null;
      renderCanvas();
    };
    img.src = logoUrl;
  }, [logoUrl, renderCanvas]);

  // Re-render when parameters change and base image is ready
  useEffect(() => {
    if (!isLoading && baseImgRef.current) {
      renderCanvas();
    }
  }, [isLoading, renderCanvas]);

  const handleZoomIn = () => setZoom((z) => Math.min(2.5, +(z + 0.2).toFixed(1)));
  const handleZoomOut = () => setZoom((z) => Math.max(0.4, +(z - 0.2).toFixed(1)));
  const handleResetZoom = () => setZoom(1);

  return {
    canvasRef,
    isLoading,
    loadError,
    zoom,
    lumaAnalysis,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
    triggerRender: renderCanvas,
  };
}
