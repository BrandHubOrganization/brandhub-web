import { api } from "@/services/api";
import { requireApiData } from "@/lib/apiData";
import type { ApiResponse } from "@/services/authService";
import type {
  TaskAssignmentFields,
  TaskDetailFields,
  TaskMemberOption,
  TaskWorkflow,
} from "@/pages/tasks/types/taskWorkflow";
import { canonicalTaskStatus } from "@/pages/tasks/taskStatus";

function scoped(workspaceId: string, taskId: string) {
  return `/api/v1/workspaces/${encodeURIComponent(workspaceId)}/tasks/${encodeURIComponent(taskId)}`;
}
function workflow(body: unknown, workspaceId: string, taskId: string) {
  const result = requireApiData<TaskWorkflow>(body);
  if (
    !result ||
    result.id !== taskId ||
    result.workspaceId !== workspaceId ||
    typeof result.allowedActions?.canEditDetail !== "boolean" ||
    typeof result.allowedActions?.canAssign !== "boolean" ||
    typeof result.allowedActions?.canStart !== "boolean" ||
    !Array.isArray(result.inputReferences) ||
    typeof result.dates?.ready !== "boolean"
  )
    throw new Error("INVALID_TASK_WORKFLOW");
  return { ...result, status: canonicalTaskStatus(result.status) };
}
export const taskWorkflowService = {
  async field(
    workspaceId: string,
    taskId: string,
    fields: { field: string; value: unknown; expectedRevision: number },
  ) {
    const response = await api.patch(
      `${scoped(workspaceId, taskId)}/field`,
      fields,
    );
    return workflow(response.data, workspaceId, taskId);
  },
  async read(workspaceId: string, taskId: string) {
    const response = await api.get<ApiResponse<TaskWorkflow>>(
      `${scoped(workspaceId, taskId)}/workflow`,
    );
    return workflow(response.data, workspaceId, taskId);
  },
  async options(workspaceId: string, taskId: string) {
    const response = await api.get<ApiResponse<TaskMemberOption[]>>(
      `${scoped(workspaceId, taskId)}/member-options`,
    );
    const options = requireApiData<TaskMemberOption[]>(response.data);
    if (
      !Array.isArray(options) ||
      !options.every(
        (option) =>
          typeof option.userId === "string" &&
          typeof option.displayName === "string",
      )
    )
      throw new Error("INVALID_TASK_MEMBERS");
    return options;
  },
  async detail(workspaceId: string, taskId: string, fields: TaskDetailFields) {
    const response = await api.patch<ApiResponse<TaskWorkflow>>(
      `${scoped(workspaceId, taskId)}/detail`,
      fields,
    );
    return workflow(response.data, workspaceId, taskId);
  },
  async assign(
    workspaceId: string,
    taskId: string,
    fields: TaskAssignmentFields,
  ) {
    const response = await api.post<ApiResponse<TaskWorkflow>>(
      `${scoped(workspaceId, taskId)}/assign`,
      fields,
    );
    return workflow(response.data, workspaceId, taskId);
  },
  async start(workspaceId: string, taskId: string, expectedRevision: number) {
    const response = await api.post<ApiResponse<TaskWorkflow>>(
      `${scoped(workspaceId, taskId)}/start`,
      { expectedRevision },
    );
    return workflow(response.data, workspaceId, taskId);
  },
};
