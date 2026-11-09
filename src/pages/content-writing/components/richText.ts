/**
 * Pure rich-text model for CanvasTextEditor (FR 3.6.10 Phase 4). Drives
 * canvas rendering, caret positioning, click hit-testing, and selection
 * highlights off Y.Text.toDelta() — a Quill-Delta-shaped array of
 * {insert, attributes} ops — instead of a flat string, so character ranges
 * can carry independent formatting (bold/italic/color/font/size/align/...).
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

export const DEFAULT_FONT_SIZE = 16;
export const DEFAULT_LINE_HEIGHT = 24;
export const DEFAULT_FONT_FAMILY =
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
  const family = attrs.font && attrs.font.trim() ? attrs.font : DEFAULT_FONT_FAMILY;
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
  text: string; // concatenation of segment texts
}

export interface LaidOutRunLine extends RunLine {
  lineIndex: number;
  lineWidth: number;
  lineStartX: number;
  maxFontSize: number;
  lineHeight: number;
  yTop: number;
  baselineY: number;
  align: "left" | "center" | "right";
  /** True when this line soft-wrapped into the next line (no "\n" consumed between them). */
  softWrappedToNext: boolean;
}

// Per-paragraph wrap cache keyed on a signature of the paragraph's runs
// (text + attrs), so a pure formatting change (no text edit) still busts
// the cache correctly.
const runWrapCache = new Map<string, RunLine[]>();

export function clearRunWrapCache(): void {
  runWrapCache.clear();
}

function paragraphSignature(segments: Segment[]): string {
  return segments
    .map((s) => `${s.text}\u0000${JSON.stringify(s.attrs)}`)
    .join("\u0001");
}

/** Splits runs into paragraphs (on \n) and word-wraps each — measures each word with its own run's font. */
export function wrapRuns(
  ctx: CanvasRenderingContext2D,
  runs: Run[],
  maxWidth: number,
  measure: (ctx: CanvasRenderingContext2D, font: string, str: string) => number,
): RunLine[] {
  const paragraphs: { segments: Segment[]; startIndex: number }[] = [
    { segments: [], startIndex: 0 },
  ];
  for (const run of runs) {
    const parts = run.text.split("\n");
    let runIndex = run.startIndex;
    parts.forEach((part, i) => {
      if (part.length > 0) {
        paragraphs[paragraphs.length - 1].segments.push({
          text: part,
          startIndex: runIndex,
          attrs: run.attrs,
        });
      }
      runIndex += part.length;
      if (i < parts.length - 1) {
        runIndex += 1; // consumed "\n"
        paragraphs.push({ segments: [], startIndex: runIndex });
      }
    });
  }

  const lines: RunLine[] = [];

  for (const para of paragraphs) {
    const paragraphLines = wrapParagraphSegments(
      ctx,
      para.segments,
      para.startIndex,
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
  emptyStartIndex: number,
  maxWidth: number,
  measure: (ctx: CanvasRenderingContext2D, font: string, str: string) => number,
): RunLine[] {
  if (segments.length === 0) {
    return [{ segments: [], startIndex: emptyStartIndex, text: "" }];
  }

  const cacheKey = `${maxWidth}|${emptyStartIndex}|${paragraphSignature(segments)}`;
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

/**
 * Computes exact X/Y layout geometry for every wrapped line (font sizes, line heights,
 * paragraph alignment, baseline Y, and soft-wrap vs hard-newline flags).
 * Used identically by canvas rendering, caret positioning, click hit-testing, and selection highlights.
 */
export function layoutRunLines(
  ctx: CanvasRenderingContext2D,
  runLines: RunLine[],
  maxTextWidth: number,
  paddingX: number,
  paddingY: number,
  measure: (ctx: CanvasRenderingContext2D, font: string, str: string) => number,
  fallbackAttrs?: RunAttrs,
): LaidOutRunLine[] {
  let yCursor = paddingY;
  return runLines.map((line, i) => {
    const align: "left" | "center" | "right" =
      line.segments[0]?.attrs.align ?? fallbackAttrs?.align ?? "left";
    let lineWidth = 0;
    let maxFontSize =
      line.segments.length === 0
        ? (fallbackAttrs?.size ?? DEFAULT_FONT_SIZE)
        : DEFAULT_FONT_SIZE;

    for (const seg of line.segments) {
      const sz = seg.attrs.size ?? DEFAULT_FONT_SIZE;
      if (sz > maxFontSize) maxFontSize = sz;
      lineWidth += measure(ctx, fontStringFor(seg.attrs), seg.text);
    }

    const lineHeight = Math.max(
      DEFAULT_LINE_HEIGHT,
      Math.round(maxFontSize * 1.45),
    );
    const yTop = yCursor;
    // Vertically center the glyph box inside lineHeight with alphabetic baseline
    const baselineY =
      yTop + Math.round((lineHeight - maxFontSize) / 2 + maxFontSize * 0.82);
    yCursor += lineHeight;

    const lineStartX =
      align === "center"
        ? paddingX + Math.max(0, (maxTextWidth - lineWidth) / 2)
        : align === "right"
          ? paddingX + Math.max(0, maxTextWidth - lineWidth)
          : paddingX;

    const lineEnd = line.startIndex + line.text.length;
    const nextLine = i < runLines.length - 1 ? runLines[i + 1] : null;
    const softWrappedToNext =
      nextLine !== null &&
      line.text.length > 0 &&
      nextLine.startIndex === lineEnd;

    return {
      ...line,
      lineIndex: i,
      lineWidth,
      lineStartX,
      maxFontSize,
      lineHeight,
      yTop,
      baselineY,
      align,
      softWrappedToNext,
    };
  });
}

/**
 * Measures the horizontal pixel offset from `line.lineStartX` to `offsetInLine`
 * (0 <= offsetInLine <= line.text.length) by summing exact per-segment widths.
 */
export function measureLinePrefixWidth(
  ctx: CanvasRenderingContext2D,
  line: RunLine,
  offsetInLine: number,
  measure: (ctx: CanvasRenderingContext2D, font: string, str: string) => number,
): number {
  const clamped = Math.max(0, Math.min(offsetInLine, line.text.length));
  if (clamped === 0 || line.segments.length === 0) return 0;

  let remaining = clamped;
  let width = 0;
  for (const seg of line.segments) {
    if (remaining <= 0) break;
    const font = fontStringFor(seg.attrs);
    if (remaining >= seg.text.length) {
      width += measure(ctx, font, seg.text);
      remaining -= seg.text.length;
    } else {
      width += measure(ctx, font, seg.text.slice(0, remaining));
      remaining = 0;
    }
  }
  return width;
}

/**
 * Snaps a UTF-16 code-unit index so it never lands inside a surrogate pair
 * (e.g. emojis 😀 or Mathematical Unicode styled characters 𝗔).
 */
export function snapToCodePointBoundary(
  text: string,
  index: number,
  direction: "nearest" | "left" | "right" = "nearest",
): number {
  const clamped = Math.max(0, Math.min(index, text.length));
  if (clamped <= 0 || clamped >= text.length) return clamped;
  const code = text.charCodeAt(clamped);
  const prev = text.charCodeAt(clamped - 1);
  // Low surrogate preceded by high surrogate -> we are mid-code-point
  if (code >= 0xdc00 && code <= 0xdfff && prev >= 0xd800 && prev <= 0xdbff) {
    return direction === "right" ? clamped + 1 : clamped - 1;
  }
  return clamped;
}

export interface CaretVisualCoords {
  x: number;
  y: number;
  height: number;
  lineIndex: number;
  baselineY: number;
}

/**
 * Computes exact pixel coordinates (x, y, height, lineIndex) for a document index
 * directly from laid-out rich-text lines.
 */
export function caretCoordsFromLaidOutLines(
  ctx: CanvasRenderingContext2D,
  lines: LaidOutRunLine[],
  index: number,
  measure: (ctx: CanvasRenderingContext2D, font: string, str: string) => number,
  fallbackAttrs?: RunAttrs,
): CaretVisualCoords {
  if (lines.length === 0) {
    const h = (fallbackAttrs?.size ?? DEFAULT_FONT_SIZE) + 4;
    return { x: 24, y: 20, height: h, lineIndex: 0, baselineY: 20 + DEFAULT_FONT_SIZE };
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineEnd = line.startIndex + line.text.length;
    const isLastLine = i === lines.length - 1;

    // If this line soft-wrapped into line i+1, then `index === lineEnd` is the start
    // of the word on line i+1, so line i only owns strictly `< lineEnd`.
    const ownsIndex = line.softWrappedToNext
      ? index < lineEnd
      : index <= lineEnd || isLastLine;

    if (ownsIndex) {
      const offsetInLine = Math.max(
        0,
        Math.min(index - line.startIndex, line.text.length),
      );
      const xOffset = measureLinePrefixWidth(ctx, line, offsetInLine, measure);
      // Determine font size at the caret for an accurate caret height
      let caretFontSize = fallbackAttrs?.size ?? line.maxFontSize;
      if (line.segments.length > 0) {
        const probeOffset = offsetInLine > 0 ? offsetInLine - 1 : 0;
        let acc = 0;
        for (const seg of line.segments) {
          if (probeOffset >= acc && probeOffset < acc + seg.text.length) {
            caretFontSize = seg.attrs.size ?? DEFAULT_FONT_SIZE;
            break;
          }
          acc += seg.text.length;
        }
      }
      const caretHeight = caretFontSize + 4;
      const caretTop = Math.round(
        line.baselineY - caretFontSize * 0.82 - 2,
      );
      return {
        x: line.lineStartX + xOffset,
        y: caretTop,
        height: caretHeight,
        lineIndex: i,
        baselineY: line.baselineY,
      };
    }
  }

  const last = lines[lines.length - 1];
  return {
    x: last.lineStartX + last.lineWidth,
    y: Math.round(last.baselineY - last.maxFontSize * 0.82 - 2),
    height: last.maxFontSize + 4,
    lineIndex: lines.length - 1,
    baselineY: last.baselineY,
  };
}

/**
 * Converts a canvas-local `(canvasX, canvasY)` point (in CSS pixels from top-left of `<canvas>`)
 * into the closest character index in the document, accounting for per-segment fonts,
 * sizes, alignments, and UTF-16 code-point boundaries.
 */
export function indexFromLaidOutLinesPoint(
  ctx: CanvasRenderingContext2D,
  lines: LaidOutRunLine[],
  canvasX: number,
  canvasY: number,
  measure: (ctx: CanvasRenderingContext2D, font: string, str: string) => number,
): number {
  if (lines.length === 0) return 0;

  // Find the vertical line containing canvasY
  let targetLine = lines[lines.length - 1];
  if (canvasY <= lines[0].yTop) {
    targetLine = lines[0];
  } else {
    for (const line of lines) {
      if (canvasY >= line.yTop && canvasY < line.yTop + line.lineHeight) {
        targetLine = line;
        break;
      }
    }
  }

  const relX = canvasX - targetLine.lineStartX;
  if (relX <= 0 || targetLine.text.length === 0) {
    return targetLine.startIndex;
  }

  // Build valid code-point boundary offsets within targetLine.text so we never
  // split surrogate pairs and can find the exact closest character boundary.
  const boundaries: number[] = [0];
  for (let i = 0; i < targetLine.text.length; ) {
    const cp = targetLine.text.codePointAt(i)!;
    i += cp > 0xffff ? 2 : 1;
    boundaries.push(i);
  }

  // If soft-wrapped to the next line and ends with trailing whitespace, don't
  // place the caret past the trailing space (which would jump to next line start)
  // unless the user clicked past the last non-space character.
  const maxBoundaryIdx =
    targetLine.softWrappedToNext && boundaries.length > 1
      ? boundaries.length - 2
      : boundaries.length - 1;

  let lo = 0;
  let hi = maxBoundaryIdx;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    const width = measureLinePrefixWidth(
      ctx,
      targetLine,
      boundaries[mid],
      measure,
    );
    if (width <= relX) {
      lo = mid;
    } else {
      hi = mid - 1;
    }
  }

  const offsetLo = boundaries[lo];
  const widthLo = measureLinePrefixWidth(ctx, targetLine, offsetLo, measure);
  const nextIdx = Math.min(lo + 1, maxBoundaryIdx);
  const offsetNext = boundaries[nextIdx];
  const widthNext =
    nextIdx > lo
      ? measureLinePrefixWidth(ctx, targetLine, offsetNext, measure)
      : widthLo;

  const bestOffset =
    Math.abs(widthNext - relX) < Math.abs(widthLo - relX)
      ? offsetNext
      : offsetLo;

  return targetLine.startIndex + bestOffset;
}
