import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { CreditQueryState } from "@/pages/credit/components/CreditQueryState";
import { WorkspaceCreditRow } from "@/pages/credit/components/WorkspaceCreditRow";
import { useWorkspaceCredit } from "@/pages/credit/hooks/useWorkspaceCredit";

export function WorkspaceCreditPanel({
  agencyId,
  canEdit,
}: {
  agencyId: string;
  canEdit: boolean;
}) {
  const { t } = useTranslation();
  const { query, save } = useWorkspaceCredit(agencyId);
  if (query.isPending || query.isError) {
    return (
      <CreditQueryState
        loading={query.isPending}
        error={query.error}
        retry={() => query.refetch()}
      />
    );
  }
  return (
    <section className="border-border bg-card space-y-4 rounded-xl border p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{t("credit.workspace.title")}</h2>
        <Button
          variant="outline"
          loading={query.isFetching}
          onClick={() => void query.refetch()}
        >
          {t("credit.refresh")}
        </Button>
      </div>
      <p className="text-muted-foreground text-sm">
        {t("credit.workspace.description")}
      </p>
      {query.data.length === 0 ? (
        <p>{t("credit.workspace.empty")}</p>
      ) : (
        <div className="divide-border divide-y">
          {query.data.map((workspace) => (
            <WorkspaceCreditRow
              key={workspace.workspaceId}
              workspace={workspace}
              canEdit={canEdit}
              onSave={save}
              onReload={async () => {
                await query.refetch();
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
