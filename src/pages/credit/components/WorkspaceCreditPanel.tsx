import { useTranslation } from "react-i18next";
import { AlertTriangle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreditQueryState } from "@/pages/credit/components/CreditQueryState";
import { WorkspaceCreditRow } from "@/pages/credit/components/WorkspaceCreditRow";
import { useCreditBalance } from "@/pages/credit/hooks/useCreditReporting";
import { useWorkspaceCredit } from "@/pages/credit/hooks/useWorkspaceCredit";
import { formatCredits } from "@/pages/credit/utils/creditFormat";
import { cn } from "@/lib/utils";

export function WorkspaceCreditPanel({
  agencyId,
  canEdit,
}: {
  agencyId: string;
  canEdit: boolean;
}) {
  const { t, i18n } = useTranslation();
  const { query, save } = useWorkspaceCredit(agencyId);
  const balanceQuery = useCreditBalance(agencyId);

  if (query.isPending || query.isError) {
    return (
      <CreditQueryState
        loading={query.isPending}
        error={query.error}
        retry={() => query.refetch()}
      />
    );
  }

  const balance = balanceQuery.data;
  const availableCredits = balance
    ? balance.planAvailable +
      balance.purchasedAvailable +
      (balance.developmentAvailable ?? 0) +
      (balance.otherAvailable ?? 0)
    : null;

  const cappedWorkspaces = query.data.filter((ws) => ws.cap !== null);
  const totalWorkspaceCap = cappedWorkspaces.reduce(
    (sum, ws) => sum + (ws.cap ?? 0),
    0,
  );
  const exceedsAvailable =
    availableCredits !== null &&
    cappedWorkspaces.length > 0 &&
    totalWorkspaceCap > availableCredits;

  return (
    <section className="border-border bg-card space-y-4 rounded-xl border p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-foreground text-lg font-semibold">
            {t("credit.workspace.title")}
          </h2>
          <p className="text-muted-foreground text-sm">
            {t("credit.workspace.description")}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={query.isFetching}
          onClick={() => void query.refetch()}
        >
          <RotateCw
            className={cn(
              "mr-1.5 size-3.5",
              query.isFetching && "animate-spin",
            )}
          />
          {t("credit.refresh")}
        </Button>
      </div>

      {cappedWorkspaces.length > 0 && availableCredits !== null && (
        <div className="border-border bg-muted/20 flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3.5 py-2.5 text-xs">
          <span className="text-muted-foreground">
            {t(
              "credit.workspace.totalCapLabel",
              "Tổng giới hạn tối đa đã đặt cho các Workspace:",
            )}
          </span>
          <span
            className={cn(
              "font-semibold tabular-nums",
              exceedsAvailable
                ? "text-amber-600 dark:text-amber-400"
                : "text-foreground",
            )}
          >
            {formatCredits(totalWorkspaceCap, i18n.language)} /{" "}
            {formatCredits(availableCredits, i18n.language)} Credits
          </span>
        </div>
      )}

      {exceedsAvailable && availableCredits !== null && (
        <div
          role="status"
          data-testid="workspace-cap-exceeds-warning"
          className="flex items-start gap-2.5 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3.5 text-sm text-amber-800 dark:text-amber-300"
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="text-xs sm:text-sm">
            {t("credit.workspace.totalCapExceedsWarning", {
              totalCap: formatCredits(totalWorkspaceCap, i18n.language),
              available: formatCredits(availableCredits, i18n.language),
              defaultValue: `Cảnh báo: Tổng giới hạn tối đa của các Workspace (${formatCredits(totalWorkspaceCap, i18n.language)} credit) đang lớn hơn số dư Credit hiện tại của Agency (${formatCredits(availableCredits, i18n.language)} credit). Các Workspace dùng chung quỹ Agency nên tổng chi tiêu thực tế không thể vượt quá số dư hiện có.`,
            })}
          </p>
        </div>
      )}

      {query.data.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          {t("credit.workspace.empty")}
        </p>
      ) : (
        <div className="divide-border divide-y">
          {query.data.map((workspace) => {
            const otherWorkspacesCapSum =
              totalWorkspaceCap - (workspace.cap ?? 0);
            return (
              <WorkspaceCreditRow
                key={workspace.workspaceId}
                workspace={workspace}
                canEdit={canEdit}
                availableCredits={availableCredits}
                otherWorkspacesCapSum={otherWorkspacesCapSum}
                onSave={save}
                onReload={async () => {
                  await query.refetch();
                }}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
