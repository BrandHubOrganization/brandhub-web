import { api } from "@/services/api";
import type { AnalyticsOverview } from "@/types/analytics";

const REFRESH_MS = 5 * 60 * 1000;

// The user id keeps one account's numbers from showing after another signs in on this browser.
export const analyticsOverviewQuery = (userId: string | undefined) => ({
  queryKey: ["analytics-overview", userId],
  queryFn: () => analyticsService.getOverview(),
  enabled: !!userId,
  refetchInterval: REFRESH_MS,
  retry: 1,
});

export const analyticsService = {
  async getOverview(): Promise<AnalyticsOverview> {
    const response = await api.get<{ data: AnalyticsOverview }>(
      "/api/v1/analytics/overview",
      {
        params: { timezone: Intl.DateTimeFormat().resolvedOptions().timeZone },
      },
    );
    return response.data.data;
  },
};
