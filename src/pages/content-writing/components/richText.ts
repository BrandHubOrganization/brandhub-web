/**
 * Pure rich-text model for CanvasTextEditor (FR 3.6.10 Phase 4). Drives
 * canvas rendering off Y.Text.toDelta() — a Quill-Delta-shaped array of
 * {insert, attributes} ops — instead of a flat string, so character ranges
 * can carry independent formatting (bold/italic/color/...).
 *
 * No React, no DOM dependency beyond CanvasRenderingContext2D — unit
 * testable with a mocked ctx.
 */

export interface RunAttrs {
  bold?: true;
  italic?: true;
  underline?: true;
  strikethrough?: true;
  color?: string;
  highlight?: string;
  font?: string;
  size?: number;
  link?: string;
  /** Paragraph-level — applied over the whole paragraph's char range via Y.Text.format(), not per-character meaning. */
  align?: "left" | "center" | "right";
}

export interface Run {
  text: string;
  attrs: RunAttrs;
  startIndex: number;
}

export interface DeltaOp {
  insert?: string;
  attributes?: RunAttrs;
}

const DEFAULT_FONT_SIZE = 16;
const DEFAULT_FONT_FAMILY =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

/** Flattens a Y.Text delta into runs with absolute startIndex. Embeds (non-string insert) are skipped — this editor is text-only. */
export function deltaToRuns(delta: DeltaOp[]): Run[] {
  const runs: Run[] = [];
  let index = 0;
  for (const op of delta) {
    if (typeof op.insert !== "string") continue;
    runs.push({
      text: op.insert,
      attrs: op.attributes ?? {},
      startIndex: index,
    });
    index += op.insert.length;
  }
  return runs;
}

/** Builds a canvas ctx.font string for a run's attributes. */
export function fontStringFor(attrs: RunAttrs): string {
  const size = attrs.size ?? DEFAULT_FONT_SIZE;
  const family = attrs.font ?? DEFAULT_FONT_FAMILY;
  const italic = attrs.italic ? "italic " : "";
  const weight = attrs.bold ? "bold " : "";
  return `${italic}${weight}${size}px ${family}`;
}

/** Attributes of the character immediately left of `index` — Google-Docs-style "what would the caret type as". Caret at 0 looks right instead. */
export function attrsAtIndex(runs: Run[], index: number): RunAttrs {
  if (runs.length === 0) return {};
  const probeIndex = index > 0 ? index - 1 : 0;
  for (const run of runs) {
    const end = run.startIndex + run.text.length;
    if (probeIndex >= run.startIndex && probeIndex < end) return run.attrs;
  }
  return runs[runs.length - 1]?.attrs ?? {};
}

const MIXED = "mixed" as const;
export type AttrsOrMixed = {
  [K in keyof RunAttrs]?: RunAttrs[K] | typeof MIXED;
};

/** Attributes over [start, end) — a key is "mixed" when it differs across the range, matching Google Docs' indeterminate toolbar state. */
export function attrsOverRange(
  runs: Run[],
  start: number,
  end: number,
): AttrsOrMixed {
  const keys: (keyof RunAttrs)[] = [
    "bold",
    "italic",
    "underline",
    "strikethrough",
    "color",
    "highlight",
    "font",
    "size",
    "link",
    "align",
  ];
  const result: AttrsOrMixed = {};
  let first = true;

  for (const run of runs) {
    const runEnd = run.startIndex + run.text.length;
    if (runEnd <= start || run.startIndex >= end) continue;
    if (first) {
      for (const key of keys) {
        (result as Record<string, unknown>)[key] = run.attrs[key];
      }
      first = false;
    } else {
      for (const key of keys) {
        const current = (result as Record<string, unknown>)[key];
        if (current === MIXED) continue;
        if (current !== run.attrs[key]) {
          (result as Record<string, unknown>)[key] = MIXED;
        }
      }
    }
  }
  return result;
}

export interface Segment {
  text: string;
  startIndex: number;
  attrs: RunAttrs;
}

export interface RunLine {
  segments: Segment[];
  startIndex: number;
  text: string; // concatenation of segment texts — convenience for caret math reuse
}

// Per-paragraph wrap cache keyed on a signature of the paragraph's runs
// (text + attrs), so a pure formatting change (no text edit) still busts
// the cache correctly.
const runWrapCache = new Map<string, RunLine[]>();

function paragraphSignature(segments: Segment[]): string {
  return segments
    .map((s) => `${s.text}\u0000${JSON.stringify(s.attrs)}`)
    .join("\u0001");
}

/** Splits runs into paragraphs (on \n) and word-wraps each — mirrors the plain-text wrapLines algorithm but measures each word with its own run's font. */
export function wrapRuns(
  ctx: CanvasRenderingContext2D,
  runs: Run[],
  maxWidth: number,
  measure: (ctx: CanvasRenderingContext2D, font: string, str: string) => number,
): RunLine[] {
  // Flatten runs into a single per-character attrs lookup, then split into
  // paragraph-scoped segment lists on "\n" — simplest way to keep mid-run
  // paragraph breaks (a run's text containing "\n") correct.
  const paragraphs: Segment[][] = [[]];
  for (const run of runs) {
    const parts = run.text.split("\n");
    let runIndex = run.startIndex;
    parts.forEach((part, i) => {
      if (part.length > 0) {
        paragraphs[paragraphs.length - 1].push({
          text: part,
          startIndex: runIndex,
          attrs: run.attrs,
        });
      }
      runIndex += part.length;
      if (i < parts.length - 1) {
        paragraphs.push([]);
        runIndex += 1; // consumed "\n"
      }
    });
  }

  const lines: RunLine[] = [];

  for (const segments of paragraphs) {
    const paragraphLines = wrapParagraphSegments(
      ctx,
      segments,
      maxWidth,
      measure,
    );
    for (const line of paragraphLines) lines.push(line);
  }

  return lines;
}

function wrapParagraphSegments(
  ctx: CanvasRenderingContext2D,
  segments: Segment[],
  maxWidth: number,
  measure: (ctx: CanvasRenderingContext2D, font: string, str: string) => number,
): RunLine[] {
  if (segments.length === 0) {
    return [{ segments: [], startIndex: 0, text: "" }];
  }

  const cacheKey = `${maxWidth}|${paragraphSignature(segments)}`;
  const cached = runWrapCache.get(cacheKey);
  if (cached) return cached;

  const paragraphStart = segments[0].startIndex;
  const lines: RunLine[] = [];
  let currentSegments: Segment[] = [];
  let currentWidth = 0;
  let currentText = "";

  const flush = () => {
    if (currentSegments.length === 0 && lines.length > 0) return;
    lines.push({
      segments: currentSegments,
      startIndex: currentSegments[0]?.startIndex ?? paragraphStart,
      text: currentText,
    });
    currentSegments = [];
    currentText = "";
    currentWidth = 0;
  };

  for (const segment of segments) {
    const words = segment.text.split(/(\s+)/).filter((w) => w.length > 0);
    let offset = 0;
    for (const word of words) {
      const font = fontStringFor(segment.attrs);
      const wordWidth = measure(ctx, font, word);
      if (currentSegments.length > 0 && currentWidth + wordWidth > maxWidth) {
        flush();
      }
      const lastSeg = currentSegments[currentSegments.length - 1];
      const wordStart = segment.startIndex + offset;
      if (
        lastSeg &&
        lastSeg.attrs === segment.attrs &&
        lastSeg.startIndex + lastSeg.text.length === wordStart
      ) {
        lastSeg.text += word;
      } else {
        currentSegments.push({
          text: word,
          startIndex: wordStart,
          attrs: segment.attrs,
        });
      }
      currentText += word;
      currentWidth += wordWidth;
      offset += word.length;
    }
  }
  flush();
  if (lines.length === 0) {
    lines.push({ segments: [], startIndex: paragraphStart, text: "" });
  }

  runWrapCache.set(cacheKey, lines);
  return lines;
}
