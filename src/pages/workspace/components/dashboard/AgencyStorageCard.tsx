import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  Check,
  ChevronDown,
  Cloud,
  Folder,
  Link2,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { useCustomerDriveConnection } from "@/hooks/useCustomerDriveConnection";
import { materialService } from "@/services/materialService";
import { formatFileSize } from "@/lib/utils";

export function AgencyStorageCard({
  workspaceId,
  compact = false,
}: {
  workspaceId?: string;
  compact?: boolean;
}) {
  const { t } = useTranslation();
  const connection = useCustomerDriveConnection(workspaceId);
  const [expanded, setExpanded] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const label = (key: string) => t(`workspace.agencyStorage.${key}`);
  const { status, busy } = connection;
  const usage = useQuery({
    queryKey: [
      "material-storage-usage",
      connection.workspace,
      connection.actor,
    ],
    queryFn: ({ signal }) =>
      materialService.storageUsage(connection.workspace!, signal),
    enabled:
      connection.allowed &&
      expanded &&
      !!status.data?.enabled &&
      !!status.data?.connected &&
      !status.isError,
    retry: false,
  });
  if (!connection.allowed) return null;
  if (status.isPending)
    return (
      <section
        aria-label={label("title")}
        className="border-border bg-card mb-5 rounded-2xl border p-5"
        aria-busy="true"
      >
        <p role="status" className="text-muted-foreground text-sm">
          {label("loading")}
        </p>
      </section>
    );
  if (status.isError)
    return (
      <section
        aria-label={label("title")}
        className="border-border bg-card mb-5 rounded-2xl border p-5"
      >
        <p role="alert" className="text-sm">
          {label("loadError")}
        </p>
        <Button
          className="mt-3"
          variant="outline"
          onClick={() => void status.refetch()}
        >
          {label("retry")}
        </Button>
      </section>
    );
  const disconnecting = status.data?.disconnecting === true;
  const connected = status.data?.connected === true || disconnecting;
  const ready = status.data?.enabled === true;
  const action = (
    <Button
      variant="orange"
      disabled={busy || !ready || disconnecting}
      onClick={connection.connect}
    >
      <Link2 className="mr-2 size-4" />
      {label(busy ? "connecting" : connected ? "reconnect" : "connect")}
    </Button>
  );
  return (
    <section
      aria-label={compact ? t("library.drive.title") : label("title")}
      className="border-border bg-card mb-5 overflow-hidden rounded-2xl border shadow-sm"
    >
      <div
        className={
          connected || compact
            ? "p-5"
            : "grid gap-5 p-5 sm:p-6 xl:grid-cols-[minmax(0,1fr)_260px]"
        }
      >
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="bg-brand-orange-soft text-brand-orange flex size-10 shrink-0 items-center justify-center rounded-xl">
              {connected ? (
                <Check className="size-5" />
              ) : (
                <Cloud className="size-5" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <h2
                className={
                  connected || compact
                    ? "font-semibold"
                    : "text-xl font-semibold tracking-tight"
                }
              >
                {connected
                  ? label("connected")
                  : compact
                    ? t("library.drive.title")
                    : label("headline")}
              </h2>
              {connected && (
                <p className="text-muted-foreground mt-1 text-sm break-all">
                  {status.data?.email}
                </p>
              )}
              {!connected && (
                <p className="text-muted-foreground mt-1 text-xs">
                  {label("oneTime")}
                </p>
              )}
            </div>
            {connected && (
              <Button
                variant="outline"
                disabled={busy}
                onClick={() => setExpanded(!expanded)}
                aria-expanded={expanded}
              >
                {label("manage")}
                <ChevronDown className="ml-1 size-4" />
              </Button>
            )}
          </div>
          {!connected && (
            <>
              <p className="text-muted-foreground mt-3 max-w-xl text-sm leading-relaxed">
                {label("description")}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                {action}
                <span className="text-muted-foreground text-xs">
                  {label("noFolderPicking")}
                </span>
              </div>
              <p className="text-muted-foreground mt-4 flex items-center gap-2 text-xs">
                <ShieldCheck className="size-4 shrink-0" />
                {label("privacy")}
              </p>
            </>
          )}
          {!ready && (
            <div
              className="bg-muted text-muted-foreground mt-4 rounded-lg p-3 text-sm"
              role="status"
            >
              <p>{label("unavailable")}</p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={() => void status.refetch()}
              >
                {label("retry")}
              </Button>
            </div>
          )}
          {disconnecting && (
            <p role="alert" className="text-destructive mt-4 text-sm">
              {label("disconnectPending")}
            </p>
          )}
          {connected && !disconnecting && status.data?.syncEnabled && (
            <p className="text-muted-foreground mt-4 text-sm" role="status">
              {label(
                status.data.syncReady ? "syncHint" : "syncReconnectRequired",
              )}
            </p>
          )}
        </div>
        {!connected && !compact && (
          <aside className="border-border bg-muted/30 hidden rounded-xl border p-4 xl:block">
            <p className="text-sm font-medium">{label("automatic")}</p>
            <ul className="text-muted-foreground mt-3 space-y-3 text-sm">
              {["stepFolder", "stepTeam", "stepFallback"].map((key) => (
                <li key={key} className="flex gap-2">
                  <Check className="text-brand-orange mt-0.5 size-4 shrink-0" />
                  {label(key)}
                </li>
              ))}
            </ul>
          </aside>
        )}
        {connected && expanded && (
          <div className="border-border mt-4 space-y-4 border-t pt-4">
            {status.data?.folderId && (
              <a
                className="text-brand-orange inline-flex items-center gap-2 text-sm underline underline-offset-4"
                href={`https://drive.google.com/drive/folders/${encodeURIComponent(status.data.folderId)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Folder className="size-4" />
                {label("openFolder")}
              </a>
            )}
            <p className="text-muted-foreground text-sm">
              {label("sharedAgency")}
            </p>
            <p className="text-muted-foreground text-sm">{label("fallback")}</p>
            {usage.isPending && (
              <p className="text-muted-foreground text-sm" role="status">
                {label("loadingUsage")}
              </p>
            )}
            {usage.isError && (
              <div className="text-muted-foreground text-sm" role="status">
                {label("usageError")}{" "}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void usage.refetch()}
                >
                  {label("retry")}
                </Button>
              </div>
            )}
            {usage.data?.storageMode === "CUSTOMER_DRIVE_FIRST" && (
              <p className="text-sm">
                {label("brandhubUsage")}:{" "}
                {formatFileSize(Number(usage.data.agencyUsedBytes))} /{" "}
                {formatFileSize(Number(usage.data.agencyQuotaBytes))}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {action}
              <Button
                variant="outline"
                disabled={busy}
                onClick={() => setConfirm(true)}
              >
                {label("disconnect")}
              </Button>
            </div>
          </div>
        )}
      </div>
      <ConfirmDialog
        isOpen={confirm}
        onClose={() => {
          if (!busy) setConfirm(false);
        }}
        onConfirm={async () => {
          try {
            if (await connection.disconnect()) setConfirm(false);
          } catch {
            /* Shared hook reports the API error. */
          }
        }}
        title={label("disconnectTitle")}
        description={label("disconnectDescription")}
        confirmText={label("disconnectConfirm")}
        cancelText={label("cancel")}
        isLoading={busy}
      />
    </section>
  );
}
