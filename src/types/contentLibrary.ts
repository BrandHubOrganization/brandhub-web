export type MediaType = "image" | "video" | "file";

export interface MediaItem {
  source?: "repository";
  id: string;
  workspaceId: string;
  filename: string;
  url: string;
  thumbnailUrl?: string;
  type: MediaType;
  sizeBytes: number;
  width?: number;
  height?: number;
  durationSeconds?: number;
  createdAt: string;
  aspectRatio?: "1:1" | "16:9" | "9:16" | "4:5";
  resolution?: string;
  category?: string;
}

export interface HashtagGroup {
  id: string;
  workspaceId: string;
  name: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  category?: string;
  usageCount?: number;
}

export interface PostTemplate {
  id: string;
  workspaceId: string;
  title: string;
  caption: string;
  hashtagGroup?: HashtagGroup;
  createdAt: string;
  category?: string;
  platforms?: string[];
}

export interface MediaQueryParams {
  workspaceId?: string;
  type?: MediaType | "all";
  aspectRatio?: string;
  search?: string;
  sort?: "newest" | "oldest";
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  hasMore: boolean;
  total: number;
  page: number;
}
