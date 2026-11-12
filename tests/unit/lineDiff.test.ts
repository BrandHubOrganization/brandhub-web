import { describe, expect, it } from "vitest";
import { fieldText, lineDiff } from "@/components/task-sections/lineDiff";

describe("lineDiff", () => {
  it("marks kept, removed and added lines in order", () => {
    expect(lineDiff("a\nb\nc", "a\nx\nc\nd")).toEqual([
      { type: "same", text: "a" },
      { type: "del", text: "b" },
      { type: "add", text: "x" },
      { type: "same", text: "c" },
      { type: "add", text: "d" },
    ]);
  });
  it("handles empty sides", () => {
    expect(lineDiff("", "a")).toEqual([{ type: "add", text: "a" }]);
    expect(lineDiff("a", "")).toEqual([{ type: "del", text: "a" }]);
  });
  it("renders list rows one per line", () => {
    expect(fieldText([{ scene: "1", line: "Hi" }, { scene: "2", line: "" }])).toBe(
      "1 · Hi\n2",
    );
  });
});
