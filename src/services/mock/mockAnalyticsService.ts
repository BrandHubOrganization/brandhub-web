import type { AnalyticsSummary } from "@/types/analytics";

const MOCK_ANALYTICS_SUMMARY: AnalyticsSummary = {
  cards: [
    { key: "reach", value: "245,890", deltaPercent: 12.4 },
    { key: "engagement", value: "18,430", deltaPercent: 8.2 },
    { key: "posts", value: "48", deltaPercent: 0 },
    { key: "responseRate", value: "94.5%", deltaPercent: 1.5 },
  ],
  channelStats: [
    { platform: "FACEBOOK", postCount: 22, reach: 98200, engagement: 7150 },
    { platform: "INSTAGRAM", postCount: 14, reach: 76400, engagement: 6820 },
    { platform: "TIKTOK", postCount: 6, reach: 51300, engagement: 3210 },
    { platform: "THREADS", postCount: 4, reach: 12600, engagement: 890 },
    { platform: "YOUTUBE", postCount: 2, reach: 7390, engagement: 360 },
  ],
};

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  return Promise.resolve(MOCK_ANALYTICS_SUMMARY);
}
