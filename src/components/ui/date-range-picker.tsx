import React, { useState, useEffect, useMemo, type MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import {
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface DateRangePickerProps {
  from?: string;
  to?: string;
  onChange: (from: string, to: string) => void;
  label?: React.ReactNode;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  presets?: boolean;
  min?: string;
  max?: string;
  align?: "start" | "center" | "end";
  allowClear?: boolean;
}

export interface DatePickerProps {
  value?: string;
  onChange: (value: string) => void;
  label?: React.ReactNode;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  error?: string;
  min?: string;
  max?: string;
  align?: "start" | "center" | "end";
  allowClear?: boolean;
  showPresets?: boolean;
  id?: string;
  name?: string;
}

interface CalendarDay {
  date: Date;
  dateStr: string;
  dayNumber: number;
  isCurrentMonth: boolean;
}

export function parseDateStr(str?: string): Date {
  if (!str) return new Date();
  const dateOnly = str.split("T")[0];
  const [y, m, d] = dateOnly.split("-").map(Number);
  if (!y || !m || !d) return new Date();
  return new Date(y, m - 1, d);
}

export function formatDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function formatVnDisplay(str?: string, fallback = ""): string {
  if (!str) return fallback;
  const dateOnly = str.split("T")[0];
  const [y, m, d] = dateOnly.split("-");
  if (!y || !m || !d) return str;
  return `${d}/${m}/${y}`;
}

export function countDays(fromStr?: string, toStr?: string): number {
  if (!fromStr || !toStr) return 0;
  const t1 = parseDateStr(fromStr).getTime();
  const t2 = parseDateStr(toStr).getTime();
  return Math.max(1, Math.round(Math.abs(t2 - t1) / 86400000) + 1);
}

function buildCalendarDays(year: number, month: number): CalendarDay[] {
  const list: CalendarDay[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay(); // 0 is Sun, 1 is Mon
  const mondayOffset = (firstDay + 6) % 7; // Monday = 0, Sunday = 6
  const prevMonthDays = new Date(year, month, 0).getDate();

  // Previous month filler
  for (let i = 0; i < mondayOffset; i++) {
    const dNum = prevMonthDays - mondayOffset + 1 + i;
    const d = new Date(year, month - 1, dNum);
    list.push({ date: d, dateStr: formatDateStr(d), dayNumber: dNum, isCurrentMonth: false });
  }

  // Current month days
  for (let dNum = 1; dNum <= daysInMonth; dNum++) {
    const d = new Date(year, month, dNum);
    list.push({ date: d, dateStr: formatDateStr(d), dayNumber: dNum, isCurrentMonth: true });
  }

  // Next month filler
  const totalCells = list.length <= 35 ? 35 : 42;
  const remaining = totalCells - list.length;
  for (let dNum = 1; dNum <= remaining; dNum++) {
    const d = new Date(year, month + 1, dNum);
    list.push({ date: d, dateStr: formatDateStr(d), dayNumber: dNum, isCurrentMonth: false });
  }

  return list;
}

// ============================================================================
// 1. DATE RANGE PICKER (Khoảng ngày: Từ ngày - Đến ngày)
// ============================================================================
export function DateRangePicker({
  from = "",
  to = "",
  onChange,
  label,
  placeholder,
  className,
  triggerClassName,
  disabled = false,
  required = false,
  error,
  presets = true,
  min,
  max,
  align = "start",
  allowClear = false,
}: DateRangePickerProps) {
  const { t, i18n } = useTranslation();
  const isVi = i18n.language?.startsWith("vi") ?? true;
  const [isOpen, setIsOpen] = useState(false);

  // Temporary selection state
  const [tempFrom, setTempFrom] = useState<string>(from);
  const [tempTo, setTempTo] = useState<string>(to);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [isSelectingEnd, setIsSelectingEnd] = useState(false);

  // Calendar month view
  const [viewDate, setViewDate] = useState<Date>(() => parseDateStr(to || from || formatDateStr(new Date())));

  // Sync with incoming props when opened or props change
  useEffect(() => {
    setTempFrom(from);
    setTempTo(to);
    setIsSelectingEnd(false);
    if (to) {
      setViewDate(parseDateStr(to));
    } else if (from) {
      setViewDate(parseDateStr(from));
    }
  }, [from, to, isOpen]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const monthLabel = useMemo(() => {
    return isVi
      ? `Tháng ${month + 1} năm ${year}`
      : viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }, [month, year, isVi, viewDate]);

  const weekdays = useMemo(() => {
    return isVi
      ? ["T2", "T3", "T4", "T5", "T6", "T7", "CN"]
      : ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
  }, [isVi]);

  const days = useMemo(() => buildCalendarDays(year, month), [year, month]);

  const handlePrevMonth = (e: MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = (e: MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(year, month + 1, 1));
  };

  const handleDayClick = (dayStr: string) => {
    if (min && dayStr < min) return;
    if (max && dayStr > max) return;

    if (!isSelectingEnd) {
      setTempFrom(dayStr);
      setTempTo(dayStr);
      setIsSelectingEnd(true);
    } else {
      if (dayStr < tempFrom) {
        setTempTo(tempFrom);
        setTempFrom(dayStr);
      } else {
        setTempTo(dayStr);
      }
      setIsSelectingEnd(false);
    }
  };

  const applyPreset = (preset: "today" | "7d" | "30d" | "thisMonth") => {
    const now = new Date();
    const todayStr = formatDateStr(now);
    if (preset === "today") {
      setTempFrom(todayStr);
      setTempTo(todayStr);
    } else if (preset === "7d") {
      const start = new Date(now);
      start.setDate(now.getDate() - 6);
      setTempFrom(formatDateStr(start));
      setTempTo(todayStr);
    } else if (preset === "30d") {
      const start = new Date(now);
      start.setDate(now.getDate() - 29);
      setTempFrom(formatDateStr(start));
      setTempTo(todayStr);
    } else if (preset === "thisMonth") {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      setTempFrom(formatDateStr(start));
      setTempTo(todayStr);
    }
    setIsSelectingEnd(false);
  };

  const handleApply = () => {
    onChange(tempFrom, tempTo || tempFrom);
    setIsOpen(false);
  };

  const handleReset = () => {
    setTempFrom(from);
    setTempTo(to);
    setIsSelectingEnd(false);
  };

  const handleClear = (e: MouseEvent) => {
    e.stopPropagation();
    onChange("", "");
    setTempFrom("");
    setTempTo("");
    setIsSelectingEnd(false);
  };

  // Range preview boundaries
  const activeFrom = tempFrom;
  const activeTo = isSelectingEnd && hoveredDate
    ? (hoveredDate >= tempFrom ? hoveredDate : activeFrom)
    : tempTo;
  const effectiveStart = isSelectingEnd && hoveredDate && hoveredDate < tempFrom ? hoveredDate : activeFrom;
  const effectiveEnd = isSelectingEnd && hoveredDate && hoveredDate < tempFrom ? tempFrom : activeTo;
  const selectedDays = countDays(tempFrom, tempTo);
  const hasValue = Boolean(from || to);

  const displayText = useMemo(() => {
    if (from && to) return `${formatVnDisplay(from)} — ${formatVnDisplay(to)}`;
    if (from) return `${formatVnDisplay(from)} — ...`;
    if (to) return `... — ${formatVnDisplay(to)}`;
    return placeholder || t("common.datePicker.selectRange", "Chọn khoảng thời gian");
  }, [from, to, placeholder, t]);

  return (
    <div className={cn("relative inline-flex flex-col gap-1.5", className)}>
      {label && (
        <Label className={cn("text-xs font-semibold tracking-wide flex items-center gap-0.5", error && "text-destructive")}>
          <span>{label}</span>
          {required && (
            <span className="text-destructive font-bold ml-0.5" aria-hidden="true">*</span>
          )}
        </Label>
      )}

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild disabled={disabled}>
          <button
            type="button"
            aria-expanded={isOpen}
            aria-haspopup="dialog"
            disabled={disabled}
            className={cn(
              "bg-card border-border hover:bg-muted/50 text-foreground flex h-9 cursor-pointer items-center justify-between gap-2 rounded-lg border px-3 text-xs font-medium transition-all shadow-2xs focus-visible:outline-hidden",
              "border-input",
              isOpen && "border-brand-orange ring-2 ring-brand-orange/20",
              error && "border-destructive ring-destructive/20",
              disabled && "opacity-50 cursor-not-allowed pointer-events-none",
              triggerClassName,
            )}
          >
            <div className="flex items-center gap-2 min-w-0 overflow-hidden">
              <CalendarIcon className="size-3.5 text-brand-orange shrink-0" />
              <span className={cn("truncate font-medium", hasValue ? "text-foreground font-semibold" : "text-muted-foreground")}>
                {displayText}
              </span>
              {hasValue && from && to && (
                <span className="bg-muted text-muted-foreground hidden rounded px-1.5 py-0.5 text-2xs font-normal sm:inline-block shrink-0">
                  {countDays(from, to)} {t("common.datePicker.daysCount", "ngày")}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {allowClear && hasValue && !disabled && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={handleClear}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleClear(e as unknown as MouseEvent);
                    }
                  }}
                  className="text-muted-foreground hover:text-foreground hover:bg-muted/80 p-0.5 rounded cursor-pointer transition-colors"
                  title={t("common.datePicker.clear", "Xóa")}
                >
                  <X className="size-3" />
                </span>
              )}
              <ChevronDown
                className={cn(
                  "text-muted-foreground size-3.5 shrink-0 transition-transform duration-200",
                  isOpen && "rotate-180 text-brand-orange",
                )}
              />
            </div>
          </button>
        </PopoverTrigger>

        <PopoverContent
          align={align}
          sideOffset={6}
          className="bg-card text-card-foreground border-border z-[75] flex w-[330px] sm:w-[350px] flex-col rounded-2xl border p-4 shadow-xl"
        >
          {/* Quick Presets Bar */}
          {presets && (
            <div className="border-border/70 mb-3 flex items-center justify-between gap-1 border-b pb-2.5">
              <span className="text-muted-foreground text-2xs font-semibold uppercase tracking-wider">
                {t("common.datePicker.selectRange", "Khoảng nhanh")}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => applyPreset("today")}
                  className="hover:bg-muted text-foreground/80 hover:text-foreground rounded-md px-2 py-1 text-2xs font-medium transition-colors cursor-pointer"
                >
                  {t("common.datePicker.today", "Hôm nay")}
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset("7d")}
                  className="hover:bg-muted text-foreground/80 hover:text-foreground rounded-md px-2 py-1 text-2xs font-medium transition-colors cursor-pointer"
                >
                  {t("common.datePicker.last7Days", "7 ngày")}
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset("30d")}
                  className="hover:bg-muted text-foreground/80 hover:text-foreground rounded-md px-2 py-1 text-2xs font-medium transition-colors cursor-pointer"
                >
                  {t("common.datePicker.last30Days", "30 ngày")}
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset("thisMonth")}
                  className="hover:bg-muted text-foreground/80 hover:text-foreground rounded-md px-2 py-1 text-2xs font-medium transition-colors cursor-pointer"
                >
                  {t("common.datePicker.thisMonth", "Tháng này")}
                </button>
              </div>
            </div>
          )}

          {/* Month Navigation */}
          <div className="mb-2 flex items-center justify-between px-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="hover:bg-muted text-muted-foreground hover:text-foreground flex size-7 cursor-pointer items-center justify-center rounded-lg transition-colors"
              aria-label={t("common.datePicker.prevMonth", "Tháng trước")}
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="text-foreground text-xs font-bold">{monthLabel}</span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="hover:bg-muted text-muted-foreground hover:text-foreground flex size-7 cursor-pointer items-center justify-center rounded-lg transition-colors"
              aria-label={t("common.datePicker.nextMonth", "Tháng sau")}
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          {/* Weekday Row */}
          <div className="mb-1 grid grid-cols-7 text-center text-2xs font-semibold text-muted-foreground">
            {weekdays.map((w, i) => (
              <div key={i} className="flex h-6 items-center justify-center">
                {w}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div
            className="grid grid-cols-7 gap-y-1"
            onMouseLeave={() => setHoveredDate(null)}
          >
            {days.map((day, idx) => {
              const isStart = day.dateStr === effectiveStart;
              const isEnd = day.dateStr === effectiveEnd;
              const isSingle = isStart && isEnd;
              const isInRange =
                Boolean(effectiveStart && effectiveEnd && day.dateStr > effectiveStart && day.dateStr < effectiveEnd);

              const isDisabled = Boolean(
                (min && day.dateStr < min) || (max && day.dateStr > max),
              );

              return (
                <div
                  key={`${idx}-${day.dateStr}`}
                  className="relative flex h-8 items-center justify-center p-0"
                  onMouseEnter={() => !isDisabled && isSelectingEnd && setHoveredDate(day.dateStr)}
                >
                  {/* Ribbon background */}
                  {isStart && !isEnd && (
                    <div className="bg-brand-orange/15 dark:bg-brand-orange/20 absolute inset-y-0.5 right-0 left-1/2" />
                  )}
                  {isEnd && !isStart && (
                    <div className="bg-brand-orange/15 dark:bg-brand-orange/20 absolute inset-y-0.5 left-0 right-1/2" />
                  )}
                  {isInRange && (
                    <div className="bg-brand-orange/15 dark:bg-brand-orange/20 absolute inset-y-0.5 inset-x-0" />
                  )}

                  {/* Day cell button */}
                  {isSingle ? (
                    <button
                      type="button"
                      disabled={isDisabled}
                      onClick={() => handleDayClick(day.dateStr)}
                      className={cn(
                        "bg-brand-orange text-white shadow-xs relative z-10 flex size-7 cursor-pointer items-center justify-center rounded-lg text-xs font-bold",
                        isDisabled && "opacity-25 pointer-events-none",
                      )}
                    >
                      {day.dayNumber}
                    </button>
                  ) : isStart ? (
                    <button
                      type="button"
                      disabled={isDisabled}
                      onClick={() => handleDayClick(day.dateStr)}
                      className={cn(
                        "bg-brand-orange text-white shadow-xs relative z-10 flex size-7 cursor-pointer items-center justify-center rounded-l-lg text-xs font-bold",
                        isDisabled && "opacity-25 pointer-events-none",
                      )}
                    >
                      {day.dayNumber}
                    </button>
                  ) : isEnd ? (
                    <button
                      type="button"
                      disabled={isDisabled}
                      onClick={() => handleDayClick(day.dateStr)}
                      className={cn(
                        "bg-brand-orange text-white shadow-xs relative z-10 flex size-7 cursor-pointer items-center justify-center rounded-r-lg text-xs font-bold",
                        isDisabled && "opacity-25 pointer-events-none",
                      )}
                    >
                      {day.dayNumber}
                    </button>
                  ) : isInRange ? (
                    <button
                      type="button"
                      disabled={isDisabled}
                      onClick={() => handleDayClick(day.dateStr)}
                      className={cn(
                        "text-brand-orange relative z-10 flex size-7 cursor-pointer items-center justify-center text-xs font-bold",
                        isDisabled && "opacity-25 pointer-events-none",
                      )}
                    >
                      {day.dayNumber}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isDisabled}
                      onClick={() => handleDayClick(day.dateStr)}
                      className={cn(
                        "hover:bg-muted relative z-10 flex size-7 cursor-pointer items-center justify-center rounded-lg text-xs transition-colors",
                        day.isCurrentMonth
                          ? "text-foreground font-medium"
                          : "text-muted-foreground/35 font-normal",
                        isDisabled && "opacity-25 pointer-events-none cursor-not-allowed",
                      )}
                    >
                      {day.dayNumber}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer Bar */}
          <div className="border-border/70 mt-3 flex items-center justify-between border-t pt-3">
            <div className="flex flex-col">
              <span className="text-foreground text-xs font-semibold">
                {formatVnDisplay(tempFrom, "...")} — {formatVnDisplay(tempTo || tempFrom, "...")}
              </span>
              <span className="text-muted-foreground text-2xs">
                {selectedDays > 0 ? `${selectedDays} ${t("common.datePicker.daysCount", "ngày")}` : "---"}
                {isSelectingEnd && ` • ${t("common.datePicker.selectingEndDate", "Đang chọn ngày kết thúc")}`}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-muted-foreground hover:text-foreground h-8 px-2 text-xs"
                title={t("common.datePicker.reset", "Khôi phục")}
              >
                <RotateCcw className="size-3.5" />
              </Button>
              <Button
                type="button"
                variant="orange"
                size="sm"
                onClick={handleApply}
                className="h-8 px-3 text-xs font-semibold shadow-2xs"
              >
                {t("common.datePicker.apply", "Áp dụng")}
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {error && (
        <p className="text-destructive text-xs font-medium leading-none">{error}</p>
      )}
    </div>
  );
}

// ============================================================================
// 2. DATE PICKER (Chọn 1 ngày đơn)
// ============================================================================
export function DatePicker({
  value = "",
  onChange,
  label,
  placeholder,
  className,
  triggerClassName,
  disabled = false,
  readOnly = false,
  required = false,
  error,
  min,
  max,
  align = "start",
  allowClear = true,
  showPresets = true,
  id,
  name,
}: DatePickerProps) {
  const { t, i18n } = useTranslation();
  const isVi = i18n.language?.startsWith("vi") ?? true;
  const [isOpen, setIsOpen] = useState(false);

  // Calendar month view
  const [viewDate, setViewDate] = useState<Date>(() =>
    parseDateStr(value || formatDateStr(new Date())),
  );

  // Sync with value prop
  useEffect(() => {
    if (value) {
      setViewDate(parseDateStr(value));
    }
  }, [value, isOpen]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const monthLabel = useMemo(() => {
    return isVi
      ? `Tháng ${month + 1} năm ${year}`
      : viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }, [month, year, isVi, viewDate]);

  const weekdays = useMemo(() => {
    return isVi
      ? ["T2", "T3", "T4", "T5", "T6", "T7", "CN"]
      : ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
  }, [isVi]);

  const days = useMemo(() => buildCalendarDays(year, month), [year, month]);

  const handlePrevMonth = (e: MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = (e: MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(year, month + 1, 1));
  };

  const handleDaySelect = (dayStr: string) => {
    if (disabled || readOnly) return;
    if (min && dayStr < min) return;
    if (max && dayStr > max) return;
    onChange(dayStr);
    setIsOpen(false);
  };

  const handlePreset = (type: "today" | "yesterday" | "tomorrow") => {
    const now = new Date();
    if (type === "yesterday") {
      now.setDate(now.getDate() - 1);
    } else if (type === "tomorrow") {
      now.setDate(now.getDate() + 1);
    }
    const dayStr = formatDateStr(now);
    if (min && dayStr < min) return;
    if (max && dayStr > max) return;
    onChange(dayStr);
    setViewDate(now);
    setIsOpen(false);
  };

  const handleClear = (e: MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  const todayStr = useMemo(() => formatDateStr(new Date()), []);
  const hasValue = Boolean(value);
  const displayText = hasValue
    ? formatVnDisplay(value)
    : placeholder || t("common.datePicker.selectDate", "Chọn ngày");

  return (
    <div className={cn("relative inline-flex flex-col gap-1.5 w-full", className)}>
      {label && (
        <Label
          htmlFor={id}
          className={cn(
            "text-xs font-semibold tracking-wide flex items-center gap-0.5",
            error && "text-destructive",
          )}
        >
          <span>{label}</span>
          {required && (
            <span className="text-destructive font-bold ml-0.5" aria-hidden="true">
              *
            </span>
          )}
        </Label>
      )}

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild disabled={disabled || readOnly}>
          <button
            id={id}
            name={name}
            type="button"
            aria-expanded={isOpen}
            aria-haspopup="dialog"
            disabled={disabled || readOnly}
            className={cn(
              "bg-card border-border hover:bg-muted/50 text-foreground flex h-9 w-full cursor-pointer items-center justify-between gap-2 rounded-lg border px-3 text-xs font-medium transition-all shadow-2xs focus-visible:outline-hidden",
              "border-input",
              isOpen && "border-brand-orange ring-2 ring-brand-orange/20",
              error && "border-destructive ring-destructive/20",
              (disabled || readOnly) && "opacity-50 cursor-not-allowed pointer-events-none",
              triggerClassName,
            )}
          >
            <div className="flex items-center gap-2 min-w-0 overflow-hidden">
              <CalendarIcon className="size-3.5 text-brand-orange shrink-0" />
              <span className={cn("truncate font-medium", hasValue ? "text-foreground font-semibold" : "text-muted-foreground")}>
                {displayText}
              </span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {allowClear && hasValue && !disabled && !readOnly && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={handleClear}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleClear(e as unknown as MouseEvent);
                    }
                  }}
                  className="text-muted-foreground hover:text-foreground hover:bg-muted/80 p-0.5 rounded cursor-pointer transition-colors"
                  title={t("common.datePicker.clear", "Xóa")}
                >
                  <X className="size-3" />
                </span>
              )}
              <ChevronDown
                className={cn(
                  "text-muted-foreground size-3.5 shrink-0 transition-transform duration-200",
                  isOpen && "rotate-180 text-brand-orange",
                )}
              />
            </div>
          </button>
        </PopoverTrigger>

        <PopoverContent
          align={align}
          sideOffset={6}
          className="bg-card text-card-foreground border-border z-[75] flex w-[300px] flex-col rounded-2xl border p-3.5 shadow-xl"
        >
          {/* Quick Presets */}
          {showPresets && (
            <div className="border-border/70 mb-2.5 flex items-center justify-between gap-1 border-b pb-2">
              <span className="text-muted-foreground text-2xs font-semibold uppercase tracking-wider">
                {t("common.datePicker.selectRange", "Chọn nhanh")}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handlePreset("yesterday")}
                  className="hover:bg-muted text-foreground/80 hover:text-foreground rounded-md px-2 py-0.5 text-2xs font-medium transition-colors cursor-pointer"
                >
                  {t("common.datePicker.yesterday", "Hôm qua")}
                </button>
                <button
                  type="button"
                  onClick={() => handlePreset("today")}
                  className="hover:bg-muted text-foreground/80 hover:text-foreground rounded-md px-2 py-0.5 text-2xs font-medium transition-colors cursor-pointer"
                >
                  {t("common.datePicker.today", "Hôm nay")}
                </button>
                <button
                  type="button"
                  onClick={() => handlePreset("tomorrow")}
                  className="hover:bg-muted text-foreground/80 hover:text-foreground rounded-md px-2 py-0.5 text-2xs font-medium transition-colors cursor-pointer"
                >
                  {t("common.datePicker.tomorrow", "Ngày mai")}
                </button>
              </div>
            </div>
          )}

          {/* Month Navigation */}
          <div className="mb-2 flex items-center justify-between px-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="hover:bg-muted text-muted-foreground hover:text-foreground flex size-7 cursor-pointer items-center justify-center rounded-lg transition-colors"
              aria-label={t("common.datePicker.prevMonth", "Tháng trước")}
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="text-foreground text-xs font-bold">{monthLabel}</span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="hover:bg-muted text-muted-foreground hover:text-foreground flex size-7 cursor-pointer items-center justify-center rounded-lg transition-colors"
              aria-label={t("common.datePicker.nextMonth", "Tháng sau")}
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          {/* Weekday Row */}
          <div className="mb-1 grid grid-cols-7 text-center text-2xs font-semibold text-muted-foreground">
            {weekdays.map((w, i) => (
              <div key={i} className="flex h-6 items-center justify-center">
                {w}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-y-1">
            {days.map((day, idx) => {
              const isSelected = day.dateStr === value;
              const isToday = day.dateStr === todayStr;
              const isDisabled = Boolean(
                (min && day.dateStr < min) || (max && day.dateStr > max),
              );

              return (
                <div
                  key={`${idx}-${day.dateStr}`}
                  className="flex h-8 items-center justify-center p-0"
                >
                  <button
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleDaySelect(day.dateStr)}
                    className={cn(
                      "relative flex size-7 cursor-pointer items-center justify-center rounded-lg text-xs transition-colors",
                      isSelected && "bg-brand-orange text-white font-bold shadow-xs hover:bg-brand-orange/90",
                      !isSelected && isToday && "border border-brand-orange/50 text-brand-orange font-bold hover:bg-brand-orange/10",
                      !isSelected && !isToday && day.isCurrentMonth && "text-foreground font-medium hover:bg-muted",
                      !isSelected && !isToday && !day.isCurrentMonth && "text-muted-foreground/35 font-normal hover:bg-muted/50",
                      isDisabled && "opacity-25 pointer-events-none cursor-not-allowed",
                    )}
                  >
                    {day.dayNumber}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Clear Footer if needed */}
          {allowClear && hasValue && (
            <div className="border-border/70 mt-2 flex items-center justify-between border-t pt-2">
              <span className="text-muted-foreground text-2xs font-medium">
                {formatVnDisplay(value)}
              </span>
              <button
                type="button"
                onClick={handleClear}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded px-2 py-0.5 text-2xs font-medium transition-colors cursor-pointer"
              >
                {t("common.datePicker.clear", "Xóa")}
              </button>
            </div>
          )}
        </PopoverContent>
      </Popover>

      {error && (
        <p className="text-destructive text-xs font-medium leading-none">{error}</p>
      )}
    </div>
  );
}

// Re-export Admin aliases for backward compatibility
export { DateRangePicker as AdminDateRangePicker };
