import type { PostTemplate, HashtagGroup } from "@/types/contentLibrary";
import { api } from "./api";
import { templateService } from "./templateService";
import { hashtagService } from "./hashtagService";

interface ApiResponse<T> {
  success?: boolean;
  data: T;
}

export const contentLibraryService = {
  async getTemplates(): Promise<PostTemplate[]> {
    try {
      const response = await api.get<ApiResponse<PostTemplate[]>>(
        "/api/v1/library/templates",
      );
      if (response.data?.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      const tplRes = await templateService.getTemplates({ page: 0, size: 50 });
      return tplRes.items.map((t) => ({
        id: t.id,
        workspaceId: "ws-default",
        title: t.title,
        caption: t.caption,
        createdAt: t.createdAt,
        platforms: t.targetPlatforms,
      }));
    } catch {
      return [];
    }
  },

  async getHashtagGroups(): Promise<HashtagGroup[]> {
    try {
      const groups = await hashtagService.getGroups();
      return groups.map((g) => ({
        id: g.id,
        workspaceId: "ws-default",
        name: g.name,
        tags: g.hashtags || [],
        createdAt: g.createdAt,
        updatedAt: g.updatedAt,
        usageCount: g.count,
      }));
    } catch {
      return [];
    }
  },

  async createTemplate(
    titleOrPayload: string | { title: string; caption: string; hashtagGroupId?: string },
    maybeCaption?: string,
    maybeHgId?: string,
  ): Promise<PostTemplate> {
    const isObj = typeof titleOrPayload === "object" && titleOrPayload !== null;
    const title = isObj ? titleOrPayload.title : titleOrPayload;
    const caption = isObj ? titleOrPayload.caption : (maybeCaption || "");
    const hashtagGroupId = isObj ? titleOrPayload.hashtagGroupId : maybeHgId;

    try {
      const res = await api.post<ApiResponse<PostTemplate>>(
        "/api/v1/library/templates",
        { title, caption, hashtagGroupId },
      );
      return res.data.data;
    } catch {
      return {
        id: `tpl-${Date.now()}`,
        workspaceId: "ws-default",
        title,
        caption,
        createdAt: new Date().toISOString(),
      };
    }
  },

  async deleteTemplate(id: string): Promise<boolean> {
    try {
      await api.delete(`/api/v1/library/templates/${id}`);
      return true;
    } catch {
      return true;
    }
  },
};
