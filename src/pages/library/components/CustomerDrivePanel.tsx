import { useRef, useState } from "react";
import { isAxiosError } from "axios";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  CheckCircle2,
  CloudDownload,
  FolderOpen,
  FileCheck2,
  Loader2,
  RotateCcw,
  X,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CircularPercent } from "@/components/common/BackgroundTaskDock";
import {
  clearCachedDriveImportToken,
  loadDriveImportAuthorization,
  requestDriveImportToken,
} from "@/pages/library/hooks/driveImportAuthorization";
import { materialService } from "@/services/materialService";
import { useAuthStore } from "@/store/authStore";
import { useBackgroundTaskStore } from "@/store/backgroundTaskStore";
import { useWorkspaceStore } from "@/store/workspaceStore";

function extractFailureCode(error: unknown): string | undefined {
  return isAxiosError(error)
    ? error.response?.data?.error?.code
    : error instanceof Error
      ? error.message
      : undefined;
}

export function CustomerDrivePanel({
  folderId,
  workspaceIdOverride,
  showInlineProgress = true,
  onImportStarted,
}: {
  folderId?: string;
  workspaceIdOverride?: string;
  showInlineProgress?: boolean;
  onImportStarted?: () => void;
}) {
  const { t } = useTranslation();
  const storeWorkspace = useWorkspaceStore(
    (state) => state.currentWorkspace?.id,
  );
  const workspace = workspaceIdOverride || storeWorkspace;
  const userEmail = useAuthStore((state) => state.user?.email);
  const authorization = useRef<Promise<string> | null>(null);
  const [source, setSource] = useState("");

  const { tasks, startDriveImportTask, cancelTask, dismissTask } =
    useBackgroundTaskStore();

  const activeTask = tasks.find(
    (item) => item.type === "DRIVE_IMPORT" && item.workspaceId === workspace,
  );

  const isRunning = activeTask?.status === "RUNNING";
  const isCleaning = activeTask?.status === "CANCEL_CLEANUP";
  const isBusy = isRunning || isCleaning;

  const config = useQuery({
    queryKey: ["drive-import-config", workspace],
    enabled: !!workspace,
    queryFn: async ({ signal }) => {
      const result = await materialService.driveImportConfig(
        workspace!,
        signal,
      );
      await loadDriveImportAuthorization();
      return result;
    },
    retry: false,
    staleTime: 300_000,
  });

  const label = (key: string, fallback?: string) =>
    t(`materials.repository.${key}`, fallback ?? key);

  const importError = (code?: string) => {
    const key =
      code === "DRIVE_IMPORT_AUTH_REQUIRED"
        ? "authorize"
        : code === "DRIVE_IMPORT_AUTH_EXPIRED"
          ? "expired"
          : code === "DRIVE_IMPORT_ACCESS_DENIED"
            ? "denied"
            : code === "DRIVE_IMPORT_SOURCE_NOT_FOUND"
              ? "notFound"
              : code === "DRIVE_IMPORT_POPUP_FAILED"
                ? "popup"
                : code === "DRIVE_IMPORT_SDK_UNAVAILABLE" ||
                    code === "DRIVE_IMPORT_NOT_CONFIGURED"
                  ? "notConfigured"
                  : code === "STORAGE_QUOTA_EXCEEDED"
                    ? "quota"
                    : "failed";
    return t(`library.driveImport.${key}`);
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const pending = authorization.current;
      authorization.current = null;
      if (!pending) throw new Error("DRIVE_IMPORT_AUTH_REQUIRED");
      let id = source.trim();
      try {
        const url = new URL(id);
        if (url.hostname !== "drive.google.com") {
          throw new Error("Invalid folder");
        }
        id = url.pathname.match(/\/folders\/([A-Za-z0-9_-]+)/)?.[1] ?? "";
        if (!id) throw new Error("Invalid folder");
      } catch {
        if (!/^[A-Za-z0-9_-]+$/.test(id)) throw new Error("Invalid folder");
      }
      const token = await pending;
      return materialService.importDriveFolder(workspace!, {
        googleAccessToken: token,
        driveFolderId: id,
        targetFolderId: folderId,
        conflictResolution: "KEEP_BOTH",
      });
    },
    onSuccess: (job) => {
      if (workspace) {
        startDriveImportTask({
          workspaceId: workspace,
          jobId: job.jobId,
        });
      }
      onImportStarted?.();
    },
    onError: (err) => {
      const code = extractFailureCode(err);
      if (
        code === "DRIVE_IMPORT_AUTH_REQUIRED" ||
        code === "DRIVE_IMPORT_AUTH_EXPIRED" ||
        code === "DRIVE_IMPORT_ACCESS_DENIED"
      ) {
        clearCachedDriveImportToken();
      }
    },
  });

  return (
    <section
      aria-label={t("library.simple.fromDrive", "Đồng bộ từ Google Drive")}
      className="space-y-2.5"
    >
      <form
        className="flex items-center gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (!config.data || mutation.isPending || isBusy) return;
          authorization.current = requestDriveImportToken(
            config.data.clientId,
            userEmail,
          );
          void authorization.current.catch(() => {});
          mutation.mutate();
        }}
      >
        <div className="relative min-w-0 flex-1">
          <CloudDownload className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-brand-orange" />
          <Input
            className="h-9 rounded-lg bg-background pl-9 text-xs focus-visible:ring-1 focus-visible:ring-brand-orange/60 focus-visible:ring-offset-0"
            disabled={mutation.isPending || isBusy}
            type="url"
            wrapperClassName="min-w-0 flex-1"
            aria-label={label(
              "driveFolder",
              "Liên kết thư mục Google Drive...",
            )}
            placeholder={label(
              "driveFolder",
              "Dán liên kết thư mục Google Drive (https://drive.google.com/drive/folders/...)",
            )}
            value={source}
            onChange={(event) => setSource(event.target.value)}
            required
          />
        </div>

        <Button
          size="sm"
          variant="orange"
          className="h-9 shrink-0 gap-1.5 rounded-lg px-4 text-xs font-semibold shadow-xs hover:bg-brand-orange/90"
          type="submit"
          disabled={
            !source.trim() ||
            !config.isSuccess ||
            mutation.isPending ||
            isBusy
          }
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              Đang kết nối...
            </>
          ) : (
            <>
              <CloudDownload className="h-3.5 w-3.5" />
              {t("library.simple.import", "Import")}
            </>
          )}
        </Button>
      </form>

      {config.isError && (
        <div
          role="alert"
          className="flex items-center justify-between gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive"
        >
          <span>{t("library.driveImport.notConfigured")}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 rounded-md px-2.5 text-xs font-semibold text-destructive hover:bg-destructive/15"
            onClick={() => void config.refetch()}
          >
            <RotateCcw className="mr-1 h-3 w-3" />
            {label("retry", "Thử lại")}
          </Button>
        </div>
      )}

      {mutation.isError &&
        extractFailureCode(mutation.error) !== "DRIVE_IMPORT_CANCELLED" && (
          <div
            role="alert"
            className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive"
          >
            <XCircle className="h-4 w-4 shrink-0" />
            <span>{importError(extractFailureCode(mutation.error))}</span>
          </div>
        )}

      {/* Live status & progress card */}
      {showInlineProgress && activeTask && (
        <div
          role="status"
          data-slot="drive-import-progress"
          className={`rounded-xl border px-3.5 py-3 transition-colors ${
            isBusy
              ? "border-brand-orange/30 bg-brand-orange/5"
              : activeTask.status === "COMPLETED"
                ? "border-emerald-500/25 bg-emerald-500/5"
                : activeTask.status === "FAILED"
                  ? "border-destructive/30 bg-destructive/5"
                  : "border-border/80 bg-muted/30"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              {isCleaning ? (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : isRunning ? (
                <CircularPercent percent={activeTask.progress} size={36} />
              ) : activeTask.status === "COMPLETED" ? (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              ) : activeTask.status === "FAILED" ? (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-destructive/15 text-destructive">
                  <XCircle className="h-4 w-4" />
                </div>
              ) : (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <X className="h-4 w-4" />
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-xs font-semibold text-foreground">
                    {activeTask.title}
                  </p>
                  {(activeTask.totalItems > 0 ||
                    (activeTask.importedFolders ?? 0) > 0) && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      {activeTask.totalItems > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-md border border-border/70 bg-background/80 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-foreground">
                          <FileCheck2 className="h-3 w-3 text-brand-orange" />
                          {activeTask.completedItems}/{activeTask.totalItems} tệp
                        </span>
                      )}
                      {(activeTask.importedFolders ?? 0) > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-md border border-border/70 bg-background/80 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-muted-foreground">
                          <FolderOpen className="h-3 w-3 text-brand-orange" />
                          {activeTask.importedFolders} thư mục
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                  {activeTask.currentFileName
                    ? `Đang nhập tệp: ${activeTask.currentFileName}`
                    : activeTask.subtitle}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              {isRunning && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void cancelTask(activeTask.id)}
                  className="h-8 gap-1 rounded-lg border-destructive/30 bg-background px-2.5 text-xs font-semibold text-destructive hover:border-destructive hover:bg-destructive hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                  <span>Huỷ import</span>
                </Button>
              )}

              {isCleaning && (
                <span className="rounded-md bg-amber-500/15 px-2.5 py-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                  Đang huỷ...
                </span>
              )}

              {!isBusy && (
                <button
                  type="button"
                  onClick={() => dismissTask(activeTask.id)}
                  className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Ẩn thông báo import"
                  title="Đóng"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {isBusy && (
            <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-brand-orange/15">
              <div
                className={`h-full rounded-full transition-all duration-300 ease-out ${
                  isCleaning
                    ? "w-full animate-pulse bg-amber-500"
                    : "bg-gradient-to-r from-brand-orange to-amber-400"
                }`}
                style={
                  isCleaning
                    ? undefined
                    : { width: `${Math.max(4, activeTask.progress)}%` }
                }
              />
            </div>
          )}
        </div>
      )}
    </section>
  );
}
