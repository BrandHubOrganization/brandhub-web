import { useCallback, useEffect, useRef, useState } from "react";
import { isAxiosError, isCancel } from "axios";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { materialService } from "@/services/materialService";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import type { DownloadMaterialResponse, MaterialItem } from "@/types/material";

const ERROR_TOAST_DURATION_MS = 5000;

export function resolveDownloadErrorKey(error: unknown): string {
  if (!isAxiosError(error)) return "downloadFailed";
  const status = error.response?.status;
  const code = (
    error.response?.data as { error?: { code?: string } } | undefined
  )?.error?.code;
  if (code === "MATERIAL_STORAGE_MISSING") return "storageMissing";
  if (code === "SUPPORT_TICKET_REQUIRED") return "supportTicketRequired";
  if (code === "ADMIN_SUPPORT_READ_ONLY") return "adminSupportReadOnly";
  if (code === "MATERIAL_STORAGE_UNAVAILABLE" || status === 503) {
    return "storageUnavailable";
  }
  if (code === "MATERIAL_NOT_READY") return "materialNotReady";
  if (
    code === "MATERIAL_UNAVAILABLE" ||
    code === "MATERIAL_NOT_FOUND" ||
    status === 404
  ) {
    return "unavailable";
  }
  if (
    code === "WORKSPACE_ACCESS_DENIED" ||
    code === "FORBIDDEN" ||
    status === 403
  ) {
    return "forbidden";
  }
  return "downloadFailed";
}

function triggerBrowserAttachmentDownload(downloadUrl: string): void {
  const anchor = document.createElement("a");
  anchor.href = downloadUrl;
  anchor.rel = "noopener noreferrer";
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  window.setTimeout(() => anchor.remove(), 100);
}

function isStaleContext(
  aborted: boolean,
  requestedWorkspace: string,
  requestedUser: string | undefined,
): boolean {
  const currentWorkspace = useWorkspaceStore.getState().currentWorkspace?.id;
  const currentUser = useAuthStore.getState().user?.id;
  return (
    aborted ||
    Boolean(currentWorkspace && currentWorkspace !== requestedWorkspace) ||
    currentUser !== requestedUser
  );
}

function isLinkExpired(result: DownloadMaterialResponse): boolean {
  const expiresMs = Date.parse(result.expiresAt);
  return (
    !result.downloadUrl ||
    !Number.isFinite(expiresMs) ||
    expiresMs <= Date.now()
  );
}

export function useMaterialDownload() {
  const { t } = useTranslation();
  const workspaceId = useWorkspaceStore((state) => state.currentWorkspace?.id);
  const userId = useAuthStore((state) => state.user?.id);
  const [downloadingIds, setDownloadingIds] = useState<Record<string, boolean>>(
    {},
  );
  const controllers = useRef<Map<string, AbortController>>(new Map());
  const contextRef = useRef({ workspaceId, userId });

  useEffect(() => {
    const previous = contextRef.current;
    const switched =
      previous.workspaceId !== undefined &&
      (previous.workspaceId !== workspaceId || previous.userId !== userId);
    contextRef.current = { workspaceId, userId };
    if (switched && controllers.current.size > 0) {
      controllers.current.forEach((controller) => controller.abort());
      controllers.current.clear();
      setDownloadingIds({});
      toast.info(t("library.repository.switchWorkspaceCancelled"));
    }
  }, [workspaceId, userId, t]);

  useEffect(() => {
    const active = controllers.current;
    return () => {
      active.forEach((controller) => controller.abort());
      active.clear();
    };
  }, []);

  const executeDownload = useCallback(
    async (
      material: MaterialItem,
      controller: AbortController,
      requestedUser: string | undefined,
      supportTicket?: string,
    ) => {
      const result = await materialService.download(
        material.workspaceId,
        material.id,
        controller.signal,
        supportTicket,
      );
      if (
        isStaleContext(
          controller.signal.aborted,
          material.workspaceId,
          requestedUser,
        )
      ) {
        toast.info(t("library.repository.switchWorkspaceCancelled"));
        return;
      }
      if (isLinkExpired(result)) {
        toast.error(t("library.repository.linkExpired"), {
          duration: ERROR_TOAST_DURATION_MS,
        });
        return;
      }
      triggerBrowserAttachmentDownload(result.downloadUrl);
      toast.success(
        t("library.repository.downloadStarted", {
          name: result.filename || material.name,
        }),
      );
    },
    [t],
  );

  const download = useCallback(
    async (material: MaterialItem) => {
      if (controllers.current.has(material.id)) return;
      let supportTicket: string | undefined;
      if (useAuthStore.getState().systemRole === "ADMIN") {
        const input = window.prompt(t("library.repository.supportTicketPrompt"));
        if (!input || !input.trim()) return;
        supportTicket = input.trim();
      }
      const controller = new AbortController();
      const requestedUser = useAuthStore.getState().user?.id;
      controllers.current.set(material.id, controller);
      setDownloadingIds((prev) => ({ ...prev, [material.id]: true }));
      try {
        await executeDownload(material, controller, requestedUser, supportTicket);
      } catch (error: unknown) {
        if (!isCancel(error) && !controller.signal.aborted) {
          const key = resolveDownloadErrorKey(error);
          toast.error(t(`library.repository.${key}`), {
            duration: ERROR_TOAST_DURATION_MS,
          });
        }
      } finally {
        controllers.current.delete(material.id);
        setDownloadingIds((prev) => {
          const next = { ...prev };
          delete next[material.id];
          return next;
        });
      }
    },
    [executeDownload, t],
  );

  const isDownloading = useCallback(
    (materialId: string) => Boolean(downloadingIds[materialId]),
    [downloadingIds],
  );

  return { download, isDownloading };
}
