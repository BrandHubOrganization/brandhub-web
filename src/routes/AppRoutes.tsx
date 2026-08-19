import { Routes, Route } from "react-router-dom";

// Import Layout & Security Components
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Layout } from "@/components/layout/Layout";

// Import Pages
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { VerifyOtpPage } from "@/pages/auth/VerifyOtpPage";
import { ForgotPasswordPage } from "@/pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "@/pages/auth/ResetPasswordPage";
import { OAuthCallbackPage } from "@/pages/auth/OAuthCallbackPage";
import { LandingPage } from "@/pages/dashboard/landing";
import { DashboardPage } from "@/pages/dashboard";
import { ChangePasswordPage } from "@/pages/change-password";
import { WorkspacePage } from "@/pages/workspace";
import { CreateWorkspacePage } from "@/pages/workspace/create";
import { WorkspaceSettingsPage } from "@/pages/workspace/detail";
import { WorkspaceMembersPage } from "@/pages/workspace/members";
import { InvitationsPage } from "@/pages/workspace/invitations";
import { PortalPage } from "@/pages/portal";
import { AdminPage } from "@/pages/admin";
import { EditorPage } from "@/pages/editor";
import { CalendarPage } from "@/pages/calendar";
import { AnalyticsPage } from "@/pages/analytics";
import { ClientListPage } from "@/pages/client";
import { ClientDetailPage } from "@/pages/client/detail";
import { ContentLibraryPage } from "@/pages/library";
import { ContentRequestListPage } from "@/pages/requests";
import { TemplateBrowserPage } from "@/pages/templates";
import { HashtagGroupsPage } from "@/pages/hashtag-groups";
import ExamplesPage from "@/components/examples";

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes — accessible without authentication */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-otp" element={<VerifyOtpPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/oauth-callback" element={<OAuthCallbackPage />} />

      {/* Authenticated Routes — require login */}
      <Route element={<AuthGuard />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/clients" element={<ClientListPage />} />
          <Route path="/clients/:id" element={<ClientDetailPage />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />
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
          <Route path="/portal" element={<PortalPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/requests" element={<ContentRequestListPage />} />
          <Route path="/editor" element={<EditorPage />} />
          <Route path="/templates" element={<TemplateBrowserPage />} />
          <Route path="/hashtag-groups" element={<HashtagGroupsPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/library" element={<ContentLibraryPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/components/examples" element={<ExamplesPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default AppRoutes;
