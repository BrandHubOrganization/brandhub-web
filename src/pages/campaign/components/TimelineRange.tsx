import { useState, type PointerEvent as ReactPointerEvent } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { addDays, dayNumber } from "@/pages/campaign/utils/timelineDates";
import { TimelineUnscheduledRange } from "@/pages/campaign/components/TimelineUnscheduledRange";
import { cn } from "@/lib/utils";
export function TimelineRange({
  start,
  end,
  viewStart,
  dayWidth,
  editable,
  busy,
  status,
  today,
  onSave,
}: {
  start: string;
  end: string;
  viewStart: string;
  dayWidth: number;
  editable: boolean;
  busy: boolean;
  status: string;
  today: string;
  onSave: (start: string, end: string) => Promise<unknown>;
}) {
  const { t } = useTranslation();
  const [preview, setPreview] = useState<{ start: string; end: string } | null>(
    null,
  );
  const [form, setForm] = useState<{ start: string; end: string } | null>(null);
  const [open, setOpen] = useState(false);
  const shown = preview ?? { start, end };
  const duration =
    start && end
      ? Math.max(1, dayNumber(shown.end) - dayNumber(shown.start) + 1)
      : 0;
  async function save(s: string, e: string) {
    if (!s || !e || e <= s) return;
    try {
      await onSave(s, e);
      setOpen(false);
    } catch {
      /* Mutation reports the error and keeps editor open. */
    }
  }
  function begin(
    event: ReactPointerEvent<HTMLButtonElement>,
    mode: "move" | "start" | "end",
  ) {
    if (!editable || busy || !start || !end || event.button !== 0) return;
    event.preventDefault();
    const button = event.currentTarget;
    const x = event.clientX;
    let next = { start, end };
    button.setPointerCapture(event.pointerId);
    const move = (e: PointerEvent) => {
      const n = Math.round((e.clientX - x) / dayWidth);
      next =
        mode === "move"
          ? { start: addDays(start, n), end: addDays(end, n) }
          : mode === "start"
            ? {
                start: addDays(
                  start,
                  Math.min(n, dayNumber(end) - dayNumber(start) - 1),
                ),
                end,
              }
            : {
                start,
                end: addDays(
                  end,
                  Math.max(n, dayNumber(start) - dayNumber(end) + 1),
                ),
              };
      setPreview(next);
    };
    const finish = (e: PointerEvent, cancel = false) => {
      button.removeEventListener("pointermove", move);
      button.removeEventListener("pointerup", up);
      button.removeEventListener("pointercancel", cancelDrag);
      document.removeEventListener("keydown", key);
      if (button.hasPointerCapture(e.pointerId))
        button.releasePointerCapture(e.pointerId);
      if (!cancel && (next.start !== start || next.end !== end))
        void save(next.start, next.end).finally(() => setPreview(null));
      else setPreview(null);
    };
    const up = (e: PointerEvent) => finish(e);
    const cancelDrag = (e: PointerEvent) => finish(e, true);
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish(event.nativeEvent, true);
    };
    button.addEventListener("pointermove", move);
    button.addEventListener("pointerup", up);
    button.addEventListener("pointercancel", cancelDrag);
    document.addEventListener("keydown", key);
  }
  return (
    <>
      {start && end ? (
        <div
          className={cn(
            "ct-range",
            editable && "ct-range-editable",
            status === "FINISHED" && "ct-range-done",
            status === "IN_PROGRESS" && "ct-range-working",
            status === "IN_REVIEW" && "ct-range-review",
          )}
          style={{
            left: (dayNumber(shown.start) - dayNumber(viewStart)) * dayWidth,
            width: duration * dayWidth,
          }}
        >
          <Button
            size="sm"
            variant="ghost"
            className="ct-range-edge"
            aria-label={t("campaign.timeline.resizeStart")}
            disabled={!editable || busy}
            onPointerDown={(e) => begin(e, "start")}
          />
          <Button
            size="sm"
            variant="ghost"
            className="ct-range-body"
            aria-label={t("campaign.timeline.moveRange", { start, end })}
            disabled={busy}
            onPointerDown={(e) => begin(e, "move")}
            onDoubleClick={() => {
              setForm({ start, end });
              setOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setForm({ start, end });
                setOpen(true);
              }
              if (
                editable &&
                !busy &&
                ["ArrowLeft", "ArrowRight"].includes(e.key)
              ) {
                e.preventDefault();
                const n =
                  (e.key === "ArrowRight" ? 1 : -1) * (e.shiftKey ? 7 : 1);
                void save(addDays(start, n), addDays(end, n));
              }
            }}
          >
            <span
              className={duration * dayWidth < 55 ? "ct-short-duration" : ""}
            >
              {t("campaign.timeline.days", { count: duration })}
            </span>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="ct-range-edge"
            aria-label={t("campaign.timeline.resizeEnd")}
            disabled={!editable || busy}
            onPointerDown={(e) => begin(e, "end")}
          />
        </div>
      ) : (
        editable && (
          <TimelineUnscheduledRange
            viewStart={viewStart}
            dayWidth={dayWidth}
            today={today}
            busy={busy}
            onCommit={async (s, e) => {
              try {
                await onSave(s, e);
              } catch {
                /* Existing mutation reports the failure; leave row unscheduled. */
              }
            }}
          />
        )
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <span
            className="absolute top-0 h-9 w-px"
            style={{
              left: Math.max(
                0,
                (dayNumber(form?.start || start || today) -
                  dayNumber(viewStart)) *
                  dayWidth,
              ),
            }}
          />
        </PopoverTrigger>
        <PopoverContent
          className="w-64 space-y-3"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <label className="block text-xs">
            {t("campaign.timeline.plannedStart")}
            <Input
              type="date"
              value={form?.start ?? start}
              disabled={!editable || busy}
              onChange={(e) =>
                setForm((f) => ({ start: e.target.value, end: f?.end ?? end }))
              }
            />
          </label>
          <label className="block text-xs">
            {t("campaign.timeline.deadline")}
            <Input
              type="date"
              value={form?.end ?? end}
              disabled={!editable || busy}
              onChange={(e) =>
                setForm((f) => ({
                  start: f?.start ?? start,
                  end: e.target.value,
                }))
              }
            />
          </label>
          {editable && (
            <Button
              size="sm"
              variant="orange"
              disabled={
                busy || !form?.start || !form.end || form.end <= form.start
              }
              onClick={() => form && void save(form.start, form.end)}
            >
              {t("campaign.timeline.done")}
            </Button>
          )}
        </PopoverContent>
      </Popover>
    </>
  );
}
