import { useCallback, useEffect, useRef, useState } from "react";
import * as Y from "yjs";

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

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): Line[] {
  const paragraphs = text.split("\n");
  const lines: Line[] = [];
  let globalIndex = 0;

  for (const paragraph of paragraphs) {
    if (paragraph === "") {
      lines.push({ text: "", startIndex: globalIndex });
      globalIndex += 1;
      continue;
    }

    let current = "";
    let currentStart = globalIndex;
    const words = paragraph.split(/(\s+)/);

    for (const word of words) {
      const candidate = current + word;
      if (current !== "" && ctx.measureText(candidate).width > maxWidth) {
        lines.push({ text: current, startIndex: currentStart });
        globalIndex += current.length;
        current = word;
        currentStart = globalIndex;
      } else {
        current = candidate;
      }
    }
    lines.push({ text: current, startIndex: currentStart });
    globalIndex += current.length + 1; // +1 for the "\n" consumed between paragraphs
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
      const x = ctx.measureText(line.text.slice(0, offset)).width;
      return { x, lineIndex: i };
    }
  }
  return { x: 0, lineIndex: 0 };
}

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

  let bestOffset = 0;
  let bestDistance = Infinity;
  for (let offset = 0; offset <= line.text.length; offset++) {
    const width = ctx.measureText(line.text.slice(0, offset)).width;
    const distance = Math.abs(width - clickX);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestOffset = offset;
    }
  }
  return line.startIndex + bestOffset;
}

export interface CanvasTextEditorProps {
  /** Shared Yjs document — owned by the caller (useTaskContentSync) so it can also wire the WebSocket transport. */
  yDoc: Y.Doc;
}

export function CanvasTextEditor({ yDoc }: CanvasTextEditorProps) {
  const yTextRef = useRef<Y.Text>(yDoc.getText("content"));
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hiddenInputRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [text, setText] = useState(() => yTextRef.current.toString());
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
  const [isComposing, setIsComposing] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [caretPos, setCaretPos] = useState({ x: 0, y: 0 });
  const [canvasWidth, setCanvasWidth] = useState(800);

  // yText is the source of truth; local caretIndex just tracks this
  // client's cursor position and is nudged when remote edits land before it.
  useEffect(() => {
    const yText = yTextRef.current;
    const observer = (event: Y.YTextEvent) => {
      setText(yText.toString());
      if (!event.transaction.local) {
        let delta = 0;
        let cursor = 0;
        for (const op of event.delta) {
          if (op.retain) cursor += op.retain;
          else if (op.insert) {
            const len = typeof op.insert === "string" ? op.insert.length : 1;
            if (cursor <= caretIndexRef.current) delta += len;
            cursor += len;
          } else if (op.delete) {
            if (cursor < caretIndexRef.current) {
              delta -= Math.min(op.delete, caretIndexRef.current - cursor);
            }
          }
        }
        if (delta !== 0) {
          setCaretIndex((prev) => Math.max(0, prev + delta));
        }
      }
    };
    yText.observe(observer);
    return () => yText.unobserve(observer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caretIndex read via closure intentionally, re-subscribing per keystroke would be wasteful
  }, []);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const cssWidth = canvasWidth;
    const maxTextWidth = cssWidth - PADDING_X * 2;

    ctx.font = FONT;
    const lines = wrapLines(ctx, text, maxTextWidth);
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
    ctx.fillStyle = "#1f2937";
    ctx.textBaseline = "alphabetic";

    lines.forEach((line, i) => {
      ctx.fillText(
        line.text,
        PADDING_X,
        PADDING_Y + i * LINE_HEIGHT + FONT_SIZE,
      );
    });

    const { x, lineIndex } = caretCoordsFromIndex(ctx, lines, caretIndex);
    setCaretPos({ x: PADDING_X + x, y: PADDING_Y + lineIndex * LINE_HEIGHT });
  }, [text, caretIndex, canvasWidth]);

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

  const focusHiddenInput = useCallback(() => {
    hiddenInputRef.current?.focus();
  }, []);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left - PADDING_X;
    const clickY = event.clientY - rect.top - PADDING_Y;

    ctx.font = FONT;
    const lines = wrapLines(ctx, text, canvasWidth - PADDING_X * 2);
    const index = indexFromPoint(ctx, lines, clickX, clickY);
    setCaretIndex(index);
    focusHiddenInput();
  };

  const insertAtCaret = (value: string) => {
    yTextRef.current.insert(caretIndexRef.current, value);
    setCaretIndex((prev) => prev + value.length);
  };

  const deleteBackward = () => {
    if (caretIndexRef.current === 0) return;
    yTextRef.current.delete(caretIndexRef.current - 1, 1);
    setCaretIndex((prev) => prev - 1);
  };

  const deleteForward = () => {
    if (caretIndexRef.current >= yTextRef.current.length) return;
    yTextRef.current.delete(caretIndexRef.current, 1);
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

  const handleCompositionEnd = (
    event: React.CompositionEvent<HTMLDivElement>,
  ) => {
    setIsComposing(false);
    if (event.data) {
      insertAtCaret(event.data);
    }
    // Clear the hidden input so the composed syllable isn't re-read next time.
    if (hiddenInputRef.current) hiddenInputRef.current.textContent = "";
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
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
    } else if (event.key === "ArrowLeft") {
      setCaretIndex((prev) => Math.max(0, prev - 1));
      event.preventDefault();
    } else if (event.key === "ArrowRight") {
      setCaretIndex((prev) => Math.min(yTextRef.current.length, prev + 1));
      event.preventDefault();
    }
  };

  return (
    <div
      ref={containerRef}
      className="border-border bg-card relative w-full rounded-xl border p-2"
    >
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="block cursor-text"
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
        onCompositionEnd={handleCompositionEnd}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="fixed top-0 left-0 h-px w-px overflow-hidden opacity-0"
        style={{ transform: "translateX(-10000px)" }}
        aria-label="Content editor input"
        tabIndex={-1}
      />
      {/* Accessibility: screen readers can't read canvas pixels — this hidden
          region mirrors the real text in parallel (see spec.md §4). */}
      <div className="sr-only" aria-live="polite">
        {text}
      </div>
    </div>
  );
}
