import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { agencyBillingService } from "@/services/agencyBillingService";
import { useAgencyStore } from "@/store/agencyStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";

export function AiCreditBalance({ sidebar = false }: { sidebar?: boolean }) {
  const { t, i18n } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const userId = useAuthStore((s) => s.user?.id);
  const systemRole = useAuthStore((s) => s.systemRole);
  const agencyId = useAgencyStore((s) => s.currentAgencyId);
  const agency = useAgencyStore((s) =>
    s.agencyList.find((a) => a.id === s.currentAgencyId),
  );
  const workspace = useWorkspaceStore((s) => s.currentWorkspace);
  const owner = agency?.myRole === "OWNER";
  const workspaceId =
    !owner && workspace?.agencyId === agencyId ? workspace.id : undefined;
  const allowed =
    !!userId &&
    !!agencyId &&
    systemRole !== "ADMIN" &&
    (owner ||
      (!!workspaceId &&
        (workspace?.myRole === "CREATOR" || workspace?.myRole === "MANAGER")));
  const query = useQuery({
    queryKey: ["ai-credit-balance", userId, agencyId, workspaceId],
    queryFn: () =>
      agencyBillingService.getCreditBalance(agencyId!, workspaceId),
    enabled: allowed,
    staleTime: 10000,
    refetchInterval: 30000,
    retry: false,
  });
  if (!allowed || !query.data?.visible) return null;
  const data = query.isError ? undefined : query.data;
  const number = (v: string) =>
    new Intl.NumberFormat(i18n.language).format(BigInt(v));
  const allocated = data?.allocated ? BigInt(data.allocated) : 0n;
  const available = data ? BigInt(data.available) : 0n;
  const percent =
    allocated > 0n
      ? Number(((available * 10000n) / allocated).toString()) / 100
      : 0;
  return (
    <section
      data-testid={sidebar ? "sidebar-ai-credit" : "studio-ai-credit"}
      className={cn(
        "rounded-lg border p-3 text-xs",
        sidebar
          ? "border-sidebar-border bg-sidebar-accent text-sidebar-foreground mx-3 my-2"
          : "border-border bg-card text-card-foreground mb-4",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-medium">
          {t(
            owner
              ? "subscription.credits.agency"
              : "subscription.credits.workspace",
          )}
        </span>
        {query.isPending ? (
          <span role="status">{t("subscription.credits.loading")}</span>
        ) : query.isError ? (
          <button
            type="button"
            onClick={() => void query.refetch()}
            className="underline underline-offset-2"
          >
            {t("subscription.credits.retry")}
          </button>
        ) : (
          data && (
            <button
              type="button"
              aria-expanded={expanded}
              onClick={() => setExpanded(!expanded)}
              className="font-semibold tabular-nums underline-offset-2 hover:underline"
            >
              {number(data.available)}
            </button>
          )
        )}
      </div>
      {query.isError && (
        <p className="mt-2 opacity-75">
          {t("subscription.credits.unavailable")}
        </p>
      )}
      {data && allocated > 0n && (
        <div
          role="progressbar"
          aria-label={t("subscription.credits.remaining")}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.min(100, percent)}
          className="bg-primary/15 mt-2 h-1.5 overflow-hidden rounded-full"
        >
          <div
            className="bg-primary h-full"
            style={{ width: `${Math.min(100, percent)}%` }}
          />
        </div>
      )}
      {data && available === 0n && (
        <p className="mt-2 opacity-75">{t("subscription.credits.empty")}</p>
      )}
      {expanded && data && (
        <div className="mt-3 space-y-1 border-t border-current/15 pt-2">
          <p>{t("subscription.credits.shared")}</p>
          {data.reserved !== null && (
            <p>
              {t("subscription.credits.reserved", {
                amount: number(data.reserved),
              })}
            </p>
          )}
          {data.expiresAt && (
            <p>
              {t("subscription.credits.expiry", {
                date: new Date(data.expiresAt).toLocaleDateString(
                  i18n.language,
                ),
              })}
            </p>
          )}
          {!owner && <p>{t("subscription.credits.scoped")}</p>}
        </div>
      )}
    </section>
  );
}
