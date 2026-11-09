import { useRef, useState, type PointerEvent } from "react";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { addDays, dayNumber } from "@/pages/campaign/utils/timelineDates";
import { TimelinePendingRange } from "@/pages/campaign/components/TimelinePendingRange";

export function TimelineUnscheduledRange({
  viewStart,
  dayWidth,
  today,
  busy,
  onCommit,
}: {
  viewStart: string;
  dayWidth: number;
  today: string;
  busy: boolean;
  onCommit: (start: string, end: string) => Promise<void>;
}) {
  const { t } = useTranslation();
  const [preview, setPreview] = useState<{ start: string; end: string } | null>(
    null,
  );
  const [dragging, setDragging] = useState(false);
  const [pendingRange, setPendingRange] = useState<{
    start: string;
    end: string;
  } | null>(null);
  const committing = pendingRange !== null;
  const lock = useRef(false);
  async function commit(start: string, end: string) {
    if (lock.current || busy) return;
    lock.current = true;
    setPendingRange({ start, end });
    try {
      await onCommit(start, end);
    } finally {
      lock.current = false;
      setPendingRange(null);
      setPreview(null);
    }
  }
  const dayAt = (event: PointerEvent<HTMLButtonElement>) =>
    addDays(
      viewStart,
      Math.max(
        0,
        Math.floor(
          (event.clientX - event.currentTarget.getBoundingClientRect().left) /
            dayWidth,
        ),
      ),
    );
  function begin(event: PointerEvent<HTMLButtonElement>) {
    if (busy || lock.current || event.button !== 0) return;
    event.preventDefault();
    const button = event.currentTarget;
    const origin = dayAt(event),
      originX = event.clientX,
      rect = button.getBoundingClientRect();
    let selected = { start: origin, end: addDays(origin, 3) },
      moved = false;
    setDragging(true);
    setPreview(selected);
    button.setPointerCapture(event.pointerId);
    const move = (e: globalThis.PointerEvent) => {
      if (Math.abs(e.clientX - originX) < 4 && !moved) return;
      moved = true;
      const day = addDays(
        viewStart,
        Math.max(0, Math.floor((e.clientX - rect.left) / dayWidth)),
      );
      selected =
        day < origin
          ? { start: day, end: origin }
          : { start: origin, end: day > origin ? day : addDays(origin, 1) };
      setPreview(selected);
    };
    const end = (cancel: boolean) => {
      button.removeEventListener("pointermove", move);
      button.removeEventListener("pointerup", up);
      button.removeEventListener("pointercancel", abort);
      document.removeEventListener("keydown", key);
      if (button.hasPointerCapture(event.pointerId))
        button.releasePointerCapture(event.pointerId);
      setDragging(false);
      setPreview(null);
      if (!cancel) {
        void commit(selected.start, selected.end);
      }
    };
    const up = () => end(false),
      abort = () => end(true);
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") end(true);
    };
    button.addEventListener("pointermove", move);
    button.addEventListener("pointerup", up);
    button.addEventListener("pointercancel", abort);
    document.addEventListener("keydown", key);
  }
  return (
    <>
      <button
        type="button"
        className="ct-unscheduled-lane"
        disabled={busy || committing}
        aria-label={t("campaign.timeline.createRange")}
        onPointerMove={(e) => {
          if (!dragging && !busy) {
            const start = dayAt(e);
            setPreview({ start, end: addDays(start, 3) });
          }
        }}
        onPointerLeave={() => {
          if (!dragging) setPreview(null);
        }}
        onPointerDown={begin}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            void commit(today, addDays(today, 3));
          }
        }}
      >
        {preview && !committing && (
          <span
            className="ct-range ct-range-preview"
            style={{
              left:
                (dayNumber(preview.start) - dayNumber(viewStart)) * dayWidth,
              width:
                (dayNumber(preview.end) - dayNumber(preview.start) + 1) *
                dayWidth,
            }}
          >
            <Plus className="size-3" />
          </span>
        )}
      </button>
      {pendingRange && (
        <TimelinePendingRange
          {...pendingRange}
          viewStart={viewStart}
          dayWidth={dayWidth}
        />
      )}
    </>
  );
}
