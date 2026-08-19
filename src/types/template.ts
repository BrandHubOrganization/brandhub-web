export type SocialPlatform =
  "FACEBOOK" | "INSTAGRAM" | "TIKTOK" | "THREADS" | "YOUTUBE";

export interface ContentTemplate {
  id: string;
  title: string;
  caption: string;
  hashtags: string[];
  mediaUrls: string[];
  targetPlatforms: SocialPlatform[];
  isTemplate: boolean;
  lastUsedAt: string;
  createdAt: string;
}

export interface TemplateQueryParams {
  search?: string;
  page: number;
  size: number;
}

export interface TemplatePaginatedResponse {
  items: ContentTemplate[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}
