import { useCallback, useEffect, useRef, useState } from "react";
import { isAxiosError, isCancel } from "axios";
import { useTranslation } from "react-i18next";
import { ImageOff, Loader2 } from "lucide-react";
import { materialService } from "@/services/materialService";
import type { MaterialItem } from "@/types/material";

export function MaterialPreview({
  material,
  onUnavailable,
}: {
  material: MaterialItem;
  onUnavailable: () => void;
}) {
  const { t } = useTranslation();
  const [preview, setPreview] = useState({
    url: material.previewUrl,
    expires: material.previewExpiresAt,
  });
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const controller = useRef<AbortController | null>(null);
  const initialRecovery = useRef(false);

  const ready = material.status === "READY" && !material.deletedAt;
  const image = ["image/jpeg", "image/png", "image/webp"].includes(
    material.mimeType ?? "",
  );
  const video = ["video/mp4", "video/quicktime"].includes(
    material.mimeType ?? "",
  );
  const supported = image || video || material.mimeType === "application/pdf";
  const canRefresh =
    ready &&
    supported &&
    !!(material.capabilities?.canPreview || material.previewUnavailableReason);

  const unavailable = useRef(onUnavailable);
  useEffect(() => {
    unavailable.current = onUnavailable;
  }, [onUnavailable]);

  const refresh = useCallback(async () => {
    if (controller.current) return;
    initialRecovery.current = true;
    const request = new AbortController();
    controller.current = request;
    setBusy(true);
    try {
      const result = await materialService.preview(
        material.workspaceId,
        material.id,
        request.signal,
      );
      if (
        !result.previewUrl ||
        !Number.isFinite(Date.parse(result.previewExpiresAt)) ||
        Date.parse(result.previewExpiresAt) <= Date.now() + 15_000
      ) {
        throw new Error("Preview expiry is not usable");
      }
      if (!request.signal.aborted) {
        setPreview({
          url: result.previewUrl,
          expires: result.previewExpiresAt,
        });
        setFailed(false);
      }
    } catch (error) {
      if (!isCancel(error) && !request.signal.aborted) {
        setPreview({ url: undefined, expires: undefined });
        setFailed(true);
        if (
          isAxiosError(error) &&
          [403, 404].includes(error.response?.status ?? 0)
        ) {
          unavailable.current();
        }
      }
    } finally {
      if (!request.signal.aborted) setBusy(false);
      controller.current = null;
    }
  }, [material.workspaceId, material.id]);

  useEffect(() => {
    if (!canRefresh || preview.url || initialRecovery.current) return;
    const timer = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(timer);
  }, [canRefresh, preview.url, refresh]);

  useEffect(() => {
    if (!preview.expires || !canRefresh) return;
    const timer = window.setTimeout(
      () => void refresh(),
      Math.max(0, Date.parse(preview.expires) - Date.now() - 10_000),
    );
    return () => window.clearTimeout(timer);
  }, [preview.expires, canRefresh, refresh]);

  useEffect(() => () => controller.current?.abort(), []);

  const url = ready ? preview.url : undefined;
  const message =
    material.status === "FAILED" || material.status === "REJECTED"
      ? "previewUploadFailed"
      : material.status === "UPLOADING"
        ? "uploading"
        : material.status === "VALIDATING"
          ? "validating"
          : !ready
            ? "previewNotReady"
            : failed
              ? "previewFailed"
              : supported
                ? "previewUnavailable"
                : "previewUnsupported";

  return (
    <section
      className="group relative overflow-hidden rounded-2xl border border-border/80 bg-muted/30"
      aria-label={t("library.repository.preview", "Xem trước")}
    >
      <div className="flex min-h-[210px] items-center justify-center p-3">
        {busy && !url ? (
          <div
            role="status"
            className="flex flex-col items-center gap-2 py-8 text-xs text-muted-foreground"
          >
            <Loader2 className="h-5 w-5 animate-spin text-brand-orange" />
            <span>{t("library.repository.previewRefreshing")}</span>
          </div>
        ) : url && !failed && image ? (
          <img
            src={url}
            alt={material.name}
            className="max-h-80 w-full rounded-xl object-contain"
            onError={() => setFailed(true)}
          />
        ) : url && !failed && video ? (
          <video
            src={url}
            controls
            preload="metadata"
            className="max-h-80 w-full rounded-xl"
            onError={() => setFailed(true)}
          />
        ) : url && !failed && material.mimeType === "application/pdf" ? (
          <iframe
            title={material.name}
            src={url}
            sandbox=""
            referrerPolicy="no-referrer"
            className="h-80 w-full rounded-xl border border-border/60 bg-background"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 px-4 py-8 text-center text-xs text-muted-foreground">
            <ImageOff className="h-6 w-6 text-muted-foreground/60" />
            <p>{t(`library.repository.${message}`)}</p>
          </div>
        )}
      </div>
    </section>
  );
}
