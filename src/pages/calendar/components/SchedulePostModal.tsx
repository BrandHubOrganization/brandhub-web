import React, { useState, useEffect } from "react";
import type { CalendarPostEvent, PlatformType } from "@/types/calendar";
import {
  Calendar as CalendarIcon,
  Eye,
  X,
  AlertTriangle,
  Repeat,
  Clock,
  Check,
} from "lucide-react";
import { PlatformPreviewModal } from "@/pages/editor/components/PlatformPreviewModal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { PLATFORM_META } from "@/pages/social-accounts/lib/platformMeta";
import { formatRelativeScheduleTime } from "@/lib/dateUtils";

type RecurringPattern = "DAILY" | "WEEKLY" | "MONTHLY";

interface SchedulePostModalProps {
  isOpen: boolean;
  selectedDate: Date | null;
  existingEvents?: CalendarPostEvent[];
  onClose: () => void;
  onSubmit: (postData: {
    title: string;
    caption: string;
    start: string;
    platforms: PlatformType[];
    isRecurring: boolean;
    recurringPattern?: RecurringPattern;
    weekdays?: number[]; // 1: Monday, 7: Sunday
    repeatUntilDate?: string;
  }) => void;
}

const WEEKDAYS = [
  { value: 1, label: "T2", full: "Thứ Hai" },
  { value: 2, label: "T3", full: "Thứ Ba" },
  { value: 3, label: "T4", full: "Thứ Tư" },
  { value: 4, label: "T5", full: "Thứ Năm" },
  { value: 5, label: "T6", full: "Thứ Sáu" },
  { value: 6, label: "T7", full: "Thứ Bảy" },
  { value: 7, label: "CN", full: "Chủ Nhật" },
];

export const SchedulePostModal: React.FC<SchedulePostModalProps> = ({
  isOpen,
  selectedDate,
  existingEvents = [],
  onClose,
  onSubmit,
}) => {
  const { t, i18n } = useTranslation();
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformType[]>([
    "FACEBOOK",
  ]);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("09:00");

  // Recurrence
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringPattern, setRecurringPattern] =
    useState<RecurringPattern>("WEEKLY");
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([1, 3, 5]);
  const [repeatUntil, setRepeatUntil] = useState("");

  // Validation & Conflicts
  const [validationError, setValidationError] = useState<string | null>(null);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);
  const [allowConflictOverride, setAllowConflictOverride] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Initialize date/time when modal opens
  useEffect(() => {
    if (isOpen) {
      const target = selectedDate || new Date();
      // Ensure default time is at least 30 mins ahead if selecting today
      const now = new Date();
      const isToday =
        target.toISOString().split("T")[0] === now.toISOString().split("T")[0];

      setScheduleDate(target.toISOString().split("T")[0]);

      if (isToday) {
        const futureMinutes = new Date(now.getTime() + 30 * 60000);
        const hh = String(futureMinutes.getHours()).padStart(2, "0");
        const mm = String(futureMinutes.getMinutes()).padStart(2, "0");
        setScheduleTime(`${hh}:${mm}`);
      } else {
        setScheduleTime("09:00");
      }

      setValidationError(null);
      setConflictWarning(null);
      setAllowConflictOverride(false);
    }
  }, [isOpen, selectedDate]);

  if (!isOpen) return null;

  const togglePlatform = (platform: PlatformType) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform],
    );
  };

  const toggleWeekday = (day: number) => {
    setSelectedWeekdays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const checkValidationAndConflicts = (): boolean => {
    setValidationError(null);
    setConflictWarning(null);

    // 1. Target platform list empty -> MSG56
    if (selectedPlatforms.length === 0) {
      setValidationError("Vui lòng chọn ít nhất 1 kênh nền tảng đăng bài.");
      return false;
    }

    if (!title.trim()) {
      setValidationError("Vui lòng nhập tiêu đề bài đăng.");
      return false;
    }

    // 2. Schedule time >= 15 minutes in future -> MSG67 (BR-73)
    const combinedDate = new Date(`${scheduleDate}T${scheduleTime}:00`);
    const now = new Date();
    const diffMinutes = (combinedDate.getTime() - now.getTime()) / (1000 * 60);

    if (diffMinutes < 15) {
      setValidationError(
        "Thời gian lên lịch phải cách thời điểm hiện tại ít nhất 15 phút (MSG67).",
      );
      return false;
    }

    // 3. Weekly recurring requires at least 1 weekday -> MSG70
    if (
      isRecurring &&
      recurringPattern === "WEEKLY" &&
      selectedWeekdays.length === 0
    ) {
      setValidationError(
        "Vui lòng chọn ít nhất một thứ trong tuần cho lịch lặp lại (MSG70).",
      );
      return false;
    }

    // 4. Conflict detection within 30-minute window (BR-72)
    if (!allowConflictOverride) {
      const conflictWindowMs = 30 * 60 * 1000;
      const hasConflict = existingEvents.some((event) => {
        const eventTime = new Date(event.start).getTime();
        const targetTime = combinedDate.getTime();
        const isTimeOverlapping =
          Math.abs(eventTime - targetTime) <= conflictWindowMs;
        const isSamePlatform = selectedPlatforms.includes(
          event.extendedProps?.platform,
        );
        return isTimeOverlapping && isSamePlatform;
      });

      if (hasConflict) {
        setConflictWarning(
          "Cảnh báo trùng lịch (MSG68): Có bài đăng khác được lên lịch trong vòng 30 phút trên cùng kênh nền tảng.",
        );
        return false;
      }
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!checkValidationAndConflicts()) {
      return;
    }

    const scheduledDateTime = new Date(
      `${scheduleDate}T${scheduleTime}:00`,
    ).toISOString();

    onSubmit({
      title,
      caption,
      start: scheduledDateTime,
      platforms: selectedPlatforms,
      isRecurring,
      recurringPattern: isRecurring ? recurringPattern : undefined,
      weekdays:
        isRecurring && recurringPattern === "WEEKLY"
          ? selectedWeekdays
          : undefined,
      repeatUntilDate: isRecurring && repeatUntil ? repeatUntil : undefined,
    });

    // Reset & Close
    setTitle("");
    setCaption("");
    setIsRecurring(false);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
        <div className="animate-in fade-in zoom-in-95 border-border bg-card max-h-[92vh] w-full max-w-lg space-y-5 overflow-y-auto rounded-2xl border p-6 shadow-2xl duration-200">
          {/* Header */}
          <div className="border-border flex items-center justify-between border-b pb-3.5">
            <div className="flex items-center gap-2">
              <div className="bg-brand-orange-soft text-brand-orange flex size-8 items-center justify-center rounded-lg">
                <CalendarIcon className="size-4.5" />
              </div>
              <div>
                <h3 className="text-foreground text-base font-bold">
                  {t("calendar.schedule.title", "Lên lịch bài đăng")}
                </h3>
                <p className="text-muted-foreground text-2xs">
                  Thiết lập thời gian và quy tắc lặp lại tự động đa kênh
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:bg-muted hover:text-foreground flex size-8 items-center justify-center rounded-lg transition-colors"
            >
              <X className="size-4.5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="text-foreground mb-1 block text-xs font-semibold">
                {t("calendar.schedule.postTitleLabel", "Tiêu đề bài viết")} *
              </label>
              <Input
                type="text"
                required
                placeholder="Ví dụ: Chiến dịch Black Friday Sneaker 2026"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-xs"
              />
            </div>

            {/* Target Platforms Picker */}
            <div>
              <label className="text-foreground mb-1.5 block text-xs font-semibold">
                Kênh nền tảng xuất bản *
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {(["FACEBOOK", "INSTAGRAM", "TIKTOK", "THREADS"] as PlatformType[]).map(
                  (platform) => {
                    const isSelected = selectedPlatforms.includes(platform);
                    const meta = PLATFORM_META[platform];
                    return (
                      <button
                        key={platform}
                        type="button"
                        onClick={() => togglePlatform(platform)}
                        className={`border-border flex items-center gap-2 rounded-xl border p-2.5 text-xs font-medium transition-all ${
                          isSelected
                            ? "border-brand-orange/40 bg-brand-orange/10 text-brand-orange shadow-2xs font-semibold"
                            : "bg-card text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        <span className="flex size-4 items-center justify-center">
                          {meta?.icon}
                        </span>
                        <span className="truncate">{meta?.label || platform}</span>
                        {isSelected && (
                          <Check className="text-brand-orange ml-auto size-3" />
                        )}
                      </button>
                    );
                  },
                )}
              </div>
            </div>

            {/* Caption & Preview */}
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-foreground block text-xs font-semibold">
                  Nội dung tóm tắt
                </label>
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(true)}
                  className="text-brand-orange hover:bg-brand-orange-soft flex items-center gap-1 rounded-md px-1.5 py-0.5 text-2xs font-medium transition-colors"
                >
                  <Eye className="size-3" />
                  <span>Xem trước trên MXH</span>
                </button>
              </div>
              <Textarea
                rows={2}
                placeholder="Nhập nội dung hoặc ghi chú lên lịch..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="text-xs"
              />
            </div>

            {/* Date & Time Slot (BR-73) */}
            <div className="border-border bg-card/60 space-y-3 rounded-xl border p-3.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Clock className="text-brand-orange size-4" />
                  <span className="text-foreground text-xs font-semibold">
                    Thời gian xuất bản
                  </span>
                </div>
                <span className="text-muted-foreground bg-muted/60 rounded-md px-2 py-0.5 text-3xs font-mono">
                  Asia/Ho_Chi_Minh (UTC+7)
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-muted-foreground mb-1 block text-2xs font-medium">
                    Ngày đăng bài
                  </label>
                  <div className="relative">
                    <Input
                      type="date"
                      required
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      className="border-border bg-background focus:ring-brand-orange/20 focus:border-brand-orange text-xs font-medium"
                    />
                  </div>
                  {scheduleDate && scheduleTime && (
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span className="bg-brand-orange-soft text-brand-orange inline-flex items-center rounded-md px-1.5 py-0.5 text-3xs font-semibold">
                        {formatRelativeScheduleTime(`${scheduleDate}T${scheduleTime}:00`, {
                          showWeekday: true,
                          locale: i18n.language,
                        })}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-muted-foreground mb-1 block text-2xs font-medium">
                    Giờ đăng bài (HH:mm)
                  </label>
                  <div className="relative">
                    <Input
                      type="time"
                      required
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="border-border bg-background focus:ring-brand-orange/20 focus:border-brand-orange text-xs font-mono font-semibold"
                    />
                    <Clock className="text-muted-foreground pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 opacity-70" />
                  </div>
                  <p className="text-muted-foreground mt-1 text-3xs">
                    Tối thiểu cách hiện tại 15 phút (BR-73)
                  </p>
                </div>
              </div>

              {/* Quick Time Preset Pills */}
              <div className="border-border/60 flex flex-wrap items-center gap-1.5 border-t pt-2.5">
                <span className="text-muted-foreground text-3xs font-medium">Gợi ý nhanh:</span>
                {[
                  { label: "09:00 Sáng", time: "09:00" },
                  { label: "11:30 Trưa", time: "11:30" },
                  { label: "15:00 Chiều", time: "15:00" },
                  { label: "20:00 Tối (Hot)", time: "20:00" },
                  { label: "21:30 Đêm", time: "21:30" },
                ].map((preset) => (
                  <button
                    key={preset.time}
                    type="button"
                    onClick={() => setScheduleTime(preset.time)}
                    className={`rounded-lg border px-2 py-0.5 text-3xs font-medium transition-all ${
                      scheduleTime === preset.time
                        ? "border-brand-orange bg-brand-orange-soft text-brand-orange font-semibold"
                        : "border-border/60 bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Recurrence Rule Config (BR-39, BR-74) */}
            <div className="border-border bg-muted/20 space-y-3 rounded-xl border p-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Repeat className="text-brand-orange size-4" />
                  <span className="text-foreground text-xs font-semibold">
                    Lên lịch định kỳ (Recurring series)
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="text-brand-orange focus:ring-brand-orange size-4 rounded cursor-pointer"
                />
              </div>

              {isRecurring && (
                <div className="space-y-3 border-border border-t pt-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-muted-foreground mb-1 block text-2xs font-medium">
                        Tần suất lặp
                      </label>
                      <Select
                        value={recurringPattern}
                        onChange={(e) =>
                          setRecurringPattern(e.target.value as RecurringPattern)
                        }
                        className="text-xs"
                      >
                        <option value="DAILY">Hàng ngày (Daily)</option>
                        <option value="WEEKLY">Hàng tuần (Weekly)</option>
                        <option value="MONTHLY">Hàng tháng (Monthly)</option>
                      </Select>
                    </div>

                    <div>
                      <label className="text-muted-foreground mb-1 block text-2xs font-medium">
                        Lặp lại đến ngày
                      </label>
                      <Input
                        type="date"
                        value={repeatUntil}
                        onChange={(e) => setRepeatUntil(e.target.value)}
                        className="text-xs"
                      />
                    </div>
                  </div>

                  {/* Weekday Selector for Weekly Rule (MSG70) */}
                  {recurringPattern === "WEEKLY" && (
                    <div>
                      <label className="text-muted-foreground mb-1.5 block text-2xs font-medium">
                        Chọn các ngày trong tuần:
                      </label>
                      <div className="flex items-center gap-1.5">
                        {WEEKDAYS.map((day) => {
                          const isDaySelected = selectedWeekdays.includes(
                            day.value,
                          );
                          return (
                            <button
                              key={day.value}
                              type="button"
                              onClick={() => toggleWeekday(day.value)}
                              title={day.full}
                              className={`size-8 rounded-lg text-xs font-semibold transition-all ${
                                isDaySelected
                                  ? "bg-brand-orange text-white shadow-xs"
                                  : "border-border bg-card text-muted-foreground hover:bg-muted border"
                              }`}
                            >
                              {day.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Validation Alerts */}
            {validationError && (
              <div className="bg-destructive/10 border-destructive/30 text-destructive flex items-center gap-2 rounded-lg border p-2.5 text-xs">
                <AlertTriangle className="size-4 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Conflict Warning with Override Prompt (BR-72 / MSG68) */}
            {conflictWarning && (
              <div className="bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300 space-y-2 rounded-lg border p-3 text-xs">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="size-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                  <span className="leading-relaxed">{conflictWarning}</span>
                </div>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setAllowConflictOverride(true);
                      setConflictWarning(null);
                    }}
                    className="border-amber-500/40 text-amber-900 dark:text-amber-100 hover:bg-amber-500/20 text-2xs h-7"
                  >
                    Bỏ qua & Vẫn lên lịch (Override)
                  </Button>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="border-border flex items-center justify-end gap-2 border-t pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
              >
                {t("calendar.schedule.cancel", "Hủy")}
              </Button>
              <Button type="submit" variant="orange" size="sm">
                {t("calendar.schedule.submit", "Xác nhận lên lịch")}
              </Button>
            </div>
          </form>
        </div>
      </div>

      <PlatformPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        data={{
          title,
          caption: caption || title || "Bài đăng mẫu lên lịch",
          targetPlatforms: selectedPlatforms,
        }}
      />
    </>
  );
};
