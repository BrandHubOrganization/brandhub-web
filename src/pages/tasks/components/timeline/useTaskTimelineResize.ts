import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent, MouseEvent as ReactMouseEvent } from "react";
import { addDays, dayNumber } from "@/pages/campaign/utils/timelineDates";
import type { UseTaskTimelineResizeOptions } from "./types";

export type { UseTaskTimelineResizeOptions };

export function useTaskTimelineResize({
  startDate,
  endDate,
  dayWidth,
  canManageSchedule,
  onUnauthorized,
  onCommit,
}: UseTaskTimelineResizeOptions) {
  const [isDragging, setIsDragging] = useState(false);
  const [deltaDays, setDeltaDays] = useState(0);

  const startXRef = useRef(0);
  const activePointerIdRef = useRef<number | null>(null);
  const activeTargetRef = useRef<HTMLDivElement | null>(null);

  const minDelta = dayNumber(startDate) - dayNumber(endDate);

  const clampDelta = useCallback(
    (dx: number) => {
      const rawDelta = Math.round(dx / dayWidth);
      return Math.max(minDelta, rawDelta);
    },
    [dayWidth, minDelta],
  );

  const cleanupListeners = useCallback(() => {
    const target = activeTargetRef.current;
    const pointerId = activePointerIdRef.current;
    if (target && pointerId !== null && target.hasPointerCapture(pointerId)) {
      target.releasePointerCapture(pointerId);
    }
    activeTargetRef.current = null;
    activePointerIdRef.current = null;
  }, []);

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    e.preventDefault();

    if (!canManageSchedule) {
      onUnauthorized();
      return;
    }

    const target = e.currentTarget;
    target.setPointerCapture(e.pointerId);
    activeTargetRef.current = target;
    activePointerIdRef.current = e.pointerId;
    startXRef.current = e.clientX;

    setIsDragging(true);
    setDeltaDays(0);

    function onPointerMove(ev: PointerEvent) {
      const dx = ev.clientX - startXRef.current;
      setDeltaDays(clampDelta(dx));
    }

    function cleanup() {
      target.removeEventListener("pointermove", onPointerMove);
      target.removeEventListener("pointerup", onPointerUp);
      target.removeEventListener("pointercancel", onPointerCancel);
      document.removeEventListener("keydown", onKeyDown);
      cleanupListeners();
      setIsDragging(false);
    }

    function finish(commit: boolean, clientX: number) {
      cleanup();
      const dx = clientX - startXRef.current;
      const finalDelta = clampDelta(dx);
      setDeltaDays(0);

      if (commit && finalDelta !== 0) {
        const newEndDate = addDays(endDate, finalDelta);
        void onCommit(newEndDate);
      }
    }

    function onPointerUp(ev: PointerEvent) {
      finish(true, ev.clientX);
    }

    function onPointerCancel() {
      cleanup();
      setDeltaDays(0);
    }

    function onKeyDown(ev: KeyboardEvent) {
      if (ev.key === "Escape") {
        cleanup();
        setDeltaDays(0);
      }
    }

    target.addEventListener("pointermove", onPointerMove);
    target.addEventListener("pointerup", onPointerUp);
    target.addEventListener("pointercancel", onPointerCancel);
    document.addEventListener("keydown", onKeyDown);
  };

  const handleClick = (e: ReactMouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    if (!canManageSchedule) {
      onUnauthorized();
    }
  };

  useEffect(() => {
    return () => {
      cleanupListeners();
    };
  }, [cleanupListeners]);

  const previewEndDate = isDragging ? addDays(endDate, deltaDays) : null;

  return {
    isDragging,
    deltaDays,
    previewEndDate,
    handlePointerDown,
    handleClick,
  };
}
