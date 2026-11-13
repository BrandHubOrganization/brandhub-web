import { create } from "zustand";
import { toast } from "sonner";
import { materialService } from "@/services/materialService";
import {
  convertImageFileToWebp,
  stripExtension,
} from "@/utils/mediaDownloadHelper";
import type { MaterialItem, MaterialVisibility } from "@/types/material";
import type { QueuedUploadFile } from "@/pages/library/utils/folderDropReader";

export type BackgroundTaskType =
  | "UPLOAD_BATCH"
  | "DRIVE_IMPORT"
  | "AI_IMAGE"
  | "AI_VIDEO";

export type BackgroundTaskStatus =
  | "RUNNING"
  | "CANCEL_CLEANUP"
  | "COMPLETED"
  | "CANCELLED"
  | "FAILED";

export interface BackgroundTaskSubItem {
  id: string;
  name: string;
  sizeBytes?: number;
  status: "PENDING" | "UPLOADING" | "COMPLETED" | "CANCELLED" | "FAILED";
  progress: number;
  errorMessage?: string;
}

export interface BackgroundTask {
  id: string;
  type: BackgroundTaskType;
  kind?: BackgroundTaskType;
  title: string;
  subtitle: string;
  workspaceId: string;
  status: BackgroundTaskStatus;
  progress: number;
  totalItems: number;
  completedItems: number;
  errorMessage?: string;
  targetRoute?: string;
  createdAt: number;
  items: BackgroundTaskSubItem[];
  jobId?: string;
  resultUrl?: string;
  resultS3Key?: string;
  folderName?: string;
  currentFileName?: string;
  importedFolders?: number;
  importedFiles?: number;
  skippedItems?: number;
}

interface UploadRuntime {
  controller: AbortController;
  workspaceId: string;
  activeSessionId: string | null;
  createdMaterials: MaterialItem[];
  createdFolderIds: string[];
  workerPromise: Promise<void> | null;
}

const uploadRuntimes = new Map<string, UploadRuntime>();
const aiTimers = new Map<string, ReturnType<typeof setInterval>>();
const repositoryRefreshListeners = new Set<(workspaceId: string) => void>();

export function onRepositoryTaskRefresh(
  listener: (workspaceId: string) => void,
): () => void {
  repositoryRefreshListeners.add(listener);
  return () => {
    repositoryRefreshListeners.delete(listener);
  };
}

function notifyRepositoryRefresh(workspaceId: string) {
  repositoryRefreshListeners.forEach((listener) => {
    try {
      listener(workspaceId);
    } catch {
      // ignore listener errors
    }
  });
}

async function digestFileSha256(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

interface StartUploadBatchParams {
  workspaceId: string;
  files: QueuedUploadFile[];
  baseFolderId?: string | null;
  visibility: MaterialVisibility;
  clientProfileId?: string;
  isClientRole?: boolean;
  rootFolderName?: string;
  conflictResolution?: "ASK" | "KEEP_BOTH" | "OVERWRITE" | "SKIP";
  overwriteMaterialId?: string;
}

interface StartAiImageTaskParams<
  T extends { image_url?: string; s3_key?: string; storage_provider?: string },
> {
  workspaceId?: string;
  title?: string;
  subtitle?: string;
  targetRoute?: string;
  execute: () => Promise<T>;
}

export interface AiVideoPollResult {
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | string;
  videoUrl?: string | null;
  s3Key?: string | null;
  errorMessage?: string | null;
}

interface StartAiVideoTaskParams {
  workspaceId?: string;
  jobId?: string;
  title?: string;
  subtitle?: string;
  targetRoute?: string;
  pollIntervalMs?: number;
  poll: () => Promise<AiVideoPollResult>;
  onCompleted?: (result: { videoUrl: string; s3Key?: string }) => void;
}

export interface StartDriveImportTaskParams {
  workspaceId: string;
  jobId: string;
  pollIntervalMs?: number;
}

function formatDriveImportError(code?: string): string {
  switch (code) {
    case "DRIVE_IMPORT_AUTH_EXPIRED":
      return "Quyền Google Drive đã hết hạn. Vui lòng bấm Nhập lại.";
    case "DRIVE_IMPORT_ACCESS_DENIED":
      return "Tài khoản Google chưa có quyền đọc thư mục này.";
    case "DRIVE_IMPORT_SOURCE_NOT_FOUND":
      return "Không tìm thấy thư mục Google Drive hoặc chưa được chia sẻ.";
    case "STORAGE_QUOTA_EXCEEDED":
      return "Kho không còn đủ dung lượng lưu trữ để nhập.";
    default:
      return "Không thể hoàn tất nhập từ Google Drive.";
  }
}

interface BackgroundTaskState {
  tasks: BackgroundTask[];
  isDockMinimized: boolean;
  setDockMinimized: (minimized: boolean) => void;
  startUploadBatch: (params: StartUploadBatchParams) => Promise<void>;
  startDriveImportTask: (params: StartDriveImportTaskParams) => string;
  cancelTask: (taskId: string) => Promise<void>;
  dismissTask: (taskId: string) => void;
  clearFinishedTasks: () => void;
  startAiImageTask: <
    T extends {
      image_url?: string;
      s3_key?: string;
      storage_provider?: string;
    },
  >(
    params: StartAiImageTaskParams<T>,
  ) => Promise<T>;
  startAiVideoTask: (
    params: StartAiVideoTaskParams,
  ) => Promise<{ videoUrl: string; s3Key?: string }>;
  registerExternalTask: (task: Omit<BackgroundTask, "createdAt">) => void;
  updateExternalTask: (
    taskId: string,
    patch: Partial<Omit<BackgroundTask, "id">>,
  ) => void;
}

export const useBackgroundTaskStore = create<BackgroundTaskState>((set, get) => ({
  tasks: [],
  isDockMinimized: false,

  setDockMinimized: (minimized) => set({ isDockMinimized: minimized }),

  registerExternalTask: (task) => {
    set((state) => ({
      isDockMinimized: false,
      tasks: [{ ...task, createdAt: Date.now() }, ...state.tasks],
    }));
  },

  updateExternalTask: (taskId, patch) => {
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, ...patch } : t)),
    }));
  },

  dismissTask: (taskId) => {
    const timer = aiTimers.get(taskId);
    if (timer) {
      clearInterval(timer);
      aiTimers.delete(taskId);
    }
    uploadRuntimes.delete(taskId);
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== taskId),
    }));
  },

  clearFinishedTasks: () => {
    set((state) => ({
      tasks: state.tasks.filter(
        (t) => t.status === "RUNNING" || t.status === "CANCEL_CLEANUP",
      ),
    }));
  },

  cancelTask: async (taskId) => {
    const task = get().tasks.find((t) => t.id === taskId);
    if (!task) return;

    if (task.type === "AI_IMAGE" || task.type === "AI_VIDEO") {
      const timer = aiTimers.get(taskId);
      if (timer) {
        clearInterval(timer);
        aiTimers.delete(taskId);
      }
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === taskId
            ? {
                ...t,
                status: "CANCELLED",
                subtitle: "Đã huỷ tác vụ AI",
              }
            : t,
        ),
      }));
      toast.info("Đã huỷ theo dõi tác vụ AI");
      return;
    }

    if (task.type === "DRIVE_IMPORT") {
      const timer = aiTimers.get(taskId);
      if (timer) {
        clearInterval(timer);
        aiTimers.delete(taskId);
      }
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === taskId
            ? {
                ...t,
                status: "CANCEL_CLEANUP",
                subtitle: "Đang huỷ import và xoá dữ liệu tải dở...",
              }
            : t,
        ),
      }));

      if (task.jobId) {
        try {
          await materialService.cancelDriveImport(task.workspaceId, task.jobId);
        } catch {
          // Best-effort backend cancellation
        }
      }

      notifyRepositoryRefresh(task.workspaceId);

      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === taskId
            ? {
                ...t,
                status: "CANCELLED",
                progress: 0,
                completedItems: 0,
                currentFileName: undefined,
                subtitle: "Đã huỷ import từ Google Drive và xoá dữ liệu dở",
              }
            : t,
        ),
      }));
      toast.success("Đã huỷ import từ Google Drive và xoá sạch dữ liệu dở");
      return;
    }

    const runtime = uploadRuntimes.get(taskId);
    if (!runtime) {
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === taskId ? { ...t, status: "CANCELLED" } : t,
        ),
      }));
      return;
    }

    // 1. Mark task as cleaning up and abort in-flight HTTP/XHR immediately
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: "CANCEL_CLEANUP",
              subtitle: "Đang huỷ và xoá dữ liệu tải dở...",
              items: t.items.map((item) =>
                item.status === "PENDING" || item.status === "UPLOADING"
                  ? { ...item, status: "CANCELLED", progress: 0 }
                  : item,
              ),
            }
          : t,
      ),
    }));

    runtime.controller.abort();
    if (runtime.workerPromise) {
      try {
        await runtime.workerPromise;
      } catch {
        // Worker aborted
      }
    }

    const { workspaceId, activeSessionId, createdMaterials, createdFolderIds } =
      runtime;

    // 2. Cancel uncommitted upload session on backend (deletes staging S3 object + releases quota)
    if (activeSessionId) {
      try {
        await materialService.cancelUploadSession(workspaceId, activeSessionId);
      } catch {
        // Ignore if session already expired or not created
      }
    }

    // 3. Rollback & permanently purge any files already uploaded in this cancelled batch
    for (const mat of [...createdMaterials].reverse()) {
      try {
        const trashed = await materialService.deleteMaterial(workspaceId, mat);
        await materialService.purgeMaterial(workspaceId, trashed ?? mat);
      } catch {
        // Best-effort cleanup
      }
    }

    // 4. Rollback & permanently purge any folders created during this cancelled batch (leaf-first)
    for (const folderId of [...createdFolderIds].reverse()) {
      try {
        await materialService.deleteFolder(workspaceId, folderId);
        await materialService.purgeFolder(workspaceId, folderId);
      } catch {
        // Best-effort cleanup
      }
    }

    uploadRuntimes.delete(taskId);
    notifyRepositoryRefresh(workspaceId);

    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: "CANCELLED",
              progress: 0,
              completedItems: 0,
              subtitle: "Đã huỷ và xoá toàn bộ dữ liệu tải dở",
            }
          : t,
      ),
    }));

    toast.success("Đã huỷ tải lên và xoá sạch các tệp/thư mục tải dở");
  },

  startUploadBatch: async ({
    workspaceId,
    files,
    baseFolderId,
    visibility,
    clientProfileId,
    rootFolderName,
    conflictResolution = "KEEP_BOTH",
    overwriteMaterialId,
  }) => {
    if (!files.length) return;

    const taskId = `upload-${ crypto.randomUUID() }`;
    const controller = new AbortController();
    const runtime: UploadRuntime = {
      controller,
      workspaceId,
      activeSessionId: null,
      createdMaterials: [],
      createdFolderIds: [],
      workerPromise: null,
    };
    uploadRuntimes.set(taskId, runtime);

    const isFolderImport = Boolean(
      rootFolderName || files.some((f) => f.folderSegments.length > 0),
    );
    const title = isFolderImport
      ? `Tải thư mục "${rootFolderName || files[0]?.folderSegments[0] || "Thư mục"}"`
      : files.length === 1
        ? `Tải tệp "${stripExtension(files[0].file.name)}"`
        : `Tải lên ${files.length} tệp`;

    const subItems: BackgroundTaskSubItem[] = files.map((entry, idx) => ({
      id: `${taskId}-item-${idx}`,
      name:
        entry.folderSegments.length > 0
          ? `${entry.folderSegments.join("/")}/${stripExtension(entry.file.name)}`
          : stripExtension(entry.file.name),
      sizeBytes: entry.file.size,
      status: "PENDING",
      progress: 0,
    }));

    const newTask: BackgroundTask = {
      id: taskId,
      type: "UPLOAD_BATCH",
      title,
      subtitle: isFolderImport
        ? "Đang khởi tạo cấu trúc thư mục..."
        : `Đang chuẩn bị ${files.length} tệp...`,
      workspaceId,
      status: "RUNNING",
      progress: 1,
      totalItems: files.length,
      completedItems: 0,
      targetRoute: `/workspaces/${workspaceId}/library?tab=media`,
      createdAt: Date.now(),
      items: subItems,
    };

    set((state) => ({
      isDockMinimized: false,
      tasks: [newTask, ...state.tasks],
    }));

    const workerPromise = (async () => {
      try {
        // Step 1: Create nested folder hierarchy if needed
        const folderPathMap = new Map<string, string>();
        const uniqueFolderPaths = new Set<string>();

        for (const entry of files) {
          if (entry.folderSegments.length > 0) {
            let acc = "";
            for (const segment of entry.folderSegments) {
              acc = acc ? `${acc}/${segment}` : segment;
              uniqueFolderPaths.add(acc);
            }
          }
        }

        const sortedPaths = Array.from(uniqueFolderPaths).sort(
          (a, b) => a.split("/").length - b.split("/").length,
        );

        for (const relPath of sortedPaths) {
          if (controller.signal.aborted) return;
          const segments = relPath.split("/");
          const folderName = segments[segments.length - 1];
          const parentRelPath =
            segments.length > 1 ? segments.slice(0, -1).join("/") : null;
          const parentId = parentRelPath
            ? folderPathMap.get(parentRelPath)
            : baseFolderId ?? undefined;

          const createdFolder = await materialService.createFolder(
            workspaceId,
            folderName,
            parentId || undefined,
          );
          folderPathMap.set(relPath, createdFolder.id);
          runtime.createdFolderIds.push(createdFolder.id);
          if (controller.signal.aborted) return;
        }

        if (sortedPaths.length > 0 && !controller.signal.aborted) {
          notifyRepositoryRefresh(workspaceId);
        }

        // Step 2: Upload each file sequentially with real-time byte % progress
        let completedCount = 0;

        for (let i = 0; i < files.length; i += 1) {
          if (controller.signal.aborted) return;
          const entry = files[i];
          const itemId = subItems[i].id;
          const targetFolderId =
            entry.folderSegments.length > 0
              ? folderPathMap.get(entry.folderSegments.join("/")) ??
                baseFolderId ??
                undefined
              : baseFolderId ?? undefined;

          const updateItemProgress = (itemProgress: number) => {
            if (controller.signal.aborted) return;
            const overallProgress = Math.min(
              99,
              Math.max(
                1,
                Math.round(
                  ((completedCount * 100 + itemProgress) / files.length),
                ),
              ),
            );
            set((state) => ({
              tasks: state.tasks.map((t) =>
                t.id === taskId && t.status === "RUNNING"
                  ? {
                      ...t,
                      progress: overallProgress,
                      subtitle: `Đang tải (${i + 1}/${files.length}): ${stripExtension(entry.file.name)}`,
                      items: t.items.map((it) =>
                        it.id === itemId
                          ? { ...it, status: "UPLOADING", progress: itemProgress }
                          : it,
                      ),
                    }
                  : t,
              ),
            }));
          };

          updateItemProgress(2);

          const uploadFile = await convertImageFileToWebp(entry.file);
          if (controller.signal.aborted) return;

          const contentHash = await digestFileSha256(uploadFile);
          if (controller.signal.aborted) return;

          const effectiveConflict =
            files.length > 1 ? "KEEP_BOTH" : conflictResolution;

          const session = await materialService.createUploadSession(
            workspaceId,
            uploadFile,
            {
              type: "RAW",
              purpose: "MATERIAL",
              visibility,
              clientProfileId,
              folderId: targetFolderId,
              contentHash,
              conflictResolution: effectiveConflict,
              overwriteMaterialId:
                files.length === 1 ? overwriteMaterialId : undefined,
            },
            crypto.randomUUID(),
            controller.signal,
          );

          if (!session.skipped) {
            runtime.activeSessionId = session.sessionId;
          }
          if (controller.signal.aborted) return;

          if (!session.skipped) {
            await materialService.uploadBinaryWithProgress(
              session.uploadUrl,
              uploadFile,
              session.uploadHeaders ?? {},
              controller.signal,
              (binaryPct) => {
                updateItemProgress(Math.max(5, Math.round(binaryPct * 0.9)));
              },
            );

            if (controller.signal.aborted) return;

            const confirmed = await materialService.confirmUploadSession(
              workspaceId,
              session.sessionId,
              controller.signal,
            );
            runtime.activeSessionId = null;
            runtime.createdMaterials.push(confirmed);
          }

          if (controller.signal.aborted) return;

          completedCount += 1;
          notifyRepositoryRefresh(workspaceId);

          set((state) => ({
            tasks: state.tasks.map((t) =>
              t.id === taskId && t.status === "RUNNING"
                ? {
                    ...t,
                    completedItems: completedCount,
                    progress: Math.round((completedCount / files.length) * 100),
                    items: t.items.map((it) =>
                      it.id === itemId
                        ? { ...it, status: "COMPLETED", progress: 100 }
                        : it,
                    ),
                  }
                : t,
            ),
          }));
        }

        if (controller.signal.aborted) return;

        uploadRuntimes.delete(taskId);
        notifyRepositoryRefresh(workspaceId);

        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  status: "COMPLETED",
                  progress: 100,
                  completedItems: files.length,
                  subtitle: `Hoàn tất ${files.length}/${files.length} tệp`,
                }
              : t,
          ),
        }));

        toast.success(
          isFolderImport
            ? `Đã tải thư mục thành công (${files.length} tệp)`
            : `Đã tải lên thành công ${files.length} tệp`,
        );
      } catch (error) {
        if (
          controller.signal.aborted ||
          get().tasks.find((t) => t.id === taskId)?.status === "CANCEL_CLEANUP" ||
          get().tasks.find((t) => t.id === taskId)?.status === "CANCELLED"
        ) {
          return;
        }

        uploadRuntimes.delete(taskId);
        const errMsg =
          (
            error as {
              response?: { data?: { message?: string } };
              message?: string;
            }
          )?.response?.data?.message ||
          (error as Error)?.message ||
          "Tải tệp lên thất bại";

        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  status: "FAILED",
                  errorMessage: errMsg,
                  subtitle: errMsg,
                  items: t.items.map((it) =>
                    it.status === "UPLOADING" || it.status === "PENDING"
                      ? { ...it, status: "FAILED", errorMessage: errMsg }
                      : it,
                  ),
                }
              : t,
          ),
        }));
        toast.error(errMsg);
      }
    })();

    runtime.workerPromise = workerPromise;
    await workerPromise;
  },

  startAiImageTask: async ({
    workspaceId = "",
    title = "Tạo ảnh AI",
    subtitle = "Đang kết xuất hình ảnh AI...",
    targetRoute,
    execute,
  }) => {
    const taskId = `ai-img-${crypto.randomUUID()}`;

    set((state) => ({
      isDockMinimized: false,
      tasks: [
        {
          id: taskId,
          type: "AI_IMAGE",
          kind: "AI_IMAGE",
          title,
          subtitle,
          workspaceId,
          status: "RUNNING",
          progress: 12,
          totalItems: 1,
          completedItems: 0,
          targetRoute:
            targetRoute ||
            (workspaceId
              ? `/workspaces/${workspaceId}/library?tab=media`
              : undefined),
          createdAt: Date.now(),
          items: [
            {
              id: `${taskId}-0`,
              name: title,
              status: "UPLOADING",
              progress: 12,
            },
          ],
        },
        ...state.tasks,
      ],
    }));

    const timer = setInterval(() => {
      set((state) => ({
        tasks: state.tasks.map((t) => {
          if (t.id !== taskId || t.status !== "RUNNING") return t;
          const next = Math.min(92, t.progress + (t.progress < 60 ? 8 : 3));
          return {
            ...t,
            progress: next,
            items: t.items.map((it) => ({ ...it, progress: next })),
          };
        }),
      }));
    }, 900);
    aiTimers.set(taskId, timer);

    try {
      const result = await execute();
      clearInterval(timer);
      aiTimers.delete(taskId);

      if (workspaceId) {
        notifyRepositoryRefresh(workspaceId);
      }

      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === taskId
            ? {
                ...t,
                status: "COMPLETED",
                progress: 100,
                completedItems: 1,
                subtitle: "Đã tạo xong ảnh AI",
                resultUrl: result.image_url,
                resultS3Key: result.s3_key,
                items: t.items.map((it) => ({
                  ...it,
                  status: "COMPLETED",
                  progress: 100,
                })),
              }
            : t,
        ),
      }));

      return result;
    } catch (error) {
      clearInterval(timer);
      aiTimers.delete(taskId);
      const errMsg =
        (error as Error)?.message || "Không thể tạo hình ảnh AI";
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === taskId
            ? {
                ...t,
                status: "FAILED",
                errorMessage: errMsg,
                subtitle: errMsg,
                items: t.items.map((it) => ({
                  ...it,
                  status: "FAILED",
                  errorMessage: errMsg,
                })),
              }
            : t,
        ),
      }));
      throw error;
    }
  },

  startAiVideoTask: async ({
    workspaceId = "",
    jobId,
    title = "Tạo Video AI",
    subtitle = "Đang khởi tạo tiến trình tạo video...",
    targetRoute,
    pollIntervalMs = 3000,
    poll,
    onCompleted,
  }) => {
    const taskId = `ai-vid-${jobId || crypto.randomUUID()}`;

    set((state) => ({
      isDockMinimized: false,
      tasks: [
        {
          id: taskId,
          type: "AI_VIDEO",
          kind: "AI_VIDEO",
          jobId,
          title,
          subtitle,
          workspaceId,
          status: "RUNNING",
          progress: 8,
          totalItems: 1,
          completedItems: 0,
          targetRoute: targetRoute || "/ai-studio/video",
          createdAt: Date.now(),
          items: [
            {
              id: `${taskId}-0`,
              name: title,
              status: "UPLOADING",
              progress: 8,
            },
          ],
        },
        ...state.tasks.filter((t) => t.id !== taskId),
      ],
    }));

    let attempts = 0;

    try {
      const completed = await new Promise<{ videoUrl: string; s3Key?: string }>(
        (resolve, reject) => {
          const pollTimer = setInterval(async () => {
            attempts += 1;
            const currentTask = get().tasks.find((t) => t.id === taskId);
            if (!currentTask || currentTask.status === "CANCELLED") {
              clearInterval(pollTimer);
              aiTimers.delete(taskId);
              reject(new Error("Đã huỷ tiến trình tạo video AI"));
              return;
            }

            const simulatedProgress = Math.min(94, 10 + attempts * 3);
            set((state) => ({
              tasks: state.tasks.map((t) =>
                t.id === taskId && t.status === "RUNNING"
                  ? {
                      ...t,
                      progress: simulatedProgress,
                      subtitle: `Đang kết xuất video AI (${simulatedProgress}%)...`,
                      items: t.items.map((it) => ({
                        ...it,
                        progress: simulatedProgress,
                      })),
                    }
                  : t,
              ),
            }));

            try {
              const statusResp = await poll();
              if (statusResp.status === "COMPLETED" && statusResp.videoUrl) {
                clearInterval(pollTimer);
                aiTimers.delete(taskId);
                const finalPayload = {
                  videoUrl: statusResp.videoUrl,
                  s3Key: statusResp.s3Key ?? undefined,
                };
                if (workspaceId) {
                  notifyRepositoryRefresh(workspaceId);
                }
                onCompleted?.(finalPayload);
                set((state) => ({
                  tasks: state.tasks.map((t) =>
                    t.id === taskId
                      ? {
                          ...t,
                          status: "COMPLETED",
                          progress: 100,
                          completedItems: 1,
                          subtitle: "Đã tạo xong Video AI",
                          resultUrl: finalPayload.videoUrl,
                          resultS3Key: finalPayload.s3Key,
                          items: t.items.map((it) => ({
                            ...it,
                            status: "COMPLETED",
                            progress: 100,
                          })),
                        }
                      : t,
                  ),
                }));
                resolve(finalPayload);
              } else if (statusResp.status === "FAILED") {
                clearInterval(pollTimer);
                aiTimers.delete(taskId);
                reject(
                  new Error(
                    statusResp.errorMessage ||
                      "Tiến trình tạo video AI thất bại",
                  ),
                );
              }
            } catch (pollErr) {
              if (attempts > 180) {
                clearInterval(pollTimer);
                aiTimers.delete(taskId);
                reject(
                  pollErr instanceof Error
                    ? pollErr
                    : new Error("Quá thời gian chờ tạo video AI"),
                );
              }
            }
          }, pollIntervalMs);
          aiTimers.set(taskId, pollTimer);
        },
      );
      return completed;
    } catch (error) {
      const errMsg =
        (error as Error)?.message || "Không thể hoàn tất tạo video AI";
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === taskId && t.status !== "CANCELLED"
            ? {
                ...t,
                status: "FAILED",
                errorMessage: errMsg,
                subtitle: errMsg,
                items: t.items.map((it) => ({
                  ...it,
                  status: "FAILED",
                  errorMessage: errMsg,
                })),
              }
            : t,
        ),
      }));
      throw error;
    }
  },

  startDriveImportTask: ({
    workspaceId,
    jobId,
    pollIntervalMs = 1500,
  }) => {
    const taskId = `drive-${jobId}`;
    const existingTimer = aiTimers.get(taskId);
    if (existingTimer) {
      clearInterval(existingTimer);
      aiTimers.delete(taskId);
    }

    const initialTask: BackgroundTask = {
      id: taskId,
      type: "DRIVE_IMPORT",
      kind: "DRIVE_IMPORT",
      jobId,
      title: "Đồng bộ từ Google Drive",
      subtitle: "Đang quét cấu trúc thư mục trên Drive...",
      workspaceId,
      status: "RUNNING",
      progress: 5,
      totalItems: 0,
      completedItems: 0,
      importedFolders: 0,
      importedFiles: 0,
      skippedItems: 0,
      targetRoute: `/workspaces/${workspaceId}/library?tab=media`,
      createdAt: Date.now(),
      items: [],
    };

    set((state) => ({
      isDockMinimized: false,
      tasks: [initialTask, ...state.tasks.filter((t) => t.id !== taskId)],
    }));

    let lastImportedFiles = 0;
    let lastImportedFolders = 0;
    let inFlight = false;

    const pollOnce = async () => {
      if (inFlight) return;
      const current = get().tasks.find((t) => t.id === taskId);
      if (!current || current.status !== "RUNNING") {
        const timer = aiTimers.get(taskId);
        if (timer) {
          clearInterval(timer);
          aiTimers.delete(taskId);
        }
        return;
      }

      inFlight = true;
      try {
        const job = await materialService.driveImportStatus(workspaceId, jobId);
        const latest = get().tasks.find((t) => t.id === taskId);
        if (!latest || latest.status !== "RUNNING") return;

        const processed = (job.importedFiles ?? 0) + (job.skippedFiles ?? 0);
        const total = job.totalFiles ?? 0;
        const foldersCount = job.importedFolders ?? 0;
        const title = job.folderName
          ? `Nhập "${job.folderName}" từ Drive`
          : "Đồng bộ từ Google Drive";

        if (
          (job.importedFiles ?? 0) > lastImportedFiles ||
          foldersCount > lastImportedFolders
        ) {
          lastImportedFiles = job.importedFiles ?? 0;
          lastImportedFolders = foldersCount;
          notifyRepositoryRefresh(workspaceId);
        }

        if (job.status === "COMPLETED") {
          const timer = aiTimers.get(taskId);
          if (timer) {
            clearInterval(timer);
            aiTimers.delete(taskId);
          }
          notifyRepositoryRefresh(workspaceId);
          const summaryParts = [
            `Đã nhập ${job.importedFiles} tệp`,
            `${foldersCount} thư mục`,
          ];
          if (job.skippedFiles > 0) {
            summaryParts.push(`bỏ qua ${job.skippedFiles} tệp`);
          }
          const doneSubtitle = summaryParts.join(" • ");
          set((state) => ({
            tasks: state.tasks.map((t) =>
              t.id === taskId
                ? {
                    ...t,
                    title,
                    status: "COMPLETED",
                    progress: 100,
                    totalItems: total || processed,
                    completedItems: processed,
                    importedFolders: foldersCount,
                    importedFiles: job.importedFiles,
                    skippedItems: job.skippedFiles,
                    folderName: job.folderName,
                    currentFileName: undefined,
                    subtitle: doneSubtitle,
                  }
                : t,
            ),
          }));
          toast.success(`Nhập từ Google Drive hoàn tất (${doneSubtitle})`);
          return;
        }

        if (job.status === "CANCELLED") {
          const timer = aiTimers.get(taskId);
          if (timer) {
            clearInterval(timer);
            aiTimers.delete(taskId);
          }
          notifyRepositoryRefresh(workspaceId);
          set((state) => ({
            tasks: state.tasks.map((t) =>
              t.id === taskId
                ? {
                    ...t,
                    title,
                    status: "CANCELLED",
                    progress: 0,
                    completedItems: 0,
                    currentFileName: undefined,
                    subtitle: "Đã huỷ import từ Google Drive và xoá dữ liệu dở",
                  }
                : t,
            ),
          }));
          return;
        }

        if (job.status === "FAILED") {
          const timer = aiTimers.get(taskId);
          if (timer) {
            clearInterval(timer);
            aiTimers.delete(taskId);
          }
          const errMsg = formatDriveImportError(job.errorMessage);
          set((state) => ({
            tasks: state.tasks.map((t) =>
              t.id === taskId
                ? {
                    ...t,
                    title,
                    status: "FAILED",
                    errorMessage: errMsg,
                    currentFileName: undefined,
                    subtitle: errMsg,
                  }
                : t,
            ),
          }));
          toast.error(errMsg);
          return;
        }

        const livePct =
          total > 0
            ? Math.min(98, Math.max(5, Math.round((processed / total) * 100)))
            : Math.min(25, 6 + foldersCount * 5);
        const liveSubtitle = job.currentFileName
          ? `Đang xử lý: ${job.currentFileName}`
          : total > 0
            ? `Đã xử lý ${processed}/${total} tệp • ${foldersCount} thư mục`
            : foldersCount > 0
              ? `Đang quét (${foldersCount} thư mục)...`
              : "Đang kết nối và quét thư mục Drive...";

        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId && t.status === "RUNNING"
              ? {
                  ...t,
                  title,
                  progress: livePct,
                  totalItems: total,
                  completedItems: processed,
                  importedFolders: foldersCount,
                  importedFiles: job.importedFiles,
                  skippedItems: job.skippedFiles,
                  folderName: job.folderName,
                  currentFileName: job.currentFileName,
                  subtitle: liveSubtitle,
                }
              : t,
          ),
        }));
      } catch {
        // Transient network hiccup during poll; next interval will retry
      } finally {
        inFlight = false;
      }
    };

    const timer = setInterval(() => {
      void pollOnce();
    }, pollIntervalMs);
    aiTimers.set(taskId, timer);
    void pollOnce();

    return taskId;
  },
}));
