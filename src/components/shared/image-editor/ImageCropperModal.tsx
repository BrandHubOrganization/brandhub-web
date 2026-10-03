import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  RotateCw,
  ZoomIn,
  ZoomOut,
  Check,
  Palette,
  Crop,
  Sparkles,
  RefreshCw,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface ImageCropperModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageFile?: File | null;
  imageUrl?: string | null;
  cropType: "logo" | "banner";
  title?: string;
  onConfirm: (file: File, previewUrl: string) => Promise<void> | void;
}

const OVERLAY_COLORS = [
  { name: "Cam BrandHub", value: "#f05a28" },
  { name: "Xanh biển", value: "#2563eb" },
  { name: "Xanh ngọc", value: "#059669" },
  { name: "Tím", value: "#7c3aed" },
  { name: "Đỏ hồng", value: "#e11d48" },
  { name: "Vàng hổ phách", value: "#d97706" },
  { name: "Xám đen", value: "#1e293b" },
  { name: "Trắng", value: "#ffffff" },
];

export function ImageCropperModal({
  isOpen,
  onClose,
  imageFile,
  imageUrl,
  cropType,
  title,
  onConfirm,
}: ImageCropperModalProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [sourceImage, setSourceImage] = useState<HTMLImageElement | null>(null);

  // Transform states
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Color overlay and filter states
  const [activeTab, setActiveTab] = useState<"crop" | "filter">("crop");
  const [overlayColor, setOverlayColor] = useState<string>("#f05a28");
  const [overlayOpacity, setOverlayOpacity] = useState<number>(0); // 0 to 50%
  const [brightness, setBrightness] = useState<number>(100); // 80% - 130%
  const [contrast, setContrast] = useState<number>(100); // 80% - 130%
  const [grayscale, setGrayscale] = useState<number>(0); // 0% - 100%

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Aspect ratio configuration
  // Logo: 1:1; Banner: 3:1 (1200 x 400)
  const isLogo = cropType === "logo";
  const targetWidth = isLogo ? 512 : 1200;
  const targetHeight = isLogo ? 512 : 400;
  const previewAspectRatio = isLogo ? 1 : 3 / 1;

  // Load image when imageFile or imageUrl changes
  useEffect(() => {
    if (!isOpen) return;

    let src = imageUrl || "";
    let objectUrlToRevoke: string | null = null;

    if (imageFile) {
      src = URL.createObjectURL(imageFile);
      objectUrlToRevoke = src;
    }

    if (!src) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setSourceImage(img);
      // Reset transforms
      setScale(1);
      setRotation(0);
      setOffset({ x: 0, y: 0 });
      setOverlayOpacity(0);
      setBrightness(100);
      setContrast(100);
      setGrayscale(0);
      setActiveTab("crop");
    };
    img.src = src;

    return () => {
      if (objectUrlToRevoke) {
        URL.revokeObjectURL(objectUrlToRevoke);
      }
    };
  }, [isOpen, imageFile, imageUrl]);

  // Render on preview canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !sourceImage) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cw = canvas.width;
    const ch = canvas.height;

    ctx.clearRect(0, 0, cw, ch);
    ctx.save();

    // Set filters
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) grayscale(${grayscale}%)`;

    // Center and translate
    ctx.translate(cw / 2 + offset.x, ch / 2 + offset.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);

    // Calculate dimensions to fit inside canvas naturally
    const imgRatio = sourceImage.width / sourceImage.height;
    const canvasRatio = cw / ch;

    let renderW = cw;
    let renderH = ch;

    if (imgRatio > canvasRatio) {
      renderH = cw / imgRatio;
    } else {
      renderW = ch * imgRatio;
    }

    ctx.drawImage(
      sourceImage,
      -renderW / 2,
      -renderH / 2,
      renderW,
      renderH,
    );

    ctx.restore();

    // Draw Color Overlay (tint)
    if (overlayOpacity > 0) {
      ctx.save();
      ctx.fillStyle = overlayColor;
      ctx.globalAlpha = overlayOpacity / 100;
      ctx.fillRect(0, 0, cw, ch);
      ctx.restore();
    }
  }, [
    sourceImage,
    scale,
    rotation,
    offset,
    brightness,
    contrast,
    grayscale,
    overlayColor,
    overlayOpacity,
  ]);

  // Mouse / Pointer Drag Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - offset.x,
      y: e.clientY - offset.y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    setScale((prev) => Math.min(Math.max(0.5, prev + delta), 3.5));
  };

  const handleReset = () => {
    setScale(1);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
    setOverlayOpacity(0);
    setBrightness(100);
    setContrast(100);
    setGrayscale(0);
  };

  // Export processed image
  const handleConfirm = async () => {
    if (!sourceImage) return;

    setLoading(true);
    try {
      // Create high-resolution export canvas
      const exportCanvas = document.createElement("canvas");
      exportCanvas.width = targetWidth;
      exportCanvas.height = targetHeight;
      const ctx = exportCanvas.getContext("2d");

      if (!ctx) throw new Error("Could not create canvas context");

      // Draw background
      ctx.fillStyle = isLogo ? "#ffffff" : "#000000";
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      ctx.save();
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) grayscale(${grayscale}%)`;

      // Calculate scale factor from preview canvas (e.g. 360px wide) to targetWidth (e.g. 1200 or 512)
      const previewCanvas = canvasRef.current;
      const previewW = previewCanvas ? previewCanvas.width : 400;
      const multiplier = targetWidth / previewW;

      ctx.translate(
        targetWidth / 2 + offset.x * multiplier,
        targetHeight / 2 + offset.y * multiplier,
      );
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(scale * multiplier, scale * multiplier);

      const imgRatio = sourceImage.width / sourceImage.height;
      const canvasRatio = previewW / (previewCanvas ? previewCanvas.height : 400);

      let renderW = previewW;
      let renderH = previewCanvas ? previewCanvas.height : 400;

      if (imgRatio > canvasRatio) {
        renderH = previewW / imgRatio;
      } else {
        renderW = (previewCanvas ? previewCanvas.height : 400) * imgRatio;
      }

      ctx.drawImage(
        sourceImage,
        -renderW / 2,
        -renderH / 2,
        renderW,
        renderH,
      );

      ctx.restore();

      // Apply Color Overlay
      if (overlayOpacity > 0) {
        ctx.save();
        ctx.fillStyle = overlayColor;
        ctx.globalAlpha = overlayOpacity / 100;
        ctx.fillRect(0, 0, targetWidth, targetHeight);
        ctx.restore();
      }

      // Convert to blob and file
      const mimeType = isLogo ? "image/png" : "image/jpeg";
      const fileExt = isLogo ? "png" : "jpg";
      const filename = `${cropType}_${Date.now()}.${fileExt}`;

      const blob = await new Promise<Blob | null>((resolve) =>
        exportCanvas.toBlob(resolve, mimeType, 0.92),
      );

      if (!blob) throw new Error("Failed to export image blob");

      const file = new File([blob], filename, { type: mimeType });
      const previewUrl = URL.createObjectURL(blob);

      await onConfirm(file, previewUrl);
      onClose();
    } catch (err) {
      console.error("Cropper confirm error:", err);
    } finally {
      setLoading(false);
    }
  };

  const modalTitle =
    title ||
    (isLogo
      ? t("clientProfile.cropLogoTitle", "Cắt & Chỉnh sửa Logo / Ảnh đại diện")
      : t("clientProfile.cropBannerTitle", "Cắt & Chỉnh sửa Ảnh bìa"));

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !loading && onClose()}>
      <DialogContent className="max-w-2xl sm:max-w-3xl overflow-hidden p-0 gap-0">
        <DialogHeader className="p-4 sm:p-5 border-b border-border bg-card/60">
          <DialogTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
            {isLogo ? (
              <Crop className="size-5 text-brand-orange" />
            ) : (
              <Sparkles className="size-5 text-brand-orange" />
            )}
            {modalTitle}
          </DialogTitle>
        </DialogHeader>

        {/* Tab switcher: Cắt ảnh vs Đổ màu & Bộ lọc */}
        <div className="flex border-b border-border bg-muted/30 px-4 sm:px-6 pt-2 gap-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("crop")}
            className={cn(
              "pb-2.5 flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer",
              activeTab === "crop"
                ? "border-brand-orange text-brand-orange"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <Crop className="size-3.5" />
            Cắt & Căn chỉnh ({isLogo ? "1:1 Vuông/Tròn" : "Khổ rộng 3:1"})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("filter")}
            className={cn(
              "pb-2.5 flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer",
              activeTab === "filter"
                ? "border-brand-orange text-brand-orange"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <Palette className="size-3.5" />
            Đổ màu & Bộ lọc ánh sáng
            {overlayOpacity > 0 && (
              <span className="size-2 rounded-full bg-brand-orange" />
            )}
          </button>
        </div>

        {/* Main Content Area */}
        <div className="p-4 sm:p-6 space-y-4">
          {/* Interactive Crop Viewport */}
          <div className="relative flex flex-col items-center justify-center rounded-xl bg-neutral-950 p-4 overflow-hidden border border-border shadow-inner">
            <div
              className={cn(
                "relative overflow-hidden cursor-grab active:cursor-grabbing border-2 border-dashed border-brand-orange/60 shadow-xl",
                isLogo ? "rounded-2xl" : "rounded-lg",
              )}
              style={{
                width: isLogo ? "240px" : "100%",
                maxWidth: isLogo ? "240px" : "540px",
                aspectRatio: previewAspectRatio,
              }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onWheel={handleWheel}
            >
              <canvas
                ref={canvasRef}
                width={isLogo ? 480 : 720}
                height={isLogo ? 480 : 240}
                className="w-full h-full block"
              />

              {/* Circle outline guide for logo/avatar */}
              {isLogo && (
                <div className="pointer-events-none absolute inset-0 rounded-full border border-white/40 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]" />
              )}
            </div>

            <p className="mt-2.5 text-3xs text-muted-foreground/80 select-none">
              Kéo chuột để di chuyển • Lăn chuột để phóng to/thu nhỏ
            </p>
          </div>

          {/* Tab 1: Crop & Transform Controls */}
          {activeTab === "crop" && (
            <div className="space-y-3 bg-muted/20 rounded-xl p-3.5 border border-border">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Zoom control */}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <ZoomIn className="size-3.5" /> Thu phóng:
                    </span>
                    <span className="font-semibold">{Math.round(scale * 100)}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ZoomOut className="size-3.5 text-muted-foreground shrink-0" />
                    <input
                      type="range"
                      min="0.5"
                      max="3.0"
                      step="0.05"
                      value={scale}
                      onChange={(e) => setScale(parseFloat(e.target.value))}
                      className="w-full accent-brand-orange h-1.5 bg-muted rounded cursor-pointer"
                    />
                    <ZoomIn className="size-3.5 text-muted-foreground shrink-0" />
                  </div>
                </div>

                {/* Actions: Rotate & Reset */}
                <div className="flex items-center gap-2 pt-1 sm:pt-0 self-end sm:self-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 text-xs cursor-pointer"
                    onClick={() => setRotation((r) => (r + 90) % 360)}
                  >
                    <RotateCw className="size-3.5" />
                    Xoay 90°
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1.5 text-xs text-muted-foreground cursor-pointer"
                    onClick={handleReset}
                  >
                    <RefreshCw className="size-3.5" />
                    Đặt lại
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Color Overlay & Light Filters */}
          {activeTab === "filter" && (
            <div className="space-y-4 bg-muted/20 rounded-xl p-3.5 border border-border">
              {/* Color Overlay Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold flex items-center gap-1.5">
                    <Palette className="size-3.5 text-brand-orange" />
                    Đổ màu nhẹ (Color Overlay):
                  </Label>
                  <span className="text-xs font-semibold text-brand-orange">
                    {overlayOpacity}% độ phủ
                  </span>
                </div>

                {/* Swatches */}
                <div className="flex flex-wrap items-center gap-2">
                  {OVERLAY_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      title={c.name}
                      onClick={() => {
                        setOverlayColor(c.value);
                        if (overlayOpacity === 0) setOverlayOpacity(20);
                      }}
                      className={cn(
                        "size-6 rounded-full border transition-all cursor-pointer flex items-center justify-center",
                        overlayColor === c.value && overlayOpacity > 0
                          ? "ring-2 ring-brand-orange ring-offset-2 scale-110 border-white"
                          : "border-black/20 hover:scale-105",
                      )}
                      style={{ background: c.value }}
                    >
                      {overlayColor === c.value && overlayOpacity > 0 && (
                        <Check
                          className={cn(
                            "size-3 font-bold",
                            c.value === "#ffffff" ? "text-black" : "text-white",
                          )}
                        />
                      )}
                    </button>
                  ))}

                  {/* Custom color input */}
                  <div className="flex items-center gap-1.5 pl-2 border-l border-border">
                    <input
                      type="color"
                      value={overlayColor}
                      onChange={(e) => {
                        setOverlayColor(e.target.value);
                        if (overlayOpacity === 0) setOverlayOpacity(20);
                      }}
                      className="size-7 rounded cursor-pointer border-0 bg-transparent"
                      title="Chọn màu khác"
                    />
                    <span className="text-3xs font-mono text-muted-foreground uppercase">
                      {overlayColor}
                    </span>
                  </div>
                </div>

                {/* Opacity slider */}
                <div className="pt-1.5">
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="2"
                    value={overlayOpacity}
                    onChange={(e) => setOverlayOpacity(parseInt(e.target.value, 10))}
                    className="w-full accent-brand-orange h-1.5 bg-muted rounded cursor-pointer"
                  />
                  <div className="flex justify-between text-3xs text-muted-foreground mt-0.5">
                    <span>Không đổ màu (0%)</span>
                    <span>Phủ nhẹ (20%)</span>
                    <span>Phủ đậm (50%)</span>
                  </div>
                </div>
              </div>

              {/* Light adjustment: Brightness & Contrast */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-border/70">
                <div className="space-y-1">
                  <div className="flex justify-between text-3xs font-medium">
                    <span className="text-muted-foreground">Độ sáng:</span>
                    <span>{brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="75"
                    max="135"
                    step="5"
                    value={brightness}
                    onChange={(e) => setBrightness(parseInt(e.target.value, 10))}
                    className="w-full accent-brand-orange h-1.5 bg-muted rounded cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-3xs font-medium">
                    <span className="text-muted-foreground">Tương phản:</span>
                    <span>{contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min="75"
                    max="135"
                    step="5"
                    value={contrast}
                    onChange={(e) => setContrast(parseInt(e.target.value, 10))}
                    className="w-full accent-brand-orange h-1.5 bg-muted rounded cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-3xs font-medium">
                    <span className="text-muted-foreground">Đen trắng:</span>
                    <span>{grayscale}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="10"
                    value={grayscale}
                    onChange={(e) => setGrayscale(parseInt(e.target.value, 10))}
                    className="w-full accent-brand-orange h-1.5 bg-muted rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="p-4 sm:p-5 border-t border-border bg-card/60 flex items-center justify-between sm:justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="cursor-pointer text-xs h-9"
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={loading || !sourceImage}
            className="cursor-pointer text-xs h-9 gap-1.5 bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Đang xử lý & lưu...
              </>
            ) : (
              <>
                <Check className="size-4" />
                Áp dụng & Cắt ảnh
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
