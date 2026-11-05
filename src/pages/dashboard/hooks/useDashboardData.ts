import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { authService } from "@/services/authService";
import { analyticsService } from "@/services/analyticsService";
import type { AnalyticsOverview } from "@/types/analytics";

export function useDashboardData() {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();

  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(true);
  const [isAnalyticsError, setIsAnalyticsError] = useState(false);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    try {
      setIsAnalyticsError(false);
      const data = await analyticsService.getOverview();
      setAnalytics(data);
    } catch (err) {
      console.error("Failed to fetch analytics overview:", err);
      setIsAnalyticsError(true);
    } finally {
      setIsAnalyticsLoading(false);
    }
  }, []);

  const loadAllData = useCallback(async () => {
    setIsRefreshing(true);
    await fetchAnalytics();
    setIsRefreshing(false);
  }, [fetchAnalytics]);

  useEffect(() => {
    loadAllData();
    const pollingInterval = setInterval(
      () => {
        loadAllData();
      },
      5 * 60 * 1000,
    );

    return () => clearInterval(pollingInterval);
  }, [loadAllData]);

  const handleLogout = () => {
    // FR 3.2.8: blacklist token server-side (BR-14), same as Navbar.handleLogout.
    authService.logout().catch(() => {});
    clearAuth();
    navigate("/login", { replace: true });
  };

  return {
    user,
    analytics,
    isAnalyticsLoading,
    isAnalyticsError,
    isRefreshing,
    loadAllData,
    fetchAnalytics,
    handleLogout,
  };
}
