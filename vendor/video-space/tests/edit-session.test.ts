import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  applyPendingEditPlan,
  requestEditPlan,
} from "../src/brandhub/edit-session";
import { editingBasis } from "../src/brandhub/snapshot";

const mocks = vi.hoisted(() => ({
  save: vi.fn(),
  request: vi.fn(),
  apply: vi.fn(),
  project: null as any,
}));
vi.mock("@/brandhub/api", () => ({
  API_BASE: "/projects",
  projectRequest: mocks.request,
}));
vi.mock("@/brandhub/sync", () => ({
  currentProject: () => mocks.project,
  saveToServer: mocks.save,
}));
vi.mock("@/brandhub/apply-plan", () => ({ applyEditPlan: mocks.apply }));
const plan = {
  summary: "Rename",
  actions: [{ kind: "rename_project", text: "New" }],
  base_revision: 1,
};
const editor: any = {
  scenes: { getActiveScene: () => mocks.project.scenes[0] },
  project: { getActive: () => mocks.project },
};
beforeEach(() => {
  vi.resetAllMocks();
  mocks.project = {
    metadata: {
      id: "project",
      name: "Original",
      createdAt: new Date(),
      updatedAt: new Date(),
      videoSpaceRevision: 1,
    },
    settings: {},
    currentSceneId: "scene",
    scenes: [
      {
        id: "scene",
        tracks: { main: { id: "main", elements: [] }, overlay: [], audio: [] },
      },
    ],
  };
  mocks.save.mockResolvedValue({ id: "project", revision: 1 });
  mocks.request.mockResolvedValue(plan);
});
describe("assistant asynchronous editing basis", () => {
  it("saves first and sends only canonical revision and instruction", async () => {
    const pending = await requestEditPlan(editor, " Rename project ");
    expect(pending.plan).toEqual(plan);
    expect(mocks.save).toHaveBeenCalledOnce();
    expect(mocks.request).toHaveBeenCalledWith({
      path: "/projects/project/edit-plans",
      options: {
        method: "POST",
        body: JSON.stringify({
          expected_revision: 1,
          instruction: "Rename project",
        }),
      },
    });
  });
  it("keeps a manual edit during saving and never sends a stale AI request", async () => {
    mocks.save.mockImplementation(async () => {
      mocks.project.metadata.name = "Manual edit";
      return { id: "project", revision: 1 };
    });
    await expect(requestEditPlan(editor, "Rename")).rejects.toThrow(
      "VIDEO_EDIT_PLAN_STALE",
    );
    expect(mocks.request).not.toHaveBeenCalled();
    expect(mocks.project.metadata.name).toBe("Manual edit");
  });
  it("rejects a late AI response after a local edit or project switch", async () => {
    mocks.request.mockImplementation(async () => {
      mocks.project.metadata.id = "other-project";
      return plan;
    });
    await expect(requestEditPlan(editor, "Rename")).rejects.toThrow(
      "VIDEO_EDIT_PLAN_STALE",
    );
    expect(mocks.apply).not.toHaveBeenCalled();
  });
  it("checks the base revision returned by planning", async () => {
    mocks.request.mockResolvedValue({ ...plan, base_revision: 2 });
    await expect(requestEditPlan(editor, "Rename")).rejects.toThrow(
      "VIDEO_EDIT_PLAN_STALE",
    );
  });
  it("rejects a plan stale before applying without querying or changing the timeline", async () => {
    const pending = { plan, basis: editingBasis(mocks.project) };
    mocks.project.metadata.name = "Manual edit";
    await expect(applyPendingEditPlan(editor, pending as any)).rejects.toThrow(
      "VIDEO_EDIT_PLAN_STALE",
    );
    expect(mocks.request).not.toHaveBeenCalled();
    expect(mocks.apply).not.toHaveBeenCalled();
  });
  it("rejects a remote revision conflict or a manual edit during the revision query", async () => {
    const pending = { plan, basis: editingBasis(mocks.project) };
    mocks.request.mockResolvedValue({ revision: 2 });
    await expect(applyPendingEditPlan(editor, pending as any)).rejects.toThrow(
      "VIDEO_EDIT_PLAN_STALE",
    );
    mocks.request.mockImplementation(async () => {
      mocks.project.metadata.name = "Manual edit";
      return { revision: 1 };
    });
    await expect(applyPendingEditPlan(editor, pending as any)).rejects.toThrow(
      "VIDEO_EDIT_PLAN_STALE",
    );
    expect(mocks.apply).not.toHaveBeenCalled();
    expect(mocks.project.metadata.name).toBe("Manual edit");
  });
  it("applies once after both local and remote checks pass", async () => {
    const pending = { plan, basis: editingBasis(mocks.project) };
    mocks.request.mockResolvedValue({ revision: 1 });
    await applyPendingEditPlan(editor, pending as any);
    expect(mocks.apply).toHaveBeenCalledExactlyOnceWith({ editor, plan });
  });
});
