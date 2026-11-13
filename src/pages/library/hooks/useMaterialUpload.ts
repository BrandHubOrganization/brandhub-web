import { useEffect, useRef, useState } from "react";
import { isAxiosError } from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { materialService } from "@/services/materialService";
import { convertImageFileToWebp } from "@/utils/mediaDownloadHelper";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useAuthStore } from "@/store/authStore";
import type {
  MaterialDuplicateConflict,
  MaterialUploadOptions,
  MaterialUploadSession,
} from "@/types/material";
import {
  materialUploadLimit,
  putMaterialBytes,
} from "@/pages/library/hooks/materialUploadTransport";

interface Attempt {
  file: File;
  options: string;
  requestId: string;
  session?: MaterialUploadSession;
  uploaded: boolean;
}

export function useMaterialUpload(workspaceId: string | undefined) {
  const actorId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();
  type Stage = "idle" | "uploading" | "validating";
  const [stageState, setStageState] = useState<{
    workspaceId: string | undefined;
    value: Stage;
  }>({ workspaceId, value: "idle" });
  const stage =
    stageState.workspaceId === workspaceId ? stageState.value : "idle";
  const setStage = (value: Stage) => setStageState({ workspaceId, value });
  const [progress, setProgress] = useState(0);
  const [conflict, setConflict] = useState<MaterialDuplicateConflict | null>(
    null,
  );
  const conflictResolver = useRef<
    ((choice: "SKIP" | "KEEP_BOTH" | "OVERWRITE") => void) | null
  >(null);
  const resolveConflict = (choice: "SKIP" | "KEEP_BOTH" | "OVERWRITE") => {
    conflictResolver.current?.(choice);
    conflictResolver.current = null;
    setConflict(null);
  };
  const attempt = useRef<Attempt | null>(null);
  const controller = useRef<AbortController | null>(null);

  useEffect(() => {
    attempt.current = null;
    return () => {
      controller.current?.abort();
      controller.current = null;
      attempt.current = null;
    };
  }, [workspaceId, actorId]);

  async function upload(file: File, options: MaterialUploadOptions) {
    if (!workspaceId || !actorId || controller.current) return null;
    const limit = materialUploadLimit(file.type);
    if (!limit || file.size <= 0 || file.size > limit)
      throw new Error("INVALID_UPLOAD_CONTENT_TYPE");
    const optionsKey = JSON.stringify(options);
    if (
      !attempt.current ||
      attempt.current.file !== file ||
      attempt.current.options !== optionsKey ||
      (attempt.current.session &&
        Date.parse(attempt.current.session.expiresAt) <= Date.now())
    ) {
      attempt.current = {
        file,
        options: optionsKey,
        requestId: crypto.randomUUID(),
        uploaded: false,
      };
    }
    let currentAttempt = attempt.current;
    const active = new AbortController();
    controller.current = active;
    const isCurrent = () =>
      !active.signal.aborted &&
      useAuthStore.getState().user?.id === actorId &&
      useWorkspaceStore.getState().currentWorkspace?.id === workspaceId;
    setStage("uploading");
    setProgress(0);
    try {
      const uploadFile = await convertImageFileToWebp(file);
      if (!isCurrent()) return null;
      const contentHash =
        options.contentHash ??
        Array.from(
          new Uint8Array(
            await crypto.subtle.digest("SHA-256", await uploadFile.arrayBuffer()),
          ),
        )
          .map((byte) => byte.toString(16).padStart(2, "0"))
          .join("");
      let resolvedOptions: MaterialUploadOptions = {
        ...options,
        contentHash,
        conflictResolution: options.conflictResolution ?? "ASK",
      };
      const createSession = async () => {
        for (let count = 0; count < 5; count++) {
          if (!isCurrent()) return null;
          try {
            return await materialService.createUploadSession(
              workspaceId,
              uploadFile,
              resolvedOptions,
              currentAttempt.requestId,
              active.signal,
            );
          } catch (failure) {
            if (
              !isAxiosError<{
                error?: { code?: string; details?: MaterialDuplicateConflict };
              }>(failure) ||
              failure.response?.data.error?.code !==
                "MATERIAL_DUPLICATE_CONFLICT" ||
              !failure.response.data.error.details
            )
              throw failure;
            const details = failure.response.data.error.details;
            const choice = await new Promise<
              "SKIP" | "KEEP_BOTH" | "OVERWRITE"
            >((resolve) => {
              const aborted = () => resolve("SKIP");
              conflictResolver.current = (value) => {
                active.signal.removeEventListener("abort", aborted);
                resolve(value);
              };
              active.signal.addEventListener("abort", aborted, { once: true });
              setConflict(details);
            });
            if (isCurrent()) setConflict(null);
            if (choice === "SKIP") {
              attempt.current = null;
              return null;
            }
            resolvedOptions = {
              ...resolvedOptions,
              conflictResolution: choice,
              overwriteMaterialId:
                choice === "OVERWRITE" ? details.existingMaterialId : undefined,
            };
            currentAttempt.requestId = crypto.randomUUID();
          }
        }
        throw new Error("MATERIAL_DUPLICATE_CONFLICT");
      };
      for (let storageAttempt = 0; storageAttempt < 2; storageAttempt++) {
        try {
          if (!currentAttempt.session) {
            const session = await createSession();
            if (!session || session.skipped) return null;
            currentAttempt.session = session;
          }
          if (!isCurrent()) return null;
          if (!currentAttempt.uploaded) {
            await putMaterialBytes(
              currentAttempt.session.uploadUrl,
              uploadFile,
              active.signal,
              (percent) => {
                if (isCurrent()) setProgress(percent);
              },
              currentAttempt.session.uploadHeaders,
            );
            currentAttempt.uploaded = true;
          }
          if (!isCurrent()) return null;
          setStage("validating");
          const material = await materialService.confirmUploadSession(
            workspaceId,
            currentAttempt.session.sessionId,
            active.signal,
          );
          if (!isCurrent()) return null;
          if (material.status !== "READY")
            throw new Error("MATERIAL_NOT_READY");
          attempt.current = null;
          await queryClient.invalidateQueries({
            queryKey: ["materials", workspaceId],
          });
          await queryClient.invalidateQueries({
            queryKey: ["materials-storage-usage", workspaceId],
          });
          await queryClient.invalidateQueries({
            queryKey: ["material-storage-usage", workspaceId],
          });
          await queryClient.invalidateQueries({
            queryKey: ["client-vault-storage"],
          });
          return isCurrent() ? material : null;
        } catch (failure) {
          const full =
            (failure instanceof Error &&
              failure.message === "DRIVE_STORAGE_FULL") ||
            (isAxiosError<{ error?: { code?: string } }>(failure) &&
              failure.response?.data.error?.code === "DRIVE_STORAGE_FULL");
          if (storageAttempt !== 0 || !full || !isCurrent()) throw failure;
          currentAttempt = {
            file,
            options: optionsKey,
            requestId: crypto.randomUUID(),
            uploaded: false,
          };
          attempt.current = currentAttempt;
          setStage("uploading");
          setProgress(0);
        }
      }
      return null;
    } finally {
      if (controller.current === active) {
        controller.current = null;
        if (!active.signal.aborted) setStage("idle");
      }
    }
  }

  function cancel() {
    controller.current?.abort();
    controller.current = null;
    setStage("idle");
  }

  return {
    upload,
    stage,
    progress,
    cancel,
    conflict,
    resolveConflict,
    busy: stage !== "idle",
  };
}
