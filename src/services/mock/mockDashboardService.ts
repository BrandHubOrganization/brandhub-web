import { api } from "@/services/api";
import type { AnalyticsOverview, ActivityEvent } from "@/types/analytics";

// NOTE: /api/v1/analytics/overview is not yet implemented in the backend.
// Throws on error/missing endpoint so UI isAnalyticsError fires correctly.
// Do NOT restore a mock fallback: API error → error state (per checklist principle).
//
// NOTE: Activity feed (/api/v1/activity) does not yet exist in the backend.
// getActivityFeed throws so the UI isActivitiesError flag fires correctly.
// The correct notifications path is /api/v1/notifications/me (user inbox),
// but it returns system notifications, not ActivityEvent[] — deferred until
// a dedicated activity-feed endpoint is implemented.

export const dashboardService = {
  async getAnalyticsOverview(): Promise<AnalyticsOverview> {
    const response = await api.get<{ data: AnalyticsOverview }>(
      "/api/v1/analytics/overview",
    );
    const data = (response.data as { data?: AnalyticsOverview })?.data ?? response.data;
    if (
      data == null ||
      typeof (data as AnalyticsOverview).totalPosts !== "number" ||
      typeof (data as AnalyticsOverview).publishedCount !== "number"
    ) {
      throw new Error("INVALID_ANALYTICS_RESPONSE");
    }
    return data as AnalyticsOverview;
  },

  async getActivityFeed(_page = 0, _size = 10): Promise<ActivityEvent[]> {
    // Backend activity-feed endpoint not yet implemented.
    // Throwing here keeps isActivitiesError=true and shows the retry button.
    throw new Error("ACTIVITY_FEED_NOT_IMPLEMENTED");
  },
};
