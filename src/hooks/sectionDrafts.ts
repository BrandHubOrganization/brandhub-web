import type { TaskSection } from "@/types/task";

/** Unsaved local content of one section. `base` = server revision the edit started from. */
export interface SectionDraft {
  content: Record<string, unknown>;
  base: number;
  edit: number;
}
export type SectionDrafts = Record<string, SectionDraft>;
export type SectionSaveState = "saving" | "saved" | "error" | "conflict";

export function editDraft(
  drafts: SectionDrafts,
  section: TaskSection,
  patch: Record<string, unknown>,
): SectionDrafts {
  const prev = drafts[section.key];
  return {
    ...drafts,
    [section.key]: {
      content: { ...(prev?.content ?? section.content), ...patch },
      base: prev?.base ?? section.revision,
      edit: (prev?.edit ?? 0) + 1,
    },
  };
}

/** Saved edit `sentEdit` at `revision`: drop the draft, or rebase it when the user kept typing meanwhile. */
export function afterSave(
  drafts: SectionDrafts,
  key: string,
  sentEdit: number,
  revision: number,
): SectionDrafts {
  const draft = drafts[key];
  if (!draft) return drafts;
  const next = { ...drafts };
  if (draft.edit === sentEdit) delete next[key];
  else next[key] = { ...draft, base: revision };
  return next;
}

export function dropDraft(drafts: SectionDrafts, key: string): SectionDrafts {
  if (!drafts[key]) return drafts;
  const next = { ...drafts };
  delete next[key];
  return next;
}

export function upsertSection(
  list: TaskSection[] | undefined,
  section: TaskSection,
): TaskSection[] | undefined {
  return list?.map((s) => (s.key === section.key ? section : s));
}
