import { api } from "@/services/api";
import { requireApiData } from "@/lib/apiData";
import type {
  ReviewAction,
  ReviewExpected,
  TaskApprovalPage,
  TaskReview,
} from "@/pages/tasks/types/taskApproval";

function route(workspaceId: string, taskId: string) {
  return `/api/v1/workspaces/${encodeURIComponent(workspaceId)}/tasks/${encodeURIComponent(taskId)}`;
}

function review(body: unknown, workspaceId: string, taskId: string) {
  const result = requireApiData<TaskReview>(body);
  if (
    result.workspaceId !== workspaceId ||
    result.taskId !== taskId ||
    !Number.isSafeInteger(result.approvalRound) ||
    result.approvalRound < 1 ||
    (result.workflowRevision !== null &&
      (!Number.isSafeInteger(result.workflowRevision) ||
        result.workflowRevision < 0)) ||
    typeof result.supportedType !== "boolean" ||
    ["canSubmit", "canWithdraw", "canApprove", "canReject"].some(
      (key) =>
        typeof result.allowedActions?.[
          key as keyof TaskReview["allowedActions"]
        ] !== "boolean",
    )
  )
    throw new Error("INVALID_TASK_REVIEW");
  return result;
}

export const taskApprovalService = {
  async read(workspaceId: string, taskId: string) {
    const response = await api.get(`${route(workspaceId, taskId)}/review`);
    return review(response.data, workspaceId, taskId);
  },
  async submit(
    workspaceId: string,
    taskId: string,
    expected: {
      expectedRevision: number;
      expectedApprovalRound: number;
      expectedPostContentVersion: number;
    },
  ) {
    const response = await api.post(
      `${route(workspaceId, taskId)}/submit`,
      expected,
    );
    return review(response.data, workspaceId, taskId);
  },
  async act(
    workspaceId: string,
    taskId: string,
    input: { action: ReviewAction; expected: ReviewExpected },
  ) {
    const response = await api.post(
      `${route(workspaceId, taskId)}/${input.action}`,
      input.expected,
    );
    return review(response.data, workspaceId, taskId);
  },
  async history(workspaceId: string, taskId: string, cursor: string | null) {
    const response = await api.get(`${route(workspaceId, taskId)}/approvals`, {
      params: { limit: 30, ...(cursor ? { cursor } : {}) },
    });
    const result = requireApiData<TaskApprovalPage>(response.data);
    if (
      !Array.isArray(result.items) ||
      result.items.some(
        (item) =>
          item.taskId !== taskId ||
          !item.id ||
          !Number.isSafeInteger(item.approvalRound) ||
          item.approvalRound < 1 ||
          !["APPROVE", "REJECT"].includes(item.action),
      ) ||
      (result.nextCursor !== null && typeof result.nextCursor !== "string")
    )
      throw new Error("INVALID_TASK_APPROVAL_HISTORY");
    return result;
  },
};
