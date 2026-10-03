import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import * as Y from "yjs";
import { UndoManager } from "yjs";
import {
  attrsAtIndex,
  attrsOverRange,
  deltaToRuns,
  fontStringFor,
  wrapRuns,
  type AttrsOrMixed,
  type Run,
  type RunAttrs,
} from "./richText";
import { FormattingToolbar } from "./FormattingToolbar";

/**
 * Core Google-Docs-style canvas text editor (FR 3.6.10, see
 * brandhub-infrastructure/docs/feature/content-task-workflow/3-6-10-content-writting-view/).
 *
 * Text is drawn on <canvas> (not DOM) — pixel-accurate, avoids cross-browser
 * line-shift. A hidden offscreen contenteditable captures keystrokes/IME
 * (Vietnamese diacritics need compositionstart/update/end, not raw keydown).
 * The blinking cursor is a CSS div positioned from canvas text measurement.
 *
 * Content lives in a Yjs Y.Text (CRDT), not plain React state — see plan.md
 * §6 direction B: concurrent edits from other Creators are merged via Yjs
 * instead of hand-written Operational Transformation. The editor doesn't
 * open the WebSocket connection itself — see useTaskContentSync (caller
 * wires yDoc updates in/out over the wire).
 */

const FONT_SIZE = 16;
const LINE_HEIGHT = 24;
const FONT = `${FONT_SIZE}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
const PADDING_X = 24;
const PADDING_Y = 20;

interface Line {
  text: string;
  startIndex: number;
}

// measureText is the hot path for wrapping/caret math — memoize per
// font|string. Capped well above anything this short-form editor will ever
// see; a real cache-eviction policy would be overkill here.
const measureCache = new Map<string, number>();
const MEASURE_CACHE_LIMIT = 5000;
function measureWidth(
  ctx: CanvasRenderingContext2D,
  font: string,
  str: string,
): number {
  const key = font + "|" + str;
  const cached = measureCache.get(key);
  if (cached !== undefined) return cached;
  const width = ctx.measureText(str).width;
  if (measureCache.size >= MEASURE_CACHE_LIMIT) measureCache.clear();
  measureCache.set(key, width);
  return width;
}

// Per-paragraph wrap cache — re-wrapping the whole document on every
// keystroke is the main source of input lag. Keyed by paragraph text + the
// layout inputs that affect wrapping, so editing one paragraph never
// invalidates the others.
const wrapCache = new Map<string, Line[]>();

function wrapParagraph(
  ctx: CanvasRenderingContext2D,
  font: string,
  paragraph: string,
  maxWidth: number,
): Line[] {
  if (paragraph === "") return [{ text: "", startIndex: 0 }];

  const cacheKey = `${font}|${maxWidth}|${paragraph}`;
  const cached = wrapCache.get(cacheKey);
  if (cached) return cached;

  const lines: Line[] = [];
  let current = "";
  let currentStart = 0;
  const words = paragraph.split(/(\s+)/);

  for (const word of words) {
    const candidate = current + word;
    if (current !== "" && measureWidth(ctx, font, candidate) > maxWidth) {
      lines.push({ text: current, startIndex: currentStart });
      currentStart += current.length;
      current = word;
    } else {
      current = candidate;
    }
  }
  lines.push({ text: current, startIndex: currentStart });

  wrapCache.set(cacheKey, lines);
  return lines;
}

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): Line[] {
  const paragraphs = text.split("\n");
  const lines: Line[] = [];
  let globalIndex = 0;

  for (const paragraph of paragraphs) {
    const paragraphLines = wrapParagraph(ctx, FONT, paragraph, maxWidth);
    for (const line of paragraphLines) {
      lines.push({
        text: line.text,
        startIndex: globalIndex + line.startIndex,
      });
    }
    const lastLine = paragraphLines[paragraphLines.length - 1];
    globalIndex += lastLine.startIndex + lastLine.text.length + 1; // +1 for the "\n" consumed between paragraphs
  }

  return lines;
}

function caretCoordsFromIndex(
  ctx: CanvasRenderingContext2D,
  lines: Line[],
  index: number,
): { x: number; lineIndex: number } {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineEnd = line.startIndex + line.text.length;
    const isLastLine = i === lines.length - 1;
    if (index <= lineEnd || isLastLine) {
      const offset = Math.max(
        0,
        Math.min(index - line.startIndex, line.text.length),
      );
      const x = measureWidth(ctx, FONT, line.text.slice(0, offset));
      return { x, lineIndex: i };
    }
  }
  return { x: 0, lineIndex: 0 };
}

// Binary search over character offset — measureWidth(prefix) is monotonic
// non-decreasing for LTR text, so this turns click-to-caret from O(n) into
// O(log n) measureText calls.
function indexFromPoint(
  ctx: CanvasRenderingContext2D,
  lines: Line[],
  clickX: number,
  clickY: number,
): number {
  const lineIndex = Math.max(
    0,
    Math.min(Math.floor(clickY / LINE_HEIGHT), lines.length - 1),
  );
  const line = lines[lineIndex];
  if (!line) return 0;

  let lo = 0;
  let hi = line.text.length;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    const width = measureWidth(ctx, FONT, line.text.slice(0, mid));
    if (width <= clickX) {
      lo = mid;
    } else {
      hi = mid - 1;
    }
  }

  // lo now sits just at-or-before clickX; check whether lo+1 is actually closer.
  const widthLo = measureWidth(ctx, FONT, line.text.slice(0, lo));
  const widthNext =
    lo < line.text.length
      ? measureWidth(ctx, FONT, line.text.slice(0, lo + 1))
      : widthLo;
  const bestOffset =
    Math.abs(widthNext - clickX) < Math.abs(widthLo - clickX) ? lo + 1 : lo;

  return line.startIndex + bestOffset;
}

export interface CanvasTextEditorProps {
  /** Shared Yjs document — owned by the caller (useTaskContentSync) so it can also wire the WebSocket transport. */
  yDoc: Y.Doc;
  /** Called whenever the committed text changes — used by parent to mirror text into social preview. */
  onTextChange?: (text: string) => void;
}

export interface CanvasTextEditorHandle {
  /** Insert a string at the current caret position. */
  insertText: (value: string) => void;
}

export const CanvasTextEditor = forwardRef<CanvasTextEditorHandle, CanvasTextEditorProps>(
  function CanvasTextEditor({ yDoc, onTextChange }, ref) {
  const yTextRef = useRef<Y.Text>(yDoc.getText("content"));
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hiddenInputRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // UndoManager scoped to this editor's Y.Text — undo/redo are always
  // local-only (remote edits are not undoable by this client).
  const undoManager = useMemo(
    () => new UndoManager(yTextRef.current, { captureTimeout: 500 }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // Expose insertText so the parent (ContentWritingPage) can insert emojis
  // or other text at the current caret position without reaching into internals.
  useImperativeHandle(ref, () => ({
    insertText: (value: string) => {
      hiddenInputRef.current?.focus();
      // Use a microtask so focus settles before the Yjs insert (avoids a
      // timing issue where the caret position reads stale before focus lands).
      Promise.resolve().then(() => insertAtCaret(value));
    },
  }));

  const [text, setText] = useState(() => yTextRef.current.toString());
  // Mirrors `text`/`canvasWidth` for the window-level mousemove/mouseup
  // listeners (bound once, see the drag-selection effect below) — those
  // closures would otherwise see the text/width from whichever render
  // happened to be active when the effect last ran, not the current value.
  const textRef = useRef(text);
  textRef.current = text;
  const [caretIndex, setCaretIndexState] = useState(0);
  // caretIndex (state) lags a render behind rapid consecutive keystrokes —
  // yText.insert() needs the true current position synchronously, not a
  // stale value from the last completed render, or fast typing inserts
  // every character at the same spot (or the wrong spot after a delete).
  const caretIndexRef = useRef(0);
  const setCaretIndex = useCallback(
    (updater: number | ((prev: number) => number)) => {
      const next =
        typeof updater === "function"
          ? updater(caretIndexRef.current)
          : updater;
      caretIndexRef.current = next;
      setCaretIndexState(next);
    },
    [],
  );
  // Selection range — anchor is where the drag/shift-select started, focus
  // is the end currently being moved. Never pre-sorted: Shift+Home/End and
  // reversed drags need to know which end is "moving".
  const [selection, setSelectionState] = useState<{
    anchor: number;
    focus: number;
  } | null>(null);
  type Selection = { anchor: number; focus: number } | null;
  const selectionRef = useRef<Selection>(null);
  const setSelection = useCallback(
    (next: Selection | ((prev: Selection) => Selection)) => {
      const resolved =
        typeof next === "function" ? next(selectionRef.current) : next;
      selectionRef.current = resolved;
      setSelectionState(resolved);
    },
    [],
  );
  const isDraggingRef = useRef(false);

  // Runs derived from yText.toDelta() — the attributed-text source of
  // truth for rendering. Kept alongside the plain `text` string: caret
  // math/wrapping for plain measurement stays on `text` (unchanged,
  // already correct), only the paint step reads `runs`.
  const [runs, setRunsState] = useState<Run[]>(() =>
    deltaToRuns(yTextRef.current.toDelta()),
  );
  const runsRef = useRef(runs);
  const setRuns = useCallback((next: Run[]) => {
    runsRef.current = next;
    setRunsState(next);
  }, []);
  // Format for the next typed character when there's no active selection —
  // Google Docs' "click Bold, keep typing" behavior. Reset on any plain
  // (non-shift) caret move.
  const [pendingAttrs, setPendingAttrsState] = useState<RunAttrs>({});
  const pendingAttrsRef = useRef(pendingAttrs);
  const setPendingAttrs = useCallback((next: RunAttrs) => {
    pendingAttrsRef.current = next;
    setPendingAttrsState(next);
  }, []);

  const [isComposing, setIsComposing] = useState(false);
  // In-progress IME syllable (Vietnamese Unikey/Telex/VNI), updated on every
  // compositionupdate. Spliced into the rendered text at the caret so the
  // user sees what they're typing immediately — without this, the canvas
  // shows nothing until compositionend fires, which looks like "nothing
  // happens until I press Tab/Space" even though composition is working
  // correctly under the hood. Never written to Y.Text until commit.
  const [compositionPreview, setCompositionPreview] = useState<string | null>(
    null,
  );
  const [isFocused, setIsFocused] = useState(false);
  const [caretPos, setCaretPos] = useState({ x: 0, y: 0 });
  const [canvasWidth, setCanvasWidth] = useState(800);
  const canvasWidthRef = useRef(canvasWidth);
  canvasWidthRef.current = canvasWidth;

  // yText is the source of truth; local caretIndex/selection just track this
  // client's cursor position and are nudged when remote edits land before
  // them — same delta-accumulation logic applied to both, since a remote
  // edit during an active local selection must shift the highlight exactly
  // as it shifts the caret, or the two desync from the real text.
  useEffect(() => {
    const yText = yTextRef.current;
    const observer = (event: Y.YTextEvent) => {
      const next = yText.toString();
      setText(next);
      setRuns(deltaToRuns(yText.toDelta()));
      onTextChange?.(next);
      if (!event.transaction.local) {
        const computeDelta = (index: number) => {
          let delta = 0;
          let cursor = 0;
          for (const op of event.delta) {
            if (op.retain) cursor += op.retain;
            else if (op.insert) {
              const len = typeof op.insert === "string" ? op.insert.length : 1;
              if (cursor <= index) delta += len;
              cursor += len;
            } else if (op.delete) {
              if (cursor < index) {
                delta -= Math.min(op.delete, index - cursor);
              }
            }
          }
          return delta;
        };

        const caretDelta = computeDelta(caretIndexRef.current);
        if (caretDelta !== 0) {
          setCaretIndex((prev) => Math.max(0, prev + caretDelta));
        }

        const sel = selectionRef.current;
        if (sel) {
          const anchorDelta = computeDelta(sel.anchor);
          const focusDelta = computeDelta(sel.focus);
          if (anchorDelta !== 0 || focusDelta !== 0) {
            const nextAnchor = Math.max(0, sel.anchor + anchorDelta);
            const nextFocus = Math.max(0, sel.focus + focusDelta);
            setSelection(
              nextAnchor === nextFocus
                ? null
                : { anchor: nextAnchor, focus: nextFocus },
            );
          }
        }
      }
    };
    yText.observe(observer);
    return () => yText.unobserve(observer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caretIndex/selection read via closure intentionally, re-subscribing per keystroke would be wasteful
  }, []);

  // Composed display text = committed text with the in-progress IME
  // syllable spliced in at the caret. Y.Text itself is untouched until
  // compositionend commits — this only affects what's drawn.
  const displayText = compositionPreview
    ? text.slice(0, caretIndex) + compositionPreview + text.slice(caretIndex)
    : text;
  const displayCaretIndex = compositionPreview
    ? caretIndex + compositionPreview.length
    : caretIndex;

  // Runs with the in-progress IME syllable spliced in as a plain-attrs run
  // at the caret — mirrors displayText's splice but for the attributed
  // model. Reuses the attrs at the caret so the preview doesn't visually
  // jump when it commits.
  const displayRuns: Run[] = compositionPreview
    ? (() => {
        const caretAttrs = attrsAtIndex(runs, caretIndex);
        const before: Run[] = [];
        const after: Run[] = [];
        for (const run of runs) {
          const end = run.startIndex + run.text.length;
          if (end <= caretIndex) {
            before.push(run);
          } else if (run.startIndex >= caretIndex) {
            after.push({
              ...run,
              startIndex: run.startIndex + compositionPreview.length,
            });
          } else {
            before.push({
              ...run,
              text: run.text.slice(0, caretIndex - run.startIndex),
            });
            after.push({
              ...run,
              text: run.text.slice(caretIndex - run.startIndex),
              startIndex: caretIndex + compositionPreview.length,
            });
          }
        }
        const previewRun: Run = {
          text: compositionPreview,
          attrs: caretAttrs,
          startIndex: caretIndex,
        };
        return [...before, previewRun, ...after];
      })()
    : runs;

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const cssWidth = canvasWidth;
    const maxTextWidth = cssWidth - PADDING_X * 2;

    ctx.font = FONT;
    const lines = wrapLines(ctx, displayText, maxTextWidth);
    const runLines = wrapRuns(ctx, displayRuns, maxTextWidth, measureWidth);
    const cssHeight = Math.max(200, lines.length * LINE_HEIGHT + PADDING_Y * 2);

    if (canvas.width !== cssWidth * dpr || canvas.height !== cssHeight * dpr) {
      canvas.width = cssWidth * dpr;
      canvas.height = cssHeight * dpr;
      canvas.style.width = `${cssWidth}px`;
      canvas.style.height = `${cssHeight}px`;
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssWidth, cssHeight);
    ctx.font = FONT;
    ctx.textBaseline = "alphabetic";

    // Selection highlight band, drawn before the text so glyphs paint on
    // top of it. Composition preview and active selection don't coexist in
    // practice (typing collapses selection first), so displayText's indices
    // are safe to use directly here.
    if (selection && selection.anchor !== selection.focus) {
      const selStart = Math.min(selection.anchor, selection.focus);
      const selEnd = Math.max(selection.anchor, selection.focus);
      ctx.fillStyle = "rgba(66, 133, 244, 0.35)";
      lines.forEach((line, i) => {
        const lineStart = line.startIndex;
        const lineEnd = line.startIndex + line.text.length;
        const rangeStart = Math.max(selStart, lineStart);
        const rangeEnd = Math.min(selEnd, lineEnd);
        if (rangeStart >= rangeEnd) return;
        const x1 = measureWidth(
          ctx,
          FONT,
          line.text.slice(0, rangeStart - lineStart),
        );
        const x2 = measureWidth(
          ctx,
          FONT,
          line.text.slice(0, rangeEnd - lineStart),
        );
        ctx.fillRect(
          PADDING_X + x1,
          PADDING_Y + i * LINE_HEIGHT,
          x2 - x1,
          LINE_HEIGHT,
        );
      });
    }

    // Per-run paint: each segment gets its own font/color/decoration. Line
    // y-offsets come from the plain-text `lines` (identical wrap points,
    // since wrapRuns mirrors the same word-break algorithm) — runLines are
    // only consulted for their per-segment styling.
    runLines.forEach((runLine, i) => {
      const align = runLine.segments[0]?.attrs.align ?? "left";
      const lineWidth = runLine.segments.reduce(
        (sum, seg) =>
          sum + measureWidth(ctx, fontStringFor(seg.attrs), seg.text),
        0,
      );
      const lineStartX =
        align === "center"
          ? PADDING_X + (maxTextWidth - lineWidth) / 2
          : align === "right"
            ? PADDING_X + (maxTextWidth - lineWidth)
            : PADDING_X;

      let x = lineStartX;
      const y = PADDING_Y + i * LINE_HEIGHT + FONT_SIZE;
      for (const segment of runLine.segments) {
        ctx.font = fontStringFor(segment.attrs);
        ctx.fillStyle = segment.attrs.color ?? "#1f2937";
        const w = measureWidth(ctx, fontStringFor(segment.attrs), segment.text);
        if (segment.attrs.highlight) {
          ctx.fillStyle = segment.attrs.highlight;
          ctx.fillRect(x, PADDING_Y + i * LINE_HEIGHT, w, LINE_HEIGHT);
          ctx.fillStyle = segment.attrs.color ?? "#1f2937";
        }
        ctx.fillText(segment.text, x, y);
        if (segment.attrs.underline || segment.attrs.link) {
          ctx.strokeStyle = ctx.fillStyle as string;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x, y + 2);
          ctx.lineTo(x + w, y + 2);
          ctx.stroke();
        }
        if (segment.attrs.strikethrough) {
          ctx.strokeStyle = ctx.fillStyle as string;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x, y - FONT_SIZE * 0.3);
          ctx.lineTo(x + w, y - FONT_SIZE * 0.3);
          ctx.stroke();
        }
        x += w;
      }
    });
    ctx.font = FONT;

    if (compositionPreview) {
      const start = caretCoordsFromIndex(ctx, lines, caretIndex);
      const end = caretCoordsFromIndex(
        ctx,
        lines,
        caretIndex + compositionPreview.length,
      );
      if (start.lineIndex === end.lineIndex) {
        const y = PADDING_Y + start.lineIndex * LINE_HEIGHT + FONT_SIZE + 2;
        ctx.strokeStyle = "#1f2937";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(PADDING_X + start.x, y);
        ctx.lineTo(PADDING_X + end.x, y);
        ctx.stroke();
      }
    }

    const { x, lineIndex } = caretCoordsFromIndex(
      ctx,
      lines,
      displayCaretIndex,
    );
    setCaretPos({ x: PADDING_X + x, y: PADDING_Y + lineIndex * LINE_HEIGHT });
  }, [
    displayText,
    displayRuns,
    displayCaretIndex,
    caretIndex,
    compositionPreview,
    canvasWidth,
    selection,
  ]);

  useEffect(() => {
    render();
  }, [render]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (width) setCanvasWidth(width);
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Auto-focus when editor mounts so user can type immediately
  useEffect(() => {
    hiddenInputRef.current?.focus();
  }, []);

  const focusHiddenInput = useCallback(() => {
    hiddenInputRef.current?.focus();
  }, []);

  // Reads text/canvasWidth via ref, not the closed-over state value — this
  // is called from the window-level drag-selection listeners (bound once,
  // see below), which would otherwise see whatever text/width was current
  // when that effect last ran instead of the live value.
  const indexFromEvent = (clientX: number, clientY: number): number | null => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return null;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left - PADDING_X;
    const y = clientY - rect.top - PADDING_Y;
    ctx.font = FONT;
    const lines = wrapLines(
      ctx,
      textRef.current,
      canvasWidthRef.current - PADDING_X * 2,
    );
    return indexFromPoint(ctx, lines, x, y);
  };

  const handleCanvasMouseDown = (
    event: React.MouseEvent<HTMLCanvasElement>,
  ) => {
    const index = indexFromEvent(event.clientX, event.clientY);
    if (index === null) return;
    isDraggingRef.current = true;
    setCaretIndex(index);
    setSelection({ anchor: index, focus: index });
    setPendingAttrs({});
    focusHiddenInput();
  };

  // Mouse-drag selection: window-level listeners while dragging, mirroring
  // the ResizeObserver effect's lifecycle pattern (attach only while active).
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const index = indexFromEvent(event.clientX, event.clientY);
      if (index === null) return;
      setCaretIndex(index);
      setSelection((prev) =>
        prev
          ? { anchor: prev.anchor, focus: index }
          : { anchor: index, focus: index },
      );
    };
    const handleMouseUp = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      // A plain click (no actual drag) collapses to a caret move, not a
      // zero-width selection.
      setSelection((prev) =>
        prev && prev.anchor === prev.focus ? null : prev,
      );
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- text/canvasWidth read via closure (indexFromEvent), re-binding window listeners per keystroke would be wasteful
  }, []);

  const clearSelection = () => setSelection(null);
  const clearPendingAttrs = () => setPendingAttrs({});

  /** Deletes the active selection (if any) and returns the collapsed caret index, or null if there was nothing selected. */
  const deleteSelectionIfAny = (): number | null => {
    const sel = selectionRef.current;
    if (!sel || sel.anchor === sel.focus) return null;
    const selStart = Math.min(sel.anchor, sel.focus);
    const selEnd = Math.max(sel.anchor, sel.focus);
    yTextRef.current.delete(selStart, selEnd - selStart);
    setSelection(null);
    setCaretIndex(selStart);
    return selStart;
  };

  const insertAtCaret = (value: string) => {
    const collapsedAt = deleteSelectionIfAny();
    const at = collapsedAt ?? caretIndexRef.current;
    // Inherit the left-neighbor's formatting by default (typing continues
    // whatever style surrounds the caret), overridden by any pendingAttrs
    // set via the toolbar with no active selection — same precedence as
    // Google Docs' "click Bold, keep typing". Yjs rejects attribute objects
    // carrying explicit `undefined` values, so strip those out first.
    const merged = {
      ...attrsAtIndex(runsRef.current, at),
      ...pendingAttrsRef.current,
    };
    const attrs = Object.fromEntries(
      Object.entries(merged).filter(([, v]) => v !== undefined),
    );
    if (Object.keys(attrs).length > 0) {
      yTextRef.current.insert(at, value, attrs);
    } else {
      yTextRef.current.insert(at, value);
    }
    setCaretIndex(at + value.length);
  };

  const deleteBackward = () => {
    if (deleteSelectionIfAny() !== null) return;
    if (caretIndexRef.current === 0) return;
    yTextRef.current.delete(caretIndexRef.current - 1, 1);
    setCaretIndex((prev) => prev - 1);
  };

  const deleteForward = () => {
    if (deleteSelectionIfAny() !== null) return;
    if (caretIndexRef.current >= yTextRef.current.length) return;
    yTextRef.current.delete(caretIndexRef.current, 1);
  };

  // --- Formatting toolbar wiring -------------------------------------
  // Every format action branches on whether there's an active selection:
  // a non-collapsed selection formats that range directly via
  // yText.format(); with no selection it just updates pendingAttrs for the
  // next typed character (Google Docs' "click Bold, keep typing").

  const currentSelRange = (): { start: number; end: number } | null => {
    const sel = selectionRef.current;
    if (!sel || sel.anchor === sel.focus) return null;
    return {
      start: Math.min(sel.anchor, sel.focus),
      end: Math.max(sel.anchor, sel.focus),
    };
  };

  const applyFormat = (patch: RunAttrs) => {
    const range = currentSelRange();
    if (range) {
      yTextRef.current.format(range.start, range.end - range.start, patch);
      setRuns(deltaToRuns(yTextRef.current.toDelta()));
    } else {
      setPendingAttrs({ ...pendingAttrsRef.current, ...patch });
    }
  };

  const currentAttrs = (): AttrsOrMixed => {
    const range = currentSelRange();
    if (range) return attrsOverRange(runsRef.current, range.start, range.end);
    const base = attrsAtIndex(runsRef.current, caretIndexRef.current);
    return { ...base, ...pendingAttrsRef.current };
  };

  const toggleFormat = (key: "bold" | "italic" | "underline" | "strikethrough") => {
    const active = currentAttrs()[key];
    applyFormat({ [key]: active && active !== "mixed" ? undefined : true });
  };

  const clearFormatting = () => {
    const range = currentSelRange();
    if (!range) return;
    yTextRef.current.format(range.start, range.end - range.start, {
      bold: undefined,
      italic: undefined,
      underline: undefined,
      strikethrough: undefined,
      color: undefined,
      highlight: undefined,
      font: undefined,
      size: undefined,
      link: undefined,
    });
    setRuns(deltaToRuns(yTextRef.current.toDelta()));
    setPendingAttrs({});
  };

  const setColor = (color: string | undefined) => applyFormat({ color });
  const setHighlight = (highlight: string | undefined) =>
    applyFormat({ highlight });
  const setFontFamily = (font: string | undefined) => applyFormat({ font });
  const setFontSize = (size: number | undefined) => applyFormat({ size });
  const setLink = (link: string | undefined) => applyFormat({ link });

  /** Alignment is paragraph-scoped: finds the paragraph's full char range around the caret (or selection) and formats the whole thing via Y.Text, regardless of what's selected. */
  const setAlign = (align: RunAttrs["align"]) => {
    const t = textRef.current;
    const sel = selectionRef.current;
    const anchorIndex = sel
      ? Math.min(sel.anchor, sel.focus)
      : caretIndexRef.current;
    const focusIndex = sel
      ? Math.max(sel.anchor, sel.focus)
      : caretIndexRef.current;
    const paraStart = t.lastIndexOf("\n", anchorIndex - 1) + 1;
    const nextBreak = t.indexOf("\n", focusIndex);
    const paraEnd = nextBreak === -1 ? t.length : nextBreak;
    if (paraEnd > paraStart) {
      yTextRef.current.format(paraStart, paraEnd - paraStart, { align });
      setRuns(deltaToRuns(yTextRef.current.toDelta()));
    }
  };

  // IME-aware: during composition (Vietnamese Unikey/Telex/VNI), the browser
  // fires intermediate "input" events with partial syllables — forwarding
  // those into the Y.Text mid-composition garbles diacritics. Only commit
  // once compositionend fires.
  const handleBeforeInput = (event: React.FormEvent<HTMLDivElement>) => {
    const nativeEvent = event.nativeEvent as InputEvent;
    if (isComposing) return;

    // `inputType` is unreliable across browsers/automation (observed empty
    // in some environments) — `data`/`inputType === "insertLineBreak"` are
    // what we actually need, so branch on those instead of trusting
    // inputType for the common insertText case.
    const data = nativeEvent.data;
    if (
      nativeEvent.inputType === "insertLineBreak" ||
      nativeEvent.data === "\n"
    ) {
      insertAtCaret("\n");
      event.preventDefault();
    } else if (data) {
      insertAtCaret(data);
      event.preventDefault();
    }
    // Backspace/Delete are handled in handleKeyDown instead — same
    // inputType-unreliability issue, and keydown is more robust for them.
  };

  const handleCompositionUpdate = (
    event: React.CompositionEvent<HTMLDivElement>,
  ) => {
    setCompositionPreview(event.data || null);
  };

  const handleCompositionEnd = (
    event: React.CompositionEvent<HTMLDivElement>,
  ) => {
    setIsComposing(false);
    setCompositionPreview(null);
    if (event.data) {
      insertAtCaret(event.data);
    }
    // Clear the hidden input so the composed syllable isn't re-read next time.
    if (hiddenInputRef.current) hiddenInputRef.current.textContent = "";
  };

  /** Lines for the current committed text, used by Home/End to find paragraph boundaries. */
  const currentLines = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return [] as Line[];
    ctx.font = FONT;
    return wrapLines(ctx, text, canvasWidth - PADDING_X * 2);
  };

  /** Moves the caret, extending or clearing the selection depending on shiftKey — shared by every arrow/Home/End handler. */
  const moveCaret = (nextIndex: number, shiftKey: boolean) => {
    const clamped = Math.max(0, Math.min(yTextRef.current.length, nextIndex));
    if (shiftKey) {
      const anchor = selectionRef.current?.anchor ?? caretIndexRef.current;
      setSelection(anchor === clamped ? null : { anchor, focus: clamped });
    } else {
      clearSelection();
    }
    clearPendingAttrs();
    setCaretIndex(clamped);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const ctrl = event.ctrlKey || event.metaKey;
    // --- Keyboard shortcuts ---
    if (ctrl && !event.shiftKey && event.key.toLowerCase() === "b") {
      toggleFormat("bold"); event.preventDefault(); return;
    }
    if (ctrl && !event.shiftKey && event.key.toLowerCase() === "i") {
      toggleFormat("italic"); event.preventDefault(); return;
    }
    if (ctrl && !event.shiftKey && event.key.toLowerCase() === "u") {
      toggleFormat("underline"); event.preventDefault(); return;
    }
    if (ctrl && event.key.toLowerCase() === "z") {
      if (event.shiftKey) { undoManager.redo(); } else { undoManager.undo(); }
      event.preventDefault(); return;
    }
    if (ctrl && (event.key.toLowerCase() === "y")) {
      undoManager.redo(); event.preventDefault(); return;
    }
    if (ctrl && event.key.toLowerCase() === "a") {
      setSelection({ anchor: 0, focus: yTextRef.current.length });
      setCaretIndex(yTextRef.current.length);
      event.preventDefault(); return;
    }
    // Backspace/Delete handled here, not solely via beforeinput's
    // deleteContentBackward/Forward — that inputType is unreliable across
    // browsers/automation tooling, same issue as insertText above.
    if (event.key === "Backspace") {
      deleteBackward();
      event.preventDefault();
    } else if (event.key === "Delete") {
      deleteForward();
      event.preventDefault();
    } else if (event.key === " " && !isComposing) {
      // beforeinput's insertText isn't consistently fired for Space across
      // environments (observed dropped in some automation/browser paths) —
      // handle it directly here as a safety net, same as Backspace/Delete.
      insertAtCaret(" ");
      event.preventDefault();
    } else if (
      (event.ctrlKey || event.metaKey) &&
      event.key.toLowerCase() === "a"
    ) {
      setSelection({ anchor: 0, focus: yTextRef.current.length });
      setCaretIndex(yTextRef.current.length);
      event.preventDefault();
    } else if (event.key === "ArrowLeft") {
      moveCaret(caretIndexRef.current - 1, event.shiftKey);
      event.preventDefault();
    } else if (event.key === "ArrowRight") {
      moveCaret(caretIndexRef.current + 1, event.shiftKey);
      event.preventDefault();
    } else if (event.key === "Home") {
      const lines = currentLines();
      const line = lines.find(
        (l) =>
          caretIndexRef.current >= l.startIndex &&
          caretIndexRef.current <= l.startIndex + l.text.length,
      );
      moveCaret(line ? line.startIndex : 0, event.shiftKey);
      event.preventDefault();
    } else if (event.key === "End") {
      const lines = currentLines();
      const line = lines.find(
        (l) =>
          caretIndexRef.current >= l.startIndex &&
          caretIndexRef.current <= l.startIndex + l.text.length,
      );
      moveCaret(
        line ? line.startIndex + line.text.length : yTextRef.current.length,
        event.shiftKey,
      );
      event.preventDefault();
    }
  };

  // Word / character count — derived from committed text only.
  const wordCount = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  const charCount = text.length;

  return (
    <div className="w-full">
      <FormattingToolbar
        currentAttrs={currentAttrs()}
        onToggle={toggleFormat}
        onSetColor={setColor}
        onSetHighlight={setHighlight}
        onSetFont={setFontFamily}
        onSetSize={setFontSize}
        onSetAlign={setAlign}
        onSetLink={setLink}
        onUndo={() => undoManager.undo()}
        onRedo={() => undoManager.redo()}
        onClearFormatting={clearFormatting}
        onInsertEmoji={(emoji) => insertAtCaret(emoji)}
      />
      <div
        ref={containerRef}
        className="border-border bg-card relative w-full rounded-b-xl border p-2"
        style={{ minHeight: "200px" }}
        onClick={focusHiddenInput}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={handleCanvasMouseDown}
          className="block w-full cursor-text"
          style={{ minHeight: "200px" }}
        />
        {isFocused && (
          <div
            className="bg-foreground pointer-events-none absolute w-[1.5px] animate-pulse"
            style={{
              left: caretPos.x + 8,
              top: caretPos.y + 8,
              height: FONT_SIZE + 2,
            }}
          />
        )}
        <div
          ref={hiddenInputRef}
          contentEditable
          suppressContentEditableWarning
          onBeforeInput={handleBeforeInput}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionUpdate={handleCompositionUpdate}
          onCompositionEnd={handleCompositionEnd}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            // Defensive: a composition cancelled by focus loss wouldn't
            // otherwise fire compositionend, leaving a stale preview on screen.
            setIsComposing(false);
            setCompositionPreview(null);
          }}
          className="fixed top-0 left-0 h-px w-px overflow-hidden opacity-0"
          style={{ transform: "translateX(-10000px)" }}
          aria-label="Content editor input"
          tabIndex={-1}
        />
        {/* Accessibility: screen readers can't read canvas pixels — this
            hidden region mirrors the real text in parallel (see spec.md §4). */}
        <div className="sr-only" aria-live="polite">
          {displayText}
        </div>
      </div>
      {/* Status bar: word/char count + keyboard shortcut hints */}
      <div className="border-border text-muted-foreground mt-1 flex items-center justify-between rounded-lg border px-3 py-1 text-xs">
        <span>
          {wordCount} từ &nbsp;·&nbsp; {charCount} ký tự
        </span>
        <span className="hidden gap-3 sm:flex">
          <span title="Bold"><kbd className="bg-muted rounded px-1 py-0.5 font-mono text-[10px]">Ctrl+B</kbd> In đậm</span>
          <span title="Italic"><kbd className="bg-muted rounded px-1 py-0.5 font-mono text-[10px]">Ctrl+I</kbd> Nghiêng</span>
          <span title="Underline"><kbd className="bg-muted rounded px-1 py-0.5 font-mono text-[10px]">Ctrl+U</kbd> Gạch dưới</span>
          <span title="Undo"><kbd className="bg-muted rounded px-1 py-0.5 font-mono text-[10px]">Ctrl+Z</kbd> Hoàn tác</span>
          <span title="Redo"><kbd className="bg-muted rounded px-1 py-0.5 font-mono text-[10px]">Ctrl+Y</kbd> Làm lại</span>
        </span>
      </div>
    </div>
  );
  }, // end forwardRef render
);

CanvasTextEditor.displayName = "CanvasTextEditor";
