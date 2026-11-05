import { useState, useRef, useEffect, useCallback } from "react";

export type WidthResolvable = number | (() => number);

/**
 * Calculates ~60% screen width (6/10 viewport), clamped between 450px and 92vw (max 1400px).
 */
export function getInitialTaskDrawerWidth(): number {
  if (typeof window === "undefined") return 900;
  const target = Math.round(window.innerWidth * 0.6);
  return Math.min(Math.round(window.innerWidth * 0.92), Math.max(450, target));
}

// Bounded from 450px to 1400px (or 40vw to 92vw)
export const MIN_PANEL_WIDTH = 450;
export const MAX_PANEL_WIDTH = 1400;
export const DEFAULT_PANEL_WIDTH = 900;
const STORAGE_KEY = "brandhub_task_panel_width";

function resolveWidth(val: WidthResolvable, fallback: number): number {
  if (typeof val === "function") {
    try {
      return val();
    } catch {
      return fallback;
    }
  }
  if (typeof val === "number" && !Number.isNaN(val)) return val;
  return fallback;
}

export function useResizablePanelWidth(
  defaultWidth: WidthResolvable = getInitialTaskDrawerWidth,
  minWidth: WidthResolvable = MIN_PANEL_WIDTH,
  maxWidth: WidthResolvable = MAX_PANEL_WIDTH,
  storageKey = STORAGE_KEY,
) {
  const [isDragging, setIsDragging] = useState(false);
  const [width, setWidth] = useState<number>(() => {
    const min = resolveWidth(minWidth, MIN_PANEL_WIDTH);
    const max = resolveWidth(maxWidth, MAX_PANEL_WIDTH);
    const def = resolveWidth(defaultWidth, getInitialTaskDrawerWidth());
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const parsed = parseInt(saved, 10);
      // Migrate legacy hardcoded 600px on large viewports (>= 1200px) to 60vw
      if (
        storageKey === STORAGE_KEY &&
        parsed === 600 &&
        typeof window !== "undefined" &&
        window.innerWidth >= 1200
      ) {
        return def;
      }
      if (!Number.isNaN(parsed) && parsed >= min && parsed <= max) {
        return parsed;
      }
    }
    return def;
  });

  const panelRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);
  const currentWidthRef = useRef(width);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    currentWidthRef.current = width;
  }, [width]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    setIsDragging(true);
    startXRef.current = e.clientX;
    startWidthRef.current = currentWidthRef.current;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      if (rafIdRef.current !== null) return;

      const clientX = e.clientX;
      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = null;
        if (!isDraggingRef.current) return;
        const deltaX = startXRef.current - clientX;
        const currentMin = resolveWidth(minWidth, MIN_PANEL_WIDTH);
        const currentMax = resolveWidth(maxWidth, MAX_PANEL_WIDTH);
        const screenBoundMin = Math.min(currentMin, window.innerWidth * 0.9);
        const screenBoundMax = Math.min(currentMax, window.innerWidth * 0.92);
        const newWidth = Math.min(
          screenBoundMax,
          Math.max(screenBoundMin, startWidthRef.current + deltaX),
        );
        currentWidthRef.current = newWidth;
        // Trực tiếp thay đổi style trên DOM node: 0 re-render React, 0 lag
        if (panelRef.current) {
          panelRef.current.style.width = `${newWidth}px`;
        }
      });
    };

    const onMouseUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        setIsDragging(false);
        if (rafIdRef.current !== null) {
          cancelAnimationFrame(rafIdRef.current);
          rafIdRef.current = null;
        }
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        // Chỉ re-render state và lưu localStorage 1 lần duy nhất khi nhả chuột
        setWidth(currentWidthRef.current);
        localStorage.setItem(storageKey, String(currentWidthRef.current));
      }
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [minWidth, maxWidth, storageKey]);

  return { width, panelRef, onMouseDown, isDragging };
}
