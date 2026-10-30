import { useTranslation } from "react-i18next";
import { BarChart3, Sparkles, CalendarClock, CheckCircle2 } from "lucide-react";
import { LineStatChart, PieStatChart } from "@/components/charts/StatCharts";
import {
  MOCK_CAMPAIGN_TREND,
  MOCK_CONTENT_BY_STATUS,
  MOCK_RECENT_ACTIVITY,
  MOCK_UPCOMING_CONTENT,
} from "../../mockDashboardData";

export function WorkspaceVisualAnalytics() {
  const { t } = useTranslation();

  return (
    <>
      {/* ── Visual Analytics Section ── */}
      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="text-brand-orange size-5" />
            <h3 className="text-foreground text-lg font-bold">
              {t("nav.analytics")} &amp;{" "}
              {t("workspace.dashboard.campaignTrend")}
            </h3>
          </div>
          <span className="bg-brand-orange-soft text-brand-orange text-2xs inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-semibold">
            <Sparkles className="size-3" />
            {t("workspace.dashboard.mockBadge")}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <LineStatChart
            title={t("workspace.dashboard.campaignTrend")}
            data={MOCK_CAMPAIGN_TREND}
          />
          <PieStatChart
            title={t("workspace.dashboard.contentByStatus")}
            data={MOCK_CONTENT_BY_STATUS}
          />
        </div>
      </div>

      {/* ── Content Schedule & Recent Activity ── */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="border-border bg-card rounded-2xl border p-5 shadow-xs">
          <p className="text-foreground mb-3 text-sm font-semibold">
            {t("workspace.dashboard.upcomingContent")}
          </p>
          {MOCK_UPCOMING_CONTENT.length === 0 ? (
            <p className="text-muted-foreground text-xs">
              {t("workspace.dashboard.upcomingContentEmpty")}
            </p>
          ) : (
            <ul className="space-y-3">
              {MOCK_UPCOMING_CONTENT.map((item) => (
                <li key={item.id} className="flex items-start gap-2.5 text-sm">
                  <CalendarClock className="text-brand-orange mt-0.5 size-4.5 shrink-0" />
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

        <div className="border-border bg-card rounded-2xl border p-5 shadow-xs">
          <p className="text-foreground mb-3 text-sm font-semibold">
            {t("workspace.dashboard.recentActivity")}
          </p>
          {MOCK_RECENT_ACTIVITY.length === 0 ? (
            <p className="text-muted-foreground text-xs">
              {t("workspace.dashboard.recentActivityEmpty")}
            </p>
          ) : (
            <ul className="space-y-3">
              {MOCK_RECENT_ACTIVITY.map((item) => (
                <li key={item.id} className="flex items-start gap-2.5 text-sm">
                  <CheckCircle2 className="mt-0.5 size-4.5 shrink-0 text-emerald-500" />
                  <div className="min-w-0">
                    <p className="text-foreground">
                      <span className="font-semibold">{item.actor}</span>{" "}
                      {item.action}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {new Date(item.at).toLocaleString()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
