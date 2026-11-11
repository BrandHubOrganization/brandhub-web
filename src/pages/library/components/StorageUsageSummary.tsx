import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { HardDrive, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { materialService } from "@/services/materialService";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useAuthStore } from "@/store/authStore";
import { onRepositoryTaskRefresh } from "@/store/backgroundTaskStore";
import { formatBytes } from "./MaterialRepositoryCard";
import { StorageAddonPanel } from "./StorageAddonPanel";

export function StorageUsageSummary() {
  const workspaceObj = useWorkspaceStore((state) => state.currentWorkspace);
  const workspace = workspaceObj?.id;
  const role = useWorkspaceStore((state) => state.currentMemberRole);
  const actor = useAuthStore((state) => state.user?.id);
  const [addonOpen, setAddonOpen] = useState(false);

  const isClient = role === "CLIENT";
  const canBuyAddon =
    role === "OWNER" || role === "MANAGER" || role === "CLIENT";

  const workspaceUsage = useQuery({
    queryKey: ["material-storage-usage", workspace, actor],
    enabled: Boolean(workspace && actor && role && !isClient),
    queryFn: ({ signal }) => materialService.storageUsage(workspace!, signal),
    staleTime: 60_000,
    refetchInterval: 60_000,
    retry: 2,
  });

  const clientVaultUsage = useQuery({
    queryKey: ["client-vault-storage", actor],
    enabled: Boolean(actor && isClient),
    queryFn: ({ signal }) => materialService.clientVaultStorageUsage(signal),
    refetchInterval: 60_000,
    retry: 2,
  });

  useEffect(() => {
    if (!workspace) return;
    return onRepositoryTaskRefresh((wsId) => {
      if (wsId === workspace) {
        if (isClient) {
          void clientVaultUsage.refetch();
        } else {
          void workspaceUsage.refetch();
        }
      }
    });
  }, [workspace, isClient, clientVaultUsage, workspaceUsage]);

  if (!workspace || !actor || !role) return null;

  const usedBytes = isClient
    ? Number(clientVaultUsage.data?.usedBytes ?? 0)
    : Number(
        workspaceUsage.data?.agencyUsedBytes ??
          workspaceUsage.data?.workspaceUsedBytes ??
          0,
      );
  const quotaBytes = isClient
    ? Number(
        clientVaultUsage.data?.totalQuotaBytes ??
          clientVaultUsage.data?.quotaBytes ??
          0,
      )
    : Number(workspaceUsage.data?.agencyQuotaBytes ?? 0);
  const percent =
    quotaBytes > 0
      ? Math.min(100, Math.round((usedBytes / quotaBytes) * 100))
      : 0;

  return (
    <>
      <div className="flex flex-wrap items-center gap-2.5 rounded-2xl border border-border/80 bg-card px-3.5 py-2 shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-orange/10 text-brand-orange">
            <HardDrive className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-[140px]">
            <div className="flex items-center justify-between gap-2 text-[11px]">
              <span className="font-semibold text-foreground">
                {isClient ? "Kho cá nhân S3" : "Dung lượng S3"}
              </span>
              {quotaBytes > 0 && (
                <span className="font-bold tabular-nums text-muted-foreground">
                  {formatBytes(usedBytes)} / {formatBytes(quotaBytes)}
                </span>
              )}
            </div>
            {quotaBytes > 0 && (
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    percent >= 90
                      ? "bg-destructive"
                      : percent >= 75
                        ? "bg-amber-500"
                        : "bg-brand-orange"
                  }`}
                  style={{ width: `${Math.max(4, percent)}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {canBuyAddon && (
          <Button
            type="button"
            size="sm"
            onClick={() => setAddonOpen(true)}
            className="h-8 gap-1 rounded-xl bg-brand-orange px-3 text-xs font-semibold text-white shadow-xs hover:bg-brand-orange/90"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Mua thêm S3</span>
          </Button>
        )}
      </div>

      {canBuyAddon && (
        <StorageAddonPanel
          open={addonOpen}
          onOpenChange={setAddonOpen}
          agencyId={workspaceObj?.agencyId ?? undefined}
          payerScope={isClient ? "CLIENT_VAULT" : "AGENCY"}
          usedBytes={usedBytes}
          quotaBytes={quotaBytes}
        />
      )}
    </>
  );
}
