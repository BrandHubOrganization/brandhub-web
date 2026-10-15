import { api } from "@/services/api";
import type { TaskListItem, TaskListFilterParams } from "@/types/task";

export interface PagedTaskResponse {
  content: TaskListItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export const taskService = {
  getWorkspaceTasks: async (
    workspaceId: string,
    params: TaskListFilterParams = {},
  ): Promise<PagedTaskResponse> => {
    try {
      const response = await api.get(`/api/v1/workspaces/${workspaceId}/tasks`, {
        params: {
          page: params.page ?? 0,
          size: params.size ?? 20,
          sort: params.sort ?? "createdAt",
          direction: params.direction ?? "desc",
        },
      });

      if (response.data?.success && response.data?.data) {
        return response.data.data;
      }
    } catch (error) {
      console.error("Error loading workspace tasks from backend:", error);
    }

    return {
      content: [],
      page: 0,
      size: 20,
      totalElements: 0,
      totalPages: 0,
      last: true,
    };
  },
};
