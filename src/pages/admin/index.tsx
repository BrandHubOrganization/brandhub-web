import { lazy, Suspense, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Construction, ArrowLeft } from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import { AdminAccountsPanel } from "@/pages/admin/components/AdminAccountsPanel";
import { AdminTrendReplayPanel } from "@/pages/admin/components/AdminTrendReplayPanel";
import { AdminTrendPanel } from "@/pages/admin/components/AdminTrendPanel";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminRevenuePanel } from "@/pages/admin/components/AdminRevenuePanel";
import { AdminModerationPanel } from "@/pages/admin/components/AdminModerationPanel";
import { AdminNotificationsPanel } from "@/pages/admin/components/AdminNotificationsPanel";
import { AdminMailTemplatesPanel } from "@/pages/admin/components/AdminMailTemplatesPanel";
import { AdminReportForm } from "@/pages/admin/components/AdminReportExport";
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
  "reports",
  "trendReplay",
  "trends",
  "trendGraph",
];

const AdminTrendGraphPanel = lazy(
  () => import("@/pages/admin/components/AdminTrendGraphPanel"),
);
const descriptions: Record<string, string> = {
  overview: "admin.overview.description",
  users: "admin.accounts.description",
  trendReplay: "admin.trendReplay.description",
  trends: "admin.trends.description",
  trendGraph: "admin.trendGraph.description",
  mailTemplates: "mailTemplate.admin.description",
  reports: "admin.reports.description",
  moderation: "admin.moderation.description",
};

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
            : `admin.navigation.${view}`,
        )}
        description={t(descriptions[view] ?? `admin.unavailable.${view}`)}
        hideBanner
        showGuideButton={false}
        actions={
          view === "overview" && (
            <AdminOverviewActions
              timezone={timezone}
              onTimezoneChange={setTimezone}
            />
          )
        }
        className="max-w-[1600px] space-y-6 p-4 pb-12 md:p-8 [&>div:first-child]:border-0 [&>div:first-child]:pb-0"
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
        ) : view === "reports" ? (
          <section className="bg-card border-border max-w-2xl rounded-xl border p-5 lg:p-6">
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
