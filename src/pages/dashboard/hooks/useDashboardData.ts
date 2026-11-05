import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { authService } from "@/services/authService";
import { analyticsOverviewQuery } from "@/services/analyticsService";

export function useDashboardData() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const overview = useQuery(analyticsOverviewQuery(user?.id));

  const handleLogout = () => {
    // FR 3.2.8: blacklist token server-side (BR-14), same as Navbar.handleLogout.
    authService.logout().catch(() => {});
    clearAuth();
    navigate("/login", { replace: true });
  };

  return {
    user,
    analytics: overview.data ?? null,
    isAnalyticsLoading: overview.isLoading,
    isAnalyticsError: overview.isError,
    isRefreshing: overview.isFetching,
    loadAllData: overview.refetch,
    fetchAnalytics: overview.refetch,
    handleLogout,
  };
}
