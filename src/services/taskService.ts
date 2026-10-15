import { api } from "@/services/api";
import type { TaskListItem, TaskListFilterParams } from "@/types/task";
import { mockTaskService } from "@/services/mock/mockTaskService";

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
      const response = await api.get(`/workspaces/${workspaceId}/tasks`, {
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
      console.warn("Backend API not reachable or empty, falling back to mockTaskService", error);
    }

    return mockTaskService.getWorkspaceTasks(params);
  },
};
