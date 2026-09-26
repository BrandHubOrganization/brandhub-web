import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import PageWrapper from "@/components/layout/PageWrapper";
import { workspaceService } from "@/services/workspaceService";
import { extractErrorMessage } from "@/utils/error";
import type { WorkspaceDashboard } from "@/types/workspace";

// FR 3.4.11 — View Workspace Dashboard. Cards only use data that genuinely
// exists (member roles, campaign status, package negotiation, Agency-wide
// AI credit usage) — no Task/Material summary since those entities don't
// exist in this codebase.
function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border-border bg-card rounded-xl border p-4">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="text-foreground mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function BreakdownList({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data);
  if (entries.length === 0) return null;
  return (
    <ul className="mt-2 space-y-1">
      {entries.map(([key, count]) => (
        <li key={key} className="flex justify-between text-sm">
          <span className="text-muted-foreground">{key}</span>
          <span className="text-foreground font-medium">{count}</span>
        </li>
      ))}
    </ul>
  );
}

export function WorkspaceDashboardPage() {
  const { t } = useTranslation();
  const { id: workspaceId } = useParams<{ id: string }>();
  const [dashboard, setDashboard] = useState<WorkspaceDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workspaceId) return;
    workspaceService
      .getDashboard(workspaceId)
      .then(({ data }) => setDashboard(data.data))
      .catch((err: unknown) =>
        toast.error(
          extractErrorMessage(err, t("workspace.dashboard.loadError")),
        ),
      )
      .finally(() => setLoading(false));
  }, [workspaceId, t]);

  if (loading || !dashboard) return null;

  return (
    <PageWrapper
      title={t("workspace.dashboard.title")}
      description={t("workspace.dashboard.description")}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t("workspace.dashboard.activeMembers")}
          value={dashboard.totalActiveMembers}
        />
        <StatCard
          label={t("workspace.dashboard.totalCampaigns")}
          value={dashboard.totalCampaigns}
        />
        <StatCard
          label={t("workspace.dashboard.packageStatus")}
          value={
            dashboard.packageNegotiationStatus ??
            t("workspace.dashboard.noPackage")
          }
        />
        <StatCard
          label={t("workspace.dashboard.agencyAiCredits", {
            month: dashboard.aiCreditMonth,
          })}
          value={dashboard.agencyAiCreditsUsedThisMonth}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="border-border bg-card rounded-xl border p-4">
          <p className="text-foreground text-sm font-medium">
            {t("workspace.dashboard.membersByRole")}
          </p>
          <BreakdownList data={dashboard.membersByRole} />
        </div>
        <div className="border-border bg-card rounded-xl border p-4">
          <p className="text-foreground text-sm font-medium">
            {t("workspace.dashboard.campaignsByStatus")}
          </p>
          <BreakdownList data={dashboard.campaignsByStatus} />
        </div>
      </div>
    </PageWrapper>
  );
}

export default WorkspaceDashboardPage;
