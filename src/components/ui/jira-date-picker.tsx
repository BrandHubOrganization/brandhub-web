import React, {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  addDays,
  addMonths,
  addYears,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  isToday,
  isValid,
  parse,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
  subYears,
} from "date-fns";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Clock,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import {
  taskInstant,
  taskLocalMinute,
} from "@/pages/tasks/utils/taskWorkflowDates";

export interface JiraDatePickerPreset {
  label: string;
  date: string | Date;
  title?: string;
}

export interface JiraDatePickerProps {
  id?: string;
  name?: string;
  value?: string | null;
  onChange: (value: string | null) => void | Promise<unknown>;
  timezone?: string;
  includeTime?: boolean;
  placeholder?: string;
  title?: string;
  disabled?: boolean;
  readOnly?: boolean;
  minDate?: string | null;
  maxDate?: string | null;
  className?: string;
  inputClassName?: string;
  popoverAlign?: "start" | "center" | "end";
  popoverSide?: "top" | "bottom" | "left" | "right";
  allowClear?: boolean;
  showQuickPresets?: boolean;
  extraPresets?: JiraDatePickerPreset[];
  ariaLabel?: string;
  isError?: boolean;
  errorMessage?: string;
  autoFocus?: boolean;
  required?: boolean;
}

const WEEKDAY_NAMES_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAY_NAMES_VI = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

/**
 * Parse an ISO or local date string to local Date object taking timezone into account.
 */
function parseValueToLocalDate(value?: string | null, timezone?: string): Date | null {
  if (!value || !Number.isFinite(Date.parse(value))) return null;
  if (timezone) {
    try {
      const localMin = taskLocalMinute(value, timezone);
      if (localMin) {
        const [datePart, timePart] = localMin.split("T");
        const [year, month, day] = datePart.split("-").map(Number);
        const [hour, minute] = (timePart || "00:00").split(":").map(Number);
        const d = new Date(year, month - 1, day, hour, minute);
        if (isValid(d)) return d;
      }
    } catch {
      // fallback
    }
  }
  const fallback = new Date(value);
  return isValid(fallback) ? fallback : null;
}

/**
 * Format a Date object to an ISO string taking timezone into account.
 */
function localDateToIso(date: Date, timezone?: string): string {
  if (timezone) {
    try {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hour = String(date.getHours()).padStart(2, "0");
      const minute = String(date.getMinutes()).padStart(2, "0");
      const localMin = `${year}-${month}-${day}T${hour}:${minute}`;
      return taskInstant(localMin, timezone);
    } catch {
      return date.toISOString();
    }
  }
  return date.toISOString();
}

/**
 * Parse user-typed date string supporting multiple common formats:
 * dd/MM/yyyy, dd/MM/yyyy HH:mm, yyyy-MM-dd, yyyy-MM-dd HH:mm, etc.
 */
export function parseDateInput(
  input: string,
  includeTime = false,
  defaultTime = "18:00",
): Date | null | undefined {
  const str = input.trim();
  if (!str) return null; // empty -> clear

  const patterns = [
    "dd/MM/yyyy HH:mm",
    "d/M/yyyy HH:mm",
    "dd/MM/yyyy H:mm",
    "d/M/yyyy H:mm",
    "dd/MM/yyyy",
    "d/M/yyyy",
    "dd-MM-yyyy HH:mm",
    "d-M-yyyy HH:mm",
    "dd-MM-yyyy",
    "d-M-yyyy",
    "yyyy-MM-dd HH:mm",
    "yyyy-MM-dd'T'HH:mm",
    "yyyy-MM-dd",
    "yyyy/MM/dd HH:mm",
    "yyyy/MM/dd",
  ];

  for (const pattern of patterns) {
    const parsed = parse(str, pattern, new Date());
    if (
      isValid(parsed) &&
      parsed.getFullYear() >= 1970 &&
      parsed.getFullYear() <= 2100
    ) {
      if (!pattern.includes("HH") && !pattern.includes("H:mm")) {
        if (includeTime && defaultTime) {
          const [h, m] = defaultTime.split(":").map(Number);
          parsed.setHours(h || 18, m || 0, 0, 0);
        } else {
          parsed.setHours(18, 0, 0, 0);
        }
      }
      return parsed;
    }
  }

  const native = new Date(str);
  if (
    isValid(native) &&
    native.getFullYear() >= 1970 &&
    native.getFullYear() <= 2100
  ) {
    return native;
  }

  return undefined; // invalid format
}

export function JiraDatePicker({
  id,
  name,
  value,
  onChange,
  timezone,
  includeTime = false,
  placeholder,
  title,
  disabled = false,
  readOnly = false,
  minDate,
  maxDate,
  className,
  inputClassName,
  popoverAlign = "start",
  popoverSide = "bottom",
  allowClear = true,
  showQuickPresets = true,
  extraPresets,
  ariaLabel,
  isError = false,
  errorMessage,
  autoFocus = false,
  required = false,
}: JiraDatePickerProps) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const { t, i18n } = useTranslation();
  const isVi = Boolean(i18n?.language?.startsWith("vi"));

  const initialDate = useMemo(
    () => parseValueToLocalDate(value, timezone),
    [value, timezone],
  );

  const [currentMonth, setCurrentMonth] = useState<Date>(
    initialDate || new Date(),
  );
  const [selectedTime, setSelectedTime] = useState<string>(() => {
    if (initialDate) {
      return format(initialDate, "HH:mm");
    }
    return "18:00";
  });

  const formatDisplay = (d: Date | null): string => {
    if (!d || !isValid(d)) return "";
    return includeTime ? format(d, "dd/MM/yyyy HH:mm") : format(d, "dd/MM/yyyy");
  };

  const [inputValue, setInputValue] = useState<string>(() =>
    formatDisplay(initialDate),
  );
  const [isOpen, setIsOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const popoverContentRef = useRef<HTMLDivElement>(null);
  const justFocusedRef = useRef(false);
  const focusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync state if external value changes
  useEffect(() => {
    const parsed = parseValueToLocalDate(value, timezone);
    if (parsed) {
      setInputValue(formatDisplay(parsed));
      setCurrentMonth(parsed);
      setSelectedTime(format(parsed, "HH:mm"));
    } else {
      setInputValue("");
    }
  }, [value, timezone, includeTime]);

  const parsedMin = useMemo(
    () => (minDate ? parseValueToLocalDate(minDate, timezone) : null),
    [minDate, timezone],
  );
  const parsedMax = useMemo(
    () => (maxDate ? parseValueToLocalDate(maxDate, timezone) : null),
    [maxDate, timezone],
  );

  const tooltipTitle =
    title ||
    (initialDate
      ? `Hạn hoàn thành: ${initialDate.toLocaleString()}`
      : "Chọn hạn hoàn thành");

  // Focus and click detection for Jira-like behavior:
  // First click focuses the input to allow typing without popover obstruction.
  // Second click while already focused OR clicking the calendar icon opens the popover.
  const handleInputFocus = () => {
    justFocusedRef.current = true;
    if (focusTimeoutRef.current) clearTimeout(focusTimeoutRef.current);
    focusTimeoutRef.current = setTimeout(() => {
      justFocusedRef.current = false;
    }, 250);
  };

  const handleInputClick = () => {
    if (disabled || readOnly) return;
    if (justFocusedRef.current) {
      // First click: focused only, do NOT open popover
      justFocusedRef.current = false;
    } else {
      // Clicked again while already focused: toggle popover
      setIsOpen((prev) => !prev);
    }
  };

  const handleIconClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled || readOnly) return;
    setIsOpen((prev) => !prev);
    inputRef.current?.focus();
  };

  const validateBounds = (d: Date): boolean => {
    if (parsedMin && isBefore(d, startOfDay(parsedMin))) {
      toast.error(
        t("tasks.dateTooEarly", `Ngày không được sớm hơn ${format(parsedMin, "dd/MM/yyyy")}`),
      );
      return false;
    }
    if (parsedMax && isAfter(d, parsedMax)) {
      toast.error(
        t("tasks.dateTooLate", `Ngày không được muộn hơn ${format(parsedMax, "dd/MM/yyyy")}`),
      );
      return false;
    }
    return true;
  };

  const commitText = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) {
      if (allowClear) {
        setInputValue("");
        void onChange(null);
      } else {
        // Rollback
        setInputValue(formatDisplay(initialDate));
      }
      return;
    }

    const parsed = parseDateInput(trimmed, includeTime, selectedTime);
    if (parsed === undefined) {
      // Invalid format
      toast.error(
        t("tasks.invalidDateFormat", "Định dạng ngày không hợp lệ. Vui lòng nhập dạng dd/MM/yyyy"),
      );
      setInputValue(formatDisplay(initialDate));
      return;
    }

    if (parsed === null) {
      setInputValue("");
      void onChange(null);
      return;
    }

    if (!validateBounds(parsed)) {
      setInputValue(formatDisplay(initialDate));
      return;
    }

    // Valid date
    setCurrentMonth(parsed);
    setSelectedTime(format(parsed, "HH:mm"));
    setInputValue(formatDisplay(parsed));
    const isoString = localDateToIso(parsed, timezone);
    void onChange(isoString);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commitText(inputValue);
      setIsOpen(false);
      inputRef.current?.blur();
    } else if (e.key === "Escape") {
      e.preventDefault();
      if (isOpen) {
        setIsOpen(false);
      } else {
        setInputValue(formatDisplay(initialDate));
      }
    } else if (e.key === "ArrowDown" && (e.altKey || !isOpen)) {
      e.preventDefault();
      setIsOpen(true);
    }
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const related = e.relatedTarget as Node | null;
    if (
      containerRef.current?.contains(related) ||
      popoverContentRef.current?.contains(related)
    ) {
      return;
    }
    commitText(inputValue);
  };

  // Calendar Day Click
  const handleSelectDay = (day: Date) => {
    const target = new Date(day);
    if (includeTime) {
      const [h, m] = selectedTime.split(":").map(Number);
      target.setHours(h || 18, m || 0, 0, 0);
    } else {
      target.setHours(18, 0, 0, 0);
    }

    if (!validateBounds(target)) return;

    setInputValue(formatDisplay(target));
    setCurrentMonth(target);
    const isoString = localDateToIso(target, timezone);
    void onChange(isoString);
    setIsOpen(false);
  };

  const handleQuickPreset = (type: "today" | "tomorrow" | "nextWeek" | "clear") => {
    if (type === "clear") {
      setInputValue("");
      void onChange(null);
      setIsOpen(false);
      return;
    }

    let target = new Date();
    if (type === "tomorrow") {
      target = addDays(target, 1);
    } else if (type === "nextWeek") {
      target = addDays(target, 7);
    }

    if (includeTime) {
      const [h, m] = selectedTime.split(":").map(Number);
      target.setHours(h || 18, m || 0, 0, 0);
    } else {
      target.setHours(18, 0, 0, 0);
    }

    if (!validateBounds(target)) return;

    setInputValue(formatDisplay(target));
    setCurrentMonth(target);
    const isoString = localDateToIso(target, timezone);
    void onChange(isoString);
    setIsOpen(false);
  };

  const handleCustomPreset = (preset: JiraDatePickerPreset) => {
    const d = typeof preset.date === "string" ? new Date(preset.date) : preset.date;
    if (!isValid(d)) return;
    if (!validateBounds(d)) return;

    setInputValue(formatDisplay(d));
    setCurrentMonth(d);
    const isoString = localDateToIso(d, timezone);
    void onChange(isoString);
    setIsOpen(false);
  };

  // Calendar Grid Calculation (exact 42 cells, Sunday start, matching Jira)
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    while (days.length < 42) {
      days.push(addDays(days[days.length - 1], 1));
    }
    return days;
  }, [currentMonth]);

  const monthYearLabel = useMemo(() => {
    try {
      if (isVi) {
        return `Tháng ${format(currentMonth, "M, yyyy")}`;
      }
      return format(currentMonth, "MMMM yyyy");
    } catch {
      return format(currentMonth, "MM/yyyy");
    }
  }, [currentMonth, isVi]);

  const weekdayHeaders = isVi ? WEEKDAY_NAMES_VI : WEEKDAY_NAMES_EN;

  return (
    <div
      ref={containerRef}
      className={cn("relative inline-flex flex-col w-full", className)}
    >
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverAnchor asChild>
          <div
            title={tooltipTitle}
            className={cn(
              "group relative flex items-center h-9 w-full rounded-md border bg-background px-2.5 transition-all text-xs sm:text-sm",
              "border-border/80 hover:border-muted-foreground/40",
              "focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20",
              isError && "border-destructive focus-within:border-destructive focus-within:ring-destructive/20",
              (disabled || readOnly) && "opacity-75 bg-muted/30 cursor-not-allowed",
              inputClassName,
            )}
          >
            {/* Input */}
            <input
              ref={inputRef}
              id={inputId}
              name={name}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={handleInputFocus}
              onClick={handleInputClick}
              onKeyDown={handleInputKeyDown}
              onBlur={handleInputBlur}
              placeholder={
                placeholder ||
                (includeTime ? "dd/MM/yyyy HH:mm" : "dd/MM/yyyy")
              }
              disabled={disabled}
              readOnly={readOnly}
              autoFocus={autoFocus}
              required={required}
              aria-label={ariaLabel || "Chọn ngày"}
              aria-invalid={isError}
              className="flex-1 bg-transparent border-0 outline-none focus:outline-none focus:ring-0 text-foreground placeholder:text-muted-foreground/60 h-full p-0 min-w-0"
            />

            {/* Clear Button (if text exists and allowClear) */}
            {allowClear && inputValue && !disabled && !readOnly && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setInputValue("");
                  void onChange(null);
                  inputRef.current?.focus();
                }}
                className="p-1 rounded text-muted-foreground/60 hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer shrink-0"
                title="Xóa ngày"
                aria-label="Xóa ngày"
              >
                <X className="size-3.5" />
              </button>
            )}

            {/* Calendar Icon Button */}
            <button
              type="button"
              tabIndex={-1}
              onClick={handleIconClick}
              disabled={disabled || readOnly}
              className={cn(
                "p-1 rounded transition-colors cursor-pointer shrink-0 flex items-center justify-center",
                isOpen
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                (disabled || readOnly) && "pointer-events-none opacity-50",
              )}
              title={tooltipTitle}
              aria-label="Mở bảng chọn ngày"
            >
              <CalendarIcon className="size-4 shrink-0" />
            </button>
          </div>
        </PopoverAnchor>

        {/* Jira Calendar Popover Content */}
        <PopoverContent
          ref={popoverContentRef}
          align={popoverAlign}
          side={popoverSide}
          sideOffset={6}
          onOpenAutoFocus={(e) => {
            // Keep focus on the text input so user can type continuously
            e.preventDefault();
          }}
          className="w-[288px] p-3 space-y-2.5 bg-popover text-popover-foreground border-border/80 shadow-xl rounded-lg select-none z-[80]"
        >
          {/* Header: <<  <   November 2026   >  >> */}
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => setCurrentMonth((prev) => subYears(prev, 1))}
                className="size-7 p-0 inline-flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                title="Năm trước"
                aria-label="Năm trước"
              >
                <ChevronsLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentMonth((prev) => subMonths(prev, 1))}
                className="size-7 p-0 inline-flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                title="Tháng trước"
                aria-label="Tháng trước"
              >
                <ChevronLeft className="size-4" />
              </button>
            </div>

            <span className="text-xs sm:text-sm font-semibold text-foreground tracking-tight text-center truncate px-1">
              {monthYearLabel}
            </span>

            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => setCurrentMonth((prev) => addMonths(prev, 1))}
                className="size-7 p-0 inline-flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                title="Tháng sau"
                aria-label="Tháng sau"
              >
                <ChevronRight className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentMonth((prev) => addYears(prev, 1))}
                className="size-7 p-0 inline-flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                title="Năm sau"
                aria-label="Năm sau"
              >
                <ChevronsRight className="size-4" />
              </button>
            </div>
          </div>

          {/* Weekday Row: Sun Mon Tue Wed Thu Fri Sat */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-muted-foreground/75 py-1">
            {weekdayHeaders.map((day, idx) => (
              <div key={idx} className="h-5 flex items-center justify-center">
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid: 42 cells (6 rows x 7 cols) */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {calendarDays.map((day, idx) => {
              const isCurrMonth = isSameMonth(day, currentMonth);
              const isSelected = initialDate ? isSameDay(day, initialDate) : false;
              const isTodayDay = isToday(day);

              const isBeforeMin = parsedMin && isBefore(day, startOfDay(parsedMin));
              const isAfterMax = parsedMax && isAfter(day, parsedMax);
              const isDisabledDay = Boolean(isBeforeMin || isAfterMax);

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isDisabledDay}
                  onClick={() => handleSelectDay(day)}
                  className={cn(
                    "relative size-8 mx-auto rounded-[3px] flex items-center justify-center font-normal transition-colors cursor-pointer",
                    !isCurrMonth && "text-muted-foreground/45 hover:bg-muted/40",
                    isCurrMonth && !isSelected && "text-foreground hover:bg-muted/70",
                    isTodayDay && !isSelected && "font-bold text-primary",
                    isSelected && [
                      "text-blue-600 dark:text-blue-400 font-bold bg-blue-50/90 dark:bg-blue-950/50 shadow-2xs",
                      "after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-4 after:h-0.5 after:bg-blue-600 dark:after:bg-blue-400 after:rounded-full",
                    ],
                    isDisabledDay && "opacity-25 cursor-not-allowed pointer-events-none",
                  )}
                  title={format(day, "dd/MM/yyyy")}
                >
                  <span>{format(day, "d")}</span>
                </button>
              );
            })}
          </div>

          {/* Time Picker Bar (if includeTime is true) */}
          {includeTime && (
            <div className="flex items-center justify-between border-t border-border/40 pt-2 px-1 text-xs">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="size-3.5 text-brand-orange" />
                <span className="text-2xs font-medium">Giờ:</span>
              </div>
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => {
                  setSelectedTime(e.target.value);
                  if (initialDate) {
                    const [h, m] = e.target.value.split(":").map(Number);
                    const updated = new Date(initialDate);
                    updated.setHours(h || 0, m || 0, 0, 0);
                    if (validateBounds(updated)) {
                      setInputValue(formatDisplay(updated));
                      const iso = localDateToIso(updated, timezone);
                      void onChange(iso);
                    }
                  }
                }}
                className="h-6 w-24 px-1.5 text-xs font-mono rounded border border-border/70 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          )}

          {/* Quick Presets / Footer Actions */}
          {showQuickPresets && (
            <div className="space-y-1.5 border-t border-border/40 pt-2 px-0.5 text-3xs font-medium">
              <div className="flex flex-wrap items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleQuickPreset("today")}
                  className="px-2 py-1 rounded bg-muted/60 hover:bg-muted text-foreground/80 hover:text-foreground cursor-pointer transition-colors"
                >
                  Hôm nay
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPreset("tomorrow")}
                  className="px-2 py-1 rounded bg-muted/60 hover:bg-muted text-foreground/80 hover:text-foreground cursor-pointer transition-colors"
                >
                  Ngày mai
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPreset("nextWeek")}
                  className="px-2 py-1 rounded bg-muted/60 hover:bg-muted text-foreground/80 hover:text-foreground cursor-pointer transition-colors"
                >
                  1 tuần nữa
                </button>
                {extraPresets?.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleCustomPreset(p)}
                    className="px-2 py-1 rounded bg-muted/60 hover:bg-muted text-foreground/80 hover:text-foreground cursor-pointer transition-colors truncate max-w-[120px]"
                    title={p.title || p.label}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {allowClear && initialDate && (
                <div className="flex justify-end pt-0.5">
                  <button
                    type="button"
                    onClick={() => handleQuickPreset("clear")}
                    className="px-2 py-0.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer transition-colors"
                  >
                    Xóa hạn
                  </button>
                </div>
              )}
            </div>
          )}
        </PopoverContent>
      </Popover>

      {/* Error message */}
      {errorMessage && (
        <p className="text-destructive text-2xs mt-1">{errorMessage}</p>
      )}
    </div>
  );
}
