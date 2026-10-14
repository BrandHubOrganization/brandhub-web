/**
 * Pure list logic for CanvasTextEditor (FR 3.6.10). Lists are literal text
 * prefixes ("• " / "1. ") rather than a paragraph attribute, so what you see
 * is exactly what gets published to social platforms (plain text only).
 *
 * Trade-offs: wrapped lines don't hang-indent, and inserting an item
 * mid-list doesn't renumber the items below it.
 */

export type ListKind = "bullet" | "ordered";

/** Group 1 captures the number of an ordered item; undefined for a bullet. */
export const LIST_PREFIX_RE = /^(?:• |(\d+)\. )/;

/**
 * One text edit: delete `deleteLen` chars at `at`, then insert `insert` there.
 * A plan's edits are meant to be applied in order — each `at` is valid in the
 * document as it stands after the previous edits.
 */
export interface ListEdit {
  at: number;
  deleteLen: number;
  insert: string;
}

/**
 * Plans toggling `kind` over every paragraph touched by [selStart, selEnd].
 * If all of them are already that kind the markers are removed; otherwise
 * each paragraph gets the marker (replacing the other kind's), with ordered
 * lists numbered 1..n over the affected paragraphs.
 */
export function planListToggle(
  text: string,
  selStart: number,
  selEnd: number,
  kind: ListKind,
): { edits: ListEdit[]; caret: number } {
  const a = Math.min(selStart, selEnd);
  const b = Math.max(selStart, selEnd);
  const start = text.lastIndexOf("\n", a - 1) + 1;
  const nextBreak = text.indexOf("\n", b);
  const end = nextBreak === -1 ? text.length : nextBreak;
  const paragraphs = text.slice(start, end).split("\n");

  const isSameKind = (p: string) => {
    const m = LIST_PREFIX_RE.exec(p);
    return !!m && (kind === "bullet" ? m[1] === undefined : m[1] !== undefined);
  };
  const remove = paragraphs.every(isSameKind);

  const edits: ListEdit[] = [];
  let offset = start;
  let n = 1;
  for (const p of paragraphs) {
    const existing = LIST_PREFIX_RE.exec(p)?.[0] ?? "";
    const next = remove ? "" : kind === "bullet" ? "• " : `${n++}. `;
    if (existing || next) {
      edits.push({ at: offset, deleteLen: existing.length, insert: next });
    }
    offset += p.length - existing.length + next.length + 1;
  }
  return { edits, caret: Math.max(0, offset - 1) };
}

export type ListContinuation =
  | { kind: "newline"; insert: string }
  | { kind: "exit"; start: number; deleteLen: number };

/**
 * What Enter should do with the caret at `caret`: inside a list item it
 * carries the marker onto the new line (ordered lists increment); on an empty
 * item it removes the marker instead of adding a line, ending the list; the
 * caret inside the marker itself, or outside any list, is a plain newline.
 */
export function planListContinuation(text: string, caret: number): ListContinuation {
  const start = text.lastIndexOf("\n", caret - 1) + 1;
  const nextBreak = text.indexOf("\n", caret);
  const para = text.slice(start, nextBreak === -1 ? text.length : nextBreak);
  const m = LIST_PREFIX_RE.exec(para);
  if (!m || caret - start < m[0].length) return { kind: "newline", insert: "\n" };
  if (para === m[0]) return { kind: "exit", start, deleteLen: m[0].length };
  return {
    kind: "newline",
    insert: m[1] !== undefined ? `\n${Number(m[1]) + 1}. ` : "\n• ",
  };
}
