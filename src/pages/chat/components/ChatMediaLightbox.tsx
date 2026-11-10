import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import {
  RotateCw,
  Minus,
  Plus,
  Download,
  ExternalLink,
  Maximize,
  Minimize,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Volume1,
  X,
  FileText,
  PictureInPicture2,
  Loader2,
} from "lucide-react";
import { useChatMediaLightbox } from "@/pages/chat/hooks/useChatMediaLightbox";
import { AdobePdfIcon } from "@/pages/chat/components/ChatAttachmentComposer";
import { chatAttachmentService } from "@/pages/chat/services/chatAttachmentService";
import { Button } from "@/components/ui/button";
import { formatFileSize } from "@/lib/utils";

function formatVideoTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

function formatSentTime(dateStr?: string, lang: string = "vi"): string {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffSec < 60) return lang === "vi" ? "Vừa xong" : "Just now";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60)
      return lang === "vi" ? `${diffMin} phút trước` : `${diffMin}m ago`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24)
      return lang === "vi" ? `${diffHour} giờ trước` : `${diffHour}h ago`;
    return new Intl.DateTimeFormat(lang === "vi" ? "vi-VN" : "en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return dateStr;
  }
}

export function ChatMediaLightbox() {
  const { t, i18n } = useTranslation();
  const { isOpen, item, closeLightbox } = useChatMediaLightbox();

  // Image states
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // Video states
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  // General states
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Reset transforms when item changes
  useEffect(() => {
    setZoom(1);
    setRotation(0);
    setPan({ x: 0, y: 0 });
    setIsDragging(false);
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [item?.url]);

  // Handle Escape key & Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeLightbox();
        return;
      }

      // Video shortcuts
      if (item?.mimeType?.startsWith("video/")) {
        if (e.key === " " || e.code === "Space") {
          e.preventDefault();
          togglePlay();
        } else if (e.key === "m" || e.key === "M") {
          e.preventDefault();
          toggleMute();
        } else if (e.key === "f" || e.key === "F") {
          e.preventDefault();
          toggleFullscreen();
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          seekDelta(-5);
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          seekDelta(5);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, item, muted]);

  // Handle Fullscreen change
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  const handleDownload = async () => {
    if (!item) return;
    setDownloading(true);
    try {
      if (item.workspaceId && item.channelId && item.attachmentId) {
        const current = await chatAttachmentService.inspect(
          item.workspaceId,
          item.channelId,
          item.attachmentId,
        );
        const blob = await chatAttachmentService.content(
          item.workspaceId,
          item.channelId,
          item.attachmentId,
        );
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = current.filename || item.filename;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        return;
      }
    } catch (err) {
      console.warn("Re-auth download error, falling back to direct URL:", err);
    } finally {
      setDownloading(false);
    }

    if (item.url) {
      const link = document.createElement("a");
      link.href = item.url;
      link.download = item.filename;
      link.click();
    }
  };

  const handleOpenNewTab = () => {
    if (!item?.url) return;
    window.open(item.url, "_blank", "noopener,noreferrer");
  };

  // Image zoom with mouse wheel
  const handleWheel = (e: React.WheelEvent) => {
    if (!item?.mimeType?.startsWith("image/")) return;
    e.preventDefault();
    setZoom((prev) => {
      const next = e.deltaY < 0 ? prev + 0.15 : prev - 0.15;
      return Math.min(3, Math.max(0.25, Number(next.toFixed(2))));
    });
  };

  // Image drag / pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Video helpers
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
      setPlaying(true);
    } else {
      videoRef.current.pause();
      setPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !muted;
    videoRef.current.muted = nextMuted;
    setMuted(nextMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setMuted(val === 0);
    }
  };

  const seekDelta = (delta: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(
      0,
      Math.min(videoRef.current.duration, videoRef.current.currentTime + delta),
    );
  };

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    if (videoRef.current) {
      videoRef.current.playbackRate = newSpeed;
    }
    setShowSpeedMenu(false);
  };

  const togglePiP = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (err) {
      console.warn("PiP error:", err);
    }
  };

  if (!isOpen || !item) return null;

  const isImage = item.mimeType?.startsWith("image/");
  const isVideo = item.mimeType?.startsWith("video/");
  const isPdf = item.mimeType === "application/pdf";

  const initials = item.senderName
    ? item.senderName
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  return createPortal(
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col bg-black/90 text-white backdrop-blur-md select-none animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeLightbox();
      }}
    >
      {/* 1. Header Bar */}
      <header className="relative z-20 flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          {item.senderAvatar ? (
            <img
              src={item.senderAvatar}
              alt={item.senderName || "User"}
              className="size-9 shrink-0 rounded-lg object-cover ring-1 ring-white/20"
            />
          ) : (
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-orange-600/90 text-xs font-bold text-white shadow-xs">
              {initials}
            </div>
          )}
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-white/95">
              {item.senderName || t("chat.ui.roles.MEMBER")}
            </h2>
            <p className="flex items-center gap-1.5 truncate text-xs text-white/70">
              {item.sentAt && (
                <span>{formatSentTime(item.sentAt, i18n.language)}</span>
              )}
              {item.channelName && (
                <>
                  <span className="text-white/40">·</span>
                  <span className="font-medium text-white/80">
                    trong #{item.channelName}
                  </span>
                </>
              )}
              <span className="text-white/40">·</span>
              <span className="truncate font-medium text-white/90">
                {item.filename}
              </span>
              <span className="text-white/50">
                ({formatFileSize(item.byteSize)})
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={closeLightbox}
            className="size-9 rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            aria-label={t("chat.actions.close")}
            title="Đóng (Esc)"
          >
            <X className="size-5" />
          </Button>
        </div>
      </header>

      {/* 2. Main Content Area */}
      <main
        className="relative flex flex-1 items-center justify-center overflow-hidden p-4 sm:p-6"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {isImage && (
          <div
            className="flex items-center justify-center transition-transform"
            style={{
              cursor: zoom > 1 ? (isDragging ? "grabbing" : "grab") : "default",
            }}
            onDoubleClick={() => {
              setZoom((z) => (z > 1 ? 1 : 1.5));
              setPan({ x: 0, y: 0 });
            }}
          >
            <img
              src={item.url}
              alt={item.filename}
              draggable={false}
              className="max-h-[76vh] max-w-[90vw] rounded-lg object-contain shadow-2xl select-none"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) rotate(${rotation}deg) scale(${zoom})`,
                transition: isDragging ? "none" : "transform 0.15s ease",
              }}
            />
          </div>
        )}

        {isVideo && (
          <div className="relative flex max-h-[76vh] max-w-[90vw] items-center justify-center overflow-hidden rounded-xl bg-black shadow-2xl">
            <video
              ref={videoRef}
              src={item.url}
              playsInline
              preload="metadata"
              className="max-h-[76vh] max-w-[90vw] object-contain"
              onClick={togglePlay}
              onTimeUpdate={() => {
                if (videoRef.current) {
                  setCurrentTime(videoRef.current.currentTime);
                }
              }}
              onLoadedMetadata={() => {
                if (videoRef.current) {
                  setDuration(videoRef.current.duration);
                }
              }}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onEnded={() => setPlaying(false)}
            />
            {/* Center Big Play overlay when paused */}
            {!playing && (
              <button
                type="button"
                onClick={togglePlay}
                className="absolute flex size-16 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white shadow-xl backdrop-blur-xs transition-transform hover:scale-110 hover:bg-black/80"
                aria-label="Phát"
              >
                <Play className="ml-1 size-8 fill-current" />
              </button>
            )}
          </div>
        )}

        {isPdf && (
          <div className="flex h-full w-full max-w-5xl flex-col items-center justify-center">
            <div className="mb-3 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 backdrop-blur-xs">
              <div className="flex size-9 items-center justify-center rounded-lg bg-[#e01e5a]">
                <AdobePdfIcon className="size-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">
                  {item.filename}
                </p>
                <p className="text-xs text-white/60">
                  {formatFileSize(item.byteSize)}
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => void handleDownload()}
                disabled={downloading}
                className="ml-4 gap-1.5 rounded-lg bg-white/20 text-white hover:bg-white/30"
              >
                {downloading ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Download className="size-3.5" />
                )}
                <span>Tải về</span>
              </Button>
            </div>
            <iframe
              src={item.url}
              title={item.filename}
              className="h-[68vh] w-full rounded-xl border border-white/10 bg-white shadow-2xl"
            />
          </div>
        )}

        {!isImage && !isVideo && !isPdf && (
          <div className="flex flex-col items-center justify-center gap-3 text-center">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-white/10 text-white shadow-inner">
              <FileText className="size-8" />
            </div>
            <p className="text-base font-semibold">{item.filename}</p>
            <p className="text-xs text-white/60">
              {formatFileSize(item.byteSize)}
            </p>
            <Button
              variant="orange"
              onClick={() => void handleDownload()}
              disabled={downloading}
              className="mt-2 gap-2"
            >
              {downloading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
              <span>Tải file về máy</span>
            </Button>
          </div>
        )}
      </main>

      {/* 3. Bottom Floating Control Bar (Slack Style) */}
      <footer className="relative z-20 flex h-16 shrink-0 items-center justify-between border-t border-white/10 px-4 sm:px-6">
        {/* Left / Center tools */}
        {isImage && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setRotation((r) => (r + 90) % 360)}
              className="size-8 rounded-lg text-white/80 hover:bg-white/10 hover:text-white"
              title="Xoay 90°"
            >
              <RotateCw className="size-4" />
            </Button>
            <div className="mx-1 h-4 w-px bg-white/20" />
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                setZoom((z) =>
                  Math.max(0.25, Number((z - 0.25).toFixed(2))),
                )
              }
              className="size-8 rounded-lg text-white/80 hover:bg-white/10 hover:text-white"
              title="Thu nhỏ"
            >
              <Minus className="size-4" />
            </Button>
            <input
              type="range"
              min="0.25"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="h-1.5 w-24 cursor-pointer rounded-lg bg-white/20 accent-[#ff5722] sm:w-32"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                setZoom((z) =>
                  Math.min(3, Number((z + 0.25).toFixed(2))),
                )
              }
              className="size-8 rounded-lg text-white/80 hover:bg-white/10 hover:text-white"
              title="Phóng to"
            >
              <Plus className="size-4" />
            </Button>
            <button
              type="button"
              onClick={() => {
                setZoom(1);
                setPan({ x: 0, y: 0 });
                setRotation(0);
              }}
              className="rounded bg-white/10 px-2 py-0.5 font-mono text-xs text-white/80 transition-colors hover:bg-white/20 hover:text-white"
              title="Đặt lại kích thước (100%)"
            >
              {Math.round(zoom * 100)}%
            </button>
          </div>
        )}

        {isVideo && (
          <div className="flex flex-1 items-center gap-3 pr-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlay}
              className="size-8 shrink-0 rounded-lg text-white/90 hover:bg-white/10 hover:text-white"
              title={playing ? "Tạm dừng (Space)" : "Phát (Space)"}
            >
              {playing ? (
                <Pause className="size-4 fill-current" />
              ) : (
                <Play className="ml-0.5 size-4 fill-current" />
              )}
            </Button>

            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className="size-8 shrink-0 rounded-lg text-white/80 hover:bg-white/10 hover:text-white"
                title={muted ? "Bật âm thanh (M)" : "Tắt tiếng (M)"}
              >
                {muted || volume === 0 ? (
                  <VolumeX className="size-4" />
                ) : volume < 0.5 ? (
                  <Volume1 className="size-4" />
                ) : (
                  <Volume2 className="size-4" />
                )}
              </Button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={muted ? 0 : volume}
                onChange={handleVolumeChange}
                className="h-1.5 w-16 cursor-pointer rounded-lg bg-white/20 accent-[#ff5722]"
              />
            </div>

            <span className="font-mono text-xs tabular-nums text-white/70">
              {formatVideoTime(currentTime)} / {formatVideoTime(duration)}
            </span>

            {/* Video Scrubber bar */}
            <input
              type="range"
              min="0"
              max={duration || 100}
              step="0.1"
              value={currentTime}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setCurrentTime(val);
                if (videoRef.current) {
                  videoRef.current.currentTime = val;
                }
              }}
              className="h-1.5 flex-1 cursor-pointer rounded-lg bg-white/20 accent-[#ff5722]"
            />

            {/* Picture-in-Picture Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => void togglePiP()}
              className="size-8 shrink-0 rounded-lg text-white/80 hover:bg-white/10 hover:text-white"
              title="Picture-in-Picture (PiP)"
              aria-label="Picture in Picture"
            >
              <PictureInPicture2 className="size-4" />
            </Button>

            {/* Playback speed selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowSpeedMenu((s) => !s)}
                className="rounded bg-white/10 px-2 py-1 font-mono text-xs text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                title="Tốc độ phát"
              >
                {speed}x
              </button>
              {showSpeedMenu && (
                <div className="absolute right-0 bottom-9 flex flex-col rounded-xl border border-white/15 bg-zinc-900 p-1 shadow-xl">
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleSpeedChange(s)}
                      className={`rounded px-3 py-1 text-left text-xs transition-colors hover:bg-white/10 ${
                        speed === s
                          ? "font-bold text-[#ff5722]"
                          : "text-white/80"
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {!isImage && !isVideo && <div />}

        {/* Right action tools */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => void handleDownload()}
            disabled={downloading}
            className="size-8 rounded-lg text-white/80 hover:bg-white/10 hover:text-white"
            title="Tải về máy"
            aria-label="Tải về"
          >
            {downloading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Download className="size-4" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleOpenNewTab}
            className="size-8 rounded-lg text-white/80 hover:bg-white/10 hover:text-white"
            title="Mở trong tab mới"
            aria-label="Mở tab mới"
          >
            <ExternalLink className="size-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="size-8 rounded-lg text-white/80 hover:bg-white/10 hover:text-white"
            title={isFullscreen ? "Thu nhỏ (F)" : "Toàn màn hình (F)"}
            aria-label="Toàn màn hình"
          >
            {isFullscreen ? (
              <Minimize className="size-4" />
            ) : (
              <Maximize className="size-4" />
            )}
          </Button>
        </div>
      </footer>
    </div>,
    document.body,
  );
}
