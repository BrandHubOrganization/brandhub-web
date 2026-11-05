import { isAxiosError } from "axios";
import {
  loadDriveImportAuthorization,
  requestDriveImportToken,
} from "@/pages/library/hooks/driveImportAuthorization";
import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { materialService } from "@/services/materialService";
import { useWorkspaceStore } from "@/store/workspaceStore";
export function CustomerDrivePanel({ folderId }: { folderId?: string }) {
  const { t } = useTranslation();
  const client = useQueryClient();
  const workspace = useWorkspaceStore((state) => state.currentWorkspace?.id);
  const authorization = useRef<Promise<string> | null>(null);
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
  const [source, setSource] = useState("");
  const [jobId, setJobId] = useState<string>();
  const label = (key: string) => t(`materials.repository.${key}`);
  const mutation = useMutation({
    mutationFn: async () => {
      const pending = authorization.current;
      authorization.current = null;
      if (!pending) throw new Error("DRIVE_IMPORT_AUTH_REQUIRED");
      let id = source.trim();
      try {
        const url = new URL(id);
        if (url.hostname !== "drive.google.com")
          throw new Error("Invalid folder");
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
    onSuccess: (job) => setJobId(job.jobId),
  });
  const job = useQuery({
    queryKey: ["drive-import", workspace, jobId],
    enabled: !!jobId && !!workspace,
    queryFn: ({ signal }) =>
      materialService.driveImportStatus(workspace!, jobId!, signal),
    refetchInterval: (query) =>
      query.state.data?.status === "COMPLETED" ||
      query.state.data?.status === "FAILED"
        ? false
        : 2000,
    retry: false,
  });
  useEffect(() => {
    if (job.data?.status === "COMPLETED" || job.data?.status === "FAILED") {
      void client.invalidateQueries({ queryKey: ["materials", workspace] });
      void client.invalidateQueries({
        queryKey: ["material-storage-usage", workspace],
      });
    }
  }, [job.data?.status, client, workspace]);
  function failureCode(error: unknown): string | undefined {
    return isAxiosError(error)
      ? error.response?.data?.error?.code
      : error instanceof Error
        ? error.message
        : undefined;
  }
  function importError(code?: string) {
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
  }
  return (
    <section className="bg-muted/20 border-border grid min-w-0 gap-3 rounded-lg border p-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center">
      <form
        className="flex min-w-0 items-center gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (
            !config.data ||
            mutation.isPending ||
            job.data?.status === "RUNNING"
          )
            return;
          authorization.current = requestDriveImportToken(config.data.clientId);
          void authorization.current.catch(() => {});
          setJobId(undefined);
          mutation.mutate();
        }}
      >
        <Input
          className="h-9 text-sm"
          disabled={mutation.isPending || job.data?.status === "RUNNING"}
          type="url"
          wrapperClassName="min-w-0 flex-1"
          aria-label={label("driveFolder")}
          placeholder={label("driveFolder")}
          value={source}
          onChange={(event) => setSource(event.target.value)}
          required
        />
        <Button
          size="sm"
          className="h-9 shrink-0"
          type="submit"
          disabled={
            !source.trim() ||
            !config.isSuccess ||
            mutation.isPending ||
            job.data?.status === "RUNNING"
          }
        >
          {t("library.simple.import")}
        </Button>
      </form>
      {config.isError && (
        <p role="alert" className="text-destructive text-xs">
          {t("library.driveImport.notConfigured")}{" "}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void config.refetch()}
          >
            {label("retry")}
          </Button>
        </p>
      )}
      {mutation.isError &&
        failureCode(mutation.error) !== "DRIVE_IMPORT_CANCELLED" && (
          <p role="alert" className="text-destructive text-xs">
            {importError(failureCode(mutation.error))}
          </p>
        )}
      {job.data && (
        <div
          role="status"
          className="text-muted-foreground min-w-0 text-xs lg:text-right"
        >
          <span
            className={
              job.data.status === "FAILED"
                ? "text-destructive font-medium"
                : "font-medium"
            }
          >
            {t(
              `library.driveImport.${job.data.status === "FAILED" ? "failedShort" : job.data.status === "COMPLETED" ? "completedShort" : "runningShort"}`,
            )}
          </span>
          <details className="mt-1">
            <summary className="focus-visible:ring-ring inline-block cursor-pointer rounded-sm underline-offset-4 hover:underline focus-visible:ring-2">
              {t("library.driveImport.details")}
            </summary>
            <p className="mt-2 leading-relaxed">
              {job.data.status === "FAILED"
                ? importError(job.data.errorMessage)
                : label(
                    job.data.status === "RUNNING"
                      ? "importRunning"
                      : job.data.status === "COMPLETED"
                        ? "importCompleted"
                        : "importFailed",
                  )}
            </p>
            <p>
              {t("materials.repository.importProgress", {
                files: job.data.importedFiles,
                folders: job.data.importedFolders,
                skipped: job.data.skippedFiles,
              })}
            </p>
          </details>
        </div>
      )}
      {job.isError && (
        <p role="alert" className="text-destructive text-xs">
          {label("failed")}
        </p>
      )}
    </section>
  );
}
