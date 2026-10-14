import * as Y from "yjs";
import type { DeltaOp } from "./components/richText";

/** Decodes a base64 Yjs state and returns the plain text of the "content" Y.Text. */
export function yjsStateToText(base64: string | null): string {
  if (!base64) return "";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const doc = new Y.Doc();
  Y.applyUpdate(doc, bytes);
  return doc.getText("content").toString();
}

/**
 * Restore = a normal edit on the live doc. A CRDT can't rewind by merging an
 * older state (merge is a union), so replace the text with the snapshot's
 * content (formatting included). The resulting Yjs update persists and
 * broadcasts like any other edit.
 */
export function applySnapshotToDoc(yDoc: Y.Doc, snapshotBase64: string | null): void {
  if (!snapshotBase64) return;
  const binary = atob(snapshotBase64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const old = new Y.Doc();
  Y.applyUpdate(old, bytes);
  const delta = old.getText("content").toDelta();
  const text = yDoc.getText("content");
  yDoc.transact(() => {
    text.delete(0, text.length);
    text.applyDelta(delta);
  });
}

// ── Diff ────────────────────────────────────────────────────────────────

export interface DiffPart {
  type: "same" | "add" | "del";
  text: string;
}

// LCS table is O(n*m); social posts are short, so cap and fall back to a
// whole-text replace instead of freezing the tab on a pathological input.
const MAX_DIFF_CELLS = 4_000_000;

/** Word-level diff of `before` → `after`. */
export function diffText(before: string, after: string): DiffPart[] {
  const a = before.split(/(\s+)/).filter(Boolean);
  const b = after.split(/(\s+)/).filter(Boolean);
  if (a.length * b.length > MAX_DIFF_CELLS) {
    return [
      ...(before ? [{ type: "del" as const, text: before }] : []),
      ...(after ? [{ type: "add" as const, text: after }] : []),
    ];
  }

  const dp = Array.from(
    { length: a.length + 1 },
    () => new Uint16Array(b.length + 1),
  );
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      dp[i][j] =
        a[i] === b[j]
          ? dp[i + 1][j + 1] + 1
          : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const parts: DiffPart[] = [];
  const push = (type: DiffPart["type"], text: string) => {
    const last = parts[parts.length - 1];
    if (last && last.type === type) last.text += text;
    else parts.push({ type, text });
  };
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      push("same", a[i]);
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      push("del", a[i++]);
    } else {
      push("add", b[j++]);
    }
  }
  while (i < a.length) push("del", a[i++]);
  while (j < b.length) push("add", b[j++]);
  return parts;
}

// ── Publish text (font conversion) ─────────────────────────────────────

// Social platforms render plain Unicode only — bold/italic from the editor
// would be lost. Convert styled runs to the Unicode "Mathematical Sans-Serif"
// letters, which every major platform displays as bold/italic text, so the
// Creator no longer has to round-trip through Unikey/Yantext-style tools.
const BOLD = { upper: 0x1d5d4, lower: 0x1d5ee, digit: 0x1d7ec };
const ITALIC = { upper: 0x1d608, lower: 0x1d622, digit: null };
const BOLD_ITALIC = { upper: 0x1d63c, lower: 0x1d656, digit: 0x1d7ec };

function styleChar(ch: string, bold: boolean, italic: boolean): string {
  const set =
    bold && italic ? BOLD_ITALIC : bold ? BOLD : italic ? ITALIC : null;
  if (!set) return ch;
  const code = ch.charCodeAt(0);
  if (code >= 0x41 && code <= 0x5a)
    return String.fromCodePoint(set.upper + code - 0x41);
  if (code >= 0x61 && code <= 0x7a)
    return String.fromCodePoint(set.lower + code - 0x61);
  if (set.digit !== null && code >= 0x30 && code <= 0x39) {
    return String.fromCodePoint(set.digit + code - 0x30);
  }
  return ch;
}

/**
 * Converts the editor's rich-text delta to the plain Unicode string to post.
 * - Always NFC-normalizes (fixes decomposed Vietnamese from mixed input methods).
 * - Bold/italic runs become Unicode styled letters. Vietnamese letters are
 *   decomposed (NFD), the base Latin letter is styled and its combining marks
 *   kept; `đ/Đ` and any non-Latin character have no styled glyph and stay plain.
 * - List prefixes ("• ", "1. ") are already literal text, so they pass through.
 */
export function toPublishText(delta: DeltaOp[]): string {
  let out = "";
  for (const op of delta) {
    if (typeof op.insert !== "string") continue;
    const { bold, italic } = op.attributes ?? {};
    if (!bold && !italic) {
      out += op.insert.normalize("NFC");
      continue;
    }
    let styled = "";
    for (const ch of op.insert.normalize("NFD")) {
      styled += styleChar(ch, !!bold, !!italic);
    }
    out += styled;
  }
  return out;
}
