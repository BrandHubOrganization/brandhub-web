import { lazy, Suspense } from "react";
import {
  Routes,
  Route,
  Navigate,
  Outlet,
  Link,
  useLocation,
} from "react-router-dom";

// Layout & Security Components
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Layout } from "@/components/layout/Layout";
import { PublicHelpLayout } from "@/components/layout/PublicHelpLayout";
import { PageFallback } from "@/components/layout/PageFallback";
import { WorkspaceScopedRedirect } from "@/routes/WorkspaceScopedRedirect";
import { useAuthStore } from "@/store/authStore";
import { SeoHead } from "@/components/seo/SeoHead";

// Typed lazy loader supporting both named & default exports
function lazyNamed<T extends Record<string, unknown>>(
  importer: () => Promise<T>,
  name?: keyof T,
) {
  return lazy(async () => {
    const mod = await importer();
    const component = name
      ? (mod[name] ?? mod.default)
      : (mod.default ?? Object.values(mod)[0]);
    return {
      default: component as React.ComponentType<Record<string, unknown>>,
    };
  });
}

// ── Auth Pages (Code-split) ──
const LoginPage = lazyNamed(
  () => import("@/pages/auth/LoginPage"),
  "LoginPage",
);
const RegisterPage = lazyNamed(
  () => import("@/pages/auth/RegisterPage"),
  "RegisterPage",
);
const VerifyOtpPage = lazyNamed(
  () => import("@/pages/auth/VerifyOtpPage"),
  "VerifyOtpPage",
);
const TwoFactorVerifyPage = lazyNamed(
  () => import("@/pages/auth/TwoFactorVerifyPage"),
  "TwoFactorVerifyPage",
);
const ForgotPasswordPage = lazyNamed(
  () => import("@/pages/auth/ForgotPasswordPage"),
  "ForgotPasswordPage",
);
const ResetPasswordPage = lazyNamed(
  () => import("@/pages/auth/ResetPasswordPage"),
  "ResetPasswordPage",
);
const ActivateAccountPage = lazyNamed(
  () => import("@/pages/auth/ActivateAccountPage"),
  "ActivateAccountPage",
);
const OAuthCallbackPage = lazyNamed(
  () => import("@/pages/auth/OAuthCallbackPage"),
  "OAuthCallbackPage",
);

// ── Public & Help Pages ──
const LandingPage = lazyNamed(
  () => import("@/pages/dashboard/landing"),
  "LandingPage",
);
const HelpFaqPage = lazyNamed(
  () => import("@/pages/help/FaqPage"),
  "HelpFaqPage",
);
const AdminGuidePage = lazyNamed(
  () => import("@/pages/help/GuidePage"),
  "AdminGuidePage",
);
const PrivacyPolicyPage = lazyNamed(
  () => import("@/pages/legal/PrivacyPolicyPage"),
  "PrivacyPolicyPage",
);
const TermsOfServicePage = lazyNamed(
  () => import("@/pages/legal/TermsOfServicePage"),
  "TermsOfServicePage",
);
const BlogHubPage = lazyNamed(
  () => import("@/pages/blog/BlogHubPage"),
  "BlogHubPage",
);
const BlogPostPage = lazyNamed(
  () => import("@/pages/blog/BlogPostPage"),
  "BlogPostPage",
);
const GuestMediaPackagePage = lazy(() => import("@/pages/media-package/guest"));
const PublicSurveyPage = lazy(() => import("@/pages/public-survey"));

// ── Core Dashboard & Work ──
const DashboardPage = lazyNamed(
  () => import("@/pages/dashboard"),
  "DashboardPage",
);
const PortalPage = lazyNamed(() => import("@/pages/portal"), "PortalPage");
const AnalyticsPage = lazyNamed(
  () => import("@/pages/analytics"),
  "AnalyticsPage",
);
const CalendarPage = lazyNamed(
  () => import("@/pages/calendar"),
  "CalendarPage",
);
const ContentLibraryPage = lazyNamed(
  () => import("@/pages/library"),
  "ContentLibraryPage",
);
const ContentRequestListPage = lazyNamed(
  () => import("@/pages/requests"),
  "ContentRequestListPage",
);
const WorkspaceRequestPage = lazyNamed(
  () => import("@/pages/requests/WorkspaceRequestPage"),
  "WorkspaceRequestPage",
);
const EditorPage = lazyNamed(() => import("@/pages/editor"), "EditorPage");
const PublishPage = lazyNamed(() => import("@/pages/publish"), "PublishPage");
const PostDashboardPage = lazyNamed(
  () => import("@/pages/publish/dashboard"),
  "PostDashboardPage",
);
const PostDetailPage = lazyNamed(
  () => import("@/pages/publish/postDetail"),
  "PostDetailPage",
);
const SocialAccountsPage = lazyNamed(
  () => import("@/pages/social-accounts"),
  "SocialAccountsPage",
);
const ReportsPage = lazyNamed(() => import("@/pages/reports"), "ReportsPage");

// ── Workspace & Chat Pages ──
const WorkspacePage = lazyNamed(
  () => import("@/pages/workspace"),
  "WorkspacePage",
);
const CreateWorkspacePage = lazyNamed(
  () => import("@/pages/workspace/create"),
  "CreateWorkspacePage",
);
const WorkspaceSettingsPage = lazyNamed(
  () => import("@/pages/workspace/detail"),
  "WorkspaceSettingsPage",
);
const WorkspaceDashboardPage = lazyNamed(
  () => import("@/pages/workspace/dashboard"),
  "WorkspaceDashboardPage",
);
const WorkspaceChatPage = lazyNamed(
  () => import("@/pages/chat"),
  "WorkspaceChatPage",
);
const WorkspaceMembersPage = lazyNamed(
  () => import("@/pages/workspace/members"),
  "WorkspaceMembersPage",
);
const TaskListPage = lazyNamed(() => import("@/pages/tasks"), "TaskListPage");
const TaskDetailPage = lazy(() => import("@/pages/tasks/detail"));
const SurveyEditorPage = lazy(() => import("@/pages/tasks/survey-editor"));
const TaskApprovalsPage = lazy(() => import("@/pages/task-approvals"));
const AgencyCreditPage = lazy(() => import("@/pages/credit"));
const CreditPricesPage = lazy(() => import("@/pages/credit/prices"));
const WorkspaceClientsPage = lazyNamed(
  () => import("@/pages/workspace/clients"),
  "WorkspaceClientsPage",
);
const WorkspaceTemplatesPage = lazyNamed(
  () => import("@/pages/workspace/templates"),
  "WorkspaceTemplatesPage",
);
const WorkspaceClientProfilePage = lazyNamed(
  () => import("@/pages/workspace/client-profile"),
  "WorkspaceClientProfilePage",
);
const MediaPackagePage = lazy(() => import("@/pages/media-package"));
const CampaignPage = lazy(() => import("@/pages/campaign/page"));
const CampaignPartnersPage = lazy(
  () => import("@/pages/campaign-partners/page"),
);
const MailTemplatesPage = lazy(() => import("@/pages/mail-templates/page"));
const MailBatchesPage = lazy(() => import("@/pages/mail-templates/batches"));
const MailSuppressionsPage = lazy(
  () => import("@/pages/mail-templates/suppressions"),
);
const MailUnsubscribePage = lazy(
  () => import("@/pages/mail-templates/UnsubscribePage"),
);

// ── Agency Pages ──
const AgencyPage = lazyNamed(() => import("@/pages/agency"), "AgencyPage");
const AgencyDetailPage = lazyNamed(
  () => import("@/pages/agency/detail"),
  "AgencyDetailPage",
);
const CreateAgencyPage = lazyNamed(
  () => import("@/pages/agency/create"),
  "CreateAgencyPage",
);
const AgencyMembersPage = lazyNamed(
  () => import("@/pages/agency/members"),
  "AgencyMembersPage",
);
const AgencyStatsPage = lazyNamed(
  () => import("@/pages/agency/stats"),
  "AgencyStatsPage",
);
const AgencyMailTemplatesPage = lazyNamed(
  () => import("@/pages/agency/mailTemplates"),
  "AgencyMailTemplatesPage",
);
const AgencyMailSuppressionsPage = lazyNamed(
  () => import("@/pages/agency/mailSuppressions"),
  "AgencyMailSuppressionsPage",
);
const AgencyInvitationsPage = lazyNamed(
  () => import("@/pages/agency/invitations"),
  "AgencyInvitationsPage",
);
const ClientInvitationsPage = lazyNamed(
  () => import("@/pages/client/invitations"),
  "ClientInvitationsPage",
);
const AcceptInvitationPage = lazyNamed(
  () => import("@/pages/agency/accept"),
  "AcceptInvitationPage",
);
const AgencyMediaPackagePage = lazy(
  () => import("@/pages/media-package/agency"),
);
const DirectoryPage = lazy(() => import("@/pages/collaborators/page"));

// ── Client Management ──
const ClientListPage = lazyNamed(
  () => import("@/pages/client/list"),
  "ClientListPage",
);
const ClientCreatePage = lazyNamed(
  () => import("@/pages/client/create"),
  "ClientCreatePage",
);
const ClientDetailPage = lazyNamed(
  () => import("@/pages/client/detail"),
  "ClientDetailPage",
);
const ClientProfileListPage = lazyNamed(
  () => import("@/pages/client-profiles/list"),
  "ClientProfileListPage",
);

// ── Subscription & Billing ──
const SubscriptionPlansPage = lazyNamed(
  () => import("@/pages/subscription/plans"),
  "SubscriptionPlansPage",
);
const SubscriptionCheckoutPage = lazyNamed(
  () => import("@/pages/subscription/checkout"),
  "SubscriptionCheckoutPage",
);
const SubscriptionInvoicesPage = lazyNamed(
  () => import("@/pages/subscription/invoices"),
  "SubscriptionInvoicesPage",
);

// ── AI Studio ──
const AmbassadorsPage = lazyNamed(
  () => import("@/pages/ai-studio/ambassadors"),
  "AmbassadorsPage",
);
const KnowledgeBasePage = lazyNamed(
  () => import("@/pages/ai-studio/knowledge-base"),
  "KnowledgeBasePage",
);
const TrendsPage = lazyNamed(
  () => import("@/pages/ai-studio/trends"),
  "TrendsPage",
);
const WorkspaceTrendsPage = lazyNamed(
  () => import("@/pages/workspace-trends"),
  "WorkspaceTrendsPage",
);
const VideoStudioPage = lazyNamed(
  () => import("@/pages/ai-studio/video"),
  "VideoStudioPage",
);

// ── Admin Pages ──
const AdminInvoicesPage = lazy(() => import("@/pages/admin/InvoicesPage"));
const AdminPage = lazyNamed(() => import("@/pages/admin"), "AdminPage");
const SystemHealthPage = lazy(() => import("@/pages/admin/system-health"));
const WorkspaceTemplateLibraryPage = lazy(
  () => import("@/pages/admin/WorkspaceTemplateLibrary"),
);

// ── Settings & Profile ──
const SettingsLayout = lazyNamed(
  () => import("@/pages/settings/SettingsLayout"),
  "SettingsLayout",
);
const ProfilePage = lazyNamed(() => import("@/pages/profile"), "ProfilePage");
const SecurityPage = lazyNamed(
  () => import("@/pages/security"),
  "SecurityPage",
);
const ConnectionsPage = lazyNamed(
  () => import("@/pages/connections"),
  "ConnectionsPage",
);
const NotificationSettingsPage = lazyNamed(
  () => import("@/pages/notification-settings"),
  "NotificationSettingsPage",
);

// ── Dev / Examples ──
const ExamplesPage = lazy(() => import("@/components/examples"));

function WorkspaceIndexRedirect() {
  return <Navigate to="dashboard" replace />;
}

// The content-writing page was merged into the post editor's Docs mode.
function ContentWritingRedirect() {
  const { search } = useLocation();
  return <Navigate to={`../editor${search}`} relative="path" replace />;
}

export function HelpGuideRedirect() {
  const systemRole = useAuthStore((s) => s.systemRole);
  if (systemRole === "ADMIN") {
    return <Navigate to="/admin/guide" replace />;
  }
  return <Navigate to="/help/faq" replace />;
}

function AdaptiveHelpLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <Layout /> : <PublicHelpLayout />;
}

function NoIndexRouteLayout() {
  const location = useLocation();
  return (
    <>
      <SeoHead canonicalPath={location.pathname} noindex />
      <Outlet />
    </>
  );
}

function NotFoundRoute() {
  const location = useLocation();
  return (
    <main className="bg-background text-foreground flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <SeoHead
        title="404 — Không tìm thấy trang | BrandHub"
        description="Trang bạn tìm kiếm không tồn tại hoặc đã được di chuyển trên BrandHub."
        canonicalPath={location.pathname}
        noindex
      />
      <p className="text-brand-orange text-sm font-bold tracking-widest uppercase">
        404 Not Found
      </p>
      <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
        Không tìm thấy trang yêu cầu
      </h1>
      <p className="text-muted-foreground mt-2 max-w-md text-sm">
        Đường dẫn bạn truy cập không tồn tại hoặc đã hết hạn. Vui lòng quay lại
        trang chủ hoặc Trung tâm trợ giúp.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Link
          to="/"
          className="bg-brand-orange hover:bg-brand-orange/90 rounded-lg px-4 py-2 text-xs font-semibold text-white transition-colors"
        >
          Về trang chủ BrandHub
        </Link>
        <Link
          to="/help/faq"
          className="border-border hover:bg-muted rounded-lg border px-4 py-2 text-xs font-semibold transition-colors"
        >
          Trung tâm trợ giúp (FAQ)
        </Link>
      </div>
    </main>
  );
}

export function AppRoutes() {
  return (
    <Suspense fallback={<PageFallback fullScreen />}>
      <Routes>
        {/* Indexable Public Landing Route */}
        <Route path="/" element={<LandingPage />} />

        {/* Non-indexable Auth, Transactional & Tokenized Public Routes */}
        <Route element={<NoIndexRouteLayout />}>
          <Route
            path="/packages/share/:token"
            element={<GuestMediaPackagePage />}
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-otp" element={<VerifyOtpPage />} />
          <Route path="/2fa-verify" element={<TwoFactorVerifyPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/activate-account" element={<ActivateAccountPage />} />
          <Route path="/oauth-callback" element={<OAuthCallbackPage />} />
          <Route path="/mail/unsubscribe" element={<MailUnsubscribePage />} />
          <Route path="/public/surveys/:token" element={<PublicSurveyPage />} />
        </Route>

        {/* Public Help & Legal Routes — accessible without authentication */}
        <Route element={<PublicHelpLayout />}>
          <Route path="/help/guide" element={<HelpGuideRedirect />} />
          <Route path="/guide" element={<HelpGuideRedirect />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsOfServicePage />} />
        </Route>

        {/* FAQ & Blog Routes — public via PublicHelpLayout for guests/search engines, full sidebar Layout for authenticated users */}
        <Route element={<AdaptiveHelpLayout />}>
          <Route path="/help/faq" element={<HelpFaqPage />} />
          <Route path="/faq" element={<Navigate to="/help/faq" replace />} />
          <Route path="/blog" element={<BlogHubPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
        </Route>

        {/* Authenticated Routes — require login */}
        <Route element={<AuthGuard />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/clients" element={<ClientListPage />} />
            <Route path="/clients/create" element={<ClientCreatePage />} />
            <Route path="/clients/:id" element={<ClientDetailPage />} />
            <Route
              path="/change-password"
              element={<Navigate to="/settings/security" replace />}
            />
            <Route path="/workspace" element={<WorkspacePage />} />
            <Route
              path="/workspaces"
              element={<Navigate to="/workspace" replace />}
            />
            <Route
              path="/workspaces/create"
              element={<CreateWorkspacePage />}
            />
            <Route
              path="/workspaces/:id"
              element={<WorkspaceIndexRedirect />}
            />
            <Route
              path="/workspaces/:id/social-accounts"
              element={<SocialAccountsPage />}
            />
            <Route
              path="/workspaces/:id/dashboard"
              element={<WorkspaceDashboardPage />}
            />
            <Route
              path="/workspaces/:id/chat"
              element={<WorkspaceChatPage />}
            />
            <Route
              path="/workspaces/:id/settings"
              element={<WorkspaceSettingsPage />}
            />
            <Route
              path="/workspaces/:id/members"
              element={<WorkspaceMembersPage />}
            />
            <Route
              path="/workspaces/:id/clients"
              element={<WorkspaceClientsPage />}
            />
            <Route
              path="/workspaces/:id/requests"
              element={<WorkspaceRequestPage />}
            />
            <Route path="/workspaces/:id/tasks" element={<TaskListPage />} />
            <Route
              path="/workspaces/:id/trends"
              element={<WorkspaceTrendsPage />}
            />
            <Route
              path="/workspaces/:id/task-approvals"
              element={<TaskApprovalsPage />}
            />
            <Route
              path="/workspaces/:id/tasks/:taskId/detail"
              element={<TaskDetailPage />}
            />
            <Route
              path="/workspaces/:id/tasks/:taskId/survey"
              element={<SurveyEditorPage />}
            />
            <Route path="/workspaces/:id/editor" element={<EditorPage />} />
            <Route
              path="/editor"
              element={<WorkspaceScopedRedirect destination="editor" />}
            />
            <Route
              path="/workspaces/:id/content-writing"
              element={<ContentWritingRedirect />}
            />
            <Route
              path="/content-writing"
              element={<WorkspaceScopedRedirect destination="editor" />}
            />
            <Route
              path="/workspaces/:id/templates"
              element={
                <Navigate to="../library?tab=templates" relative="path" replace />
              }
            />
            <Route
              path="/workspaces/:id/hashtags"
              element={
                <Navigate to="../library?tab=hashtags" relative="path" replace />
              }
            />
            <Route
              path="/workspaces/:id/hashtag-groups"
              element={
                <Navigate to="../library?tab=hashtags" relative="path" replace />
              }
            />
            <Route path="/workspaces/:id/calendar" element={<CalendarPage />} />
            <Route
              path="/workspaces/:id/library"
              element={<ContentLibraryPage />}
            />
            <Route path="/workspaces/:id/publish" element={<PublishPage />} />
            <Route
              path="/workspaces/:id/posts/dashboard"
              element={<PostDashboardPage />}
            />
            <Route
              path="/workspaces/:id/publish/dashboard"
              element={<PostDashboardPage />}
            />
            <Route
              path="/workspaces/:id/posts/:postId"
              element={<PostDetailPage />}
            />
            <Route path="/workspaces/:id/portal" element={<PortalPage />} />
            <Route
              path="/workspaces/:id/campaigns"
              element={<CampaignPage />}
            />
            <Route
              path="/workspaces/:id/campaign-partners"
              element={<CampaignPartnersPage />}
            />
            <Route
              path="/workspaces/:id/mail-templates"
              element={<MailTemplatesPage />}
            />
            <Route
              path="/workspaces/:id/mail-templates/batches"
              element={<MailBatchesPage />}
            />
            <Route
              path="/workspaces/:id/mail-templates/suppressions"
              element={<MailSuppressionsPage />}
            />
            <Route
              path="/mail-templates"
              element={<WorkspaceScopedRedirect destination="mail-templates" />}
            />
            <Route
              path="/workspaces/:id/media-package"
              element={<MediaPackagePage />}
            />
            <Route
              path="/media-package"
              element={<WorkspaceScopedRedirect destination="media-package" />}
            />
            <Route
              path="/workspaces/:id/client-profile"
              element={<WorkspaceClientProfilePage />}
            />
            <Route
              path="/workspaces/templates"
              element={<WorkspaceTemplatesPage />}
            />
            <Route
              path="/invitations/accept"
              element={<AcceptInvitationPage />}
            />
            <Route path="/agency" element={<AgencyPage />} />
            <Route path="/agency/create" element={<CreateAgencyPage />} />
            <Route path="/agency/:id" element={<AgencyDetailPage />} />
            <Route
              path="/agency/:id/collaborators"
              element={<DirectoryPage />}
            />
            <Route
              path="/agency/:id/media-packages"
              element={<AgencyMediaPackagePage />}
            />
            <Route
              path="/agency/invitations"
              element={<AgencyInvitationsPage />}
            />
            <Route
              path="/client/invitations"
              element={<ClientInvitationsPage />}
            />
            <Route path="/agency/:id/members" element={<AgencyMembersPage />} />
            <Route
              path="/agency/:id/mail-templates"
              element={<AgencyMailTemplatesPage />}
            />
            <Route
              path="/agency/:id/mail-templates/suppressions"
              element={<AgencyMailSuppressionsPage />}
            />
            <Route path="/agency/:id/credit" element={<AgencyCreditPage />} />
            <Route path="/agency/:id/stats" element={<AgencyStatsPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/invoices" element={<AdminInvoicesPage />} />
            <Route path="/admin/system-health" element={<SystemHealthPage />} />
            <Route path="/admin/credit-prices" element={<CreditPricesPage />} />
            <Route
              path="/admin/workspace-templates"
              element={<WorkspaceTemplateLibraryPage />}
            />
            <Route path="/admin/guide" element={<AdminGuidePage />} />
            <Route path="/requests" element={<ContentRequestListPage />} />
            <Route
              path="/templates"
              element={
                <WorkspaceScopedRedirect destination="library?tab=templates" />
              }
            />
            <Route
              path="/hashtags"
              element={
                <WorkspaceScopedRedirect destination="library?tab=hashtags" />
              }
            />
            <Route
              path="/hashtag-groups"
              element={
                <WorkspaceScopedRedirect destination="library?tab=hashtags" />
              }
            />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route
              path="/library"
              element={
                <WorkspaceScopedRedirect
                  destination="library"
                  preserveSearch
                />
              }
            />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/social-accounts" element={<SocialAccountsPage />} />
            <Route
              path="/subscription"
              element={<Navigate to="/subscription/plans" replace />}
            />
            <Route
              path="/subscription/plans"
              element={<SubscriptionPlansPage />}
            />
            <Route
              path="/subscription/checkout"
              element={<SubscriptionCheckoutPage />}
            />
            <Route
              path="/subscription/invoices"
              element={<SubscriptionInvoicesPage />}
            />
            <Route
              path="/ai-studio/ambassadors"
              element={<AmbassadorsPage />}
            />
            <Route
              path="/ai-studio/knowledge-base"
              element={<KnowledgeBasePage />}
            />
            <Route path="/ai-studio/trends" element={<TrendsPage />} />
            <Route path="/reports" element={<ReportsPage />} />

            {/* Cài đặt — mỗi mục 1 route riêng, sub-nav nằm trong Sidebar chính */}
            <Route path="/settings" element={<SettingsLayout />}>
              <Route index element={<Navigate to="profile" replace />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="security" element={<SecurityPage />} />
              <Route path="connections" element={<ConnectionsPage />} />
              <Route
                path="change-password"
                element={<Navigate to="/settings/security" replace />}
              />
              <Route
                path="notifications"
                element={<NotificationSettingsPage />}
              />
            </Route>

            {/* Legacy paths — giữ để không gãy link/bookmark cũ */}
            <Route
              path="/notification-settings"
              element={<Navigate to="/settings/notifications" replace />}
            />
            <Route
              path="/security"
              element={<Navigate to="/settings/security" replace />}
            />
            <Route
              path="/profile"
              element={<Navigate to="/settings/profile" replace />}
            />
            <Route
              path="/client-profiles"
              element={<ClientProfileListPage />}
            />
            <Route path="/ai-studio/video" element={<VideoStudioPage />} />
            <Route path="/components/examples" element={<ExamplesPage />} />
          </Route>
        </Route>

        {/* Catch-all 404 Not Found Route (prevents SPA Soft 404s in Google Search Console) */}
        <Route path="*" element={<NotFoundRoute />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
