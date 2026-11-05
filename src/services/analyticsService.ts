import { api } from "@/services/api";
import type { AnalyticsOverview } from "@/types/analytics";

export const analyticsService = {
  async getOverview(): Promise<AnalyticsOverview> {
    const response = await api.get<{ data: AnalyticsOverview }>(
      "/api/v1/analytics/overview",
      { params: { timezone: Intl.DateTimeFormat().resolvedOptions().timeZone } },
    );
    return response.data.data;
  },
};
