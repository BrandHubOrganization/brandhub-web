import { type ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  Clapperboard,
  Clock,
  Film,
  ImagePlus,
  Loader2,
  Play,
  Upload,
  Video,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { DownloadFormatDropdown } from "@/components/common/DownloadFormatDropdown";
import { downloadMediaWithFormat } from "@/utils/mediaDownloadHelper";
import { aiCreditErrorMessage } from "@/services/aiCreditRequest";
import {
  aiGenerationService,
  imageSourceToDataUrl,
} from "@/services/aiGenerationService";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { aiVideoService } from "@/services/aiVideoService";

const wait = (milliseconds: number) =>
  new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds));

const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
const MAX_VIDEO_BYTES = 100 * 1024 * 1024;
const FRAMES_PER_MOTION_NODE = 81;
const DEFAULT_FPS_ESTIMATE = 30;
const MAX_MOTION_NODES = 10;
const MP4_CONTAINER_BOXES = new Set(["moov", "trak", "mdia", "minf", "stbl"]);

interface Mp4BoxProbeResult {
  frames: number;
  duration: number | null;
  fps: number | null;
}

function readBoxType(view: DataView, offset: number): string {
  return String.fromCharCode(
    view.getUint8(offset),
    view.getUint8(offset + 1),
    view.getUint8(offset + 2),
    view.getUint8(offset + 3),
  );
}

/**
 * Browser-side ISO-BMFF (MP4/MOV) box parser matching `_parse_mp4_boxes` in
 * `ai-worker-video/ai-worker-video-api/app.py` to read exact frame count (`stsz`)
 * and duration (`mdhd`) so the Web motion node count matches the worker 100%.
 */
function parseMp4VideoBoxes(
  buffer: ArrayBuffer,
): Mp4BoxProbeResult | null {
  const view = new DataView(buffer);
  const byteLength = view.byteLength;

  function* iterBoxes(
    start = 0,
    end = byteLength,
  ): Generator<{ btype: string; payloadStart: number; boxEnd: number }> {
    const limit = Math.min(byteLength, end);
    let pos = start;
    while (pos + 8 <= limit) {
      let size = view.getUint32(pos, false);
      const btype = readBoxType(view, pos + 4);
      let headerSize = 8;
      if (size === 1) {
        if (pos + 16 > limit) break;
        const hi = view.getUint32(pos + 8, false);
        const lo = view.getUint32(pos + 12, false);
        size = hi * 4294967296 + lo;
        headerSize = 16;
      } else if (size === 0) {
        size = limit - pos;
      }
      if (size < headerSize || pos + size > limit) break;
      yield { btype, payloadStart: pos + headerSize, boxEnd: pos + size };
      pos += size;
    }
  }

  function parseTrak(start: number, end: number): Mp4BoxProbeResult | null {
    let isVideo = false;
    let timescale: number | null = null;
    let medDuration: number | null = null;
    let sampleCount: number | null = null;

    function walk(s: number, e: number) {
      for (const { btype, payloadStart, boxEnd } of iterBoxes(s, e)) {
        if (MP4_CONTAINER_BOXES.has(btype)) {
          walk(payloadStart, boxEnd);
        } else if (btype === "hdlr" && boxEnd - payloadStart >= 12) {
          const handler = readBoxType(view, payloadStart + 8);
          if (handler === "vide") {
            isVideo = true;
          }
        } else if (btype === "mdhd" && boxEnd - payloadStart >= 20) {
          const version = view.getUint8(payloadStart);
          if (version === 0 && boxEnd - payloadStart >= 20) {
            timescale = view.getUint32(payloadStart + 12, false);
            medDuration = view.getUint32(payloadStart + 16, false);
          } else if (version === 1 && boxEnd - payloadStart >= 32) {
            timescale = view.getUint32(payloadStart + 20, false);
            const hi = view.getUint32(payloadStart + 24, false);
            const lo = view.getUint32(payloadStart + 28, false);
            medDuration = hi * 4294967296 + lo;
          }
        } else if (btype === "stsz" && boxEnd - payloadStart >= 12) {
          const count = view.getUint32(payloadStart + 8, false);
          if (count > 0) {
            sampleCount = count;
          }
        }
      }
    }

    walk(start, end);
    if (isVideo && sampleCount && sampleCount > 0) {
      const duration =
        timescale && medDuration && timescale > 0
          ? medDuration / timescale
          : null;
      const fps = duration && duration > 0 ? sampleCount / duration : null;
      return { frames: sampleCount, duration, fps };
    }
    return null;
  }

  for (const { btype, payloadStart, boxEnd } of iterBoxes()) {
    if (btype === "moov") {
      for (const sub of iterBoxes(payloadStart, boxEnd)) {
        if (sub.btype === "trak") {
          const res = parseTrak(sub.payloadStart, sub.boxEnd);
          if (res) return res;
        }
      }
    }
  }
  return null;
}

const SUPPORTED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const SUPPORTED_VIDEO_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-matroska",
]);

function isSupportedImageFile(file: File): boolean {
  if (SUPPORTED_IMAGE_TYPES.has(file.type)) return true;
  return /\.(jpe?g|png|webp)$/i.test(file.name);
}

function isSupportedVideoFile(file: File): boolean {
  if (SUPPORTED_VIDEO_TYPES.has(file.type)) return true;
  return /\.(mp4|webm|mov|mkv)$/i.test(file.name);
}

function isImageUrlCandidate(url: string): boolean {
  if (!url) return false;
  if (url.startsWith("data:video/")) return false;
  if (/\.(mp4|webm|mov|mkv)(\?|#|$)/i.test(url)) return false;
  return true;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      typeof reader.result === "string"
        ? resolve(reader.result)
        : reject(new Error("Invalid file result"));
    reader.onerror = () => reject(reader.error ?? new Error("File read failed"));
    reader.readAsDataURL(file);
  });
}

function probeVideoMetadata(
  objectUrl: string,
): Promise<{ duration: number; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;

    const cleanup = () => {
      video.removeAttribute("src");
      video.load();
    };

    video.onloadedmetadata = () => {
      const duration = video.duration;
      const width = video.videoWidth || 576;
      const height = video.videoHeight || 1024;
      cleanup();
      if (!Number.isFinite(duration) || duration <= 0) {
        reject(new Error("Invalid video duration"));
        return;
      }
      resolve({ duration, width, height });
    };

    video.onerror = () => {
      cleanup();
      reject(new Error("Failed to load video metadata"));
    };

    video.src = objectUrl;
  });
}

function formatDurationSeconds(seconds: number): string {
  const rounded = Math.round(seconds * 10) / 10;
  return Number.isInteger(rounded) ? `${rounded}` : rounded.toFixed(1);
}

function calculateMotionNodes(
  totalFrames: number | null,
  durationSeconds: number,
): number {
  const effectiveFrames =
    totalFrames && totalFrames > 0
      ? totalFrames
      : Math.max(1, Math.round(durationSeconds * DEFAULT_FPS_ESTIMATE));
  return Math.min(
    MAX_MOTION_NODES,
    Math.max(1, Math.ceil(effectiveFrames / FRAMES_PER_MOTION_NODE)),
  );
}

interface AIVideoAssistPanelProps {
  referenceMediaUrls?: string[];
  onApplyVideo: (videoUrl: string, s3Key?: string) => void;
}

export function AIVideoAssistPanel({
  referenceMediaUrls = [],
  onApplyVideo,
}: AIVideoAssistPanelProps) {
  const { t } = useTranslation();
  const workspaceId = useWorkspaceStore((state) => state.currentWorkspace?.id);
  const mountedRef = useRef(true);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const postImageUrls = useMemo(
    () => referenceMediaUrls.filter(isImageUrlCandidate),
    [referenceMediaUrls],
  );

  const [uploadedImage, setUploadedImage] = useState("");
  const [selectedImage, setSelectedImage] = useState(postImageUrls[0] ?? "");

  const [poseVideoDataUrl, setPoseVideoDataUrl] = useState("");
  const [poseVideoObjectUrl, setPoseVideoObjectUrl] = useState("");
  const [poseVideoName, setPoseVideoName] = useState("");
  const [poseVideoSizeMb, setPoseVideoSizeMb] = useState<number | null>(null);
  const [poseVideoDuration, setPoseVideoDuration] = useState<number | null>(
    null,
  );
  const [poseVideoFrames, setPoseVideoFrames] = useState<number | null>(null);
  const [poseVideoFps, setPoseVideoFps] = useState<number | null>(null);
  const [poseVideoDimensions, setPoseVideoDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [isProbingVideo, setIsProbingVideo] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [videoBrief, setVideoBrief] = useState("");
  const [jobStatus, setJobStatus] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoS3Key, setVideoS3Key] = useState<string>();

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (poseVideoObjectUrl) {
        URL.revokeObjectURL(poseVideoObjectUrl);
      }
    };
  }, [poseVideoObjectUrl]);

  useEffect(() => {
    if (!selectedImage && postImageUrls[0]) {
      setSelectedImage(postImageUrls[0]);
    }
  }, [postImageUrls, selectedImage]);

  const imageReferences = useMemo(
    () =>
      Array.from(
        new Set([uploadedImage, ...postImageUrls].filter(Boolean)),
      ).slice(0, 4),
    [postImageUrls, uploadedImage],
  );

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!isSupportedImageFile(file)) {
      toast.error(t("editor.studio.video.uploadImageOnly"));
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error(t("editor.studio.video.uploadImageTooLarge"));
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      if (!mountedRef.current) return;
      setUploadedImage(dataUrl);
      setSelectedImage(dataUrl);
      toast.success(t("editor.studio.video.uploadImageSuccess"));
    } catch {
      if (mountedRef.current) {
        toast.error(t("editor.studio.image.uploadFailed"));
      }
    }
  };

  const handleVideoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!isSupportedVideoFile(file)) {
      toast.error(t("editor.studio.video.uploadVideoOnly"));
      return;
    }
    if (file.size > MAX_VIDEO_BYTES) {
      toast.error(t("editor.studio.video.uploadVideoTooLarge"));
      return;
    }

    const nextObjectUrl = URL.createObjectURL(file);
    setIsProbingVideo(true);
    try {
      const [metadata, dataUrl, rawBuffer] = await Promise.all([
        probeVideoMetadata(nextObjectUrl),
        readFileAsDataUrl(file),
        typeof file.arrayBuffer === "function"
          ? file.arrayBuffer().catch(() => null)
          : Promise.resolve(null),
      ]);
      if (!mountedRef.current) {
        URL.revokeObjectURL(nextObjectUrl);
        return;
      }
      const mp4Probe = rawBuffer ? parseMp4VideoBoxes(rawBuffer) : null;
      setPoseVideoObjectUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return nextObjectUrl;
      });
      setPoseVideoDataUrl(dataUrl);
      setPoseVideoName(file.name);
      setPoseVideoSizeMb(Math.round((file.size / (1024 * 1024)) * 100) / 100);
      setPoseVideoDuration(mp4Probe?.duration ?? metadata.duration);
      setPoseVideoFrames(mp4Probe?.frames ?? null);
      setPoseVideoFps(
        mp4Probe?.fps ? Math.round(mp4Probe.fps * 10) / 10 : null,
      );
      setPoseVideoDimensions({
        width: metadata.width,
        height: metadata.height,
      });
      toast.success(t("editor.studio.video.uploadVideoSuccess"));
    } catch {
      URL.revokeObjectURL(nextObjectUrl);
      if (mountedRef.current) {
        toast.error(t("editor.studio.video.durationProbeFailed"));
      }
    } finally {
      if (mountedRef.current) {
        setIsProbingVideo(false);
      }
    }
  };

  const handleGenerate = async () => {
    const hasMotionInputs =
      Boolean(selectedImage) &&
      Boolean(poseVideoDataUrl) &&
      poseVideoDuration !== null;

    if (!hasMotionInputs && !videoBrief.trim()) {
      if (!selectedImage) {
        toast.error(t("editor.studio.video.imageRequired"));
        return;
      }
      toast.error(t("editor.studio.video.videoRequired"));
      return;
    }

    setIsGenerating(true);
    setVideoUrl("");
    setVideoS3Key(undefined);
    setJobStatus("PENDING");
    try {
      if (!hasMotionInputs && videoBrief.trim()) {
        const job = await aiGenerationService.generateVideo({
          prompt: videoBrief.trim(),
          clientId: workspaceId || "studio",
        });
        for (let attempt = 0; attempt < 600; attempt += 1) {
          await wait(500);
          if (!mountedRef.current) return;
          const status = await aiGenerationService.getVideoStatus(job.job_id);
          setJobStatus(status.status);
          if (status.status === "COMPLETED" && status.video_url) {
            setVideoUrl(status.video_url);
            setVideoS3Key(status.s3_key ?? undefined);
            toast.success(t("editor.studio.video.generateSuccess"));
            return;
          }
          if (status.status === "FAILED") {
            throw new Error(
              status.error_message ||
                status.error_code ||
                "Video generation failed",
            );
          }
        }
        throw new Error("Video generation timed out");
      }

      if (!workspaceId) throw new Error("A workspace is required for AI video");
      const referenceImageBase64 = await imageSourceToDataUrl(selectedImage);
      const aspectRatio: "16:9" | "9:16" =
        poseVideoDimensions &&
        poseVideoDimensions.width > poseVideoDimensions.height
          ? "16:9"
          : "9:16";

      const { job } = await aiVideoService.generate(workspaceId, {
        prompt: videoBrief.trim() || undefined,
        aspectRatio,
        referenceImageBase64,
        poseVideoBase64: poseVideoDataUrl,
        poseVideoFilename: poseVideoName || "pose_video.mp4",
        durationSeconds: Math.round(poseVideoDuration! * 100) / 100,
      });

      for (let attempt = 0; attempt < 600; attempt += 1) {
        await wait(3000);
        if (!mountedRef.current) return;
        const status = await aiVideoService.status(workspaceId, job.jobId);
        setJobStatus(status.status);
        if (status.status === "COMPLETED" && status.videoUrl) {
          setVideoUrl(status.videoUrl);
          setVideoS3Key(status.s3Key ?? undefined);
          toast.success(t("editor.studio.video.generateSuccess"));
          return;
        }
        if (status.status === "FAILED") {
          throw new Error(status.errorCode || "Video generation failed");
        }
      }
      throw new Error("Video generation timed out");
    } catch (error) {
      if (mountedRef.current)
        toast.error(
          aiCreditErrorMessage(error) ??
            t("editor.studio.video.generateFailed"),
          { duration: 8000 },
        );
    } finally {
      if (mountedRef.current) setIsGenerating(false);
    }
  };

  const motionNodes =
    poseVideoDuration !== null
      ? calculateMotionNodes(poseVideoFrames, poseVideoDuration)
      : null;

  return (
    <div className="border-border bg-card space-y-5 rounded-xl border p-4">
      <div className="space-y-2">
        <label
          htmlFor="studio-video-brief"
          className="text-muted-foreground text-xs font-semibold"
        >
          {t("editor.studio.video.briefLabel")}
        </label>
        <Textarea
          id="studio-video-brief"
          rows={3}
          value={videoBrief}
          onChange={(event) => setVideoBrief(event.target.value)}
          placeholder={t("editor.studio.video.briefPlaceholder")}
          className="border-border bg-muted text-foreground rounded-lg text-xs"
        />
      </div>

      {/* 1. Reference Image (1 ảnh tham chiếu) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <ImagePlus className="text-muted-foreground size-3.5" />
            <span className="text-muted-foreground text-2xs font-semibold tracking-wider uppercase">
              {t("editor.studio.video.referenceImageLabel")}
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-2xs h-7 gap-1 px-2"
            onClick={() => imageInputRef.current?.click()}
          >
            <Upload className="size-3" />
            {t("editor.studio.video.uploadImageButton")}
          </Button>
          <input
            ref={imageInputRef}
            data-testid="video-ref-image-input"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={handleImageUpload}
          />
        </div>

        {imageReferences.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {imageReferences.map((url, index) => (
              <button
                key={`${url.slice(0, 80)}-${index}`}
                type="button"
                onClick={() => setSelectedImage(url)}
                aria-label={`${t("editor.studio.video.referenceImageLabel")} ${index + 1}`}
                className={cn(
                  "border-border bg-muted relative aspect-square overflow-hidden rounded-lg border-2 transition-colors",
                  selectedImage === url && "border-brand-orange",
                )}
              >
                <img src={url} alt="" className="h-full w-full object-cover" />
                {selectedImage === url && (
                  <span className="bg-brand-orange absolute top-1.5 right-1.5 flex size-5 items-center justify-center rounded-full text-white">
                    <Check className="size-3" />
                  </span>
                )}
              </button>
            ))}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            className="border-border bg-muted/40 hover:border-brand-orange/50 hover:bg-muted/70 flex w-full flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed px-3 py-5 text-center transition-colors"
          >
            <ImagePlus className="text-muted-foreground size-5" />
            <span className="text-foreground text-xs font-medium">
              {t("editor.studio.video.selectImagePrompt")}
            </span>
            <span className="text-muted-foreground text-2xs">
              {t("editor.studio.video.referenceImageHint")}
            </span>
          </button>
        )}
      </div>

      {/* 2. Reference Video (1 video chuyển động ref) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Film className="text-muted-foreground size-3.5" />
            <span className="text-muted-foreground text-2xs font-semibold tracking-wider uppercase">
              {t("editor.studio.video.referenceVideoLabel")}
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-2xs h-7 gap-1 px-2"
            disabled={isProbingVideo}
            onClick={() => videoInputRef.current?.click()}
          >
            <Upload className="size-3" />
            {poseVideoObjectUrl
              ? t("editor.studio.video.changeVideoButton")
              : t("editor.studio.video.uploadVideoButton")}
          </Button>
          <input
            ref={videoInputRef}
            data-testid="video-ref-video-input"
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            className="hidden"
            onChange={handleVideoUpload}
          />
        </div>

        {poseVideoObjectUrl ? (
          <div className="border-brand-orange bg-muted/30 space-y-2 overflow-hidden rounded-lg border-2 p-2">
            <div className="relative overflow-hidden rounded-md bg-black">
              <video
                src={poseVideoObjectUrl}
                controls
                muted
                playsInline
                preload="metadata"
                onLoadedMetadata={(event) => {
                  const duration = event.currentTarget.duration;
                  if (Number.isFinite(duration) && duration > 0) {
                    setPoseVideoDuration(duration);
                  }
                  if (
                    event.currentTarget.videoWidth &&
                    event.currentTarget.videoHeight
                  ) {
                    setPoseVideoDimensions({
                      width: event.currentTarget.videoWidth,
                      height: event.currentTarget.videoHeight,
                    });
                  }
                }}
                className="max-h-48 w-full object-contain"
              />
              <span className="bg-brand-orange absolute top-1.5 right-1.5 flex size-5 items-center justify-center rounded-full text-white shadow-xs">
                <Check className="size-3" />
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 px-1">
              <span className="text-foreground truncate text-xs font-medium">
                {poseVideoName}
              </span>
              {poseVideoSizeMb !== null && (
                <span className="text-muted-foreground text-2xs shrink-0 font-mono">
                  {poseVideoSizeMb} MB
                </span>
              )}
            </div>
          </div>
        ) : (
          <button
            type="button"
            disabled={isProbingVideo}
            onClick={() => videoInputRef.current?.click()}
            className="border-border bg-muted/40 hover:border-brand-orange/50 hover:bg-muted/70 flex w-full flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed px-3 py-5 text-center transition-colors"
          >
            {isProbingVideo ? (
              <Loader2 className="text-brand-orange size-5 animate-spin" />
            ) : (
              <Film className="text-muted-foreground size-5" />
            )}
            <span className="text-foreground text-xs font-medium">
              {isProbingVideo
                ? t("editor.studio.video.durationProbing")
                : t("editor.studio.video.selectVideoPrompt")}
            </span>
            <span className="text-muted-foreground text-2xs">
              {t("editor.studio.video.referenceVideoHint")}
            </span>
          </button>
        )}
      </div>

      {/* 3. Auto-detected Duration Display (Tự đo thời lượng hiển thị ở dưới) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground text-xs font-semibold">
            {t("editor.studio.video.durationLabel")}
          </span>
          <span className="bg-brand-orange-soft text-brand-orange text-2xs inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium">
            <Clock className="size-3" />
            {t("editor.studio.video.durationAutoBadge")}
          </span>
        </div>

        {poseVideoDuration !== null ? (
          <div
            data-testid="video-detected-duration"
            className="border-brand-orange bg-brand-orange-soft/60 flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5"
          >
            <div className="flex items-center gap-2">
              <Video className="text-brand-orange size-4 shrink-0" />
              <div className="min-w-0">
                <p className="text-brand-orange font-mono text-sm font-bold">
                  {t("editor.studio.video.durationMeasured", {
                    seconds: formatDurationSeconds(poseVideoDuration),
                  })}
                </p>
                <p className="text-muted-foreground text-2xs">
                  {poseVideoFrames
                    ? t("editor.studio.video.durationMetaExact", {
                        frames: poseVideoFrames,
                        fps: poseVideoFps ?? DEFAULT_FPS_ESTIMATE,
                        nodes: motionNodes ?? 1,
                      })
                    : t("editor.studio.video.durationMeta", {
                        nodes: motionNodes ?? 1,
                      })}
                </p>
              </div>
            </div>
            {poseVideoDimensions && (
              <span className="border-brand-orange/30 bg-background/80 text-foreground text-2xs shrink-0 rounded-md border px-2 py-1 font-mono">
                {poseVideoDimensions.width}×{poseVideoDimensions.height}
              </span>
            )}
          </div>
        ) : (
          <div
            data-testid="video-duration-empty"
            className="bg-muted text-muted-foreground text-2xs flex items-center gap-2 rounded-lg px-3 py-2.5"
          >
            <Video className="text-brand-orange size-3.5 shrink-0" />
            <span>{t("editor.studio.video.durationEmptyNotice")}</span>
          </div>
        )}
      </div>

      <Button
        data-testid="generate-video"
        variant="orange"
        className="w-full"
        disabled={isGenerating || isProbingVideo}
        onClick={handleGenerate}
      >
        {isGenerating ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Clapperboard className="size-4" />
        )}
        {isGenerating
          ? t("editor.studio.video.generating")
          : t("editor.studio.video.generateButton")}
      </Button>

      {isGenerating && (
        <p className="text-brand-orange text-2xs text-center font-semibold">
          {t("editor.studio.video.status", { status: jobStatus })}
        </p>
      )}

      {videoUrl && (
        <div className="space-y-3">
          <video
            src={videoUrl}
            controls
            className="border-border aspect-video w-full rounded-lg border bg-black"
          />
          <div className="grid grid-cols-2 gap-2">
            <Button
              data-testid="apply-video"
              variant="outline"
              className="w-full"
              onClick={() => onApplyVideo(videoUrl, videoS3Key)}
            >
              <Play className="size-4" />
              {t("editor.studio.video.applyButton")}
            </Button>
            <DownloadFormatDropdown
              mediaKind="VIDEO"
              label={t("library.repository.download")}
              className="w-full"
              onSelectFormat={(format) =>
                void downloadMediaWithFormat({
                  url: videoUrl,
                  filename: `ai-video-${Date.now()}`,
                  format,
                  mediaKind: "VIDEO",
                })
              }
            />
          </div>
        </div>
      )}

      <Button asChild variant="outline" className="w-full">
        <Link to="/ai-studio/video">
          {t("editor.studio.video.openFullStudio")}
          <ArrowRight className="size-4" />
        </Link>
      </Button>
    </div>
  );
}
