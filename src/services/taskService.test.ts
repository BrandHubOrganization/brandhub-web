import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("@/services/api", () => ({ api: mocks }));
import { taskService } from "./taskService";
beforeEach(() => {
  mocks.get.mockReset();
});
const page = {
  content: [],
  page: 0,
  size: 20,
  totalElements: 0,
  totalPages: 0,
  last: true,
};
describe("real Workspace Task transport", () => {
  it("normalizes Spring Page.number without losing pagination metadata", async () => {
    const { page: _page, ...metadata } = page;
    mocks.get.mockResolvedValue({
      data: {
        success: true,
        data: {
          ...metadata,
          number: 2,
          totalPages: 4,
          totalElements: 70,
          last: false,
        },
      },
    });
    const result = await taskService.getWorkspaceTasks("ws", { page: 2 });
    expect(result).toMatchObject({
      page: 2,
      totalPages: 4,
      totalElements: 70,
      last: false,
    });
  });
  it("uses the versioned endpoint and forwards filters", async () => {
    mocks.get.mockResolvedValue({ data: { success: true, data: page } });
    expect(
      await taskService.getWorkspaceTasks("ws", {
        status: "CANCELLED",
        type: "EVENT_PLAN",
        search: "  proposal  ",
        campaignId: "campaign",
      }),
    ).toEqual(page);
    expect(mocks.get).toHaveBeenCalledWith("/api/v1/workspaces/ws/tasks", {
      params: {
        page: 0,
        size: 20,
        sort: "createdAt",
        direction: "desc",
        status: "CANCELLED",
        type: "EVENT_PLAN",
        search: "proposal",
        campaignId: "campaign",
      },
    });
  });
  it.each([401, 403, 500])(
    "does not fall back to mock on HTTP %i",
    async (status) => {
      const error = { response: { status } };
      mocks.get.mockRejectedValue(error);
      await expect(taskService.getWorkspaceTasks("ws")).rejects.toBe(error);
    },
  );
  it.each([
    {},
    { success: true, data: {} },
    { success: false, data: page },
    {
      success: true,
      data: { ...page, content: [{ id: "task", workspaceId: "other" }] },
    },
  ])("rejects malformed or cross-Workspace response %j", async (body) => {
    mocks.get.mockResolvedValue({ data: body });
    await expect(taskService.getWorkspaceTasks("ws")).rejects.toThrow();
  });
  it("preserves Campaign and supplemental Request Task identity", async () => {
    const content = ["CAMPAIGN", "CONTENT_REQUEST"].map((sourceType, i) => ({
      id: `task-${i}`,
      workspaceId: "ws",
      campaignId: "c",
      sourceType,
      sourceRefId: "ref",
    }));
    mocks.get.mockResolvedValue({
      data: {
        success: true,
        data: { ...page, content, totalElements: 2, totalPages: 1 },
      },
    });
    expect((await taskService.getWorkspaceTasks("ws")).content).toEqual(
      content,
    );
  });
});
