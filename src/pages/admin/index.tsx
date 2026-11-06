import { lazy, Suspense, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Construction,
  ArrowLeft,
  TrendingUp,
  Radar,
  Network,
  Activity,
} from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import { cn } from "@/lib/utils";
import { AdminAccountsPanel } from "@/pages/admin/components/AdminAccountsPanel";
import { AdminTrendPipelinePanel } from "@/pages/admin/components/AdminTrendPipelinePanel";
import { AdminTrendReplayPanel } from "@/pages/admin/components/AdminTrendReplayPanel";
import { AdminTrendPanel } from "@/pages/admin/components/AdminTrendPanel";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminRevenuePanel } from "@/pages/admin/components/AdminRevenuePanel";
import { AdminModerationPanel } from "@/pages/admin/components/AdminModerationPanel";
import { AdminNotificationsPanel } from "@/pages/admin/components/AdminNotificationsPanel";
import { AdminMailSuppressionsPanel } from "@/pages/admin/components/AdminMailSuppressionsPanel";
import { AdminMailBatchesPanel } from "@/pages/admin/components/AdminMailBatchesPanel";
import { AdminMailTemplatesPanel } from "@/pages/admin/components/AdminMailTemplatesPanel";
import { AdminReportForm } from "@/pages/admin/components/AdminReportExport";
import { AdminCrawlConfigPanel } from "@/pages/admin/components/AdminCrawlConfigPanel";
import { presetRange } from "@/services/adminRevenueService";
import {
  AdminOverviewActions,
  AdminOverviewPanel,
} from "@/pages/admin/components/AdminOverviewPanel";

const views = [
  "overview",
  "users",
  "moderation",
  "revenue",
  "email",
  "mailTemplates",
  "mailBatches",
  "mailSuppressions",
  "reports",
  "crawl",
  "trendReplay",
  "trendPipeline",
  "trends",
  "trendGraph",
];

const AdminTrendGraphPanel = lazy(
  () => import("@/pages/admin/components/AdminTrendGraphPanel"),
);
const descriptions: Record<string, string> = {
  overview: "admin.overview.description",
  users: "admin.accounts.description",
  crawl: "admin.crawl.description",
  trendReplay: "admin.trendReplay.description",
  trendPipeline: "admin.trendPipeline.description",
  trends: "admin.trends.description",
  trendGraph: "admin.trendGraph.description",
  mailTemplates: "mailTemplate.admin.description",
  mailBatches: "mailTemplate.admin.batchesDescription",
  mailSuppressions: "mailTemplate.admin.suppressionsDescription",
  reports: "admin.reports.description",
  moderation: "admin.moderation.description",
};

const aiTrendNavItems = [
  { key: "trends", icon: TrendingUp, labelKey: "admin.navigation.trends" },
  { key: "crawl", icon: Radar, labelKey: "admin.navigation.crawl" },
  {
    key: "trendPipeline",
    icon: Radar,
    labelKey: "admin.navigation.trendPipeline",
  },
  { key: "trendGraph", icon: Network, labelKey: "admin.navigation.trendGraph" },
  {
    key: "trendReplay",
    icon: Activity,
    labelKey: "admin.navigation.trendReplay",
  },
] as const;

export function AdminAiNavActions({ currentView }: { currentView: string }) {
  const { t } = useTranslation();
  return (
    <nav
      aria-label={t("admin.navigation.ai")}
      className="flex flex-wrap items-center gap-1.5 sm:gap-2"
    >
      {aiTrendNavItems.map(({ key, icon: Icon, labelKey }) => {
        const active = currentView === key;
        return (
          <Link
            key={key}
            to={`/admin?view=${key}`}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors",
              active
                ? "bg-brand-orange text-white"
                : "bg-card hover:bg-muted text-muted-foreground border-border border",
            )}
          >
            <Icon className="size-3.5 shrink-0" aria-hidden="true" />
            <span>{t(labelKey)}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminPage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const requested = params.get("view") || "overview";
  const view = views.includes(requested) ? requested : "overview";
  const [client] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: false } } }),
  );
  const [timezone, setTimezone] = useState("Asia/Ho_Chi_Minh");
  return (
    <QueryClientProvider client={client}>
      <PageWrapper
        title={t(
          view === "overview"
            ? "admin.overview.title"
            : view === "trendPipeline"
              ? "admin.navigation.trendPipeline"
              : `admin.navigation.${view}`,
        )}
        description={t(descriptions[view] ?? `admin.unavailable.${view}`)}
        hideBanner
        showGuideButton={false}
        compact={view === "trendGraph"}
        actions={
          view === "overview" ? (
            <AdminOverviewActions
              timezone={timezone}
              onTimezoneChange={setTimezone}
            />
          ) : [
              "trends",
              "crawl",
              "trendPipeline",
              "trendGraph",
              "trendReplay",
            ].includes(view) ? (
            <AdminAiNavActions currentView={view} />
          ) : undefined
        }
        className={cn(
          "max-w-[1600px] space-y-6 p-4 pb-12 md:p-8 [&>div:first-child]:border-0 [&>div:first-child]:pb-0",
          view === "trendGraph" && "space-y-3 p-3 md:px-5 md:py-4",
        )}
      >
        {view === "overview" ? (
          <AdminOverviewPanel timezone={timezone} />
        ) : view === "users" ? (
          <AdminAccountsPanel />
        ) : view === "moderation" ? (
          <AdminModerationPanel />
        ) : view === "revenue" ? (
          <AdminRevenuePanel />
        ) : view === "email" ? (
          <AdminNotificationsPanel />
        ) : view === "mailTemplates" ? (
          <AdminMailTemplatesPanel />
        ) : view === "mailSuppressions" ? (
          <AdminMailSuppressionsPanel />
        ) : view === "mailBatches" ? (
          <AdminMailBatchesPanel />
        ) : view === "trendPipeline" ? (
          <AdminTrendPipelinePanel />
        ) : view === "crawl" ? (
          <AdminCrawlConfigPanel />
        ) : view === "reports" ? (
          <section className="bg-card border-border w-full rounded-xl border p-5 lg:p-6">
            <AdminReportForm
              defaults={{
                type: "REVENUE",
                ...presetRange("month", "Asia/Ho_Chi_Minh"),
                timezone: "Asia/Ho_Chi_Minh",
              }}
            />
          </section>
        ) : view === "trendReplay" ? (
          <AdminTrendReplayPanel />
        ) : view === "trends" ? (
          <AdminTrendPanel />
        ) : view === "trendGraph" ? (
          <Suspense
            fallback={
              <Skeleton
                className="h-96 w-full"
                aria-label={t("admin.loading")}
              />
            }
          >
            <AdminTrendGraphPanel />
          </Suspense>
        ) : (
          <section className="bg-card border-border flex min-h-80 flex-col items-center justify-center rounded-xl border p-6 text-center">
            <span className="bg-muted text-muted-foreground mb-4 rounded-full p-4">
              <Construction className="size-7" />
            </span>
            <h2 className="text-base font-semibold">
              {t("admin.unavailable.title")}
            </h2>
            <p className="text-muted-foreground mt-2 max-w-md text-sm leading-6">
              {t("admin.unavailable.description")}
            </p>
            <Link
              to="/admin"
              className="text-foreground focus-visible:outline-ring mt-6 flex items-center gap-2 rounded-md text-sm font-medium focus-visible:outline-2"
            >
              <ArrowLeft className="size-4" />
              {t("admin.unavailable.back")}
            </Link>
          </section>
        )}
      </PageWrapper>
    </QueryClientProvider>
  );
}
export default AdminPage;
