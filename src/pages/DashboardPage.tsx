import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { CinematicHero } from "@/components/landing/cinematic/CinematicHero";
import { Navbar } from "@/components/landing/Navbar";
import { LogoWall } from "@/components/landing/LogoWall";
import { StatsCounter } from "@/components/landing/StatsCounter";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Templates } from "@/components/landing/Templates";
import { Testimonials } from "@/components/landing/Testimonials";
import { TeamSection } from "@/components/landing/TeamSection";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";
import { useAuthStore } from "@/store/authStore";

// Dashboard Components
import { KpiCardsSection } from "@/components/dashboard/KpiCardsSection";
import { ActivityFeedSection } from "@/components/dashboard/ActivityFeedSection";
import { TeamStatsSection } from "@/components/dashboard/TeamStatsSection";

// Service & Types
import { dashboardService } from "@/services/dashboardService";
import type { AnalyticsOverview, ActivityEvent } from "@/types/analytics";
import { RefreshCw, Plus, KeyRound, LogOut, Sparkles } from "lucide-react";

export function DashboardPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user, clearAuth } = useAuthStore();

  // Dashboard Data State
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState<boolean>(true);
  const [isAnalyticsError, setIsAnalyticsError] = useState<boolean>(false);

  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [isActivitiesLoading, setIsActivitiesLoading] = useState<boolean>(true);
  const [isActivitiesError, setIsActivitiesError] = useState<boolean>(false);

  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Fetch KPI Analytics Data
  const fetchAnalytics = useCallback(async () => {
    try {
      setIsAnalyticsError(false);
      const data = await dashboardService.getAnalyticsOverview();
      setAnalytics(data);
    } catch (err) {
      console.error("Failed to fetch analytics overview:", err);
      setIsAnalyticsError(true);
    } finally {
      setIsAnalyticsLoading(false);
    }
  }, []);

  // Fetch Activity Feed Data
  const fetchActivities = useCallback(async () => {
    try {
      setIsActivitiesError(false);
      const feed = await dashboardService.getActivityFeed(0, 10);
      setActivities(feed);
    } catch (err) {
      console.error("Failed to fetch activity feed:", err);
      setIsActivitiesError(true);
    } finally {
      setIsActivitiesLoading(false);
    }
  }, []);

  const loadAllData = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([fetchAnalytics(), fetchActivities()]);
    setIsRefreshing(false);
  }, [fetchAnalytics, fetchActivities]);

  // Polling every 5 minutes (300,000 ms) as specified in DA-E35-02 technical notes
  useEffect(() => {
    if (!isAuthenticated) return;

    loadAllData();

    const pollingInterval = setInterval(() => {
      loadAllData();
    }, 5 * 60 * 1000);

    return () => clearInterval(pollingInterval);
  }, [isAuthenticated, loadAllData]);

  const handleLogout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };

  // ── Authenticated: Render Main Dashboard View (DA-E35-02) ──
  if (isAuthenticated && user) {
    return (
      <PageWrapper
        title="Dashboard"
        description="Tổng quan chỉ số hoạt động, nhật ký sự kiện và tiến độ nhóm."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer text-xs gap-1.5"
              onClick={loadAllData}
              disabled={isRefreshing}
            >
              <RefreshCw className={`size-3.5 ${isRefreshing ? "animate-spin text-[#f05a28]" : ""}`} />
              Làm mới
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer text-xs gap-1.5"
              onClick={() => navigate("/change-password")}
            >
              <KeyRound className="size-3.5" />
              Đổi mật khẩu
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer text-xs gap-1.5"
              onClick={handleLogout}
            >
              <LogOut className="size-3.5" />
              Đăng xuất
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => navigate("/editor")}
              className="cursor-pointer bg-[#f05a28] text-xs text-white hover:bg-[#f05a28]/90 gap-1.5 font-medium"
            >
              <Plus className="size-3.5" />
              Tạo Nội Dung Mới
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Welcome Banner */}
          <div className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-r from-card via-card to-muted/30 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-foreground">
                    Xin chào trở lại, {user.name || "User"}!
                  </h2>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#f05a28]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#f05a28]">
                    <Sparkles className="size-3" /> {user.role}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Hệ thống đang hoạt động ổn định. Dưới đây là báo cáo tổng quan chiến dịch của bạn.
                </p>
              </div>
            </div>
          </div>

          {/* KPI Cards Component (DA-E35-02) */}
          <KpiCardsSection
            data={analytics}
            isLoading={isAnalyticsLoading}
            isError={isAnalyticsError}
            onRetry={fetchAnalytics}
          />

          {/* Main Content Grid: Activity Feed + Team Stats */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Activity Feed (2 cols on large screens) */}
            <div className="lg:col-span-2 space-y-6">
              <ActivityFeedSection
                events={activities}
                isLoading={isActivitiesLoading}
                isError={isActivitiesError}
                onRetry={fetchActivities}
              />
            </div>

            {/* Sidebar / Team Stats (1 col on large screens) */}
            <div className="space-y-6">
              {/* Team Stats Section (RBAC: AGENCY_OWNER & ACCOUNT_MANAGER only) */}
              <TeamStatsSection
                stats={analytics?.teamStats}
                userRole={user.role}
                isLoading={isAnalyticsLoading}
              />

              {/* Quick Tasks Card */}
              <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                <h3 className="text-sm font-bold text-foreground">Nhiệm vụ ưu tiên hôm nay</h3>
                <div className="space-y-2.5">
                  {[
                    "Phê duyệt bài viết Chiến dịch Heineken (AM)",
                    "Lên lịch bài đăng Nike Air Max (Creator)",
                    "Xem báo cáo hiệu năng nội dung tháng 8",
                  ].map((taskText, idx) => (
                    <label
                      key={idx}
                      className="flex items-center gap-2.5 text-xs text-foreground/90 cursor-pointer p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        className="rounded border-border text-[#f05a28] focus:ring-[#f05a28] size-3.5"
                      />
                      <span>{taskText}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  // ── Unauthenticated: Full Landing Page ──
  return (
    <div style={{ fontFamily: "var(--font-sans)" }}>
      <Navbar />
      <CinematicHero />
      <LogoWall />
      <Features />
      <StatsCounter />
      <HowItWorks />
      <Templates />
      <Testimonials />
      <TeamSection />
      <Pricing />
      <FAQ />
      <CTASection />
      <Footer />
    </div>
  );
}

export default DashboardPage;
