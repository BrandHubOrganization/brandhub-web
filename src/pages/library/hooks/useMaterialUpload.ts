import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { materialService } from "@/services/materialService";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useAuthStore } from "@/store/authStore";
import type {
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
    const currentAttempt = attempt.current;
    const active = new AbortController();
    controller.current = active;
    const isCurrent = () =>
      !active.signal.aborted &&
      useAuthStore.getState().user?.id === actorId &&
      useWorkspaceStore.getState().currentWorkspace?.id === workspaceId;
    setStage("uploading");
    setProgress(0);
    try {
      currentAttempt.session ??= await materialService.createUploadSession(
        workspaceId,
        file,
        options,
        currentAttempt.requestId,
        active.signal,
      );
      if (!isCurrent()) return null;
      if (!currentAttempt.uploaded) {
        await putMaterialBytes(
          currentAttempt.session.uploadUrl,
          file,
          active.signal,
          (percent) => {
            if (isCurrent()) setProgress(percent);
          },
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
      if (material.status !== "READY") throw new Error("MATERIAL_NOT_READY");
      attempt.current = null;
      await queryClient.invalidateQueries({
        queryKey: ["materials", workspaceId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["materials-storage-usage", workspaceId],
      });
      return isCurrent() ? material : null;
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

  return { upload, stage, progress, cancel, busy: stage !== "idle" };
}
