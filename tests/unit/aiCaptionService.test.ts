import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "@/lib/axios";
import { queryClient } from "@/lib/queryClient";
import { aiCaptionService } from "@/services/aiCaptionService";

vi.mock("@/lib/axios", () => ({ api: { post: vi.fn(), get: vi.fn() } }));
vi.mock("@/i18n", () => ({ default: { t: (key: string) => key } }));
vi.mock("@/lib/queryClient", () => ({
  queryClient: { invalidateQueries: vi.fn() },
}));
vi.mock("@/store/authStore", () => ({
  useAuthStore: { getState: () => ({ user: { id: "creator" } }) },
}));
vi.mock("@/store/workspaceStore", () => ({
  useWorkspaceStore: {
    getState: () => ({ currentWorkspace: { id: "other" } }),
  },
}));

const calls = [
  {
    operation: "generate",
    suffix: "",
    body: {
      topic: "A factual product announcement",
      tone: "friendly",
      platform: "facebook",
      length: "medium",
      language: "vi",
      goal: "announcement",
      trendId: "trend:2026-11-03:all:example",
    } as const,
    run() {
      return aiCaptionService.generate("workspace", this.body);
    },
  },
  {
    operation: "refine",
    suffix: "/refine",
    body: {
      caption: "Draft",
      instruction: "shorter",
      platform: "facebook",
      language: "vi",
    } as const,
    run() {
      return aiCaptionService.refine("workspace", this.body);
    },
  },
  {
    operation: "adapt",
    suffix: "/adapt",
    body: {
      caption: "Draft",
      platforms: ["facebook"],
      language: "vi" as const,
    },
    run() {
      return aiCaptionService.adapt("workspace", this.body);
    },
  },
];

beforeEach(() => vi.resetAllMocks());

describe("caption credit request contract", () => {
  it.each(calls)(
    "$operation carries scoped credit headers and preserves its response",
    async (call) => {
      const result = {
        generationId: "generation",
        drafts: [],
        captions: [],
        creditsUsed: 1,
      };
      vi.mocked(api.post).mockResolvedValue({ data: { data: result } });

      expect(await call.run()).toEqual(result);
      expect(api.post).toHaveBeenCalledWith(
        `/api/v1/workspaces/workspace/ai/captions${call.suffix}`,
        call.body,
        expect.objectContaining({
          headers: {
            "X-AI-Workspace-Id": "workspace",
            "Idempotency-Key": expect.stringMatching(/^[0-9a-f-]{36}$/),
          },
        }),
      );
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ["credit", "creator"],
      });
    },
  );

  it("refreshes credit after failure and uses a new key for a separate submission", async () => {
    const failure = new Error("request rejected");
    vi.mocked(api.post)
      .mockRejectedValueOnce(failure)
      .mockResolvedValueOnce({ data: { data: {} } });
    await expect(calls[0].run()).rejects.toBe(failure);
    await calls[0].run();

    const requests = vi.mocked(api.post).mock.calls;
    const first = requests[0][2]?.headers?.["Idempotency-Key"];
    const second = requests[1][2]?.headers?.["Idempotency-Key"];
    expect(first).toBeTruthy();
    expect(second).not.toBe(first);
    expect(queryClient.invalidateQueries).toHaveBeenCalledTimes(4);
  });
});
