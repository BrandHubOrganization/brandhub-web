import type {
  CrawlFrequency,
  TrendKeyword,
  TrendingTopic,
} from "@/pages/ai-studio/types/trends";

const MOCK_KEYWORDS: TrendKeyword[] = [
  {
    id: "kw-1",
    keyword: "áo thun local brand",
    isActive: true,
    crawlFrequency: "DAILY",
  },
  {
    id: "kw-2",
    keyword: "skincare Hàn Quốc",
    isActive: true,
    crawlFrequency: "HOURLY",
  },
  {
    id: "kw-3",
    keyword: "đồ ăn healthy",
    isActive: false,
    crawlFrequency: "WEEKLY",
  },
  {
    id: "kw-4",
    keyword: "giày sneaker",
    isActive: true,
    crawlFrequency: "DAILY",
  },
];

const MOCK_TOPICS: TrendingTopic[] = [
  {
    id: "topic-1",
    topic: "Xu hướng thời trang Y2K quay trở lại",
    platform: "TikTok",
    volume: 458000,
    growthPercent: 34.2,
    relatedKeywords: ["Y2K", "thời trang retro", "áo croptop"],
    suggestedAt: "2026-08-22T09:00:00Z",
  },
  {
    id: "topic-2",
    topic: "Review skincare routine 5 bước",
    platform: "Instagram",
    volume: 212000,
    growthPercent: 18.7,
    relatedKeywords: ["skincare", "routine", "dưỡng da"],
    suggestedAt: "2026-08-22T08:30:00Z",
  },
  {
    id: "topic-3",
    topic: "Thử thách ăn healthy 30 ngày",
    platform: "Facebook",
    volume: 98000,
    growthPercent: -6.4,
    relatedKeywords: ["healthy", "ăn kiêng", "eat clean"],
    suggestedAt: "2026-08-21T14:00:00Z",
  },
  {
    id: "topic-4",
    topic: "Giày sneaker phối đồ công sở",
    platform: "TikTok",
    volume: 145000,
    growthPercent: 22.1,
    relatedKeywords: ["sneaker", "OOTD", "công sở"],
    suggestedAt: "2026-08-21T11:00:00Z",
  },
  {
    id: "topic-5",
    topic: "Local brand Việt vươn ra quốc tế",
    platform: "LinkedIn",
    volume: 34000,
    growthPercent: 9.5,
    relatedKeywords: ["local brand", "xuất khẩu", "thương hiệu Việt"],
    suggestedAt: "2026-08-20T10:00:00Z",
  },
  {
    id: "topic-6",
    topic: "Trang điểm tối giản kiểu Hàn",
    platform: "Instagram",
    volume: 267000,
    growthPercent: -3.1,
    relatedKeywords: ["makeup Hàn Quốc", "no-makeup look"],
    suggestedAt: "2026-08-20T09:00:00Z",
  },
  {
    id: "topic-7",
    topic: "Video unboxing sản phẩm local brand",
    platform: "YouTube",
    volume: 76000,
    growthPercent: 15.8,
    relatedKeywords: ["unboxing", "review sản phẩm"],
    suggestedAt: "2026-08-19T16:00:00Z",
  },
];

export async function getKeywords(): Promise<TrendKeyword[]> {
  return Promise.resolve(MOCK_KEYWORDS.map((k) => ({ ...k })));
}

export async function addKeyword(
  keyword: string,
  frequency: CrawlFrequency,
): Promise<TrendKeyword> {
  const newKeyword: TrendKeyword = {
    id: `kw-${Date.now()}`,
    keyword,
    isActive: true,
    crawlFrequency: frequency,
  };
  MOCK_KEYWORDS.push(newKeyword);
  return Promise.resolve({ ...newKeyword });
}

export async function toggleKeyword(id: string): Promise<TrendKeyword> {
  const kw = MOCK_KEYWORDS.find((k) => k.id === id);
  if (!kw) throw new Error("Keyword not found");
  kw.isActive = !kw.isActive;
  return Promise.resolve({ ...kw });
}

export async function deleteKeyword(id: string): Promise<void> {
  const idx = MOCK_KEYWORDS.findIndex((k) => k.id === id);
  if (idx !== -1) MOCK_KEYWORDS.splice(idx, 1);
  return Promise.resolve();
}

export async function getTrendingTopics(): Promise<TrendingTopic[]> {
  return Promise.resolve(MOCK_TOPICS.map((t) => ({ ...t })));
}

export async function useForContent(_topicId: string): Promise<void> {
  return Promise.resolve();
}
