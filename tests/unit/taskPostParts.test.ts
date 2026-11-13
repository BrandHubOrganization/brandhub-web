import { describe, expect, it } from "vitest";
import {
  changedPostParts,
  emptyTaskDraft,
  postPartKey,
} from "@/pages/editor/types/taskPostDraft";

describe("post parts", () => {
  it("lists only the parts that changed", () => {
    const saved = emptyTaskDraft();
    expect(changedPostParts(saved, { ...saved })).toEqual([]);
    expect(
      changedPostParts(saved, {
        ...saved,
        hashtags: ["#a"],
        targetPlatforms: ["TIKTOK"],
      }),
    ).toEqual(["CAPTION", "CHANNELS"]);
    expect(changedPostParts(saved, { ...saved, mediaUrls: ["u"] })).toEqual([
      "MEDIA",
    ]);
  });

  it("maps short-video media to VIDEO.EDIT", () => {
    expect(postPartKey([{ key: "POST.BRIEF" }], "MEDIA")).toBe("POST.MEDIA");
    expect(postPartKey([{ key: "VIDEO.SCRIPT" }], "MEDIA")).toBe("VIDEO.EDIT");
    expect(postPartKey([{ key: "VIDEO.SCRIPT" }], "CAPTION")).toBe(
      "VIDEO.CAPTION",
    );
  });
});
