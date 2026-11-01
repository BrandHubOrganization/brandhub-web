import { useState, useRef, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DateRangeValue {
  dateRange: string;
  startDate?: string;
  endDate?: string;
}

interface PostDashboardDatePickerProps {
  value?: string;
  startDate?: string;
  endDate?: string;
  onChange: (val: DateRangeValue) => void;
}

const PRESETS = [
  { id: "today", labelKey: "publish.dashboard.dateRanges.today", fallback: "Hôm nay" },
  { id: "yesterday", labelKey: "publish.dashboard.dateRanges.yesterday", fallback: "Hôm qua" },
  { id: "7d", labelKey: "publish.dashboard.dateRanges.7d", fallback: "7 ngày qua" },
  { id: "14d", labelKey: "publish.dashboard.dateRanges.14d", fallback: "14 ngày qua" },
  { id: "28d", labelKey: "publish.dashboard.dateRanges.28d", fallback: "28 ngày qua" },
  { id: "60d", labelKey: "publish.dashboard.dateRanges.60d", fallback: "60 ngày qua" },
  { id: "90d", labelKey: "publish.dashboard.dateRanges.90d", fallback: "90 ngày qua" },
  { id: "this_year", labelKey: "publish.dashboard.dateRanges.this_year", fallback: "Năm nay" },
];

function getPresetRange(presetId: string): { start: Date; end: Date } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (presetId) {
    case "today":
      return { start: today, end: today };
    case "yesterday": {
      const d = new Date(today);
      d.setDate(today.getDate() - 1);
      return { start: d, end: d };
    }
    case "7d": {
      const d = new Date(today);
      d.setDate(today.getDate() - 6);
      return { start: d, end: today };
    }
    case "14d": {
      const d = new Date(today);
      d.setDate(today.getDate() - 13);
      return { start: d, end: today };
    }
    case "28d": {
      const d = new Date(today);
      d.setDate(today.getDate() - 27);
      return { start: d, end: today };
    }
    case "60d": {
      const d = new Date(today);
      d.setDate(today.getDate() - 59);
      return { start: d, end: today };
    }
    case "90d": {
      const d = new Date(today);
      d.setDate(today.getDate() - 89);
      return { start: d, end: today };
    }
    case "this_year":
      return { start: new Date(today.getFullYear(), 0, 1), end: today };
    default: {
      const d = new Date(today);
      d.setDate(today.getDate() - 27);
      return { start: d, end: today };
    }
  }
}

interface CalendarDayItem {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
}

export function PostDashboardDatePicker({
  value = "28d",
  startDate,
  endDate,
  onChange,
}: PostDashboardDatePickerProps) {
  const { t, i18n } = useTranslation();
  const isVi = i18n.language?.startsWith("vi") ?? true;
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const initialRange = useMemo(() => {
    if (startDate && endDate) {
      return { start: new Date(startDate), end: new Date(endDate) };
    }
    return getPresetRange(value || "28d");
  }, [value, startDate, endDate]);

  const [selectedPreset, setSelectedPreset] = useState<string>(value || "28d");
  const [tempStart, setTempStart] = useState<Date>(initialRange.start);
  const [tempEnd, setTempEnd] = useState<Date>(initialRange.end);
  const [calendarMonth, setCalendarMonth] = useState<Date>(initialRange.end);

  useEffect(() => {
    setSelectedPreset(value || "28d");
    if (startDate && endDate) {
      const s = new Date(startDate);
      const e = new Date(endDate);
      setTempStart(s);
      setTempEnd(e);
      setCalendarMonth(e);
    } else {
      const r = getPresetRange(value || "28d");
      setTempStart(r.start);
      setTempEnd(r.end);
      setCalendarMonth(r.end);
    }
  }, [value, startDate, endDate]);

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener("mousedown", onMouseDown);
      document.addEventListener("keydown", onKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const handleSelectPreset = (presetId: string) => {
    setSelectedPreset(presetId);
    const r = getPresetRange(presetId);
    setTempStart(r.start);
    setTempEnd(r.end);
    setCalendarMonth(r.end);
  };

  const handleDayClick = (dayDate: Date) => {
    const dTime = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate()).getTime();
    const sTime = tempStart ? new Date(tempStart.getFullYear(), tempStart.getMonth(), tempStart.getDate()).getTime() : 0;
    const eTime = tempEnd ? new Date(tempEnd.getFullYear(), tempEnd.getMonth(), tempEnd.getDate()).getTime() : sTime;

    if (!tempStart || (sTime > 0 && eTime > 0 && sTime !== eTime)) {
      setTempStart(dayDate);
      setTempEnd(dayDate);
    } else if (dTime < sTime) {
      setTempEnd(tempStart);
      setTempStart(dayDate);
    } else {
      setTempEnd(dayDate);
    }
    setSelectedPreset("custom");
  };

  const handleApply = () => {
    onChange({
      dateRange: selectedPreset,
      startDate: tempStart.toISOString(),
      endDate: (tempEnd || tempStart).toISOString(),
    });
    setIsOpen(false);
  };

  const formatShort = (d: Date) =>
    isVi
      ? `${d.getDate()} Tháng ${d.getMonth() + 1}`
      : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const formatFull = (d: Date) =>
    isVi
      ? `${d.getDate()} Tháng ${d.getMonth() + 1}, ${d.getFullYear()}`
      : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const triggerLabel = useMemo(() => {
    const presetObj = PRESETS.find((p) => p.id === value);
    const presetName = presetObj
      ? t(presetObj.labelKey, presetObj.fallback)
      : t("publish.dashboard.dateRanges.custom", "Tùy chỉnh");
    const activeStart = startDate ? new Date(startDate) : initialRange.start;
    const activeEnd = endDate ? new Date(endDate) : initialRange.end;
    return `${presetName}: ${formatShort(activeStart)} - ${formatShort(activeEnd)}`;
  }, [value, startDate, endDate, initialRange, t, isVi]);

  const year = calendarMonth.getFullYear();
  const month = calendarMonth.getMonth();

  const monthTitle = isVi
    ? `Tháng ${month + 1} năm ${year}`
    : calendarMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const weekdays = isVi
    ? ["CN", "T2", "T3", "T4", "T5", "T6", "T7"]
    : ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  // Grid calculation with complete prev/next month filling
  const calendarDays = useMemo(() => {
    const days: CalendarDayItem[] = [];
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = CN, 1 = T2...
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    // Fill previous month days
    for (let i = 0; i < firstDayOfWeek; i++) {
      const dayNum = daysInPrevMonth - firstDayOfWeek + 1 + i;
      days.push({
        date: new Date(year, month - 1, dayNum),
        dayNumber: dayNum,
        isCurrentMonth: false,
      });
    }

    // Fill current month days
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      days.push({
        date: new Date(year, month, d),
        dayNumber: d,
        isCurrentMonth: true,
      });
    }

    // Fill next month days so grid has no empty gaps
    const totalCount = days.length <= 35 ? 35 : 42;
    const nextMonthDaysCount = totalCount - days.length;
    for (let d = 1; d <= nextMonthDaysCount; d++) {
      days.push({
        date: new Date(year, month + 1, d),
        dayNumber: d,
        isCurrentMonth: false,
      });
    }

    return days;
  }, [year, month]);

  const startTime = tempStart
    ? new Date(tempStart.getFullYear(), tempStart.getMonth(), tempStart.getDate()).getTime()
    : 0;
  const endTime = tempEnd
    ? new Date(tempEnd.getFullYear(), tempEnd.getMonth(), tempEnd.getDate()).getTime()
    : startTime;

  return (
    <div className="relative inline-block" ref={containerRef}>
      {/* Trigger Button: Meta Business Suite Pill Style */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "bg-card border-border hover:bg-muted/50 text-foreground flex h-9 cursor-pointer items-center gap-2 rounded-lg border px-3 text-xs font-semibold shadow-2xs transition-colors focus:outline-none focus:ring-2 focus:ring-[#1877F2]/30",
          isOpen && "ring-2 ring-[#1877F2]/30 border-[#1877F2]",
        )}
      >
        <span className="truncate max-w-[280px] sm:max-w-none">{triggerLabel}</span>
        <ChevronDown className="text-muted-foreground size-3.5 shrink-0" />
      </button>

      {/* Popover */}
      {isOpen && (
        <div className="rounded-2xl border border-border bg-card p-4 shadow-2xl z-50 absolute left-0 top-full mt-1.5 flex flex-col gap-4 sm:flex-row sm:min-w-[600px]">
          {/* Cột trái: Presets */}
          <div className="border-border flex flex-col gap-1 border-b sm:border-b-0 sm:border-r pb-3 sm:pb-0 pr-1 sm:w-48 max-h-[360px] overflow-y-auto">
            <span className="text-muted-foreground px-2 pb-1 text-2xs font-semibold uppercase tracking-wider">
              {t("publish.dashboard.datePicker.presetsTitle", "Khoảng thời gian")}
            </span>
            <div className="space-y-0.5">
              {PRESETS.map((preset) => {
                const isActive = selectedPreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset.id)}
                    className={cn(
                      "flex w-full cursor-pointer items-center justify-between rounded-lg px-2.5 py-2 text-xs transition-colors text-left",
                      isActive
                        ? "bg-[#1877F2]/10 text-[#1877F2] font-semibold"
                        : "text-foreground hover:bg-muted/60 font-medium",
                    )}
                  >
                    <span>{t(preset.labelKey, preset.fallback)}</span>
                    <span
                      className={cn(
                        "size-4 rounded-full flex items-center justify-center shrink-0 border transition-all",
                        isActive ? "border-2 border-[#1877F2]" : "border border-muted-foreground/40",
                      )}
                    >
                      {isActive && <span className="size-2 rounded-full bg-[#1877F2]" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cột phải: Calendar View */}
          <div className="flex flex-1 flex-col justify-between">
            <div>
              {/* Header: < Tháng 10 năm 2026 > */}
              <div className="mb-3 flex items-center justify-between px-1">
                <button
                  type="button"
                  onClick={() => setCalendarMonth(new Date(year, month - 1, 1))}
                  className="hover:bg-muted text-muted-foreground hover:text-foreground flex size-7 cursor-pointer items-center justify-center rounded-md transition-colors"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <span className="text-foreground text-xs font-bold">{monthTitle}</span>
                <button
                  type="button"
                  onClick={() => setCalendarMonth(new Date(year, month + 1, 1))}
                  className="hover:bg-muted text-muted-foreground hover:text-foreground flex size-7 cursor-pointer items-center justify-center rounded-md transition-colors"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>

              {/* Hàng thứ: CN T2 T3 T4 T5 T6 T7 */}
              <div className="grid grid-cols-7 gap-0 text-center text-2xs font-semibold text-muted-foreground mb-1">
                {weekdays.map((w, idx) => (
                  <div key={idx} className="h-6 flex items-center justify-center">
                    {w}
                  </div>
                ))}
              </div>

              {/* Ô ngày với Facebook Range Selection */}
              <div className="grid grid-cols-7 gap-y-1">
                {calendarDays.map((item, idx) => {
                  const dTime = new Date(
                    item.date.getFullYear(),
                    item.date.getMonth(),
                    item.date.getDate(),
                  ).getTime();

                  const isStart = startTime > 0 && dTime === startTime;
                  const isEnd = endTime > 0 && dTime === endTime;
                  const isSingle = isStart && isEnd;
                  const isInRange = startTime > 0 && endTime > 0 && dTime > startTime && dTime < endTime;

                  return (
                    <div
                      key={`day-${idx}-${item.dayNumber}`}
                      className="relative flex h-9 items-center justify-center p-0"
                    >
                      {/* Ribbon background for range */}
                      {isStart && !isEnd && (
                        <div className="absolute inset-y-0.5 right-0 left-1/2 bg-[#E7F3FF] dark:bg-blue-950/60" />
                      )}
                      {isEnd && !isStart && (
                        <div className="absolute inset-y-0.5 left-0 right-1/2 bg-[#E7F3FF] dark:bg-blue-950/60" />
                      )}
                      {isInRange && (
                        <div className="absolute inset-y-0.5 inset-x-0 bg-[#E7F3FF] dark:bg-blue-950/60" />
                      )}

                      {/* Day Button / Number */}
                      {isSingle || isStart || isEnd ? (
                        <button
                          type="button"
                          onClick={() => handleDayClick(item.date)}
                          className="relative z-10 size-8 rounded-full bg-[#1877F2] text-white font-bold text-xs flex items-center justify-center shadow-xs cursor-pointer"
                        >
                          {item.dayNumber}
                        </button>
                      ) : isInRange ? (
                        <button
                          type="button"
                          onClick={() => handleDayClick(item.date)}
                          className="relative z-10 size-8 flex items-center justify-center text-xs font-semibold text-[#1877F2] dark:text-blue-200 cursor-pointer"
                        >
                          {item.dayNumber}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleDayClick(item.date)}
                          className={cn(
                            "size-8 rounded-full flex items-center justify-center text-xs transition-colors hover:bg-muted cursor-pointer",
                            item.isCurrentMonth
                              ? "text-foreground font-medium"
                              : "text-muted-foreground/40 font-normal",
                          )}
                        >
                          {item.dayNumber}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="border-border mt-4 flex items-center justify-between border-t pt-3">
              <div>
                <span className="text-foreground text-xs font-semibold">
                  {formatFull(tempStart)} - {formatFull(tempEnd || tempStart)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-xs text-muted-foreground hover:text-foreground font-semibold px-3 py-1.5 rounded-md cursor-pointer transition-colors"
                >
                  {t("common.cancel", "Hủy")}
                </button>
                <button
                  type="button"
                  onClick={handleApply}
                  className="bg-[#1877F2] hover:bg-[#166fe5] text-white font-semibold text-xs px-4 py-1.5 rounded-md cursor-pointer transition-colors shadow-2xs"
                >
                  {t("common.apply", "Áp dụng")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
