import { useState, useRef, useEffect, useCallback } from "react";

// w-100 = 400px (min), w-200 = 800px (max), default w-150 = 600px
export const MIN_PANEL_WIDTH = 400;
export const MAX_PANEL_WIDTH = 800;
export const DEFAULT_PANEL_WIDTH = 600;
const STORAGE_KEY = "brandhub_task_panel_width";

export function useResizablePanelWidth(
  defaultWidth = DEFAULT_PANEL_WIDTH,
  minWidth = MIN_PANEL_WIDTH,
  maxWidth = MAX_PANEL_WIDTH,
  storageKey = STORAGE_KEY,
) {
  const [width, setWidth] = useState<number>(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!Number.isNaN(parsed) && parsed >= minWidth && parsed <= maxWidth) {
        return parsed;
      }
    }
    return defaultWidth;
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
        const maxWidthBound = Math.min(maxWidth, window.innerWidth * 0.9);
        const newWidth = Math.min(
          maxWidthBound,
          Math.max(minWidth, startWidthRef.current + deltaX),
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

  return { width, panelRef, onMouseDown };
}
