import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
export type TimelineColumn = "name" | "status" | "assignee";
export const COLUMN_DEFAULTS: Record<TimelineColumn, number> = {
  name: 260,
  status: 100,
  assignee: 56,
};
export const COLUMN_LIMITS: Record<TimelineColumn, [number, number]> = {
  name: [200, 600],
  status: [88, 240],
  assignee: [52, 300],
};
export function useTimelineColumns(
  userId: string,
  workspaceId: string,
  statusMinimum = 88,
) {
  const limits = useMemo(
    () => ({
      ...COLUMN_LIMITS,
      status: [statusMinimum, Math.max(240, statusMinimum)] as [number, number],
    }),
    [statusMinimum],
  );
  const key = `brandhub:campaign-columns:v2:${userId}:${workspaceId}`;
  const [storedWidths, setWidths] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(key) || "{}") as Partial<
        Record<TimelineColumn, number>
      >;
      return Object.fromEntries(
        Object.entries(COLUMN_DEFAULTS).map(([column, initial]) => {
          const k = column as TimelineColumn,
            v = saved[k];
          return [
            k,
            typeof v === "number" && Number.isFinite(v)
              ? Math.max(COLUMN_LIMITS[k][0], Math.min(COLUMN_LIMITS[k][1], v))
              : initial,
          ];
        }),
      ) as Record<TimelineColumn, number>;
    } catch {
      return COLUMN_DEFAULTS;
    }
  });
  const widths = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(storedWidths).map(([key, value]) => {
          const column = key as TimelineColumn;
          return [
            column,
            Math.max(limits[column][0], Math.min(limits[column][1], value)),
          ];
        }),
      ) as Record<TimelineColumn, number>,
    [storedWidths, limits],
  );
  const resize = useRef<{
    key: TimelineColumn;
    x: number;
    width: number;
  } | null>(null);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(widths));
      } catch {
        /* Layout preference is optional. */
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [key, widths]);
  function adjust(column: TimelineColumn, value: number) {
    const [min, max] = limits[column];
    setWidths((old) => ({
      ...old,
      [column]: Math.max(min, Math.min(max, value)),
    }));
  }
  function start(e: PointerEvent<HTMLElement>, column: TimelineColumn) {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    resize.current = { key: column, x: e.clientX, width: widths[column] };
  }
  function move(e: PointerEvent<HTMLElement>) {
    const r = resize.current;
    if (r) adjust(r.key, r.width + e.clientX - r.x);
  }
  function stop(e: PointerEvent<HTMLElement>) {
    resize.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId))
      e.currentTarget.releasePointerCapture(e.pointerId);
  }
  return { widths, limits, adjust, start, move, stop };
}
