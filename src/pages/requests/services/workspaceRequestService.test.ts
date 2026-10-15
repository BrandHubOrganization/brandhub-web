import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), patch: vi.fn() }));
vi.mock("@/services/api", () => ({ api: mocks }));
import { workspaceRequestService as service } from "./workspaceRequestService";

beforeEach(() => { mocks.get.mockReset(); mocks.post.mockReset(); mocks.patch.mockReset(); });
describe("Content Request query data", () => {
  it("returns a valid empty page", async () => {
    const page = { items: [], total: 0, page: 0, size: 20, totalPages: 0, canCreate: true, workspaceRole: "CLIENT" };
    mocks.get.mockResolvedValue({ data: { success: true, data: page } });
    expect(await service.list("workspace", { page: 0, status: "", search: "" })).toEqual(page);
  });
  it.each([{}, "<html>", { success: true }, { success: false, data: {} }])(
    "rejects malformed page/detail %j", async body => {
      mocks.get.mockResolvedValue({ data: body });
      await expect(service.list("workspace", { page: 0, status: "", search: "" })).rejects.toThrow();
      await expect(service.detail("workspace", "request")).rejects.toThrow();
    });
  it("propagates HTTP errors instead of replacing them with empty data", async () => {
    const error = new Error("Unauthorized");
    mocks.get.mockRejectedValue(error);
    await expect(service.list("workspace", { page: 0, status: "", search: "" })).rejects.toBe(error);
  });
});
