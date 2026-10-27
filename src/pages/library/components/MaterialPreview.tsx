import { useCallback, useEffect, useRef, useState } from "react";
import { isAxiosError, isCancel } from "axios";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
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
        )
          unavailable.current();
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
      className="bg-muted space-y-3 rounded-xl p-3"
      aria-label={t("library.repository.preview")}
    >
      {busy && (
        <p role="status" className="text-muted-foreground text-sm">
          {t("library.repository.previewRefreshing")}
        </p>
      )}
      {url && !failed && image ? (
        <img
          src={url}
          alt={material.name}
          className="max-h-96 w-full object-contain"
          onError={() => setFailed(true)}
        />
      ) : url && !failed && video ? (
        <video
          src={url}
          controls
          preload="metadata"
          className="max-h-96 w-full"
          onError={() => setFailed(true)}
        />
      ) : url && !failed && material.mimeType === "application/pdf" ? (
        <iframe
          title={material.name}
          src={url}
          sandbox=""
          referrerPolicy="no-referrer"
          className="h-96 w-full rounded-md"
        />
      ) : (
        <p className="text-muted-foreground text-sm">
          {t(`library.repository.${message}`)}
        </p>
      )}
      {canRefresh && (
        <Button
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={() => void refresh()}
        >
          {t("library.repository.refreshPreview")}
        </Button>
      )}
    </section>
  );
}
