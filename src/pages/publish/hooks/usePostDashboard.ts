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

const DATE_RANGES: readonly PostDashboardFilters["dateRange"][] = [
  "7d",
  "14d",
  "30d",
  "90d",
  "all",
];
const PLATFORMS: readonly PostDashboardFilters["platform"][] = [
  "ALL",
  "FACEBOOK",
  "INSTAGRAM",
  "TIKTOK",
  "THREADS",
];
const STATUSES: readonly PostDashboardFilters["status"][] = [
  "ALL",
  "IN_PROGRESS",
  "DRAFT",
  "PENDING_REVIEW",
  "APPROVED",
  "SCHEDULED",
  "PUBLISHED",
  "FAILED",
  "REJECTED",
];

function getFilterValue<T extends string>(
  value: string | null,
  allowedValues: readonly T[],
  fallback: T,
): T {
  return allowedValues.find((allowedValue) => allowedValue === value) ?? fallback;
}

export function usePostDashboard(workspaceId: string) {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read initial filters from URL query parameters (BR-76)
  const [filters, setFilters] = useState<PostDashboardFilters>(() => ({
    dateRange: getFilterValue(
      searchParams.get("dateRange"),
      DATE_RANGES,
      DEFAULT_FILTERS.dateRange,
    ),
    platform: getFilterValue(
      searchParams.get("platform"),
      PLATFORMS,
      DEFAULT_FILTERS.platform,
    ),
    status: getFilterValue(
      searchParams.get("status"),
      STATUSES,
      DEFAULT_FILTERS.status,
    ),
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

  const fetchDashboardData = useCallback(
    async (silent = false) => {
      if (!workspaceId) return;
      if (!silent) {
        setIsLoading(true);
        setIsError(false);
      }
      try {
        const result = await postDashboardService.getDashboard(
          workspaceId,
          filters,
        );
        setData(result);
      } catch (err) {
        console.error("Failed to fetch post dashboard data:", err);
        if (!silent) setIsError(true);
      } finally {
        if (!silent) setIsLoading(false);
      }
    },
    [workspaceId, filters],
  );

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Auto-poll silently every 4s if any post is IN_PROGRESS
  useEffect(() => {
    const hasInProgress =
      (data?.kpis?.inProgressCount ?? 0) > 0 ||
      (data?.recentPosts?.some((p) => p.status === "IN_PROGRESS") ?? false);

    if (!hasInProgress) return;

    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 4000);

    return () => clearInterval(interval);
  }, [data?.kpis?.inProgressCount, data?.recentPosts, fetchDashboardData]);

  return {
    data,
    isLoading,
    isError,
    filters,
    updateFilters,
    refetch: () => fetchDashboardData(false),
  };
}
