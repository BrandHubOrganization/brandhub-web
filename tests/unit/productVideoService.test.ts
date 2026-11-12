import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "@/services/api";
import {
  productVideoService,
  canApproveProduction,
} from "@/pages/product-video/services/productVideoService";
import type { ProductVideoProduction } from "@/pages/product-video/types/productVideo";

vi.mock("@/services/api", () => ({ api: { get: vi.fn(), post: vi.fn() } }));
const ready = {
  productionId: "production",
  projectId: "project",
  revision: 2,
  state: "PLAN_READY",
  providerReady: true,
  missingInputs: [],
  quote: {
    quoteId: "quote",
    units: 2,
    unitCredits: 10,
    totalCredits: 20,
    expiresAt: "2026-10-30T12:00:00Z",
  },
} as ProductVideoProduction;
beforeEach(() => vi.clearAllMocks());
describe("product storyboard approval", () => {
  it("permits only the unchanged actionable current quote before expiry", () => {
    const now = Date.parse("2026-10-30T11:00:00Z");
    expect(canApproveProduction(ready, false, now)).toBe(true);
    expect(canApproveProduction(ready, true, now)).toBe(false);
    expect(canApproveProduction(ready, false, now + 3600000)).toBe(false);
    expect(
      canApproveProduction({ ...ready, providerReady: false }, false, now),
    ).toBe(false);
    expect(
      canApproveProduction({ ...ready, state: "GENERATING" }, false, now),
    ).toBe(false);
    expect(
      canApproveProduction(
        { ...ready, missingInputs: ["PACKAGING_IMAGE_REQUIRED"] },
        false,
        now,
      ),
    ).toBe(false);
    expect(api.post).not.toHaveBeenCalled();
  });
  it("planning never invokes paid generation", async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: { success: true, data: ready },
    });
    const request = {
      productionId: null,
      projectId: "project",
      expectedRevision: 0,
      brief: {},
      sceneEdits: [],
    };
    await productVideoService.plan("workspace", request as never);
    expect(api.post).toHaveBeenCalledOnce();
    expect(api.post).toHaveBeenCalledWith(
      "/api/v1/workspaces/workspace/ai/video-productions/plan",
      request,
      expect.anything(),
    );
  });
  it("passes the approved revision and stable idempotency key only on explicit generation", async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: { success: true, data: ready },
    });
    await productVideoService.generate(
      "workspace",
      "production",
      { revision: 2, quoteId: "quote" },
      "same-key",
    );
    expect(api.post).toHaveBeenCalledWith(
      "/api/v1/workspaces/workspace/ai/video-productions/production/generate",
      { revision: 2, quoteId: "quote" },
      expect.objectContaining({ headers: { "Idempotency-Key": "same-key" } }),
    );
  });
  it("quotes a failed scene separately, and render retry carries no price or source regeneration", async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: { success: true, data: ready.quote },
    });
    await productVideoService.retryQuote("workspace", "production", "scene", 2);
    expect(api.post).toHaveBeenLastCalledWith(
      expect.stringContaining("/scenes/scene/retry"),
      { revision: 2 },
      expect.anything(),
    );
    await productVideoService.retryRender(
      "workspace",
      "production",
      2,
      "render-key",
    );
    expect(api.post).toHaveBeenLastCalledWith(
      expect.stringContaining("/render-retry"),
      { revision: 2 },
      expect.objectContaining({ headers: { "Idempotency-Key": "render-key" } }),
    );
  });
  it("fetches results as authenticated blobs, rather than a public provider URL", async () => {
    vi.mocked(api.get).mockResolvedValue({ data: new Blob(["video"]) });
    await productVideoService.content("workspace", "production");
    expect(api.get).toHaveBeenCalledWith(
      expect.stringContaining("/production/content"),
      expect.objectContaining({ responseType: "blob" }),
    );
  });
});
