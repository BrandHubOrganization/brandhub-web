import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

// Import UI Primitives
import { Toaster } from "@/components/ui/sonner";
import ExamplesPage from "@/components/examples";

// Import Layout & Security Components
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Layout } from "@/components/layout/Layout";

// Import Pages
import { LoginPage } from "@/pages/LoginPage";
import { DashboardPage } from "@/pages/DashboardPage";
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
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Authenticated Routes wrapped in AuthGuard and Layout */}
        <Route element={<AuthGuard />}>
          <Route element={<Layout />}>
            <Route path="/" element={<DashboardPage />} />
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
