import { describe, expect, it } from "vitest";
import { postInputWithMaterial } from "@/pages/editor/types/taskPostDraft";
import type { PostResponse } from "@/services/postService";

const post = {
  id: "p1",
  workspaceId: "w1",
  status: "DRAFT",
  caption: "Hello",
  hashtags: ["a"],
  targetPlatforms: ["TIKTOK"],
  aiGenerated: false,
  createdAt: "",
  updatedAt: "",
  media: [
    { url: "https://cdn/x.png", s3Key: "uploads/x.png", mediaType: "IMAGE" },
    { url: "https://signed/take?sig=1", materialId: "m0", mediaType: "VIDEO" },
  ],
} as PostResponse;

describe("postInputWithMaterial", () => {
  it("appends the take and keeps fields and stable media sources", () => {
    expect(postInputWithMaterial(post, "m1", "VIDEO")).toEqual({
      caption: "Hello",
      hashtags: ["a"],
      targetPlatforms: ["TIKTOK"],
      aiGenerated: false,
      media: [
        { s3Key: "uploads/x.png", mediaType: "IMAGE" },
        { materialId: "m0", mediaType: "VIDEO" },
        { materialId: "m1", mediaType: "VIDEO" },
      ],
    });
  });

  it("never persists a signed preview URL for a material", () => {
    const body = JSON.stringify(postInputWithMaterial(post, "m1", "VIDEO"));
    expect(body).not.toContain("signed");
  });
});
