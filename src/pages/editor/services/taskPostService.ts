import { api } from "@/services/api";
import { requireApiData } from "@/lib/apiData";
import type { PostResponse, SavePostInput } from "@/services/postService";

export interface TaskPost {
  post: (PostResponse & { contentVersion: number }) | null;
  taskRevision: number | null;
  canEdit: boolean;
  blockedReason: string | null;
}

function route(workspaceId: string, taskId: string) {
  return `/api/v1/workspaces/${encodeURIComponent(workspaceId)}/tasks/${encodeURIComponent(taskId)}/post`;
}
function result(body: unknown, workspaceId: string) {
  const value = requireApiData<TaskPost>(body);
  if (
    typeof value.canEdit !== "boolean" ||
    (value.post &&
      (value.post.workspaceId !== workspaceId ||
        !value.post.id ||
        !Number.isSafeInteger(value.post.contentVersion)))
  )
    throw new Error("INVALID_TASK_POST");
  return value;
}
export const taskPostService = {
  async read(workspaceId: string, taskId: string) {
    const response = await api.get(route(workspaceId, taskId));
    return result(response.data, workspaceId);
  },
  async save(
    workspaceId: string,
    taskId: string,
    input: {
      expectedRevision: number;
      expectedPostContentVersion: number | null;
      post: SavePostInput;
    },
  ) {
    const response = await api.post(route(workspaceId, taskId), input);
    return result(response.data, workspaceId);
  },
};
