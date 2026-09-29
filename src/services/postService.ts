import { api } from "@/lib/axios";
import type { SocialPlatform } from "@/types/editor";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface SavePostMedia {
  s3Key?: string;
  externalUrl?: string;
  mediaType: "IMAGE" | "VIDEO";
}

export interface SavePostInput {
  caption: string;
  hashtags: string[];
  media: SavePostMedia[];
  targetPlatforms: SocialPlatform[];
  aiGenerated: boolean;
}

export interface PostResponse extends SavePostInput {
  id: string;
  workspaceId: string;
  status: string;
  media: Array<SavePostMedia & { url: string }>;
  createdAt: string;
  updatedAt: string;
}

export const postService = {
  async createDraft(workspaceId: string, input: SavePostInput) {
    const response = await api.post<ApiResponse<PostResponse>>(
      `/api/v1/workspaces/${workspaceId}/posts`,
      input,
    );
    return response.data.data;
  },

  async updateDraft(workspaceId: string, postId: string, input: SavePostInput) {
    const response = await api.patch<ApiResponse<PostResponse>>(
      `/api/v1/workspaces/${workspaceId}/posts/${postId}`,
      input,
    );
    return response.data.data;
  },

  async get(workspaceId: string, postId: string) {
    const response = await api.get<ApiResponse<PostResponse>>(
      `/api/v1/workspaces/${workspaceId}/posts/${postId}`,
    );
    return response.data.data;
  },

  async submitForReview(workspaceId: string, postId: string) {
    const response = await api.post<ApiResponse<PostResponse>>(
      `/api/v1/workspaces/${workspaceId}/posts/${postId}/submit`,
    );
    return response.data.data;
  },
};
