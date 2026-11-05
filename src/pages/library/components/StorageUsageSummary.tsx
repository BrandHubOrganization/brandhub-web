import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { HardDrive } from "lucide-react";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useAuthStore } from "@/store/authStore";
import { materialService } from "@/services/materialService";
import { StorageAddonPanel } from "@/pages/library/components/StorageAddonPanel";
import { cn, formatFileSize } from "@/lib/utils";

export function StorageUsageSummary() {
  const { t } = useTranslation();
  const workspace = useWorkspaceStore((state) => state.currentWorkspace?.id);
  const role = useWorkspaceStore((state) => state.currentMemberRole);
  const actor = useAuthStore((state) => state.user?.id);
  const enabled =
    !!workspace &&
    !!actor &&
    ["OWNER", "MANAGER", "CREATOR"].includes(role ?? "");
  const usage = useQuery({
    queryKey: ["material-storage-usage", workspace, actor],
    enabled,
    queryFn: ({ signal }) => materialService.storageUsage(workspace!, signal),
    staleTime: 60_000,
    retry: false,
  });
  if (
    role !== "CLIENT" &&
    (!enabled || !usage.isSuccess || usage.data?.agencyUsedBytes == null)
  )
    return null;
  const used = Number(usage.data?.agencyUsedBytes ?? 0);
  const quota = Number(usage.data?.agencyQuotaBytes ?? 0);
  const size = (bytes: number) =>
    bytes >= 1024 ** 3
      ? `${(bytes / 1024 ** 3).toLocaleString(undefined, { maximumFractionDigits: 1 })} GB`
      : formatFileSize(bytes);
  if (!workspace || !actor) return null;
  return (
    <details
      key={`${workspace}:${actor}`}
      className="relative"
      onKeyDown={(event) => {
        if (event.key === "Escape") event.currentTarget.open = false;
      }}
    >
      <summary
        className={cn(
          "text-muted-foreground hover:text-foreground focus-visible:ring-ring flex min-h-9 cursor-pointer list-none items-center gap-1.5 rounded-md px-2 text-xs focus-visible:ring-2",
          quota > 0 && used / quota >= 0.8 && "text-destructive",
        )}
      >
        <HardDrive className="size-3.5" />
        {role === "CLIENT"
          ? t("library.simple.storageDetails")
          : t("library.simple.usage", {
              used: size(used),
              quota: size(quota),
            })}
      </summary>
      <div className="border-border bg-card absolute top-full left-0 z-40 mt-2 w-60 max-w-[calc(100vw-3rem)] space-y-3 rounded-xl border p-4 shadow-lg sm:right-0 sm:left-auto sm:w-72">
        <p className="text-foreground text-sm font-medium">
          {t("library.simple.storageDetails")}
        </p>
        <StorageAddonPanel />
      </div>
    </details>
  );
}
