import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { CalendarClock, Sparkles } from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import { workspaceService } from "@/services/workspaceService";
import { extractErrorMessage } from "@/utils/error";
import type { WorkspaceDashboard } from "@/types/workspace";
import {
  LineStatChart,
  PieStatChart,
} from "@/components/charts/StatCharts";
import {
  MOCK_CAMPAIGN_TREND,
  MOCK_CONTENT_BY_STATUS,
  MOCK_RECENT_ACTIVITY,
  MOCK_UPCOMING_CONTENT,
} from "./mockDashboardData";
import { getAnalyticsSummary } from "@/services/mock/mockAnalyticsService";
import type { AnalyticsSummary } from "@/types/analytics";
import { StatCards } from "@/pages/analytics/components/StatCards";
import { ChannelPerformanceChart } from "@/pages/analytics/components/ChannelPerformanceChart";

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
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);

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

  // TODO(mock): same gap as MOCK_* below — no per-workspace analytics
  // endpoint yet, getAnalyticsSummary() is the same mock service that used
  // to back the standalone /analytics page.
  useEffect(() => {
    getAnalyticsSummary().then(setAnalytics);
  }, []);

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

      {/* TODO(mock): content/campaign-timeline data below is placeholder —
          no backend endpoint yet. Swap MOCK_* imports for real fetched state
          once content_requests/publish_logs get a Mongo repository. */}
      <div className="mt-6 flex items-center gap-2">
        <span className="bg-brand-orange-soft text-brand-orange text-2xs inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold">
          <Sparkles className="size-3" />
          {t("workspace.dashboard.mockBadge")}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <LineStatChart
          title={t("workspace.dashboard.campaignTrend")}
          data={MOCK_CAMPAIGN_TREND}
        />
        <PieStatChart
          title={t("workspace.dashboard.contentByStatus")}
          data={MOCK_CONTENT_BY_STATUS}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="border-border bg-card rounded-xl border p-4">
          <p className="text-foreground mb-3 text-sm font-medium">
            {t("workspace.dashboard.upcomingContent")}
          </p>
          {MOCK_UPCOMING_CONTENT.length === 0 ? (
            <p className="text-muted-foreground text-xs">
              {t("workspace.dashboard.upcomingContentEmpty")}
            </p>
          ) : (
            <ul className="space-y-3">
              {MOCK_UPCOMING_CONTENT.map((item) => (
                <li key={item.id} className="flex items-start gap-2 text-sm">
                  <CalendarClock className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-foreground truncate font-medium">
                      {item.title}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {item.platform} ·{" "}
                      {new Date(item.scheduledAt).toLocaleDateString()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-border bg-card rounded-xl border p-4">
          <p className="text-foreground mb-3 text-sm font-medium">
            {t("workspace.dashboard.recentActivity")}
          </p>
          {MOCK_RECENT_ACTIVITY.length === 0 ? (
            <p className="text-muted-foreground text-xs">
              {t("workspace.dashboard.recentActivityEmpty")}
            </p>
          ) : (
            <ul className="space-y-3">
              {MOCK_RECENT_ACTIVITY.map((item) => (
                <li key={item.id} className="text-sm">
                  <p className="text-foreground">
                    <span className="font-medium">{item.actor}</span>{" "}
                    {item.action}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {new Date(item.at).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {analytics && (
        <>
          <div className="mt-6">
            <StatCards cards={analytics.cards} />
          </div>
          <div className="mt-4">
            <ChannelPerformanceChart channelStats={analytics.channelStats} />
          </div>
        </>
      )}
    </PageWrapper>
  );
}

export default WorkspaceDashboardPage;
