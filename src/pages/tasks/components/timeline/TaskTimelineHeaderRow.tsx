import { useTranslation } from "react-i18next";
import type { TaskTimelineHeaderRowProps, TimelineZoom } from "./types";

export type { TaskTimelineHeaderRowProps };

function formatTick(dateStr: string, zoom: TimelineZoom): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length < 3) return dateStr;
  const [year, month, day] = parts;
  if (zoom === "quarter") {
    const q = Math.floor((parseInt(month, 10) - 1) / 3) + 1;
    return `Q${q} ${year}`;
  }
  if (zoom === "month") {
    return `T${parseInt(month, 10)}/${year.slice(2)}`;
  }
  return `${day}/${month}`;
}

export function TaskTimelineHeaderRow({
  calendarWidth,
  ticks,
  todayX,
  zoom,
}: TaskTimelineHeaderRowProps) {
  const { t } = useTranslation();

  return (
    <div
      className="ct-grid-row ct-ruler"
      style={{
        gridTemplateColumns: `280px 120px 90px ${calendarWidth}px`,
        width: 490 + calendarWidth,
      }}
    >
      <div
        className="ct-cell font-semibold"
        style={{ left: 0, width: 280, position: "sticky", zIndex: 35 }}
      >
        <span>
          {t("tasks.timelineGrid.workColumn", { defaultValue: "Công việc" })}
        </span>
      </div>

      <div
        className="ct-cell justify-center font-semibold"
        style={{ left: 280, width: 120, position: "sticky", zIndex: 35 }}
      >
        <span>
          {t("tasks.timelineGrid.statusColumn", { defaultValue: "Trạng thái" })}
        </span>
      </div>

      <div
        className="ct-cell justify-center font-semibold"
        style={{ left: 400, width: 90, position: "sticky", zIndex: 35 }}
      >
        <span>
          {t("tasks.timelineGrid.assigneeColumn", {
            defaultValue: "Người phụ trách",
          })}
        </span>
      </div>

      <div className="ct-axis" style={{ width: calendarWidth }}>
        {ticks.map((tick) => (
          <div key={tick.dayNum}>
            <span
              className="ct-gridline"
              style={{ left: tick.left }}
              aria-hidden
            />
            <span
              className="ct-tick select-none"
              style={{ left: tick.left + 4 }}
            >
              {formatTick(tick.dateStr, zoom)}
            </span>
          </div>
        ))}

        <span className="ct-today" style={{ left: todayX }} />

        <span className="ct-today-label" style={{ left: todayX }}>
          {t("tasks.timelineGrid.today", { defaultValue: "Hôm nay" })}
        </span>
      </div>
    </div>
  );
}
