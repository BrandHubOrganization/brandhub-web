import { api } from "@/services/api";
import type { TaskListItem, TaskListFilterParams } from "@/types/task";
import { requireApiData } from "@/lib/apiData";
import { canonicalTaskStatus } from "@/pages/tasks/taskStatus";
import type { ApiResponse } from "@/services/authService";

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
    const response = await api.get<ApiResponse<PagedTaskResponse>>(
      `/api/v1/workspaces/${workspaceId}/tasks`,
      {
        params: {
          page: params.page ?? 0,
          size: params.size ?? 20,
          sort: params.sort ?? "createdAt",
          direction: params.direction ?? "desc",
          status: params.status === "ALL" ? undefined : params.status,
          type: params.type === "ALL" ? undefined : params.type,
          search: params.search?.trim() || undefined,
          campaignId: params.campaignId || undefined,
        },
      },
    );

    // Spring Page serializes the current page as `number`; retain `page` support
    // for the normalized UI contract without changing the backend response.
    const raw = requireApiData<PagedTaskResponse & { number?: number }>(
      response.data,
    );
    const result = { ...raw, page: raw.number ?? raw.page };
    if (
      !Array.isArray(result.content) ||
      !Number.isInteger(result.totalPages) ||
      !Number.isInteger(result.totalElements) ||
      !Number.isInteger(result.page) ||
      !result.content.every(
        (task) =>
          task &&
          typeof task.id === "string" &&
          task.workspaceId === workspaceId,
      )
    ) {
      throw new Error("INVALID_TASK_PAGE");
    }
    return {
      ...result,
      content: result.content.map((task) => ({
        ...task,
        status: canonicalTaskStatus(task.status),
      })),
    };
  },
};
