import { describe, expect, it } from "vitest";
import {
  chatInstruction,
  displayAnswer,
  type ChatMessage,
} from "../src/brandhub/chat-context";

describe("project chat context", () => {
  const history: ChatMessage[] = [
    { id: "1", role: "user", text: "Add my title" },
    { id: "2", role: "assistant", text: "Title added", applied: true },
  ];
  it("keeps original messages as context and identifies the latest instruction", () => {
    const text = chatInstruction(history, "Make it shorter");
    expect(text).toContain("Add my title");
    expect(text).toContain("Title added");
    expect(text).toContain("Current user request:\nMake it shorter");
    expect(text).toContain("do not repeat");
  });
  it("preserves complete current intent within the existing request budget", () => {
    const current = "x".repeat(3950);
    const text = chatInstruction(
      [...history, { id: "3", role: "user", text: "old".repeat(2500) }],
      current,
    );
    expect(text.length).toBeLessThanOrEqual(4000);
    expect(text.endsWith(current)).toBe(true);
    expect(chatInstruction([], "hello")).toBe("hello");
  });
  it("shows question answers as readable text rather than a JSON blob", () => {
    expect(
      displayAnswer('[{"question":"Which layout?","answer":"Portrait"}]'),
    ).toBe("Which layout?\nPortrait");
    expect(displayAnswer("Plain answer")).toBe("Plain answer");
  });
});
