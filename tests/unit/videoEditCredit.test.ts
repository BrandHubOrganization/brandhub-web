import { beforeEach, expect, it, vi } from "vitest";
import { postAiWithCredit } from "@/services/aiCreditRequest";
import { api } from "@/lib/axios";

vi.mock("@/lib/axios", () => ({ api: { post: vi.fn() } }));
vi.mock("@/i18n", () => ({ default: { t: (key: string) => key } }));
vi.mock("@/lib/queryClient", () => ({
  queryClient: { invalidateQueries: vi.fn() },
}));
vi.mock("@/store/authStore", () => ({
  useAuthStore: { getState: () => ({ user: { id: "owner" } }) },
}));
vi.mock("@/store/workspaceStore", () => ({
  useWorkspaceStore: {
    getState: () => ({ currentWorkspace: { id: "other-workspace" } }),
  },
}));
beforeEach(() => vi.clearAllMocks());
it("generates fresh host idempotency keys and the route's workspace credit header", async () => {
  vi.mocked(api.post).mockResolvedValue({
    status: 200,
    data: { success: true, data: {} },
  });
  const path =
    "/api/v1/workspaces/11111111-1111-4111-8111-111111111111/video-projects/22222222-2222-4222-8222-222222222222/edit-plans";
  const signal = new AbortController().signal;
  const payload = { expected_revision: 1, instruction: "Rename" };
  await postAiWithCredit(path, payload, {
    signal,
    workspaceId: "11111111-1111-4111-8111-111111111111",
  });
  await postAiWithCredit(path, payload, {
    signal,
    workspaceId: "11111111-1111-4111-8111-111111111111",
  });
  const calls = vi.mocked(api.post).mock.calls;
  const first = calls[0][2]!;
  const second = calls[1][2]!;
  expect(first.signal).toBe(signal);
  expect(first.headers).toEqual({
    "X-AI-Workspace-Id": "11111111-1111-4111-8111-111111111111",
    "Idempotency-Key": expect.stringMatching(/^[a-f0-9-]{36}$/),
  });
  expect(first.headers!["Idempotency-Key"]).not.toBe(
    second.headers!["Idempotency-Key"],
  );
});
