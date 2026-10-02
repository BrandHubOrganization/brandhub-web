import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, useParams } from "react-router-dom";

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
import { WorkspaceDashboardPage } from "@/pages/workspace/dashboard";
import { WorkspaceChatPage } from "@/pages/chat";
import { WorkspaceMembersPage } from "@/pages/workspace/members";
import { WorkspaceClientsPage } from "@/pages/workspace/clients";
import { WorkspaceTemplatesPage } from "@/pages/workspace/templates";
import { InvitationsPage } from "@/pages/workspace/invitations";
import { AgencyPage } from "@/pages/agency";
import { AgencyDetailPage } from "@/pages/agency/detail";
import { CreateAgencyPage } from "@/pages/agency/create";
import { AgencyMembersPage } from "@/pages/agency/members";
import { AgencyStatsPage } from "@/pages/agency/stats";
import { AgencyInvitationsPage } from "@/pages/agency/invitations";
import { ClientInvitationsPage } from "@/pages/client/invitations";
import { AcceptInvitationPage } from "@/pages/agency/accept";
import { PortalPage } from "@/pages/portal";
import { WorkspaceClientProfilePage } from "@/pages/workspace/client-profile";
import { AdminPage } from "@/pages/admin";
import { EditorPage } from "@/pages/editor";
import { ContentWritingPage } from "@/pages/content-writing";
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
import { ProfilePage } from "@/pages/profile";
import { SecurityPage } from "@/pages/security";
import { ConnectionsPage } from "@/pages/connections";
import { NotificationSettingsPage } from "@/pages/notification-settings";
import { ClientProfileListPage } from "@/pages/client-profiles/list";
import { VideoStudioPage } from "@/pages/ai-studio/video";
import MediaPackagePage from "@/pages/media-package";
import AgencyMediaPackagePage from "@/pages/media-package/agency";
import ExamplesPage from "@/components/examples";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { WorkspaceScopedRedirect } from "@/routes/WorkspaceScopedRedirect";

const SystemHealthPage = lazy(() => import("@/pages/admin/system-health"));
const WorkspaceTemplateLibraryPage = lazy(
  () => import("@/pages/admin/WorkspaceTemplateLibrary"),
);

function WorkspaceIndexRedirect() {
  const { id } = useParams<{ id: string }>();
  const workspaceList = useWorkspaceStore((s) => s.workspaceList);
  const currentWorkspace = useWorkspaceStore((s) => s.currentWorkspace);
  const workspace =
    workspaceList.find((w) => w.id === id) ??
    (currentWorkspace?.id === id ? currentWorkspace : null);

  if (
    workspace?.myRole === "CLIENT" &&
    workspace.packageNegotiationStatus !== "APPROVED"
  ) {
    return <Navigate to="media-package" replace />;
  }
  return <Navigate to="dashboard" replace />;
}
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
          <Route path="/workspaces/:id/chat" element={<WorkspaceChatPage />} />
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
          <Route path="/invitations" element={<InvitationsPage />} />
          <Route
            path="/invitations/accept"
            element={<AcceptInvitationPage />}
          />
          <Route path="/agency" element={<AgencyPage />} />
          <Route path="/agency/create" element={<CreateAgencyPage />} />
          <Route path="/agency/:id" element={<AgencyDetailPage />} />
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
          <Route path="/agency/:id/stats" element={<AgencyStatsPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route
            path="/admin/system-health"
            element={
              <Suspense fallback={null}>
                <SystemHealthPage />
              </Suspense>
            }
          />
          <Route
            path="/admin/workspace-templates"
            element={
              <Suspense fallback={null}>
                <WorkspaceTemplateLibraryPage />
              </Suspense>
            }
          />
          <Route path="/requests" element={<ContentRequestListPage />} />
          <Route path="/editor" element={<EditorPage />} />
          <Route path="/content-writing" element={<ContentWritingPage />} />
          <Route path="/templates" element={<TemplateBrowserPage />} />
          <Route path="/hashtag-groups" element={<HashtagGroupsPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/library" element={<ContentLibraryPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
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
  );
}

export default AppRoutes;
