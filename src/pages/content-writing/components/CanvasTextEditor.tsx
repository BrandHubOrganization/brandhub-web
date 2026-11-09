import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import * as Y from "yjs";
import { UndoManager } from "yjs";
import {
  DEFAULT_FONT_SIZE,
  attrsAtIndex,
  attrsOverRange,
  caretCoordsFromLaidOutLines,
  clearRunWrapCache,
  deltaToRuns,
  fontStringFor,
  indexFromLaidOutLinesPoint,
  layoutRunLines,
  measureLinePrefixWidth,
  snapToCodePointBoundary,
  wrapRuns,
  type AttrsOrMixed,
  type CaretVisualCoords,
  type DeltaOp,
  type LaidOutRunLine,
  type Run,
  type RunAttrs,
} from "./richText";
import { FormattingToolbar, type HeadingPreset } from "./FormattingToolbar";
import {
  planListContinuation,
  planListToggle,
  type ListKind,
} from "../listUtils";
import {
  copyTextToClipboard,
  findWordBoundaryLeft,
  findWordBoundaryRight,
  parseImportedDocumentToDelta,
  styleRunText,
  toPublishText,
  transformTextCase,
  type TextCaseMode,
} from "../contentUtils";

/**
 * Core Google-Docs / Microsoft-Word style canvas text editor (FR 3.6.10, see
 * brandhub-infrastructure/docs/feature/content-task-workflow/3-6-10-content-writting-view/).
 *
 * Text is drawn on <canvas> (not DOM) — pixel-accurate, avoids cross-browser
 * line-shift. A hidden offscreen contenteditable captures keystrokes/IME
 * (Vietnamese diacritics need compositionstart/update/end, not raw keydown).
 * The blinking cursor is a CSS div positioned from exact per-run canvas text
 * measurement (matching the painted font family, size, bold/italic weight,
 * and paragraph alignment).
 *
 * Content lives in a Yjs Y.Text (CRDT), not plain React state — see plan.md
 * §6 direction B: concurrent edits from other Creators are merged via Yjs
 * instead of hand-written Operational Transformation.
 */

const FONT_SIZE = DEFAULT_FONT_SIZE;
const FONT = `${FONT_SIZE}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
const PADDING_X = 24;
const PADDING_Y = 20;

// measureText is the hot path for wrapping/caret math — memoize per
// font|string. Always sets `ctx.font = font` before measuring so bold/italic,
// custom font families (Georgia, Courier New, Times New Roman, Script, etc.),
// and custom font sizes (10..64px) are measured with their exact glyph widths.
const measureCache = new Map<string, number>();
const MEASURE_CACHE_LIMIT = 5000;
function measureWidth(
  ctx: CanvasRenderingContext2D,
  font: string,
  str: string,
): number {
  if (str.length === 0) return 0;
  const key = font + "|" + str;
  const cached = measureCache.get(key);
  if (cached !== undefined) return cached;
  if (ctx.font !== font) {
    ctx.font = font;
  }
  const width = ctx.measureText(str).width;
  if (measureCache.size >= MEASURE_CACHE_LIMIT) measureCache.clear();
  measureCache.set(key, width);
  return width;
}

export interface PeerCursor {
  clientId: number;
  userId: string;
  name: string;
  color: string;
  caretIndex: number;
  selection: { anchor: number; focus: number } | null;
}

export interface CanvasTextEditorProps {
  /** Shared Yjs document — owned by the caller (useTaskContentSync) so it can also wire the WebSocket transport. */
  yDoc: Y.Doc;
  /** Called whenever the committed text changes — used by parent to mirror text into social preview. */
  onTextChange?: (text: string) => void;
  /** Other Creators currently viewing/editing this document — see useTaskContentSync's awareness state. */
  peers?: PeerCursor[];
  /** Fired on every local caret/selection change so the parent can publish it to awareness. */
  onCursorChange?: (
    caretIndex: number,
    selection: { anchor: number; focus: number } | null,
  ) => void;
}

export interface CanvasTextEditorHandle {
  /** Insert a string at the current caret position. */
  insertText: (value: string) => void;
  /** Apply imported Delta operations (from Google Docs / .docx / .md / .txt) into the editor. */
  applyDeltaOps: (ops: DeltaOp[], mode?: "replace" | "append") => void;
  /** Transform casing of selection or entire document. */
  transformCase: (mode: TextCaseMode) => void;
  /** Wrap active selection with prefix/suffix callout markers. */
  wrapSelection: (prefix: string, suffix: string) => void;
}

export const CanvasTextEditor = forwardRef<
  CanvasTextEditorHandle,
  CanvasTextEditorProps
>(
  function CanvasTextEditor(
    { yDoc, onTextChange, peers = [], onCursorChange },
    ref,
  ) {
    const yTextRef = useRef<Y.Text>(yDoc.getText("content"));
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const hiddenInputRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    // UndoManager scoped to this editor's Y.Text — undo/redo are always
    // local-only (remote edits are not undoable by this client).
    const undoManager = useMemo(
      () => new UndoManager(yTextRef.current, { captureTimeout: 500 }),
      [],
    );

    // Expose imperative methods so the parent (ContentWritingPage) can insert
    // emojis, import Google Docs / .docx Delta operations, or trigger creative tools.
    useImperativeHandle(ref, () => ({
      insertText: (value: string) => {
        hiddenInputRef.current?.focus();
        Promise.resolve().then(() => insertAtCaret(value));
      },
      applyDeltaOps: (ops: DeltaOp[], mode = "replace") => {
        applyImportedDeltaOps(ops, mode);
      },
      transformCase: (mode: TextCaseMode) => {
        handleTransformCase(mode);
      },
      wrapSelection: (prefix: string, suffix: string) => {
        handleWrapSelection(prefix, suffix);
      },
    }));

    const [text, setText] = useState(() => yTextRef.current.toString());
    const textRef = useRef(text);
    textRef.current = text;
    const [caretIndex, setCaretIndexState] = useState(0);
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
    // is the end currently being moved.
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
    // truth for both rendering and caret/click/selection geometry.
    const [runs, setRunsState] = useState<Run[]>(() =>
      deltaToRuns(yTextRef.current.toDelta()),
    );
    const runsRef = useRef(runs);
    const setRuns = useCallback((next: Run[]) => {
      runsRef.current = next;
      setRunsState(next);
    }, []);

    // Format for the next typed character when there's no active selection —
    // Google Docs' "click Bold, keep typing" behavior.
    const [pendingAttrs, setPendingAttrsState] = useState<RunAttrs>({});
    const pendingAttrsRef = useRef(pendingAttrs);
    const setPendingAttrs = useCallback((next: RunAttrs) => {
      pendingAttrsRef.current = next;
      setPendingAttrsState(next);
    }, []);

    const [isComposing, setIsComposing] = useState(false);
    const [compositionPreview, setCompositionPreview] = useState<string | null>(
      null,
    );
    const [isFocused, setIsFocused] = useState(false);
    const [caretPos, setCaretPos] = useState<CaretVisualCoords>({
      x: PADDING_X,
      y: PADDING_Y,
      height: FONT_SIZE + 4,
      lineIndex: 0,
      baselineY: PADDING_Y + FONT_SIZE,
    });
    const [canvasWidth, setCanvasWidth] = useState(800);
    const canvasWidthRef = useRef(canvasWidth);
    canvasWidthRef.current = canvasWidth;

    // Observe Y.Text mutations (both local and remote)
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
                const len =
                  typeof op.insert === "string" ? op.insert.length : 1;
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
      // eslint-disable-next-line react-hooks/exhaustive-deps -- caretIndex/selection read via closure intentionally
    }, []);

    // Composed display text = committed text with the in-progress IME
    // syllable spliced in at the caret.
    const displayText = compositionPreview
      ? text.slice(0, caretIndex) + compositionPreview + text.slice(caretIndex)
      : text;
    const displayCaretIndex = compositionPreview
      ? caretIndex + compositionPreview.length
      : caretIndex;

    // Runs with the in-progress IME syllable spliced in at the caret
    const displayRuns: Run[] = useMemo(
      () =>
        compositionPreview
          ? (() => {
              const caretAttrs = {
                ...attrsAtIndex(runs, caretIndex),
                ...pendingAttrs,
              };
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
          : runs,
      [runs, compositionPreview, caretIndex, pendingAttrs],
    );

    const getLaidOutLines = useCallback(
      (
        ctx: CanvasRenderingContext2D,
        targetRuns: Run[],
        width: number,
        fallback?: RunAttrs,
      ): LaidOutRunLine[] => {
        const maxTextWidth = Math.max(80, width - PADDING_X * 2);
        const rawLines = wrapRuns(ctx, targetRuns, maxTextWidth, measureWidth);
        return layoutRunLines(
          ctx,
          rawLines,
          maxTextWidth,
          PADDING_X,
          PADDING_Y,
          measureWidth,
          fallback,
        );
      },
      [],
    );

    const render = useCallback(() => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const cssWidth = canvasWidth;
      const activeCaretAttrs = {
        ...attrsAtIndex(displayRuns, displayCaretIndex),
        ...pendingAttrs,
      };
      const laidOutLines = getLaidOutLines(
        ctx,
        displayRuns,
        cssWidth,
        activeCaretAttrs,
      );
      const lastLine = laidOutLines[laidOutLines.length - 1];
      const totalLinesBottom = lastLine
        ? lastLine.yTop + lastLine.lineHeight
        : PADDING_Y + 24;
      const cssHeight = Math.max(460, totalLinesBottom + PADDING_Y * 2);

      if (
        canvas.width !== Math.round(cssWidth * dpr) ||
        canvas.height !== Math.round(cssHeight * dpr)
      ) {
        canvas.width = Math.round(cssWidth * dpr);
        canvas.height = Math.round(cssHeight * dpr);
        canvas.style.width = `${cssWidth}px`;
        canvas.style.height = `${cssHeight}px`;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cssWidth, cssHeight);
      ctx.font = FONT;
      ctx.textBaseline = "alphabetic";

      // Subtle Google Docs corner margin crop marks (visual-only)
      ctx.strokeStyle = "rgba(154, 160, 166, 0.35)";
      ctx.lineWidth = 1;
      const cropLen = 8;
      // Top-left margin corner
      ctx.beginPath();
      ctx.moveTo(PADDING_X - cropLen, PADDING_Y);
      ctx.lineTo(PADDING_X, PADDING_Y);
      ctx.lineTo(PADDING_X, PADDING_Y - cropLen);
      // Top-right margin corner
      ctx.moveTo(cssWidth - PADDING_X + cropLen, PADDING_Y);
      ctx.lineTo(cssWidth - PADDING_X, PADDING_Y);
      ctx.lineTo(cssWidth - PADDING_X, PADDING_Y - cropLen);
      ctx.stroke();

      // Empty document placeholder on canvas (like Google Docs "Nhập @ để chèn...")
      if (displayText.length === 0) {
        ctx.font = `italic ${FONT_SIZE}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
        ctx.fillStyle = "#9aa0a6";
        ctx.fillText(
          "Bắt đầu soạn thảo bài đăng hoặc nhấn 'Nhập Google Docs / File' để tự động điền nội dung…",
          PADDING_X,
          PADDING_Y + FONT_SIZE,
        );
        ctx.font = FONT;
      }

      // 1. Selection highlight band, drawn using exact per-run measurements and lineStartX
      if (selection && selection.anchor !== selection.focus) {
        const selStart = Math.min(selection.anchor, selection.focus);
        const selEnd = Math.max(selection.anchor, selection.focus);
        ctx.fillStyle = "rgba(66, 133, 244, 0.28)";
        for (const line of laidOutLines) {
          const lineStart = line.startIndex;
          const lineEnd = line.startIndex + line.text.length;
          const rangeStart = Math.max(selStart, lineStart);
          const rangeEnd = Math.min(selEnd, lineEnd);
          if (rangeStart >= rangeEnd) continue;
          const x1 = measureLinePrefixWidth(
            ctx,
            line,
            rangeStart - lineStart,
            measureWidth,
          );
          const x2 = measureLinePrefixWidth(
            ctx,
            line,
            rangeEnd - lineStart,
            measureWidth,
          );
          ctx.fillRect(
            line.lineStartX + x1,
            line.yTop,
            Math.max(2, x2 - x1),
            line.lineHeight,
          );
        }
      }

      // 2. Per-run paint: each segment gets its exact font, size, color, highlight, and decoration
      for (const line of laidOutLines) {
        let x = line.lineStartX;
        const y = line.baselineY;
        for (const segment of line.segments) {
          const fontStr = fontStringFor(segment.attrs);
          const segFontSize = segment.attrs.size ?? FONT_SIZE;
          const w = measureWidth(ctx, fontStr, segment.text);
          if (segment.attrs.highlight) {
            ctx.fillStyle = segment.attrs.highlight;
            ctx.fillRect(x, line.yTop, w, line.lineHeight);
          }
          ctx.font = fontStr;
          ctx.fillStyle = segment.attrs.color ?? "#1f2937";
          ctx.fillText(segment.text, x, y);
          if (segment.attrs.underline || segment.attrs.link) {
            ctx.strokeStyle = ctx.fillStyle as string;
            ctx.lineWidth = Math.max(1, Math.round(segFontSize / 14));
            ctx.beginPath();
            ctx.moveTo(x, y + 2);
            ctx.lineTo(x + w, y + 2);
            ctx.stroke();
          }
          if (segment.attrs.strikethrough) {
            ctx.strokeStyle = ctx.fillStyle as string;
            ctx.lineWidth = Math.max(1, Math.round(segFontSize / 14));
            ctx.beginPath();
            ctx.moveTo(x, y - segFontSize * 0.3);
            ctx.lineTo(x + w, y - segFontSize * 0.3);
            ctx.stroke();
          }
          x += w;
        }
      }
      ctx.font = FONT;

      // 3. IME composition underline
      if (compositionPreview) {
        const start = caretCoordsFromLaidOutLines(
          ctx,
          laidOutLines,
          caretIndex,
          measureWidth,
          activeCaretAttrs,
        );
        const end = caretCoordsFromLaidOutLines(
          ctx,
          laidOutLines,
          caretIndex + compositionPreview.length,
          measureWidth,
          activeCaretAttrs,
        );
        if (start.lineIndex === end.lineIndex) {
          const y = start.baselineY + 2;
          ctx.strokeStyle = "#1f2937";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(start.x, y);
          ctx.lineTo(end.x, y);
          ctx.stroke();
        }
      }

      // 4. Local Caret Position — computed from the exact same laidOutLines
      const nextCaret = caretCoordsFromLaidOutLines(
        ctx,
        laidOutLines,
        displayCaretIndex,
        measureWidth,
        activeCaretAttrs,
      );
      setCaretPos((prev) =>
        prev.x === nextCaret.x &&
        prev.y === nextCaret.y &&
        prev.height === nextCaret.height &&
        prev.lineIndex === nextCaret.lineIndex
          ? prev
          : nextCaret,
      );
    }, [
      displayRuns,
      displayCaretIndex,
      caretIndex,
      compositionPreview,
      canvasWidth,
      selection,
      pendingAttrs,
      getLaidOutLines,
    ]);

    useEffect(() => {
      render();
    }, [render]);

    // Re-measure and re-render once browser web fonts finish loading so
    // custom fonts never keep stale fallback widths.
    useEffect(() => {
      let active = true;
      if (typeof document !== "undefined" && document.fonts?.ready) {
        document.fonts.ready.then(() => {
          if (!active) return;
          measureCache.clear();
          clearRunWrapCache();
          render();
        });
      }
      return () => {
        active = false;
      };
    }, [render]);

    useEffect(() => {
      if (isFocused) onCursorChange?.(caretIndex, selection);
    }, [caretIndex, selection, isFocused, onCursorChange]);

    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;
      const initialWidth = container.clientWidth;
      if (initialWidth > 0) {
        setCanvasWidth(initialWidth);
      }
      const observer = new ResizeObserver((entries) => {
        const width = entries[0]?.contentRect.width;
        if (width && width > 0) setCanvasWidth(width);
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

    /**
     * Converts a mouse event's viewport coordinates `(clientX, clientY)` into
     * the exact document character index under the pointer.
     */
    const indexFromEvent = (
      clientX: number,
      clientY: number,
    ): number | null => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return null;
      const rect = canvas.getBoundingClientRect();
      const effectiveWidth =
        rect.width > 0 ? canvasWidthRef.current : canvasWidthRef.current;
      const scaleX = rect.width > 0 ? effectiveWidth / rect.width : 1;
      const canvasX = (clientX - rect.left) * scaleX;
      const canvasY = clientY - rect.top;

      const laidOutLines = getLaidOutLines(
        ctx,
        runsRef.current,
        effectiveWidth,
        pendingAttrsRef.current,
      );
      return indexFromLaidOutLinesPoint(
        ctx,
        laidOutLines,
        canvasX,
        canvasY,
        measureWidth,
      );
    };

    const handleCanvasMouseDown = (
      event: React.MouseEvent<HTMLCanvasElement>,
    ) => {
      const index = indexFromEvent(event.clientX, event.clientY);
      if (index === null) return;

      // Triple-click (event.detail >= 3) selects the entire paragraph, matching Google Docs / Word
      if (event.detail >= 3) {
        const t = textRef.current;
        const paraStart = t.lastIndexOf("\n", Math.max(0, index - 1)) + 1;
        const nextBreak = t.indexOf("\n", index);
        const paraEnd = nextBreak === -1 ? t.length : nextBreak;
        isDraggingRef.current = false;
        setSelection({ anchor: paraStart, focus: paraEnd });
        setCaretIndex(paraEnd);
        setPendingAttrs({});
        focusHiddenInput();
        return;
      }

      // Double-click (event.detail === 2) is handled by onDoubleClick — avoid resetting selection
      if (event.detail === 2) {
        isDraggingRef.current = false;
        focusHiddenInput();
        return;
      }

      isDraggingRef.current = true;
      if (event.shiftKey) {
        const anchor = selectionRef.current?.anchor ?? caretIndexRef.current;
        setSelection(anchor === index ? null : { anchor, focus: index });
        setCaretIndex(index);
      } else {
        setCaretIndex(index);
        setSelection({ anchor: index, focus: index });
      }
      setPendingAttrs({});
      focusHiddenInput();
    };

    // Double-click on canvas selects the word under the cursor, matching Google Docs / Word
    const handleCanvasDoubleClick = (
      event: React.MouseEvent<HTMLCanvasElement>,
    ) => {
      const index = indexFromEvent(event.clientX, event.clientY);
      if (index === null) return;
      const t = textRef.current;
      if (t.length === 0) return;

      const isWordChar = (ch: string) => /[^\s.,;!?()[\]{}"'“”‘’<>\\/|]/.test(ch);
      let start = Math.min(index, t.length);
      let end = start;
      if (start > 0 && !isWordChar(t[start] ?? "") && isWordChar(t[start - 1])) {
        start -= 1;
        end = start;
      }
      while (start > 0 && isWordChar(t[start - 1])) start--;
      while (end < t.length && isWordChar(t[end])) end++;

      if (end > start) {
        setSelection({ anchor: start, focus: end });
        setCaretIndex(end);
      }
      focusHiddenInput();
    };

    // Mouse-drag selection: window-level listeners while dragging
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
      // eslint-disable-next-line react-hooks/exhaustive-deps -- reads live refs
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

    const deleteBackward = (byWord = false) => {
      if (deleteSelectionIfAny() !== null) return;
      const cur = caretIndexRef.current;
      if (cur === 0) return;
      const prevBoundary = byWord
        ? findWordBoundaryLeft(textRef.current, cur)
        : snapToCodePointBoundary(textRef.current, cur - 1, "left");
      const deleteLen = Math.max(1, cur - prevBoundary);
      yTextRef.current.delete(prevBoundary, deleteLen);
      setCaretIndex(prevBoundary);
    };

    const deleteForward = (byWord = false) => {
      if (deleteSelectionIfAny() !== null) return;
      const cur = caretIndexRef.current;
      if (cur >= yTextRef.current.length) return;
      const nextBoundary = byWord
        ? findWordBoundaryRight(textRef.current, cur)
        : snapToCodePointBoundary(textRef.current, cur + 1, "right");
      const deleteLen = Math.max(1, nextBoundary - cur);
      yTextRef.current.delete(cur, deleteLen);
    };

    // --- Formatting toolbar wiring -------------------------------------

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
      hiddenInputRef.current?.focus();
    };

    const currentAttrs = (): AttrsOrMixed => {
      const range = currentSelRange();
      if (range) return attrsOverRange(runsRef.current, range.start, range.end);
      const base = attrsAtIndex(runsRef.current, caretIndexRef.current);
      return { ...base, ...pendingAttrsRef.current };
    };

    const toggleFormat = (
      key: "bold" | "italic" | "underline" | "strikethrough",
    ) => {
      const active = currentAttrs()[key];
      applyFormat({ [key]: active && active !== "mixed" ? undefined : true });
    };

    const clearFormatting = () => {
      const range = currentSelRange();
      if (!range) {
        setPendingAttrs({});
        return;
      }
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
      hiddenInputRef.current?.focus();
    };

    const setColor = (color: string | undefined) => applyFormat({ color });
    const setHighlight = (highlight: string | undefined) =>
      applyFormat({ highlight });
    const setFontFamily = (font: string | undefined) => applyFormat({ font });
    const setFontSize = (size: number | undefined) => applyFormat({ size });
    const setLink = (link: string | undefined) => applyFormat({ link });

    /** Alignment is paragraph-scoped: finds the paragraph's full char range around the caret (or selection) and formats the whole thing via Y.Text. */
    const setAlign = (align: RunAttrs["align"]) => {
      const t = textRef.current;
      const sel = selectionRef.current;
      const anchorIndex = sel
        ? Math.min(sel.anchor, sel.focus)
        : caretIndexRef.current;
      const focusIndex = sel
        ? Math.max(sel.anchor, sel.focus)
        : caretIndexRef.current;
      const paraStart = t.lastIndexOf("\n", Math.max(0, anchorIndex - 1)) + 1;
      const nextBreak = t.indexOf("\n", focusIndex);
      const paraEnd = nextBreak === -1 ? t.length : nextBreak;
      if (paraEnd > paraStart) {
        yTextRef.current.format(paraStart, paraEnd - paraStart, { align });
        setRuns(deltaToRuns(yTextRef.current.toDelta()));
      } else {
        setPendingAttrs({ ...pendingAttrsRef.current, align });
      }
      hiddenInputRef.current?.focus();
    };

    const toggleList = (kind: ListKind) => {
      const sel = selectionRef.current;
      const from = sel ? sel.anchor : caretIndexRef.current;
      const to = sel ? sel.focus : caretIndexRef.current;
      const { edits, caret } = planListToggle(textRef.current, from, to, kind);
      const yText = yTextRef.current;
      yText.doc?.transact(() => {
        for (const e of edits) {
          if (e.deleteLen > 0) yText.delete(e.at, e.deleteLen);
          if (e.insert) yText.insert(e.at, e.insert);
        }
      });
      setSelection(null);
      setCaretIndex(caret);
      hiddenInputRef.current?.focus();
    };

    const handleTransformCase = (mode: TextCaseMode) => {
      const yText = yTextRef.current;
      const range = currentSelRange();
      if (range) {
        const slice = textRef.current.slice(range.start, range.end);
        const transformed = transformTextCase(slice, mode);
        const preservedAttrs = attrsAtIndex(runsRef.current, range.start + 1);
        yText.doc?.transact(() => {
          yText.delete(range.start, range.end - range.start);
          if (Object.keys(preservedAttrs).length > 0) {
            yText.insert(range.start, transformed, preservedAttrs);
          } else {
            yText.insert(range.start, transformed);
          }
        });
        setSelection({
          anchor: range.start,
          focus: range.start + transformed.length,
        });
        setCaretIndex(range.start + transformed.length);
      } else if (textRef.current.length > 0) {
        const currentDelta = yText.toDelta();
        const transformedDelta: DeltaOp[] = currentDelta.map((op: DeltaOp) => ({
          insert:
            typeof op.insert === "string"
              ? transformTextCase(op.insert, mode)
              : "",
          ...(op.attributes ? { attributes: op.attributes } : {}),
        }));
        yText.doc?.transact(() => {
          yText.delete(0, yText.length);
          yText.applyDelta(transformedDelta);
        });
      }
      hiddenInputRef.current?.focus();
    };

    const handleWrapSelection = (prefix: string, suffix: string) => {
      const yText = yTextRef.current;
      const range = currentSelRange();
      if (range) {
        const slice = textRef.current.slice(range.start, range.end);
        const wrapped = `${prefix}${slice}${suffix}`;
        const preservedAttrs = {
          ...attrsAtIndex(runsRef.current, range.start + 1),
          bold: true,
        };
        yText.doc?.transact(() => {
          yText.delete(range.start, range.end - range.start);
          yText.insert(range.start, wrapped, preservedAttrs);
        });
        setSelection({
          anchor: range.start,
          focus: range.start + wrapped.length,
        });
        setCaretIndex(range.start + wrapped.length);
      } else {
        insertAtCaret(`${prefix}Nội dung nổi bật${suffix}`);
      }
      hiddenInputRef.current?.focus();
    };

    const insertDeltaOpExact = (
      yText: Y.Text,
      cursor: number,
      op: DeltaOp,
    ): number => {
      if (!op.insert) return cursor;
      yText.insert(cursor, op.insert, {
        bold: null,
        italic: null,
        underline: null,
        strikethrough: null,
        color: null,
        highlight: null,
        font: null,
        size: null,
        link: null,
        ...(op.attributes ?? {}),
      });
      return cursor + op.insert.length;
    };

    const applyImportedDeltaOps = (
      ops: DeltaOp[],
      mode: "replace" | "append" = "replace",
    ) => {
      const yText = yTextRef.current;
      yText.doc?.transact(() => {
        if (mode === "replace") {
          yText.delete(0, yText.length);
          let cursor = 0;
          for (const op of ops) {
            cursor = insertDeltaOpExact(yText, cursor, op);
          }
          setSelection(null);
          setCaretIndex(cursor);
        } else {
          let cursor = yText.length;
          if (cursor > 0 && !textRef.current.endsWith("\n")) {
            cursor = insertDeltaOpExact(yText, cursor, { insert: "\n\n" });
          }
          for (const op of ops) {
            cursor = insertDeltaOpExact(yText, cursor, op);
          }
          setSelection(null);
          setCaretIndex(cursor);
        }
      });
      setRuns(deltaToRuns(yText.toDelta()));
      hiddenInputRef.current?.focus();
      setTimeout(() => hiddenInputRef.current?.focus(), 0);
    };

    const handleApplyHeadingPreset = (preset: HeadingPreset) => {
      const t = textRef.current;
      const sel = selectionRef.current;
      const anchorIndex = sel
        ? Math.min(sel.anchor, sel.focus)
        : caretIndexRef.current;
      const focusIndex = sel
        ? Math.max(sel.anchor, sel.focus)
        : caretIndexRef.current;
      const paraStart = t.lastIndexOf("\n", Math.max(0, anchorIndex - 1)) + 1;
      const nextBreak = t.indexOf("\n", focusIndex);
      const paraEnd = nextBreak === -1 ? t.length : nextBreak;

      const patch: RunAttrs =
        preset === "h1"
          ? { size: 28, bold: true }
          : preset === "h2"
            ? { size: 22, bold: true }
            : preset === "h3"
              ? { size: 18, bold: true }
              : { size: 16, bold: undefined };

      if (paraEnd > paraStart) {
        yTextRef.current.format(paraStart, paraEnd - paraStart, patch);
        setRuns(deltaToRuns(yTextRef.current.toDelta()));
      } else {
        setPendingAttrs({ ...pendingAttrsRef.current, ...patch });
      }
      hiddenInputRef.current?.focus();
    };

    const handleApplyZantextPreset = (
      attrs: RunAttrs,
      customText?: string,
    ) => {
      const yText = yTextRef.current;
      const range = currentSelRange();
      const formatPatch = {
        bold: attrs.bold ?? null,
        italic: attrs.italic ?? null,
        underline: attrs.underline ?? null,
        strikethrough: attrs.strikethrough ?? null,
        font: attrs.font ?? null,
      };
      if (range) {
        yText.doc?.transact(() => {
          if (
            customText &&
            customText !== textRef.current.slice(range.start, range.end)
          ) {
            yText.delete(range.start, range.end - range.start);
            insertDeltaOpExact(yText, range.start, {
              insert: customText,
              attributes: attrs,
            });
            setSelection({
              anchor: range.start,
              focus: range.start + customText.length,
            });
            setCaretIndex(range.start + customText.length);
          } else {
            yText.format(range.start, range.end - range.start, formatPatch);
          }
        });
      } else if (customText) {
        yText.doc?.transact(() => {
          const at = caretIndexRef.current;
          const nextCursor = insertDeltaOpExact(yText, at, {
            insert: customText,
            attributes: attrs,
          });
          setSelection({ anchor: at, focus: nextCursor });
          setCaretIndex(nextCursor);
        });
      } else if (yText.length > 0) {
        yText.doc?.transact(() => {
          yText.format(0, yText.length, formatPatch);
        });
      }
      setRuns(deltaToRuns(yText.toDelta()));
      hiddenInputRef.current?.focus();
      setTimeout(() => hiddenInputRef.current?.focus(), 0);
    };

    const newlineWithListContinuation = (): string => {
      const plan = planListContinuation(textRef.current, caretIndexRef.current);
      if (plan.kind === "exit") {
        yTextRef.current.delete(plan.start, plan.deleteLen);
        setCaretIndex(plan.start);
        return "";
      }
      return plan.insert;
    };

    const handleBeforeInput = (event: React.FormEvent<HTMLDivElement>) => {
      const nativeEvent = event.nativeEvent as InputEvent;
      if (isComposing) return;

      const data = nativeEvent.data;
      if (
        nativeEvent.inputType === "insertLineBreak" ||
        nativeEvent.data === "\n"
      ) {
        const newline = newlineWithListContinuation();
        if (newline) insertAtCaret(newline);
        event.preventDefault();
      } else if (data) {
        insertAtCaret(data);
        event.preventDefault();
      }
    };

    const getSelectedStyledText = (): string => {
      const range = currentSelRange();
      if (!range) return "";
      let out = "";
      for (const run of runsRef.current) {
        const runEnd = run.startIndex + run.text.length;
        const start = Math.max(range.start, run.startIndex);
        const end = Math.min(range.end, runEnd);
        if (start >= end) continue;
        const slice = run.text.slice(start - run.startIndex, end - run.startIndex);
        out += styleRunText(slice, run.attrs);
      }
      return out;
    };

    const handleCopy = (event: React.ClipboardEvent<HTMLDivElement>) => {
      const styled = getSelectedStyledText();
      if (!styled) return;
      event.clipboardData?.setData("text/plain", styled);
      event.preventDefault();
    };

    const handleCut = (event: React.ClipboardEvent<HTMLDivElement>) => {
      const styled = getSelectedStyledText();
      if (!styled) return;
      event.clipboardData?.setData("text/plain", styled);
      deleteSelectionIfAny();
      event.preventDefault();
    };

    const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
      const html = event.clipboardData?.getData("text/html") ?? "";
      const hasRichFormatting =
        /<(b|strong|i|em|u|s|strike|del|h1|h2|h3|li)\b|font-weight\s*:\s*(700|800|900|bold)|font-style\s*:\s*italic|text-decoration[^"]*underline/i.test(
          html,
        );
      if (hasRichFormatting) {
        const ops = parseImportedDocumentToDelta(html, "html");
        if (ops.length > 0) {
          const yText = yTextRef.current;
          yText.doc?.transact(() => {
            const collapsedAt = deleteSelectionIfAny();
            let cursor = collapsedAt ?? caretIndexRef.current;
            for (const op of ops) {
              cursor = insertDeltaOpExact(yText, cursor, op);
            }
            setCaretIndex(cursor);
          });
          setRuns(deltaToRuns(yText.toDelta()));
          event.preventDefault();
          return;
        }
      }

      const pasted = event.clipboardData?.getData("text/plain");
      if (pasted) {
        insertAtCaret(pasted.replace(/\r\n/g, "\n"));
        event.preventDefault();
      }
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
      if (hiddenInputRef.current) hiddenInputRef.current.textContent = "";
    };

    /** Laid-out lines for the current committed text, used by Home/End/ArrowUp/ArrowDown. */
    const currentLaidOutLines = (): LaidOutRunLine[] => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return [];
      return getLaidOutLines(
        ctx,
        runsRef.current,
        canvasWidthRef.current,
        pendingAttrsRef.current,
      );
    };

    // Peer cursor pixel positions — computed from the exact same laid-out lines
    const peerCaretPixels = useMemo(() => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx || peers.length === 0) return [];
      const laidOutLines = getLaidOutLines(ctx, runs, canvasWidth);
      return peers.map((peer) => {
        const clamped = Math.max(0, Math.min(peer.caretIndex, text.length));
        const coords = caretCoordsFromLaidOutLines(
          ctx,
          laidOutLines,
          clamped,
          measureWidth,
        );
        return {
          ...peer,
          x: coords.x,
          y: coords.y,
          height: coords.height,
        };
      });
    }, [peers, runs, text.length, canvasWidth, getLaidOutLines]);

    /** Moves the caret, extending or clearing the selection depending on shiftKey. */
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
        toggleFormat("bold");
        event.preventDefault();
        return;
      }
      if (ctrl && !event.shiftKey && event.key.toLowerCase() === "i") {
        toggleFormat("italic");
        event.preventDefault();
        return;
      }
      if (ctrl && !event.shiftKey && event.key.toLowerCase() === "u") {
        toggleFormat("underline");
        event.preventDefault();
        return;
      }
      if (ctrl && event.key.toLowerCase() === "z") {
        if (event.shiftKey) {
          undoManager.redo();
        } else {
          undoManager.undo();
        }
        event.preventDefault();
        return;
      }
      if (ctrl && event.key.toLowerCase() === "y") {
        undoManager.redo();
        event.preventDefault();
        return;
      }
      if (ctrl && event.key.toLowerCase() === "a") {
        setSelection({ anchor: 0, focus: yTextRef.current.length });
        setCaretIndex(yTextRef.current.length);
        event.preventDefault();
        return;
      }
      if (ctrl && !event.shiftKey && event.key.toLowerCase() === "c") {
        const styled =
          getSelectedStyledText() ||
          toPublishText(yTextRef.current.toDelta());
        if (styled) {
          void copyTextToClipboard(styled);
        }
        event.preventDefault();
        return;
      }
      if (ctrl && !event.shiftKey && event.key.toLowerCase() === "x") {
        const styled = getSelectedStyledText();
        if (styled) {
          void copyTextToClipboard(styled);
          deleteSelectionIfAny();
        }
        event.preventDefault();
        return;
      }
      if (event.key === "Backspace") {
        deleteBackward(ctrl || event.altKey);
        event.preventDefault();
      } else if (event.key === "Delete") {
        deleteForward(ctrl || event.altKey);
        event.preventDefault();
      } else if (event.key === " " && !isComposing) {
        insertAtCaret(" ");
        event.preventDefault();
      } else if (event.key === "ArrowLeft") {
        const nextIdx =
          ctrl || event.altKey
            ? findWordBoundaryLeft(textRef.current, caretIndexRef.current)
            : snapToCodePointBoundary(
                textRef.current,
                caretIndexRef.current - 1,
                "left",
              );
        moveCaret(nextIdx, event.shiftKey);
        event.preventDefault();
      } else if (event.key === "ArrowRight") {
        const nextIdx =
          ctrl || event.altKey
            ? findWordBoundaryRight(textRef.current, caretIndexRef.current)
            : snapToCodePointBoundary(
                textRef.current,
                caretIndexRef.current + 1,
                "right",
              );
        moveCaret(nextIdx, event.shiftKey);
        event.preventDefault();
      } else if (event.key === "ArrowUp") {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        const lines = currentLaidOutLines();
        if (ctx && lines.length > 0) {
          const curCoords = caretCoordsFromLaidOutLines(
            ctx,
            lines,
            caretIndexRef.current,
            measureWidth,
          );
          if (curCoords.lineIndex > 0) {
            const targetLine = lines[curCoords.lineIndex - 1];
            const nextIdx = indexFromLaidOutLinesPoint(
              ctx,
              lines,
              curCoords.x,
              targetLine.yTop + targetLine.lineHeight / 2,
              measureWidth,
            );
            moveCaret(nextIdx, event.shiftKey);
          } else {
            moveCaret(0, event.shiftKey);
          }
        }
        event.preventDefault();
      } else if (event.key === "ArrowDown") {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        const lines = currentLaidOutLines();
        if (ctx && lines.length > 0) {
          const curCoords = caretCoordsFromLaidOutLines(
            ctx,
            lines,
            caretIndexRef.current,
            measureWidth,
          );
          if (curCoords.lineIndex < lines.length - 1) {
            const targetLine = lines[curCoords.lineIndex + 1];
            const nextIdx = indexFromLaidOutLinesPoint(
              ctx,
              lines,
              curCoords.x,
              targetLine.yTop + targetLine.lineHeight / 2,
              measureWidth,
            );
            moveCaret(nextIdx, event.shiftKey);
          } else {
            moveCaret(yTextRef.current.length, event.shiftKey);
          }
        }
        event.preventDefault();
      } else if (event.key === "Home") {
        if (ctrl) {
          moveCaret(0, event.shiftKey);
          event.preventDefault();
          return;
        }
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        const lines = currentLaidOutLines();
        if (ctx && lines.length > 0) {
          const curCoords = caretCoordsFromLaidOutLines(
            ctx,
            lines,
            caretIndexRef.current,
            measureWidth,
          );
          const line = lines[curCoords.lineIndex];
          moveCaret(line ? line.startIndex : 0, event.shiftKey);
        } else {
          moveCaret(0, event.shiftKey);
        }
        event.preventDefault();
      } else if (event.key === "End") {
        if (ctrl) {
          moveCaret(yTextRef.current.length, event.shiftKey);
          event.preventDefault();
          return;
        }
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        const lines = currentLaidOutLines();
        if (ctx && lines.length > 0) {
          const curCoords = caretCoordsFromLaidOutLines(
            ctx,
            lines,
            caretIndexRef.current,
            measureWidth,
          );
          const line = lines[curCoords.lineIndex];
          const lineEnd = line
            ? line.softWrappedToNext && line.text.length > 0
              ? line.startIndex + line.text.length - 1
              : line.startIndex + line.text.length
            : yTextRef.current.length;
          moveCaret(lineEnd, event.shiftKey);
        } else {
          moveCaret(yTextRef.current.length, event.shiftKey);
        }
        event.preventDefault();
      }
    };

    // Word / character count — derived from committed text only.
    const wordCount = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
    const charCount = text.length;

    const readingTimeSec = Math.max(0, Math.ceil((wordCount / 200) * 60));

    const activeRange = currentSelRange();
    const selectedPlainText = activeRange
      ? text.slice(activeRange.start, activeRange.end)
      : text;

    return (
      <div className="border-border w-full overflow-hidden rounded-b-xl border bg-[#f9fbfd] shadow-xs dark:bg-zinc-900">
        <FormattingToolbar
          currentAttrs={currentAttrs()}
          onToggle={toggleFormat}
          onSetColor={setColor}
          onSetHighlight={setHighlight}
          onSetFont={setFontFamily}
          onSetSize={setFontSize}
          onSetAlign={setAlign}
          onToggleList={toggleList}
          onSetLink={setLink}
          onUndo={() => undoManager.undo()}
          onRedo={() => undoManager.redo()}
          onClearFormatting={clearFormatting}
          onInsertEmoji={(emoji) => insertAtCaret(emoji)}
          onTransformCase={handleTransformCase}
          onWrapSelection={handleWrapSelection}
          onInsertSnippet={(snippet) => insertAtCaret(snippet)}
          onInsertTemplateOps={(ops) => applyImportedDeltaOps(ops, "append")}
          onApplyHeadingPreset={handleApplyHeadingPreset}
          selectedPlainText={selectedPlainText}
          onApplyZantextPreset={handleApplyZantextPreset}
        />

        {/* Google Docs Horizontal Ruler */}
        <div
          data-testid="gdocs-ruler"
          aria-hidden="true"
          className="border-border relative flex h-5 items-end justify-center border-y bg-[#f1f3f4] select-none dark:bg-zinc-800/80"
        >
          <div className="relative flex h-full w-full max-w-[816px] items-end justify-between bg-white px-6 dark:bg-zinc-900">
            {/* Left & Right Margin Indent Triangles (Google Docs blue markers) */}
            <span
              className="absolute top-0 left-[22px] text-[9px] leading-none text-blue-600"
              title="Lề trái (Left Margin)"
            >
              ▼
            </span>
            <span
              className="absolute top-0 right-[22px] text-[9px] leading-none text-blue-600"
              title="Lề phải (Right Margin)"
            >
              ▼
            </span>
            {Array.from({ length: 16 }, (_, i) => i + 1).map((cm) => (
              <div key={cm} className="flex flex-col items-center">
                <span className="text-[8px] leading-none font-medium text-[#5f6368] dark:text-zinc-400">
                  {cm}
                </span>
                <div className="mt-0.5 h-1.5 w-px bg-[#dadce0] dark:bg-zinc-600" />
              </div>
            ))}
          </div>
        </div>

        {/* Page canvas: Google Docs "#f8f9fa" workspace desk behind an A4 white paper sheet.
            Purely visual — the editor's own padding (PADDING_X/PADDING_Y) owns caret math. */}
        <div className="bg-[#f8f9fa] px-4 py-6 sm:px-8 dark:bg-[#1c1d1f]">
          <div
            ref={containerRef}
            className="relative mx-auto w-full max-w-[816px] rounded-[2px] bg-white shadow-[0_1px_3px_1px_rgba(60,64,67,0.15),0_1px_2px_0_rgba(60,64,67,0.3)] dark:bg-[#2b2d30]"
            style={{ minHeight: "460px" }}
            onClick={focusHiddenInput}
          >
            <canvas
              ref={canvasRef}
              aria-hidden="true"
              onMouseDown={handleCanvasMouseDown}
              onDoubleClick={handleCanvasDoubleClick}
              className="block w-full cursor-text"
              style={{ minHeight: "460px" }}
            />
            {isFocused && (
              <div
                data-testid="canvas-caret"
                className="bg-foreground pointer-events-none absolute w-[2px] animate-pulse"
                style={{
                  left: caretPos.x,
                  top: caretPos.y,
                  height: caretPos.height,
                }}
              />
            )}
            {/* Peer cursors — colored flag + name label, Google-Docs style. */}
            {peerCaretPixels.map((peer) => (
              <div
                key={peer.clientId}
                className="pointer-events-none absolute"
                style={{ left: peer.x, top: peer.y }}
              >
                <div
                  className="w-[2px]"
                  style={{
                    height: peer.height,
                    backgroundColor: peer.color,
                  }}
                />
                <span
                  className="absolute -top-[18px] left-0 rounded-t px-1 py-px text-[10px] whitespace-nowrap text-white"
                  style={{ backgroundColor: peer.color }}
                >
                  {peer.name}
                </span>
              </div>
            ))}
            <div
              ref={hiddenInputRef}
              contentEditable
              suppressContentEditableWarning
              onBeforeInput={handleBeforeInput}
              onCopy={handleCopy}
              onCut={handleCut}
              onPaste={handlePaste}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionUpdate={handleCompositionUpdate}
              onCompositionEnd={handleCompositionEnd}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => {
                setIsFocused(false);
                setIsComposing(false);
                setCompositionPreview(null);
              }}
              className="fixed top-0 left-0 h-px w-px overflow-hidden opacity-0"
              style={{ transform: "translateX(-10000px)" }}
              role="textbox"
              aria-multiline="true"
              aria-label="Content editor input"
              tabIndex={-1}
            />
            {/* Accessibility: screen readers can't read canvas pixels — this
            hidden region mirrors the real text in parallel (see spec.md §4). */}
            <div className="sr-only" aria-live="polite">
              {displayText}
            </div>
          </div>
        </div>
        {/* Status bar: word/char count + reading time + keyboard shortcut hints */}
        <div className="border-border text-muted-foreground flex items-center justify-between border-t bg-white px-4 py-1.5 text-xs dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <span className="font-medium">
              {wordCount} từ &nbsp;·&nbsp; {charCount} ký tự
            </span>
            {wordCount > 0 && (
              <span className="text-muted-foreground/80 hidden text-[11px] md:inline">
                (~{readingTimeSec}s đọc)
              </span>
            )}
          </div>
          <span className="hidden gap-3 sm:flex">
            <span title="Bold">
              <kbd className="bg-muted rounded px-1 py-0.5 font-mono text-[10px]">
                Ctrl+B
              </kbd>{" "}
              In đậm
            </span>
            <span title="Italic">
              <kbd className="bg-muted rounded px-1 py-0.5 font-mono text-[10px]">
                Ctrl+I
              </kbd>{" "}
              Nghiêng
            </span>
            <span title="Underline">
              <kbd className="bg-muted rounded px-1 py-0.5 font-mono text-[10px]">
                Ctrl+U
              </kbd>{" "}
              Gạch dưới
            </span>
            <span title="Undo">
              <kbd className="bg-muted rounded px-1 py-0.5 font-mono text-[10px]">
                Ctrl+Z
              </kbd>{" "}
              Hoàn tác
            </span>
            <span title="Redo">
              <kbd className="bg-muted rounded px-1 py-0.5 font-mono text-[10px]">
                Ctrl+Y
              </kbd>{" "}
              Làm lại
            </span>
          </span>
        </div>
      </div>
    );
  }, // end forwardRef render
);

CanvasTextEditor.displayName = "CanvasTextEditor";
