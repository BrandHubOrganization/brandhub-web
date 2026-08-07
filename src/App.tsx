import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

// Import UI Primitives
import { Toaster } from "@/components/ui/sonner";
import ExamplesPage from "@/components/examples";

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

function App() {
  return (
    <BrowserRouter>
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
            <Route path="/change-password" element={<ChangePasswordPage />} />
            <Route path="/workspace" element={<WorkspacePage />} />
            <Route path="/portal" element={<PortalPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/editor" element={<EditorPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/components/examples" element={<ExamplesPage />} />
          </Route>
        </Route>
      </Routes>
      <Toaster position="bottom-right" closeButton richColors />
    </BrowserRouter>
  );
}

export default App;
