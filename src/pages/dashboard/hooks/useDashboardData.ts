import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { dashboardService } from "@/services/dashboardService";
import type { AnalyticsOverview, ActivityEvent } from "@/types/analytics";

export function useDashboardData() {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();

  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(true);
  const [isAnalyticsError, setIsAnalyticsError] = useState(false);

  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [isActivitiesLoading, setIsActivitiesLoading] = useState(true);
  const [isActivitiesError, setIsActivitiesError] = useState(false);

  const [isRefreshing, setIsRefreshing] = useState(false);

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
    clearAuth();
    navigate("/login", { replace: true });
  };

  return {
    user,
    analytics,
    isAnalyticsLoading,
    isAnalyticsError,
    activities,
    isActivitiesLoading,
    isActivitiesError,
    isRefreshing,
    loadAllData,
    fetchAnalytics,
    fetchActivities,
    handleLogout,
  };
}
