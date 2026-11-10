import { lazy, Suspense, useEffect, useState } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { AdminAccountsPanel } from "@/pages/admin/components/AdminAccountsPanel";
import { AdminCrawlConfigPanel } from "@/pages/admin/components/AdminCrawlConfigPanel";
import {
  AdminEmailHubPanel,
  AdminEmailHubTabs,
} from "@/pages/admin/components/AdminEmailHubPanel";
import { AdminInvoicesPanel } from "@/pages/admin/components/AdminInvoicesPanel";
import { AdminMailSuppressionsPanel } from "@/pages/admin/components/AdminMailSuppressionsPanel";
import { AdminModerationPanel } from "@/pages/admin/components/AdminModerationPanel";
import {
  AdminOverviewActions,
  AdminOverviewPanel,
} from "@/pages/admin/components/AdminOverviewPanel";
import { AdminRevenuePanel } from "@/pages/admin/components/AdminRevenuePanel";
import { AdminTrendPanel } from "@/pages/admin/components/AdminTrendPanel";
import { AdminTrendReplayPanel } from "@/pages/admin/components/AdminTrendReplayPanel";
import type { EmailHubTab } from "@/pages/admin/hooks/useAdminEmailHub";

const views = [
  "overview",
  "users",
  "moderation",
  "revenue",
  "invoices",
  "email",
  "mailTemplates",
  "mailBatches",
  "mailSuppressions",
  "crawl",
  "trendReplay",
  "trendPipeline",
  "trends",
  "trendGraph",
];

const AI_VIEWS = [
  "trends",
  "crawl",
  "trendPipeline",
  "trendGraph",
  "trendReplay",
];

const EMAIL_HUB_VIEWS = ["email", "mailTemplates", "mailBatches"];

const AdminTrendGraphPanel = lazy(
  () => import("@/pages/admin/components/AdminTrendGraphPanel"),
);

const descriptions: Record<string, string> = {
  overview: "admin.overview.description",
  users: "admin.accounts.description",
  invoices: "subscription.invoices.adminDescription",
  crawl: "admin.crawl.description",
  trendReplay: "admin.trendReplay.description",
  trendPipeline: "admin.crawl.description",
  trends: "admin.trends.description",
  trendGraph: "admin.trendGraph.description",
  email: "admin.emailHub.subtitle",
  mailTemplates: "mailTemplate.admin.description",
  mailBatches: "mailTemplate.admin.batchesDescription",
  mailSuppressions: "mailTemplate.admin.suppressionsDescription",
  moderation: "admin.moderation.description",
};

const aiTrendNavItems = [
  { key: "trends", icon: TrendingUp, labelKey: "admin.navigation.trends" },
  { key: "crawl", icon: Radar, labelKey: "admin.navigation.crawl" },
  { key: "trendGraph", icon: Network, labelKey: "admin.navigation.trendGraph" },
  {
    key: "trendReplay",
    icon: Activity,
    labelKey: "admin.navigation.trendReplay",
  },
] as const;

export function AdminAiNavActions({ currentView }: { currentView: string }) {
  const { t } = useTranslation();
  const normalizedView =
    currentView === "trendPipeline" ? "crawl" : currentView;
  return (
    <nav
      aria-label={t("admin.navigation.ai")}
      className="flex flex-wrap items-center gap-1.5 sm:gap-2"
    >
      {aiTrendNavItems.map(({ key, icon: Icon, labelKey }) => {
        const isActive = normalizedView === key;
        return (
          <Link
            key={key}
            to={`/admin?view=${key}`}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors",
              isActive
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

function resolveView(requested: string): string {
  if (requested === "reports") return "overview";
  return views.includes(requested) ? requested : "overview";
}

function resolveEmailHubTab(view: string): EmailHubTab {
  if (view === "mailTemplates") return "templates";
  if (view === "mailBatches") return "history";
  return "compose";
}

function resolveTitleKey(view: string): string {
  if (view === "overview") return "admin.overview.title";
  if (view === "trendPipeline") return "admin.navigation.crawl";
  if (EMAIL_HUB_VIEWS.includes(view)) return "admin.emailHub.title";
  return `admin.navigation.${view}`;
}

interface AdminRenderOptions {
  view: string;
  timezone: string;
  onTimezoneChange: (timezone: string) => void;
  emailTab: EmailHubTab;
  onEmailTabChange: (tab: EmailHubTab) => void;
  loadingLabel: string;
}

function renderAdminContent(options: AdminRenderOptions) {
  const { view, timezone, emailTab, onEmailTabChange, loadingLabel } = options;
  if (view === "overview") return <AdminOverviewPanel timezone={timezone} />;
  if (view === "users") return <AdminAccountsPanel />;
  if (view === "moderation") return <AdminModerationPanel />;
  if (view === "revenue") return <AdminRevenuePanel />;
  if (view === "invoices") return <AdminInvoicesPanel />;
  if (EMAIL_HUB_VIEWS.includes(view)) {
    return (
      <AdminEmailHubPanel initialTab={resolveEmailHubTab(view)} activeTab={emailTab} onTabChange={onEmailTabChange} />
    );
  }
  if (view === "mailSuppressions") return <AdminMailSuppressionsPanel />;
  if (view === "crawl" || view === "trendPipeline") return <AdminCrawlConfigPanel />;
  if (view === "trendReplay") return <AdminTrendReplayPanel />;
  if (view === "trends") return <AdminTrendPanel />;
  if (view === "trendGraph") {
    return (
      <Suspense fallback={<Skeleton className="h-96 w-full" aria-label={loadingLabel} />}>
        <AdminTrendGraphPanel />
      </Suspense>
    );
  }
  return null;
}

function renderAdminHeaderActions(options: AdminRenderOptions) {
  const { view, timezone, onTimezoneChange, emailTab, onEmailTabChange } =
    options;
  if (view === "overview") {
    return (
      <AdminOverviewActions
        timezone={timezone}
        onTimezoneChange={onTimezoneChange}
      />
    );
  }
  if (AI_VIEWS.includes(view)) {
    return <AdminAiNavActions currentView={view} />;
  }
  if (EMAIL_HUB_VIEWS.includes(view)) {
    return (
      <AdminEmailHubTabs activeTab={emailTab} onTabChange={onEmailTabChange} />
    );
  }
  return undefined;
}

export function AdminPage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const view = resolveView(params.get("view") || "overview");
  const [client] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: false } } }),
  );
  const [timezone, setTimezone] = useState("Asia/Ho_Chi_Minh");
  const [emailTab, setEmailTab] = useState<EmailHubTab>(() =>
    resolveEmailHubTab(view),
  );

  useEffect(() => {
    setEmailTab(resolveEmailHubTab(view));
  }, [view]);

  const renderOptions: AdminRenderOptions = {
    view,
    timezone,
    onTimezoneChange: setTimezone,
    emailTab,
    onEmailTabChange: setEmailTab,
    loadingLabel: t("admin.loading"),
  };
  const content = renderAdminContent(renderOptions);
  const headerActions = renderAdminHeaderActions(renderOptions);

  return (
    <QueryClientProvider client={client}>
      <PageWrapper
        title={t(resolveTitleKey(view))}
        description={t(descriptions[view] ?? `admin.unavailable.${view}`)}
        guideUrl="/help/guide#admin"
        actions={headerActions}
        className="w-full space-y-6 p-4 pb-12 md:p-8"
      >
        {content ?? (
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
