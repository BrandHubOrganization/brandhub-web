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
import { DashboardPage } from "@/pages/DashboardPage";
import { ChangePasswordPage } from "@/pages/ChangePasswordPage";
import { WorkspacePage } from "@/pages/WorkspacePage";
import { PortalPage } from "@/pages/PortalPage";
import { AdminPage } from "@/pages/AdminPage";
import { EditorPage } from "@/pages/EditorPage";
import { CalendarPage } from "@/pages/CalendarPage";
import { AnalyticsPage } from "@/pages/AnalyticsPage";
import { ClientListPage } from "@/pages/ClientListPage";
import { ClientDetailPage } from "@/pages/ClientDetailPage";
import { ContentLibraryPage } from "@/pages/ContentLibraryPage";
import { ContentRequestListPage } from "@/pages/ContentRequestListPage";
import ExamplesPage from "@/components/examples";

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes — accessible without authentication */}
      <Route path="/" element={<DashboardPage />} />
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
          <Route path="/portal" element={<PortalPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/requests" element={<ContentRequestListPage />} />
          <Route path="/editor" element={<EditorPage />} />
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
