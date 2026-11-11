import type {
  HashtagGroup,
  CreateHashtagGroupPayload,
} from "@/types/hashtagGroup";
import { api } from "./api";

interface ApiResponse<T> {
  success?: boolean;
  data: T;
}

export const hashtagService = {
  async getGroups(search?: string): Promise<HashtagGroup[]> {
    try {
      const response = await api.get<ApiResponse<HashtagGroup[]>>(
        "/api/v1/hashtags",
        { params: search ? { search } : undefined },
      );
      return response.data?.data || [];
    } catch {
      return [];
    }
  },

  async createGroup(payload: CreateHashtagGroupPayload): Promise<HashtagGroup> {
    const response = await api.post<ApiResponse<HashtagGroup>>(
      "/api/v1/hashtags",
      payload,
    );
    return response.data.data;
  },

  async updateGroup(
    id: string,
    payload: CreateHashtagGroupPayload,
  ): Promise<HashtagGroup> {
    const response = await api.put<ApiResponse<HashtagGroup>>(
      `/api/v1/hashtags/${id}`,
      payload,
    );
    return response.data.data;
  },

  async deleteGroup(id: string): Promise<boolean> {
    await api.delete(`/api/v1/hashtags/${id}`);
    return true;
  },
};
