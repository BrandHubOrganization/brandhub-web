import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { CalendarDays, Check, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { dayNumber, dayString } from "@/pages/campaign/utils/timelineDates";

type Milestone = { name: string; date: string };
type Drag = {
  index: number;
  original: Milestone;
  version: number;
  clientX: number;
  date: string;
  moved: boolean;
};
type Draft = Milestone & {
  version: number;
  original?: Milestone;
  index?: number;
  error?: "save" | "changed";
  deleting?: boolean;
};

export function TimelineMilestoneRail({
  milestones,
  version,
  viewStart,
  dayWidth,
  laneWidth,
  visibleStart,
  visibleWidth,
  startDate,
  endDate,
  editable,
  busy,
  blocked,
  onDirty,
  onChange,
}: {
  milestones: Milestone[];
  version: number;
  viewStart: string;
  dayWidth: number;
  laneWidth: number;
  visibleStart: number;
  visibleWidth: number;
  startDate?: string;
  endDate?: string;
  editable: boolean;
  busy: boolean;
  blocked: boolean;
  onDirty: (dirty: boolean) => void;
  onChange: (milestones: Milestone[], version: number) => Promise<unknown>;
}) {
  const { t, i18n } = useTranslation();
  const lane = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const lock = useRef(false);
  const drag = useRef<Drag | null>(null);
  const suppressClick = useRef(false);
  const [dragPreview, setDragPreview] = useState<{
    index: number;
    date: string;
  } | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [pending, setPending] = useState(false);
  const active = draft !== null;
  const canOpen =
    editable && !busy && !blocked && !pending && !active && !dragPreview;
  const canCreate = canOpen && milestones.length < 100;
  const min = startDate || viewStart;
  const max =
    endDate ||
    dayString(
      dayNumber(viewStart) + Math.max(0, Math.floor(laneWidth / dayWidth) - 1),
    );
  const x = (date: string) =>
    (dayNumber(date) - dayNumber(viewStart) + 0.5) * dayWidth;
  const dateLabel = (date: string) =>
    new Intl.DateTimeFormat(i18n.language, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(`${date}T00:00:00Z`));
  const validDate = (date: string) => !!date && date >= min && date <= max;
  useEffect(() => {
    onDirty(active || dragPreview !== null);
    return () => onDirty(false);
  }, [active, dragPreview, onDirty]);
  useEffect(() => {
    if (active) input.current?.focus();
  }, [active]);
  useEffect(() => {
    if (!active) return;
    const outside = (event: PointerEvent) => {
      if (
        !lock.current &&
        !draft?.error &&
        !lane.current?.contains(event.target as Node)
      )
        setDraft(null);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [active, draft?.error]);
  function dateAt(clientX: number) {
    const rect = lane.current!.getBoundingClientRect();
    return dayString(
      dayNumber(viewStart) + Math.floor((clientX - rect.left) / dayWidth),
    );
  }
  function open(date: string, index?: number) {
    if (
      !canOpen ||
      !validDate(date) ||
      (index === undefined && milestones.length >= 100)
    )
      return;
    const existing = index === undefined ? undefined : milestones[index];
    setHover(null);
    setDraft({
      date,
      name: existing?.name || "",
      version,
      original: existing,
      index,
    });
  }
  async function submit(
    retry = false,
    remove = false,
    candidate: Draft | null = draft,
  ) {
    const draft = candidate;
    if (
      !draft ||
      lock.current ||
      busy ||
      blocked ||
      !editable ||
      !validDate(draft.date) ||
      (!remove && !draft.name.trim())
    ) {
      setDragPreview(null);
      return;
    }
    let index = draft.index;
    if (draft.original) {
      const matches = (m: Milestone) =>
        m.name === draft.original!.name && m.date === draft.original!.date;
      if (
        index === undefined ||
        !milestones[index] ||
        !matches(milestones[index])
      ) {
        const matching = milestones
          .map((m, i) => (matches(m) ? i : -1))
          .filter((i) => i >= 0);
        if (matching.length !== 1) {
          setDraft({ ...draft, error: "changed" });
          setDragPreview(null);
          return;
        }
        index = matching[0];
      }
    } else if (milestones.length >= 100) return;
    const value = { name: draft.name.trim(), date: draft.date };
    const next = draft.original
      ? milestones.flatMap((m, i) =>
          i === index ? (remove ? [] : [value]) : [m],
        )
      : [...milestones, value];
    lock.current = true;
    setPending(true);
    try {
      await onChange(next, retry ? version : draft.version);
      setDraft(null);
    } catch {
      setDraft({ ...draft, error: "save", deleting: false });
    } finally {
      lock.current = false;
      setPending(false);
      setDragPreview(null);
    }
  }
  function cancelDrag() {
    drag.current = null;
    setDragPreview(null);
  }
  function saveDate(
    index: number,
    date: string,
    original: Milestone,
    capturedVersion: number,
  ) {
    if (date === original.date || !validDate(date)) {
      setDragPreview(null);
      return;
    }
    void submit(false, false, {
      ...original,
      date,
      original,
      index,
      version: capturedVersion,
    });
  }
  const shown = draft?.date || (canCreate ? hover : null);
  const left = shown ? x(shown) : 0;
  const editorLeft = Math.max(
    120,
    Math.min(
      laneWidth - 120,
      Math.max(
        visibleStart + 120,
        Math.min(visibleStart + visibleWidth - 120, left),
      ),
    ),
  );
  // Two compact label tiers keep nearby milestones from covering each other's hit targets.
  const labelEnds = [-Infinity, -Infinity];
  const labelTiers = new Map<number, number>();
  milestones
    .map((m, index) => ({ m, index }))
    .sort((a, b) => a.m.date.localeCompare(b.m.date))
    .forEach(({ m, index }) => {
      const halfWidth = Math.min(120, m.name.length * 5.5 + 10) / 2;
      const center = x(m.date);
      const tier = labelEnds.findIndex((end) => end + 5 < center - halfWidth);
      labelTiers.set(index, tier);
      if (tier >= 0) labelEnds[tier] = center + halfWidth;
    });
  return (
    <div
      ref={lane}
      className="ct-milestone-lane"
      role="group"
      aria-label={t("campaign.timeline.milestoneRail")}
      tabIndex={editable ? 0 : -1}
      title={
        editable
          ? t(
              milestones.length >= 100
                ? "campaign.timeline.milestoneLimit"
                : "campaign.timeline.addMilestone",
            )
          : t("campaign.timeline.milestones")
      }
      onPointerMove={(e) => {
        if (canCreate && !(e.target as HTMLElement).closest("button, input")) {
          const y = e.clientY - e.currentTarget.getBoundingClientRect().top;
          if (y < 8 || y > 32) {
            setHover(null);
            return;
          }
          const date = dateAt(e.clientX);
          setHover(validDate(date) ? date : null);
        }
      }}
      onPointerLeave={() => setHover(null)}
      onClick={(e) => {
        if (e.target !== e.currentTarget || !canCreate) return;
        const y = e.clientY - e.currentTarget.getBoundingClientRect().top;
        if (y >= 8 && y <= 32) open(dateAt(e.clientX));
      }}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === "Escape") {
          setHover(null);
          return;
        }
        if (!canCreate) return;
        const date = hover || min;
        if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
          e.preventDefault();
          const n = dayNumber(date) + (e.key === "ArrowRight" ? 1 : -1);
          setHover(
            dayString(Math.max(dayNumber(min), Math.min(dayNumber(max), n))),
          );
        }
        if (e.key === "Enter") {
          e.preventDefault();
          open(date);
        }
      }}
    >
      <span
        className={
          startDate && endDate
            ? "ct-campaign-bar"
            : "ct-campaign-bar ct-campaign-bar-unset"
        }
        aria-hidden="true"
        style={
          startDate && endDate
            ? {
                left: (dayNumber(startDate) - dayNumber(viewStart)) * dayWidth,
                width:
                  (dayNumber(endDate) - dayNumber(startDate) + 1) * dayWidth,
              }
            : { left: 0, width: laneWidth }
        }
      />
      {milestones.map((m, i) => (
        <Button
          key={`${m.date}:${i}`}
          variant="ghost"
          className={`ct-milestone ${labelTiers.get(i) === -1 ? "ct-milestone-crowded" : ""}`}
          aria-description={`${dateLabel(m.date)}${editable ? ` · ${t("campaign.timeline.moveMilestone")}` : ""}`}
          aria-label={m.name}
          disabled={busy || blocked || !editable || active || pending}
          onPointerDown={(e) => {
            if (!canOpen || e.button !== 0) return;
            e.preventDefault();
            e.currentTarget.focus();
            setHover(null);
            suppressClick.current = false;
            drag.current = {
              index: i,
              original: m,
              version,
              clientX: e.clientX,
              date: m.date,
              moved: false,
            };
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            const current = drag.current;
            if (!current || current.index !== i) return;
            const delta = e.clientX - current.clientX;
            if (Math.abs(delta) < 4 && !current.moved) return;
            current.moved = true;
            suppressClick.current = true;
            current.date = dayString(
              Math.max(
                dayNumber(min),
                Math.min(
                  dayNumber(max),
                  dayNumber(current.original.date) +
                    Math.round(delta / dayWidth),
                ),
              ),
            );
            setDragPreview({ index: i, date: current.date });
          }}
          onPointerUp={(e) => {
            const current = drag.current;
            if (!current || current.index !== i) return;
            drag.current = null;
            if (e.currentTarget.hasPointerCapture(e.pointerId))
              e.currentTarget.releasePointerCapture(e.pointerId);
            if (current.moved)
              saveDate(i, current.date, current.original, current.version);
          }}
          onPointerCancel={() => {
            suppressClick.current = true;
            cancelDrag();
          }}
          onLostPointerCapture={() => {
            if (drag.current) cancelDrag();
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape" && drag.current) {
              e.preventDefault();
              suppressClick.current = true;
              cancelDrag();
            }
            if (
              (e.key === "ArrowLeft" || e.key === "ArrowRight") &&
              canOpen &&
              !lock.current
            ) {
              e.preventDefault();
              const date = dayString(
                Math.max(
                  dayNumber(min),
                  Math.min(
                    dayNumber(max),
                    dayNumber(m.date) + (e.key === "ArrowRight" ? 1 : -1),
                  ),
                ),
              );
              saveDate(i, date, m, version);
            }
          }}
          onClick={() => {
            if (suppressClick.current) {
              suppressClick.current = false;
              return;
            }
            open(m.date, i);
          }}
          style={{
            left: x(dragPreview?.index === i ? dragPreview.date : m.date),
          }}
        >
          <span className="ct-diamond" />
          <span
            className="ct-milestone-name"
            style={{ top: labelTiers.get(i) === 1 ? 30 : 17 }}
          >
            {m.name}
          </span>
        </Button>
      ))}
      {shown && (
        <span
          className={`ct-milestone-preview ${draft ? "ct-milestone-preview-active" : ""}`}
          style={{ left }}
          aria-hidden="true"
        >
          <span className="ct-milestone-date">{dateLabel(shown)}</span>
          <span className="ct-diamond" />
          {!draft && <span className="ct-milestone-plus">+</span>}
        </span>
      )}
      {draft && (
        <form
          className="ct-milestone-editor"
          style={{ left: editorLeft }}
          onSubmit={(e) => {
            e.preventDefault();
            void submit(!!draft.error);
          }}
          onKeyDown={(e) => {
            if (
              e.key === "Escape" &&
              !lock.current &&
              !e.nativeEvent.isComposing
            ) {
              e.preventDefault();
              setDraft(null);
              lane.current?.focus();
            }
          }}
        >
          <div className="ct-milestone-input-row">
            <Input
              ref={input}
              aria-label={t("campaign.timeline.milestoneName")}
              placeholder={t("campaign.timeline.milestonePlaceholder")}
              value={draft.name}
              maxLength={255}
              disabled={pending || busy || !editable}
              aria-invalid={!!draft.error}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.nativeEvent.isComposing)
                  e.preventDefault();
              }}
              onChange={(e) =>
                setDraft({ ...draft, name: e.target.value, deleting: false })
              }
            />
            {draft.original && (
              <label
                className="ct-date-icon"
                title={t("campaign.timeline.date")}
              >
                <CalendarDays className="size-3.5" />
                <input
                  type="date"
                  aria-label={t("campaign.timeline.milestoneDate")}
                  value={draft.date}
                  min={startDate}
                  max={endDate}
                  disabled={pending || busy || !editable}
                  onChange={(e) => {
                    if (e.target.value)
                      setDraft({
                        ...draft,
                        date: e.target.value,
                        deleting: false,
                      });
                  }}
                />
              </label>
            )}
            <Button
              type="submit"
              size="icon"
              variant="ghost"
              className="size-6 shrink-0"
              disabled={
                pending ||
                busy ||
                blocked ||
                !editable ||
                !draft.name.trim() ||
                !validDate(draft.date) ||
                (!draft.original && milestones.length >= 100)
              }
              aria-label={t(
                draft.error
                  ? "campaign.timeline.retry"
                  : "campaign.timeline.done",
              )}
            >
              <Check className="size-3" />
            </Button>
            {draft.original && (
              <Button
                type="button"
                size="icon"
                variant={draft.deleting ? "destructive" : "ghost"}
                className="size-6 shrink-0"
                disabled={pending || busy || blocked || !editable}
                title={t(
                  draft.deleting
                    ? "campaign.timeline.confirmRemove"
                    : "campaign.timeline.removeMilestone",
                )}
                aria-label={t(
                  draft.deleting
                    ? "campaign.timeline.confirmRemove"
                    : "campaign.timeline.removeMilestone",
                )}
                onClick={() =>
                  draft.deleting
                    ? void submit(!!draft.error, true)
                    : setDraft({ ...draft, deleting: true })
                }
              >
                <Trash2 className="size-3" />
              </Button>
            )}
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="size-6 shrink-0"
              disabled={pending}
              aria-label={t("campaign.timeline.cancel")}
              onClick={() => setDraft(null)}
            >
              <X className="size-3" />
            </Button>
          </div>
          {draft.error && (
            <p
              role="alert"
              className="text-destructive bg-card mt-1 rounded border p-1 text-[10px]"
            >
              {t(
                draft.error === "changed"
                  ? "campaign.timeline.milestoneChanged"
                  : "campaign.timeline.planSaveError",
              )}
            </p>
          )}
          {!draft.original && milestones.length >= 100 && (
            <p role="alert" className="text-destructive text-[10px]">
              {t("campaign.timeline.milestoneLimit")}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
