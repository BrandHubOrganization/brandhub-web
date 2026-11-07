import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

/** Persistent scroll control, including on systems that auto-hide native scrollbars. */
export function TimelineHorizontalScrollbar({
  value,
  maximum,
  visibleWidth,
  contentWidth,
  step,
  inset,
  controls,
  onChange,
}: {
  value: number;
  maximum: number;
  visibleWidth: number;
  contentWidth: number;
  step: number;
  inset: number;
  controls: string;
  onChange: (left: number) => void;
}) {
  const { t } = useTranslation();
  const drag = useRef<number | null>(null);
  const fraction = Math.min(
    1,
    Math.max(
      24 / Math.max(24, visibleWidth),
      visibleWidth / Math.max(1, contentWidth),
    ),
  );
  const progress = maximum > 0 ? Math.max(0, Math.min(1, value / maximum)) : 0;
  const set = (left: number) => onChange(Math.max(0, Math.min(maximum, left)));
  return (
    <div
      className="ct-scrollbar-shell"
      style={{
        gridTemplateColumns: inset
          ? `${inset}px minmax(0, 1fr)`
          : "minmax(0, 1fr)",
      }}
    >
      {inset > 0 && <span aria-hidden="true" />}
      <div className="ct-scrollbar-controls">
        <button
          type="button"
          className="ct-scrollbar-arrow"
          disabled={value <= 0}
          aria-label={t("campaign.timeline.previousDay")}
          title={t("campaign.timeline.previousDay")}
          onClick={() => set(value - step)}
        >
          <ChevronLeft className="size-3" />
        </button>
        <div
          className="ct-scrollbar-track"
          role="scrollbar"
          tabIndex={maximum > 0 ? 0 : -1}
          aria-label={t("campaign.timeline.horizontalScroll")}
          aria-controls={controls}
          aria-orientation="horizontal"
          aria-valuemin={0}
          aria-valuemax={Math.round(maximum)}
          aria-valuenow={Math.round(Math.min(maximum, value))}
          aria-disabled={maximum <= 0}
          onPointerDown={(e) => {
            if (maximum <= 0 || e.button !== 0) return;
            e.preventDefault();
            e.currentTarget.focus();
            const rect = e.currentTarget.getBoundingClientRect(),
              thumb = rect.width * fraction;
            drag.current = (e.target as HTMLElement).closest(
              ".ct-scrollbar-thumb",
            )
              ? e.clientX - rect.left - progress * (rect.width - thumb)
              : thumb / 2;
            e.currentTarget.setPointerCapture(e.pointerId);
            set(
              ((e.clientX - rect.left - drag.current) /
                Math.max(1, rect.width - thumb)) *
                maximum,
            );
          }}
          onPointerMove={(e) => {
            if (drag.current !== null) {
              const rect = e.currentTarget.getBoundingClientRect();
              set(
                ((e.clientX - rect.left - drag.current) /
                  Math.max(1, rect.width * (1 - fraction))) *
                  maximum,
              );
            }
          }}
          onPointerUp={(e) => {
            drag.current = null;
            if (e.currentTarget.hasPointerCapture(e.pointerId))
              e.currentTarget.releasePointerCapture(e.pointerId);
          }}
          onPointerCancel={() => {
            drag.current = null;
          }}
          onKeyDown={(e) => {
            const next =
              e.key === "Home"
                ? 0
                : e.key === "End"
                  ? maximum
                  : e.key === "ArrowLeft"
                    ? value - step
                    : e.key === "ArrowRight"
                      ? value + step
                      : e.key === "PageUp"
                        ? value - visibleWidth
                        : e.key === "PageDown"
                          ? value + visibleWidth
                          : null;
            if (next !== null) {
              e.preventDefault();
              set(next);
            }
          }}
        >
          <span
            className="ct-scrollbar-thumb"
            style={{
              width: `${fraction * 100}%`,
              left: `${progress * (1 - fraction) * 100}%`,
            }}
          />
        </div>
        <button
          type="button"
          className="ct-scrollbar-arrow"
          disabled={value >= maximum}
          aria-label={t("campaign.timeline.nextDay")}
          title={t("campaign.timeline.nextDay")}
          onClick={() => set(value + step)}
        >
          <ChevronRight className="size-3" />
        </button>
      </div>
    </div>
  );
}
