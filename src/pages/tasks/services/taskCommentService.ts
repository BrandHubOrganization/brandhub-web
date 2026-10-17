import { api } from "@/services/api";
import { requireApiData } from "@/lib/apiData";
import type {
  TaskComment,
  TaskCommentPage,
  CommentMember,
  CommentUpload,
  CommentRequest,
} from "@/pages/tasks/types/taskComment";

const base = (workspaceId: string, taskId: string) =>
  `/api/v1/workspaces/${encodeURIComponent(workspaceId)}/tasks/${encodeURIComponent(taskId)}`;
export const taskCommentService = {
  async list(
    workspaceId: string,
    taskId: string,
    cursor: string | null,
    signal?: AbortSignal,
  ) {
    const response = await api.get(`${base(workspaceId, taskId)}/comments`, {
      params: { cursor: cursor || undefined, limit: 30 },
      signal,
    });
    const page = requireApiData<TaskCommentPage>(response.data);
    if (!Array.isArray(page.items)) throw new Error("INVALID_TASK_COMMENTS");
    return page;
  },
  async create(workspaceId: string, taskId: string, request: CommentRequest) {
    const response = await api.post(
      `${base(workspaceId, taskId)}/comments`,
      request,
    );
    const result = requireApiData<TaskComment>(response.data);
    if (
      !result ||
      typeof result.id !== "string" ||
      result.taskId !== taskId ||
      result.clientRequestId !== request.clientRequestId
    )
      throw new Error("INVALID_TASK_COMMENT");
    return result;
  },
  async members(
    workspaceId: string,
    taskId: string,
    search: string,
    page: number,
    signal?: AbortSignal,
  ) {
    const response = await api.get(
      `${base(workspaceId, taskId)}/comment-members`,
      { params: { search, page }, signal },
    );
    return requireApiData<{ items: CommentMember[]; hasMore: boolean }>(
      response.data,
    );
  },
  async upload(
    workspaceId: string,
    taskId: string,
    file: File,
    progress: (percent: number) => void,
  ) {
    const body = new FormData();
    body.append("file", file);
    const response = await api.post(
      `${base(workspaceId, taskId)}/comment-uploads`,
      body,
      {
        onUploadProgress: (event) =>
          progress(
            Math.round((100 * event.loaded) / (event.total || file.size)),
          ),
      },
    );
    return requireApiData<CommentUpload>(response.data);
  },
  async image(
    workspaceId: string,
    taskId: string,
    id: string,
    signal?: AbortSignal,
  ) {
    const response = await api.get<Blob>(
      `${base(workspaceId, taskId)}/comment-uploads/${encodeURIComponent(id)}/content`,
      { responseType: "blob", signal },
    );
    return response.data;
  },
};
