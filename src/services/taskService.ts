import { api } from "@/services/api";
import type {
  TaskListItem,
  TaskListFilterParams,
  TaskStatus,
  TaskPriority,
} from "@/types/task";
import { requireApiData } from "@/lib/apiData";
import type { ApiResponse } from "@/services/authService";
import type { MeetingLinkResponse } from "@/pages/tasks/types/taskWorkflow";

export interface PagedTaskResponse {
  content: TaskListItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

function serializeFilter(param?: string | string[]): string | undefined {
  if (!param) return undefined;
  if (Array.isArray(param)) {
    return param.length === 0 || param.includes("ALL") ? undefined : param.join(",");
  }
  return param === "ALL" ? undefined : param;
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
          status: serializeFilter(params.status),
          type: serializeFilter(params.type),
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
    return result;
  },

  generateLivestreamMeetingLink: async (
    workspaceId: string,
    taskId: string,
    options?: { customMeetingUrl?: string; forceNew?: boolean },
  ): Promise<ApiResponse<MeetingLinkResponse>> => {
    const query = options?.forceNew ? "?forceNew=true" : "";
    const payload = {
      meetingUrl: options?.customMeetingUrl ?? null,
      forceNew: Boolean(options?.forceNew),
    };
    try {
      const response = await api.post<ApiResponse<MeetingLinkResponse>>(
        `/api/v1/workspaces/${workspaceId}/tasks/${taskId}/meeting-link${query}`,
        payload,
      );
      return response.data;
    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        (error as { response?: { status?: number } }).response?.status === 404
      ) {
        const fallback = await api.post<ApiResponse<MeetingLinkResponse>>(
          `/api/v1/workspaces/${workspaceId}/tasks/${taskId}/livestream/meeting-link${query}`,
          payload,
        );
        return fallback.data;
      }
      throw error;
    }
  },

  generateTaskMeetingLink: async (
    workspaceId: string,
    taskId: string,
    options?: { customMeetingUrl?: string; forceNew?: boolean },
  ): Promise<ApiResponse<MeetingLinkResponse>> => {
    return taskService.generateLivestreamMeetingLink(workspaceId, taskId, options);
  },

  updateTaskStatus: async (
    workspaceId: string,
    taskId: string,
    status: TaskStatus,
  ): Promise<void> => {
    await api.patch(
      `/api/v1/workspaces/${encodeURIComponent(workspaceId)}/tasks/${encodeURIComponent(taskId)}/status`,
      { status },
    );
  },

  updateTaskPriority: async (
    workspaceId: string,
    taskId: string,
    priority: TaskPriority,
  ): Promise<void> => {
    await api.patch(
      `/api/v1/workspaces/${encodeURIComponent(workspaceId)}/tasks/${encodeURIComponent(taskId)}/priority`,
      { priority },
    );
  },

  updateTaskAssignee: async (
    workspaceId: string,
    taskId: string,
    assigneeId: string | null,
  ): Promise<void> => {
    await api.patch(
      `/api/v1/workspaces/${encodeURIComponent(workspaceId)}/tasks/${encodeURIComponent(taskId)}/assignee`,
      { assigneeId: assigneeId || null },
    );
  },

  deleteTask: async (workspaceId: string, taskId: string): Promise<void> => {
    await api.delete(
      `/api/v1/workspaces/${encodeURIComponent(workspaceId)}/tasks/${encodeURIComponent(taskId)}`,
    );
  },
};
