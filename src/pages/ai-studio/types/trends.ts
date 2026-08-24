export type CrawlFrequency = "HOURLY" | "DAILY" | "WEEKLY";

export interface TrendKeyword {
  id: string;
  keyword: string;
  isActive: boolean;
  crawlFrequency: CrawlFrequency;
}

export interface TrendingTopic {
  id: string;
  topic: string;
  platform: string;
  volume: number;
  growthPercent: number;
  relatedKeywords: string[];
  suggestedAt: string;
}
