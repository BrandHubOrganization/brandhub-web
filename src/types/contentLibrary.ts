export type MediaType = 'image' | 'video';

export interface MediaItem {
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
}

export interface HashtagGroup {
  id: string;
  workspaceId: string;
  name: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PostTemplate {
  id: string;
  workspaceId: string;
  title: string;
  caption: string;
  hashtagGroup?: HashtagGroup;
  createdAt: string;
}

export interface MediaQueryParams {
  workspaceId?: string;
  type?: MediaType | 'all';
  search?: string;
  sort?: 'newest' | 'oldest';
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  hasMore: boolean;
  total: number;
  page: number;
}
