import { describe, expect, it } from "vitest";
import {
  planListContinuation,
  planListToggle,
  type ListEdit,
  type ListKind,
} from "./listUtils";

/** Applies a toggle plan to a string the same way the editor applies it to Y.Text. */
function toggle(text: string, from: number, to: number, kind: ListKind) {
  const { edits, caret } = planListToggle(text, from, to, kind);
  let out = text;
  for (const e of edits as ListEdit[]) {
    out = out.slice(0, e.at) + e.insert + out.slice(e.at + e.deleteLen);
  }
  return { out, caret };
}

describe("planListToggle", () => {
  it("TC-LIST-01 adds a bullet to the paragraph under the caret", () => {
    expect(toggle("alpha", 2, 2, "bullet").out).toBe("• alpha");
  });

  it("TC-LIST-02 numbers every selected paragraph 1..n for an ordered list", () => {
    const text = "one\ntwo\nthree";
    expect(toggle(text, 0, text.length, "ordered").out).toBe(
      "1. one\n2. two\n3. three",
    );
  });

  it("TC-LIST-03 only touches the paragraphs the selection spans", () => {
    const text = "a\nb\nc\nd";
    // selection from inside "b" to inside "c"
    expect(toggle(text, 2, 4, "bullet").out).toBe("a\n• b\n• c\nd");
  });

  it("TC-LIST-04 toggles the same kind off when every paragraph already has it", () => {
    expect(toggle("• a\n• b", 0, 7, "bullet").out).toBe("a\nb");
    expect(toggle("1. a\n2. b", 0, 9, "ordered").out).toBe("a\nb");
  });

  it("TC-LIST-05 applies the marker when only some paragraphs are already lists", () => {
    // mixed: not all bullets → every paragraph becomes a bullet, none double-prefixed
    expect(toggle("• a\nb", 0, 5, "bullet").out).toBe("• a\n• b");
  });

  it("TC-LIST-06 switches bullet → ordered and ordered → bullet without stacking prefixes", () => {
    expect(toggle("• a\n• b", 0, 7, "ordered").out).toBe("1. a\n2. b");
    expect(toggle("1. a\n2. b", 0, 9, "bullet").out).toBe("• a\n• b");
  });

  it("TC-LIST-07 handles an empty document (creates an empty first item)", () => {
    expect(toggle("", 0, 0, "bullet").out).toBe("• ");
    expect(toggle("", 0, 0, "ordered").out).toBe("1. ");
  });

  it("TC-LIST-08 handles an empty paragraph between two others", () => {
    expect(toggle("a\n\nb", 0, 4, "bullet").out).toBe("• a\n• \n• b");
  });

  it("TC-LIST-09 does not treat '10.5 km' or '2024' text as an existing marker", () => {
    expect(toggle("10.5 km", 0, 0, "bullet").out).toBe("• 10.5 km");
    expect(toggle("2024", 0, 0, "ordered").out).toBe("1. 2024");
  });

  it("TC-LIST-10 caret lands at the end of the last affected paragraph", () => {
    const { out, caret } = toggle("a\nb", 0, 3, "bullet");
    expect(out).toBe("• a\n• b");
    expect(caret).toBe(out.length);
  });

  it("TC-LIST-11 reversed selection (focus before anchor) gives the same result", () => {
    const text = "x\ny\nz";
    expect(toggle(text, 5, 0, "bullet").out).toBe(
      toggle(text, 0, 5, "bullet").out,
    );
  });
});

describe("planListContinuation", () => {
  it("TC-LIST-12 Enter at the end of a bullet item continues the bullet", () => {
    expect(planListContinuation("• buy milk", 10)).toEqual({
      kind: "newline",
      insert: "\n• ",
    });
  });

  it("TC-LIST-13 Enter in an ordered item increments the number", () => {
    expect(planListContinuation("1. a\n2. b", 9)).toEqual({
      kind: "newline",
      insert: "\n3. ",
    });
    expect(planListContinuation("9. x", 4)).toEqual({
      kind: "newline",
      insert: "\n10. ",
    });
  });

  it("TC-LIST-14 Enter on an empty item exits the list (removes the marker, no newline)", () => {
    expect(planListContinuation("• a\n• ", 6)).toEqual({
      kind: "exit",
      start: 4,
      deleteLen: 2,
    });
    expect(planListContinuation("1. ", 3)).toEqual({
      kind: "exit",
      start: 0,
      deleteLen: 3,
    });
  });

  it("TC-LIST-15 Enter outside any list is a plain newline", () => {
    expect(planListContinuation("hello", 5)).toEqual({
      kind: "newline",
      insert: "\n",
    });
    expect(planListContinuation("", 0)).toEqual({
      kind: "newline",
      insert: "\n",
    });
  });

  it("TC-LIST-16 Enter with the caret inside the marker itself is a plain newline", () => {
    expect(planListContinuation("• item", 1)).toEqual({
      kind: "newline",
      insert: "\n",
    });
  });

  it("TC-LIST-17 Enter in the middle of an item carries the marker (text after caret moves down)", () => {
    expect(planListContinuation("• hello world", 7)).toEqual({
      kind: "newline",
      insert: "\n• ",
    });
  });
});
