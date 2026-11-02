export interface TrendRow {
  id: string;
  keyword: string;
  date: string;
  score: number | null;
  rank: number | null;
  postCount: number | null;
  updatedAt: string | null;
  metricVersion: string | null;
  completeness: string;
}

export interface TrendPage {
  items: TrendRow[];
  hasMore: boolean;
  nextCursor: string | null;
  source: "redis" | "neo4j";
  date: string;
  fallbackReason: string | null;
  asOf: string | null;
}

export interface TrendHistory {
  keyword: string;
  points: {
    date: string;
    score: number | null;
    postCount: number | null;
    id: string | null;
  }[];
  sources: string[];
  sourcesTruncated: boolean;
  truncated: boolean;
  comparisonAvailable: boolean;
}
