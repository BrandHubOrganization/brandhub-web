import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Layout & Security Components
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Layout } from "@/components/layout/Layout";
import { PublicHelpLayout } from "@/components/layout/PublicHelpLayout";
import { PageFallback } from "@/components/layout/PageFallback";
import { WorkspaceScopedRedirect } from "@/routes/WorkspaceScopedRedirect";

// Typed lazy loader supporting both named & default exports
function lazyNamed<T extends Record<string, any>>(
  importer: () => Promise<T>,
  name?: keyof T,
) {
  return lazy(async () => {
    const mod = await importer();
    const component = name
      ? (mod[name] ?? mod.default)
      : (mod.default ?? Object.values(mod)[0]);
    return { default: component };
  });
}

// ── Auth Pages (Code-split) ──
const LoginPage = lazyNamed(() => import("@/pages/auth/LoginPage"), "LoginPage");
const RegisterPage = lazyNamed(() => import("@/pages/auth/RegisterPage"), "RegisterPage");
const VerifyOtpPage = lazyNamed(() => import("@/pages/auth/VerifyOtpPage"), "VerifyOtpPage");
const TwoFactorVerifyPage = lazyNamed(() => import("@/pages/auth/TwoFactorVerifyPage"), "TwoFactorVerifyPage");
const ForgotPasswordPage = lazyNamed(() => import("@/pages/auth/ForgotPasswordPage"), "ForgotPasswordPage");
const ResetPasswordPage = lazyNamed(() => import("@/pages/auth/ResetPasswordPage"), "ResetPasswordPage");
const OAuthCallbackPage = lazyNamed(() => import("@/pages/auth/OAuthCallbackPage"), "OAuthCallbackPage");

// ── Public & Help Pages ──
const LandingPage = lazyNamed(() => import("@/pages/dashboard/landing"), "LandingPage");
const HelpFaqPage = lazyNamed(() => import("@/pages/help/FaqPage"), "HelpFaqPage");
const AdminGuidePage = lazyNamed(() => import("@/pages/help/GuidePage"), "AdminGuidePage");

// ── Core Dashboard & Work ──
const DashboardPage = lazyNamed(() => import("@/pages/dashboard"), "DashboardPage");
const PortalPage = lazyNamed(() => import("@/pages/portal"), "PortalPage");
const AnalyticsPage = lazyNamed(() => import("@/pages/analytics"), "AnalyticsPage");
const CalendarPage = lazyNamed(() => import("@/pages/calendar"), "CalendarPage");
const ContentLibraryPage = lazyNamed(() => import("@/pages/library"), "ContentLibraryPage");
const ContentRequestListPage = lazyNamed(() => import("@/pages/requests"), "ContentRequestListPage");
const EditorPage = lazyNamed(() => import("@/pages/editor"), "EditorPage");
const ContentWritingPage = lazyNamed(() => import("@/pages/content-writing"), "ContentWritingPage");
const PublishPage = lazyNamed(() => import("@/pages/publish"), "PublishPage");
const SocialAccountsPage = lazyNamed(() => import("@/pages/social-accounts"), "SocialAccountsPage");
const TemplateBrowserPage = lazyNamed(() => import("@/pages/templates"), "TemplateBrowserPage");
const HashtagGroupsPage = lazyNamed(() => import("@/pages/hashtag-groups"), "HashtagGroupsPage");
const ReportsPage = lazyNamed(() => import("@/pages/reports"), "ReportsPage");

// ── Workspace Pages ──
const WorkspacePage = lazyNamed(() => import("@/pages/workspace"), "WorkspacePage");
const CreateWorkspacePage = lazyNamed(() => import("@/pages/workspace/create"), "CreateWorkspacePage");
const WorkspaceSettingsPage = lazyNamed(() => import("@/pages/workspace/detail"), "WorkspaceSettingsPage");
const WorkspaceDashboardPage = lazyNamed(() => import("@/pages/workspace/dashboard"), "WorkspaceDashboardPage");
const WorkspaceMembersPage = lazyNamed(() => import("@/pages/workspace/members"), "WorkspaceMembersPage");
const WorkspaceClientsPage = lazyNamed(() => import("@/pages/workspace/clients"), "WorkspaceClientsPage");
const WorkspaceTemplatesPage = lazyNamed(() => import("@/pages/workspace/templates"), "WorkspaceTemplatesPage");
const InvitationsPage = lazyNamed(() => import("@/pages/workspace/invitations"), "InvitationsPage");
const WorkspaceClientProfilePage = lazyNamed(() => import("@/pages/workspace/client-profile"), "WorkspaceClientProfilePage");

// ── Agency Pages ──
const AgencyPage = lazyNamed(() => import("@/pages/agency"), "AgencyPage");
const AgencyDetailPage = lazyNamed(() => import("@/pages/agency/detail"), "AgencyDetailPage");
const CreateAgencyPage = lazyNamed(() => import("@/pages/agency/create"), "CreateAgencyPage");
const AgencyMembersPage = lazyNamed(() => import("@/pages/agency/members"), "AgencyMembersPage");
const AgencyStatsPage = lazyNamed(() => import("@/pages/agency/stats"), "AgencyStatsPage");
const AgencyRolesPage = lazyNamed(() => import("@/pages/agency/roles"), "AgencyRolesPage");
const AgencyInvitationsPage = lazyNamed(() => import("@/pages/agency/invitations"), "AgencyInvitationsPage");
const ClientInvitationsPage = lazyNamed(() => import("@/pages/client/invitations"), "ClientInvitationsPage");
const AcceptInvitationPage = lazyNamed(() => import("@/pages/agency/accept"), "AcceptInvitationPage");

// ── Client Management ──
const ClientListPage = lazyNamed(() => import("@/pages/client/list"), "ClientListPage");
const ClientCreatePage = lazyNamed(() => import("@/pages/client/create"), "ClientCreatePage");
const ClientDetailPage = lazyNamed(() => import("@/pages/client/detail"), "ClientDetailPage");
const ClientProfileListPage = lazyNamed(() => import("@/pages/client-profiles/list"), "ClientProfileListPage");

// ── Subscription & Billing ──
const SubscriptionPlansPage = lazyNamed(() => import("@/pages/subscription/plans"), "SubscriptionPlansPage");
const SubscriptionCheckoutPage = lazyNamed(() => import("@/pages/subscription/checkout"), "SubscriptionCheckoutPage");
const SubscriptionInvoicesPage = lazyNamed(() => import("@/pages/subscription/invoices"), "SubscriptionInvoicesPage");

// ── AI Studio ──
const AmbassadorsPage = lazyNamed(() => import("@/pages/ai-studio/ambassadors"), "AmbassadorsPage");
const KnowledgeBasePage = lazyNamed(() => import("@/pages/ai-studio/knowledge-base"), "KnowledgeBasePage");
const TrendsPage = lazyNamed(() => import("@/pages/ai-studio/trends"), "TrendsPage");
const VideoStudioPage = lazyNamed(() => import("@/pages/ai-studio/video"), "VideoStudioPage");

// ── Admin Pages ──
const AdminPage = lazyNamed(() => import("@/pages/admin"), "AdminPage");
const SystemHealthPage = lazy(() => import("@/pages/admin/system-health"));
const WorkspaceTemplateLibraryPage = lazy(() => import("@/pages/admin/WorkspaceTemplateLibrary"));

// ── Settings & Profile ──
const SettingsLayout = lazyNamed(() => import("@/pages/settings/SettingsLayout"), "SettingsLayout");
const ProfilePage = lazyNamed(() => import("@/pages/profile"), "ProfilePage");
const SecurityPage = lazyNamed(() => import("@/pages/security"), "SecurityPage");
const ConnectionsPage = lazyNamed(() => import("@/pages/connections"), "ConnectionsPage");
const NotificationSettingsPage = lazyNamed(() => import("@/pages/notification-settings"), "NotificationSettingsPage");

// ── Dev / Examples ──
const ExamplesPage = lazy(() => import("@/components/examples"));

export function AppRoutes() {
  return (
    <Suspense fallback={<PageFallback fullScreen />}>
      <Routes>
        {/* Public Routes — accessible without authentication */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
        <Route path="/2fa-verify" element={<TwoFactorVerifyPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/oauth-callback" element={<OAuthCallbackPage />} />

        {/* Public Help & FAQ Routes — accessible without authentication */}
        <Route element={<PublicHelpLayout />}>
          <Route path="/help/faq" element={<HelpFaqPage />} />
          <Route path="/help/guide" element={<AdminGuidePage />} />
          <Route path="/faq" element={<Navigate to="/help/faq" replace />} />
          <Route path="/guide" element={<Navigate to="/help/guide" replace />} />
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
            <Route path="/workspaces/create" element={<CreateWorkspacePage />} />
            <Route
              path="/workspaces/:id"
              element={<Navigate to="dashboard" replace />}
            />
            <Route
              path="/workspaces/:id/dashboard"
              element={<WorkspaceDashboardPage />}
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
              element={<ContentRequestListPage />}
            />
            <Route path="/workspaces/:id/editor" element={<EditorPage />} />
            <Route
              path="/editor"
              element={<WorkspaceScopedRedirect destination="editor" />}
            />
            <Route
              path="/workspaces/:id/content-writing"
              element={<ContentWritingPage />}
            />
            <Route
              path="/content-writing"
              element={<WorkspaceScopedRedirect destination="content-writing" />}
            />
            <Route
              path="/workspaces/:id/templates"
              element={<TemplateBrowserPage />}
            />
            <Route
              path="/workspaces/:id/hashtag-groups"
              element={<HashtagGroupsPage />}
            />
            <Route path="/workspaces/:id/calendar" element={<CalendarPage />} />
            <Route
              path="/workspaces/:id/library"
              element={<ContentLibraryPage />}
            />
            <Route path="/workspaces/:id/publish" element={<PublishPage />} />
            <Route path="/workspaces/:id/portal" element={<PortalPage />} />
            <Route
              path="/workspaces/:id/client-profile"
              element={<WorkspaceClientProfilePage />}
            />
            <Route
              path="/workspaces/templates"
              element={<WorkspaceTemplatesPage />}
            />
            <Route path="/invitations" element={<InvitationsPage />} />
            <Route
              path="/invitations/accept"
              element={<AcceptInvitationPage />}
            />
            <Route path="/agency" element={<AgencyPage />} />
            <Route path="/agency/create" element={<CreateAgencyPage />} />
            <Route path="/agency/:id" element={<AgencyDetailPage />} />
            <Route
              path="/agency/invitations"
              element={<AgencyInvitationsPage />}
            />
            <Route
              path="/client/invitations"
              element={<ClientInvitationsPage />}
            />
            <Route path="/agency/:id/members" element={<AgencyMembersPage />} />
            <Route path="/agency/:id/roles" element={<AgencyRolesPage />} />
            <Route path="/agency/:id/stats" element={<AgencyStatsPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route
              path="/admin/system-health"
              element={<SystemHealthPage />}
            />
            <Route
              path="/admin/workspace-templates"
              element={<WorkspaceTemplateLibraryPage />}
            />
            <Route path="/requests" element={<ContentRequestListPage />} />
            <Route path="/editor" element={<EditorPage />} />
            <Route path="/content-writing" element={<ContentWritingPage />} />
            <Route path="/templates" element={<TemplateBrowserPage />} />
            <Route path="/hashtag-groups" element={<HashtagGroupsPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/library" element={<ContentLibraryPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/social-accounts" element={<SocialAccountsPage />} />
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
            <Route path="/ai-studio/ambassadors" element={<AmbassadorsPage />} />
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
            <Route path="/client-profiles" element={<ClientProfileListPage />} />
            <Route path="/ai-studio/video" element={<VideoStudioPage />} />
            <Route path="/components/examples" element={<ExamplesPage />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
