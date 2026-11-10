import type {
  ContentTemplate,
  TemplateQueryParams,
  TemplatePaginatedResponse,
} from "@/types/template";
import { api } from "./api";

interface ApiResponse<T> {
  success?: boolean;
  data: T;
}

export const templateService = {
  async getTemplates(
    params: TemplateQueryParams,
  ): Promise<TemplatePaginatedResponse> {
    try {
      const response = await api.get<ApiResponse<TemplatePaginatedResponse>>(
        "/api/v1/content-templates",
        { params },
      );
      if (response.data?.data) {
        return response.data.data;
      }
      return {
        items: [],
        total: 0,
        page: params.page || 0,
        size: params.size || 20,
        totalPages: 0,
      };
    } catch {
      return {
        items: [],
        total: 0,
        page: params.page || 0,
        size: params.size || 20,
        totalPages: 0,
      };
    }
  },

  async deleteTemplate(id: string): Promise<boolean> {
    try {
      await api.delete(`/api/v1/content-templates/${id}`);
      return true;
    } catch {
      return true;
    }
  },
};

export type { ContentTemplate };
