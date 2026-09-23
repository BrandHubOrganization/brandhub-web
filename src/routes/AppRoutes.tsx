import { Routes, Route, Navigate } from "react-router-dom";

// Import Layout & Security Components
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Layout } from "@/components/layout/Layout";

// Import Pages
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { VerifyOtpPage } from "@/pages/auth/VerifyOtpPage";
import { TwoFactorVerifyPage } from "@/pages/auth/TwoFactorVerifyPage";
import { ForgotPasswordPage } from "@/pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "@/pages/auth/ResetPasswordPage";
import { OAuthCallbackPage } from "@/pages/auth/OAuthCallbackPage";
import { LandingPage } from "@/pages/dashboard/landing";
import { DashboardPage } from "@/pages/dashboard";
import { WorkspacePage } from "@/pages/workspace";
import { CreateWorkspacePage } from "@/pages/workspace/create";
import { WorkspaceSettingsPage } from "@/pages/workspace/detail";
import { WorkspaceMembersPage } from "@/pages/workspace/members";
import { InvitationsPage } from "@/pages/workspace/invitations";
import { AgencyPage } from "@/pages/agency";
import { AgencyDetailPage } from "@/pages/agency/detail";
import { CreateAgencyPage } from "@/pages/agency/create";
import { AgencyMembersPage } from "@/pages/agency/members";
import { AgencyStatsPage } from "@/pages/agency/stats";
import { AgencyInvitationsPage } from "@/pages/agency/invitations";
import { AcceptInvitationPage } from "@/pages/agency/accept";
import { PortalPage } from "@/pages/portal";
import { AdminPage } from "@/pages/admin";
import { EditorPage } from "@/pages/editor";
import { CalendarPage } from "@/pages/calendar";
import { AnalyticsPage } from "@/pages/analytics";
import { SocialAccountsPage } from "@/pages/social-accounts";
import { PublishPage } from "@/pages/publish";
import { SubscriptionPlansPage } from "@/pages/subscription/plans";
import { SubscriptionCheckoutPage } from "@/pages/subscription/checkout";
import { SubscriptionInvoicesPage } from "@/pages/subscription/invoices";
import { ClientDetailPage } from "@/pages/client/detail";
import { ClientListPage } from "@/pages/client/list";
import { ClientCreatePage } from "@/pages/client/create";
import { ContentLibraryPage } from "@/pages/library";
import { ContentRequestListPage } from "@/pages/requests";
import { TemplateBrowserPage } from "@/pages/templates";
import { HashtagGroupsPage } from "@/pages/hashtag-groups";
import { AmbassadorsPage } from "@/pages/ai-studio/ambassadors";
import { KnowledgeBasePage } from "@/pages/ai-studio/knowledge-base";
import { TrendsPage } from "@/pages/ai-studio/trends";
import { ReportsPage } from "@/pages/reports";
import { SettingsLayout } from "@/pages/settings/SettingsLayout";
import { ClientProfilePage } from "@/pages/client-profile";
import { VideoStudioPage } from "@/pages/ai-studio/video";
import ExamplesPage from "@/components/examples";

export function AppRoutes() {
  return (
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

      {/* Authenticated Routes — require login */}
      <Route element={<AuthGuard />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/clients" element={<ClientListPage />} />
          <Route path="/clients/create" element={<ClientCreatePage />} />
          <Route path="/clients/:id" element={<ClientDetailPage />} />
          <Route
            path="/change-password"
            element={<Navigate to="/settings" replace />}
          />
          <Route path="/workspace" element={<WorkspacePage />} />
          <Route path="/workspaces/create" element={<CreateWorkspacePage />} />
          <Route
            path="/workspaces/:id/settings"
            element={<WorkspaceSettingsPage />}
          />
          <Route
            path="/workspaces/:id/members"
            element={<WorkspaceMembersPage />}
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
          <Route path="/agency/:id/members" element={<AgencyMembersPage />} />
          <Route path="/agency/:id/stats" element={<AgencyStatsPage />} />
          <Route path="/portal" element={<PortalPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/requests" element={<ContentRequestListPage />} />
          <Route path="/editor" element={<EditorPage />} />
          <Route path="/templates" element={<TemplateBrowserPage />} />
          <Route path="/hashtag-groups" element={<HashtagGroupsPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/library" element={<ContentLibraryPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/social-accounts" element={<SocialAccountsPage />} />
          <Route path="/publish" element={<PublishPage />} />
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
          <Route path="/settings" element={<SettingsLayout />} />
          {/* Legacy paths — giữ để không gãy link/bookmark cũ, one-page nên không cần anchor riêng */}
          <Route
            path="/notification-settings"
            element={<Navigate to="/settings" replace />}
          />
          <Route
            path="/security"
            element={<Navigate to="/settings" replace />}
          />
          <Route
            path="/profile"
            element={<Navigate to="/settings" replace />}
          />
          <Route path="/client-profile" element={<ClientProfilePage />} />
          <Route path="/ai-studio/video" element={<VideoStudioPage />} />
          <Route path="/components/examples" element={<ExamplesPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default AppRoutes;
