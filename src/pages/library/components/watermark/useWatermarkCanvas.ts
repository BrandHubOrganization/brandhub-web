import { useEffect, useRef, useState, useCallback } from "react";
import type { WatermarkMode, WatermarkPosition } from "@/types/material";

interface UseWatermarkCanvasOptions {
  baseImageUrl: string;
  logoUrl: string | null;
  mode: WatermarkMode;
  position: WatermarkPosition;
  opacity: number;
  scale: number;
  paddingPercent?: number;
  rotationAngle?: number;
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
}: UseWatermarkCanvasOptions) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const baseImgRef = useRef<HTMLImageElement | null>(null);
  const logoImgRef = useRef<HTMLImageElement | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

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

      ctx.drawImage(logoImg, x, y, targetLogoW, targetLogoH);
    }

    ctx.restore();
  }, [mode, position, opacity, scale, paddingPercent, rotationAngle]);

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
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
    triggerRender: renderCanvas,
  };
}
