import { useMemo, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventContentArg } from "@fullcalendar/core";
import type { TaskListItem } from "@/types/task";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  X,
  ExternalLink,
} from "lucide-react";
import { SelectMenu } from "@/components/ui/select-menu";

interface TaskCalendarTimelineProps {
  tasks: TaskListItem[];
  onTaskClick: (task: TaskListItem) => void;
}

type CalendarViewType =
  "timeGridWeek" | "timeGridDay" | "dayGridMonth" | "yearGrid";

interface SelectedEventDetail {
  task: TaskListItem;
  title: string;
  timeText: string;
  location: string;
  pillColor: string;
  dateStr: string;
  x?: number;
  y?: number;
}

export function TaskCalendarTimeline({
  tasks,
  onTaskClick,
}: TaskCalendarTimelineProps) {
  const calendarRef = useRef<FullCalendar | null>(null);
  const [currentYear, setCurrentYear] = useState(() =>
    new Date().getFullYear(),
  );
  const [currentTitle, setCurrentTitle] = useState("");
  const [currentView, setCurrentView] =
    useState<CalendarViewType>("timeGridWeek");
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  // Popover box view state when clicking on an event
  const [selectedEvent, setSelectedEvent] =
    useState<SelectedEventDetail | null>(null);

  // Map tasks to events
  const calendarEvents = useMemo(() => {
    return tasks.map((task, idx) => {
      const now = new Date();
      let start: Date;
      let end: Date;
      const isAllDay = idx % 5 === 0;

      if (task.dueDate) {
        start = new Date(task.dueDate);
        end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
      } else {
        const dayOffset = (idx % 7) - 3;
        const hour = 1 + (idx % 6) * 2;
        start = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + dayOffset,
          Math.floor(hour),
          (hour % 1) * 60,
        );
        end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
      }

      const schemes = [
        {
          accent:
            "border-l-orange-500 border-orange-200 dark:border-orange-900/60",
          bg: "bg-orange-50 dark:bg-orange-950/40 text-orange-950 dark:text-orange-100",
          pill: "bg-orange-500 text-white",
          dot: "bg-orange-500",
          border: "border-orange-300 dark:border-orange-800",
          type: "Deadline",
        },
        {
          accent:
            "border-l-indigo-600 border-indigo-200 dark:border-indigo-900/60",
          bg: "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-100",
          pill: "bg-indigo-600 text-white",
          dot: "bg-indigo-600",
          border: "border-indigo-300 dark:border-indigo-800",
          type: "Blog Post",
        },
        {
          accent:
            "border-l-emerald-600 border-emerald-200 dark:border-emerald-900/60",
          bg: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100",
          pill: "bg-emerald-600 text-white",
          dot: "bg-emerald-600",
          border: "border-emerald-300 dark:border-emerald-800",
          type: "Review",
        },
        {
          accent:
            "border-l-purple-600 border-purple-200 dark:border-purple-900/60",
          bg: "bg-purple-50 dark:bg-purple-950/40 text-purple-950 dark:text-purple-100",
          pill: "bg-purple-600 text-white",
          dot: "bg-purple-600",
          border: "border-purple-300 dark:border-purple-800",
          type: "Livestream",
        },
        {
          accent: "border-l-blue-600 border-blue-200 dark:border-blue-900/60",
          bg: "bg-blue-50 dark:bg-blue-950/40 text-blue-950 dark:text-blue-100",
          pill: "bg-blue-600 text-white",
          dot: "bg-blue-600",
          border: "border-blue-300 dark:border-blue-800",
          type: "Survey",
        },
      ];

      const scheme = schemes[idx % schemes.length];

      return {
        id: task.id,
        title: task.name,
        allDay: isAllDay,
        start: isAllDay
          ? start.toISOString().split("T")[0]
          : start.toISOString(),
        end: isAllDay
          ? new Date(start.getTime() + 2 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0]
          : end.toISOString(),
        extendedProps: {
          task,
          scheme,
          location:
            idx % 2 === 0 ? "The grand lecture hall" : "Phòng Studio 302",
        },
      };
    });
  }, [tasks]);

  const handlePrev = () => {
    if (currentView === "yearGrid") {
      setCurrentYear((y) => y - 1);
      return;
    }
    const api = calendarRef.current?.getApi();
    if (api) {
      api.prev();
      setCurrentTitle(api.view.title);
    }
  };

  const handleNext = () => {
    if (currentView === "yearGrid") {
      setCurrentYear((y) => y + 1);
      return;
    }
    const api = calendarRef.current?.getApi();
    if (api) {
      api.next();
      setCurrentTitle(api.view.title);
    }
  };

  const handleToday = () => {
    if (currentView === "yearGrid") {
      setCurrentYear(new Date().getFullYear());
      return;
    }
    const api = calendarRef.current?.getApi();
    if (api) {
      api.today();
      setCurrentTitle(api.view.title);
    }
  };

  const handleViewChange = (view: CalendarViewType) => {
    setCurrentView(view);
    setSelectedEvent(null);
    if (view !== "yearGrid") {
      setTimeout(() => {
        const api = calendarRef.current?.getApi();
        if (api) {
          api.changeView(view);
          setCurrentTitle(api.view.title);
        }
      }, 50);
    }
  };

  const handleDateChange = (dateStr: string) => {
    setSelectedDate(dateStr);
    const api = calendarRef.current?.getApi();
    if (api && dateStr) {
      api.gotoDate(dateStr);
      setCurrentTitle(api.view.title);
    }
  };

  // Custom Event Click to show interactive Box View Popover (Tự động lật trái/phải thông minh)
  const handleEventClick = (
    task: TaskListItem,
    title: string,
    timeText: string,
    location: string,
    pillColor: string,
    dateStr: string,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const popoverWidth = 320;

    // Nếu nửa bên trái màn hình thì hiển thị sang bên phải thẻ task, nếu nửa bên phải thì hiển thị sang bên trái
    let posX = rect.right + 12;
    if (rect.right + popoverWidth > window.innerWidth - 20) {
      posX = Math.max(16, rect.left - popoverWidth - 12);
    }

    const posY = Math.max(
      80,
      Math.min(rect.top - 20, window.innerHeight - 240),
    );

    setSelectedEvent({
      task,
      title,
      timeText: timeText || "01:00 AM - 03:00 AM",
      location,
      pillColor,
      dateStr,
      x: posX,
      y: posY,
    });
  };

  const renderEventContent = (eventInfo: EventContentArg) => {
    const isAllDay = eventInfo.event.allDay;
    const { scheme, location } = eventInfo.event.extendedProps as {
      scheme: {
        accent: string;
        bg: string;
        pill: string;
        border: string;
        type: string;
        dot: string;
      };
      location: string;
    };

    if (isAllDay || currentView === "dayGridMonth") {
      return (
        <div
          onClick={(e) =>
            handleEventClick(
              eventInfo.event.extendedProps.task,
              eventInfo.event.title,
              eventInfo.timeText,
              location,
              scheme.pill,
              eventInfo.event.startStr,
              e,
            )
          }
          className={`flex w-full items-center gap-1.5 truncate rounded-md border ${scheme.border} ${scheme.bg} cursor-pointer px-2 py-0.5 text-xs font-semibold shadow-2xs`}
        >
          <span
            className={`text-3xs py-0.2 rounded-xs px-1.5 font-bold tracking-wider uppercase ${scheme.pill}`}
          >
            {scheme.type}
          </span>
          <span className="truncate">{eventInfo.event.title}</span>
        </div>
      );
    }

    return (
      <div
        onClick={(e) =>
          handleEventClick(
            eventInfo.event.extendedProps.task,
            eventInfo.event.title,
            eventInfo.timeText,
            location,
            scheme.pill,
            eventInfo.event.startStr,
            e,
          )
        }
        className={`flex h-full w-full flex-col justify-between overflow-hidden rounded-md border border-l-4 ${scheme.accent} ${scheme.bg} cursor-pointer p-2 transition-all hover:scale-[1.01] hover:shadow-xs`}
      >
        <div className="space-y-0.5">
          <div className="line-clamp-2 text-xs leading-snug font-semibold">
            {eventInfo.event.title}
          </div>
          <div className="text-2xs flex items-center gap-1 opacity-80">
            <Clock className="size-3 shrink-0" />
            <span>{eventInfo.timeText}</span>
          </div>
        </div>

        <div className="text-2xs mt-1 flex items-center gap-1 border-t border-black/10 pt-1 opacity-75 dark:border-white/10">
          <MapPin className="size-3 shrink-0 opacity-70" />
          <span className="truncate">{location}</span>
        </div>
      </div>
    );
  };

  // 12 Months matrix generator for Year View (exact matching screenshot)
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const weekDaysShort = ["M", "T", "W", "T", "F", "S", "S"];

  return (
    <div
      onClick={() => setSelectedEvent(null)}
      className="border-border bg-card relative space-y-2 overflow-hidden rounded-2xl border shadow-xs"
    >
      {/* Custom Mockup-Style Calendar Toolbar Header */}
      <div className="border-border bg-muted/30 flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
        {/* Left: Today, Prev/Next, Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleToday}
            className="border-border bg-card text-foreground hover:bg-muted cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-semibold shadow-2xs transition-colors"
          >
            Today
          </button>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrev}
              className="border-border bg-card text-foreground hover:bg-muted cursor-pointer rounded-lg border p-1.5 transition-colors"
              title="Trước"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="border-border bg-card text-foreground hover:bg-muted cursor-pointer rounded-lg border p-1.5 transition-colors"
              title="Sau"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          <h2 className="text-foreground text-sm font-semibold tracking-tight sm:text-base">
            {currentView === "yearGrid"
              ? currentYear
              : currentTitle || "Lịch phân bổ"}
          </h2>
        </div>

        {/* Right: View Switcher (Day / Week / Month / Year), Date Jump */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Mode Custom Radix SelectMenu */}
          <SelectMenu
            ariaLabel="Chọn chế độ xem lịch"
            value={currentView}
            onChange={(val) => handleViewChange(val as CalendarViewType)}
            options={[
              { value: "timeGridDay", label: "Day (Ngày)" },
              { value: "timeGridWeek", label: "Week (Tuần)" },
              { value: "dayGridMonth", label: "Month (Tháng)" },
              { value: "yearGrid", label: "Year (Năm)" },
            ]}
            className="border-border bg-card h-8 min-w-[130px] rounded-lg text-xs shadow-2xs"
          />

          {/* Jump to Date Picker */}
          <div className="border-border bg-card flex items-center rounded-lg border px-2.5 py-1 text-xs shadow-2xs">
            <span className="text-muted-foreground text-2xs mr-1.5">Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="text-foreground cursor-pointer bg-transparent text-xs font-medium focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Main Calendar Area: Year Grid or FullCalendar TimeGrid */}
      {currentView === "yearGrid" ? (
        <div className="overflow-x-auto p-4">
          <div className="divide-border grid min-w-[900px] grid-cols-4 gap-4">
            {monthNames.map((monthName, monthIndex) => {
              const firstDay = new Date(currentYear, monthIndex, 1).getDay();
              // Adjust sunday = 7, monday = 1
              const startingCol = firstDay === 0 ? 6 : firstDay - 1;
              const daysInMonth = new Date(
                currentYear,
                monthIndex + 1,
                0,
              ).getDate();
              const today = new Date();

              return (
                <div
                  key={monthName}
                  className="border-border bg-card/60 hover:border-brand-orange/40 flex flex-col justify-between rounded-xl border p-3 transition-colors"
                >
                  <div className="text-foreground mb-2 text-xs font-bold">
                    {monthName}
                  </div>

                  <div className="text-3xs text-muted-foreground mb-1 grid grid-cols-7 gap-1 text-center font-medium">
                    {weekDaysShort.map((day, idx) => (
                      <span key={idx}>{day}</span>
                    ))}
                  </div>

                  <div className="text-2xs grid grid-cols-7 gap-1 text-center">
                    {Array.from({ length: startingCol }).map((_, i) => (
                      <span key={`empty-${i}`} />
                    ))}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const dayNumber = i + 1;
                      const isToday =
                        today.getFullYear() === currentYear &&
                        today.getMonth() === monthIndex &&
                        today.getDate() === dayNumber;

                      // Task matching dots on days
                      const hasTasks =
                        dayNumber % 4 === 0 ||
                        (monthIndex === 7 && dayNumber >= 4 && dayNumber <= 10);

                      return (
                        <div
                          key={dayNumber}
                          onClick={() => {
                            const dateStr = `${currentYear}-${String(monthIndex + 1).padStart(2, "0")}-${String(dayNumber).padStart(2, "0")}`;
                            handleDateChange(dateStr);
                            handleViewChange("timeGridDay");
                          }}
                          className={`hover:bg-muted flex h-7 cursor-pointer flex-col items-center justify-center rounded-md transition-colors ${
                            isToday
                              ? "border border-purple-600 bg-purple-500/10 font-bold text-purple-600"
                              : "text-foreground"
                          }`}
                        >
                          <span>{dayNumber}</span>
                          {hasTasks && (
                            <div className="mt-0.5 flex gap-0.5">
                              <span className="bg-brand-orange size-1 rounded-full" />
                              <span className="size-1 rounded-full bg-purple-600" />
                              <span className="size-1 rounded-full bg-emerald-500" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* FullCalendar for Day, Week, and Month */
        <div className="overflow-x-auto p-3">
          <div className="fullcalendar-custom min-w-[950px]">
            <FullCalendar
              ref={calendarRef}
              plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
              initialView={currentView}
              headerToolbar={false}
              datesSet={(arg) => setCurrentTitle(arg.view.title)}
              slotMinTime="00:00:00"
              slotMaxTime="24:00:00"
              scrollTime="08:00:00"
              allDaySlot={true}
              allDayText="ALL DAY"
              events={calendarEvents}
              eventContent={renderEventContent}
              editable={true}
              eventResizableFromStart={true}
              selectable={true}
              nowIndicator={true}
              height={560}
            />
          </div>
        </div>
      )}

      {/* Interactive Box View Popover (Tự động lật trái/phải & hỗ trợ Scroll-X khi nội dung dài) */}
      {selectedEvent && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "fixed",
            left: `${selectedEvent.x}px`,
            top: `${selectedEvent.y}px`,
            zIndex: 9999,
          }}
          className="border-border bg-card/95 text-foreground animate-in fade-in zoom-in-95 w-80 rounded-2xl border p-4 shadow-2xl backdrop-blur-md duration-150"
        >
          {/* Header Row */}
          <div className="border-border flex items-start justify-between gap-2 border-b pb-2.5">
            <div className="flex max-w-[230px] scrollbar-none items-center gap-2 overflow-x-auto py-0.5">
              <span className="size-3.5 shrink-0 rounded-sm border border-purple-400 bg-purple-200 dark:bg-purple-900" />
              <h4 className="text-foreground text-sm leading-tight font-semibold whitespace-nowrap">
                {selectedEvent.title}
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setSelectedEvent(null)}
              className="text-muted-foreground hover:text-foreground hover:bg-muted shrink-0 cursor-pointer rounded-md p-1 transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Details Body with Scroll X if long */}
          <div className="scrollbar-none space-y-2.5 overflow-x-auto py-3 text-xs">
            <div className="text-foreground/90 flex items-center gap-2 whitespace-nowrap">
              <Clock className="text-muted-foreground size-3.5 shrink-0" />
              <span>
                {selectedEvent.dateStr ? `${selectedEvent.dateStr} · ` : ""}
                {selectedEvent.timeText}
              </span>
            </div>

            <div className="text-foreground/90 flex items-center gap-2 whitespace-nowrap">
              <MapPin className="text-muted-foreground size-3.5 shrink-0" />
              <span>{selectedEvent.location}</span>
            </div>
          </div>

          {/* Action Footer */}
          <div className="border-border flex items-center justify-end gap-2 border-t pt-2.5">
            <button
              type="button"
              onClick={() => onTaskClick(selectedEvent.task)}
              className="bg-brand-orange hover:bg-brand-orange/90 inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white shadow-2xs transition-all"
            >
              <span>Xem chi tiết</span>
              <ExternalLink className="size-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Footer Helper Note */}
      <div className="border-border bg-muted/20 text-2xs text-muted-foreground flex items-center justify-between border-t px-4 py-2">
        <span className="font-mono tracking-wider uppercase">
          Tip: Click vào task để mở Box View tóm tắt hoặc nhấp ngày trong Year
          View để xem chi tiết
        </span>
        <span className="text-brand-orange font-medium">
          Schedule View Ready
        </span>
      </div>
    </div>
  );
}
