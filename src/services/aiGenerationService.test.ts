import { beforeEach, expect, it, vi } from "vitest";
const { post } = vi.hoisted(() => ({ post: vi.fn() }));
vi.mock("@/lib/axios", () => ({ api: { post } }));
import { aiGenerationService } from "@/services/aiGenerationService";

beforeEach(() => post.mockReset());
it("generates ambassador portraits with 25 steps at 832 by 1248 through the gateway", async () => {
  post.mockResolvedValue({
    data: {
      success: true,
      data: {
        image_url: "https://example.com/ambassador.png",
        image_type: "ambassador",
      },
    },
  });
  const result = await aiGenerationService.generateAmbassador({
    prompt: "Studio portrait",
  });
  expect(post).toHaveBeenCalledExactlyOnceWith(
    "/api/v1/ai/ambassadors/generate",
    {
      prompt: "Studio portrait",
      steps: 25,
      width: 832,
      height: 1248,
    },
  );
  expect(result.image_url).toBe("https://example.com/ambassador.png");
});
