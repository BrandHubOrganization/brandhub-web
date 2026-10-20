import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type {
  PostDashboardData,
  PostDashboardFilters,
} from "../types/dashboard";
import { postDashboardService } from "../services/postDashboardService";

const DEFAULT_FILTERS: PostDashboardFilters = {
  dateRange: "7d",
  platform: "ALL",
  status: "ALL",
  search: "",
  page: 1,
  limit: 10,
};

export function usePostDashboard(workspaceId: string) {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read initial filters from URL query parameters (BR-76)
  const [filters, setFilters] = useState<PostDashboardFilters>(() => ({
    dateRange: (searchParams.get("dateRange") as any) || DEFAULT_FILTERS.dateRange,
    platform: (searchParams.get("platform") as any) || DEFAULT_FILTERS.platform,
    status: (searchParams.get("status") as any) || DEFAULT_FILTERS.status,
    search: searchParams.get("search") || DEFAULT_FILTERS.search,
    page: Number(searchParams.get("page")) || DEFAULT_FILTERS.page,
    limit: Number(searchParams.get("limit")) || DEFAULT_FILTERS.limit,
  }));

  const [data, setData] = useState<PostDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // Sync state to URL search params (BR-76)
  const updateFilters = useCallback(
    (newFilters: Partial<PostDashboardFilters>) => {
      setFilters((prev) => {
        const updated = { ...prev, ...newFilters };
        const params = new URLSearchParams();

        if (updated.dateRange !== "7d") params.set("dateRange", updated.dateRange);
        if (updated.platform !== "ALL") params.set("platform", updated.platform);
        if (updated.status !== "ALL") params.set("status", updated.status);
        if (updated.search) params.set("search", updated.search);
        if (updated.page > 1) params.set("page", String(updated.page));

        setSearchParams(params, { replace: true });
        return updated;
      });
    },
    [setSearchParams],
  );

  const fetchDashboardData = useCallback(async () => {
    if (!workspaceId) return;
    setIsLoading(true);
    setIsError(false);
    try {
      const result = await postDashboardService.getDashboard(workspaceId, filters);
      setData(result);
    } catch (err) {
      console.error("Failed to fetch post dashboard data:", err);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId, filters]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    data,
    isLoading,
    isError,
    filters,
    updateFilters,
    refetch: fetchDashboardData,
  };
}
