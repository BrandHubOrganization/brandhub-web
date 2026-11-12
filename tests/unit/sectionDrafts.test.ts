import { describe, expect, it } from "vitest";
import {
  afterSave,
  dropDraft,
  editDraft,
  upsertSection,
} from "@/hooks/sectionDrafts";
import type { TaskSection } from "@/types/task";

const section = (revision: number, content = {}) =>
  ({ key: "POST.BRIEF", revision, content }) as TaskSection;

describe("section drafts", () => {
  it("keeps the revision the edit started from, even after the server moves on", () => {
    let drafts = editDraft({}, section(3, { notes: "a", sources: [] }), {
      notes: "b",
    });
    drafts = editDraft(drafts, section(5), { notes: "c" });
    expect(drafts["POST.BRIEF"]).toEqual({
      content: { notes: "c", sources: [] },
      base: 3,
      edit: 2,
    });
  });

  it("drops a saved draft, but rebases one the user kept typing in", () => {
    const drafts = editDraft({}, section(1), { notes: "x" });
    expect(afterSave(drafts, "POST.BRIEF", 1, 2)).toEqual({});
    const typed = editDraft(drafts, section(1), { notes: "xy" });
    expect(afterSave(typed, "POST.BRIEF", 1, 2)["POST.BRIEF"].base).toBe(2);
  });

  it("reload drops the draft; upsert replaces by key only", () => {
    expect(dropDraft(editDraft({}, section(1), {}), "POST.BRIEF")).toEqual({});
    const other = { ...section(1), key: "POST.MEDIA" };
    expect(upsertSection([section(1), other], section(9))).toEqual([
      section(9),
      other,
    ]);
  });
});
