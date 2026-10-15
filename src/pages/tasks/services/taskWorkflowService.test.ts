import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
}));
vi.mock("@/services/api", () => ({ api: mocks }));
import { taskWorkflowService as service } from "@/pages/tasks/services/taskWorkflowService";
const task = {
  id: "task",
  workspaceId: "workspace",
  inputReferences: [],
  allowedActions: { canEditDetail: true, canAssign: false, canStart: false },
  dates: { ready: true },
};
beforeEach(() => {
  vi.resetAllMocks();
});
describe("Task workflow API contract", () => {
  it("patches only one field with its revision, including explicit null", async () => {
    mocks.patch.mockResolvedValue({ data: { success: true, data: task } });
    const fields = { field: "dueDate", value: null, expectedRevision: 2 };
    await service.field("workspace", "task", fields);
    expect(mocks.patch).toHaveBeenCalledWith(
      "/api/v1/workspaces/workspace/tasks/task/field",
      fields,
    );
  });
  it("reads dedicated workflow without opening editor content", async () => {
    mocks.get.mockResolvedValue({ data: { success: true, data: task } });
    expect(await service.read("workspace", "task")).toEqual(task);
    expect(mocks.get).toHaveBeenCalledWith(
      "/api/v1/workspaces/workspace/tasks/task/workflow",
    );
  });
  it("forwards mandatory revision and optional QC/client configuration", async () => {
    mocks.post.mockResolvedValue({ data: { success: true, data: task } });
    const fields = {
      assigneeId: "creator",
      qcAssigneeId: null,
      requiresClientApproval: true,
      expectedRevision: 3,
    };
    await service.assign("workspace", "task", fields);
    expect(mocks.post).toHaveBeenCalledWith(
      "/api/v1/workspaces/workspace/tasks/task/assign",
      fields,
    );
    await service.start("workspace", "task", 4);
    expect(mocks.post).toHaveBeenLastCalledWith(
      "/api/v1/workspaces/workspace/tasks/task/start",
      { expectedRevision: 4 },
    );
  });
  it("keeps detail update separate from specialised editor content", async () => {
    mocks.patch.mockResolvedValue({ data: { success: true, data: task } });
    const fields = {
      description: "requirements",
      dueDate: "2026-10-16T00:00:00Z",
      plannedPublishAt: null,
      inputReferences: [],
      expectedRevision: 0,
    };
    await service.detail("workspace", "task", fields);
    expect(mocks.patch).toHaveBeenCalledWith(
      "/api/v1/workspaces/workspace/tasks/task/detail",
      fields,
    );
  });
  it.each([401, 403, 409, 500, 503])(
    "propagates HTTP %i without fake success",
    async (status) => {
      const error = { response: { status } };
      mocks.get.mockRejectedValue(error);
      await expect(service.read("workspace", "task")).rejects.toBe(error);
    },
  );
  it.each([
    { ...task, workspaceId: "other" },
    { ...task, id: "other" },
    { ...task, allowedActions: {} },
  ])("rejects malformed/cross-scope workflow", async (result) => {
    mocks.get.mockResolvedValue({ data: { success: true, data: result } });
    await expect(service.read("workspace", "task")).rejects.toThrow(
      "INVALID_TASK_WORKFLOW",
    );
  });
});
