import type { Post, PlatformTarget } from "@/types/post";
import { api } from "./api";

interface ApiResponse<T> {
  success?: boolean;
  data: T;
}

export interface CreatePostInput {
  title: string;
  caption: string;
  hashtags: string[];
  mediaUrls: string[];
  platformTargets: PlatformTarget[];
  scheduledAt?: string;
}

export async function getScheduledPosts(): Promise<Post[]> {
  try {
    const response = await api.get<ApiResponse<Post[]>>(
      "/api/v1/posts/schedule",
    );
    return response.data?.data || [];
  } catch {
    return [];
  }
}

export async function createPost(input: CreatePostInput): Promise<Post> {
  const response = await api.post<ApiResponse<Post>>("/api/v1/posts", input);
  return response.data.data;
}

export async function retryPost(id: string): Promise<Post> {
  const response = await api.post<ApiResponse<Post>>(
    `/api/v1/posts/${id}/publish`,
  );
  return response.data.data;
}
