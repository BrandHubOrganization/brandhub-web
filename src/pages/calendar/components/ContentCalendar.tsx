import React, { useEffect, useMemo, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventDropArg, EventContentArg } from "@fullcalendar/core";
import type { CalendarPostEvent, PlatformType, PostStatus } from "@/types/calendar";
import {
  Video,
  AtSign,
  Share2,
  Globe,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  X,
  Eye,
  ListTodo,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { SelectMenu } from "@/components/ui/select-menu";
import { useNavigate, useParams } from "react-router-dom";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { formatRelativeScheduleTime } from "@/lib/dateUtils";

interface ContentCalendarProps {
  events: CalendarPostEvent[];
  onReschedule: (eventId: string, newDate: Date) => Promise<boolean>;
  onDateClick: (date: Date) => void;
  onDatesChange: (startDate: Date, endDate: Date) => void;
  onEventEdit?: (event: CalendarPostEvent) => void;
}

type CalendarViewType =
  | "timeGridDay"
  | "timeGridWeek"
  | "dayGridMonth"
  | "yearGrid";

const PLATFORM_CONFIG: Record<
  PlatformType,
  { name: string; icon: React.ReactNode; color: string }
> = {
  FACEBOOK: {
    name: "Facebook",
    icon: <Share2 className="size-3.5 shrink-0 text-blue-500" />,
    color: "bg-blue-500 text-white",
  },
  INSTAGRAM: {
    name: "Instagram",
    icon: <Globe className="size-3.5 shrink-0 text-pink-500" />,
    color: "bg-pink-500 text-white",
  },
  TIKTOK: {
    name: "TikTok",
    icon: <Video className="size-3.5 shrink-0 text-slate-800 dark:text-slate-200" />,
    color: "bg-slate-900 text-white dark:bg-slate-200 dark:text-slate-900",
  },
  THREADS: {
    name: "Threads",
    icon: <AtSign className="size-3.5 shrink-0 text-purple-500" />,
    color: "bg-purple-600 text-white",
  },
};

const STATUS_CONFIG: Record<
  PostStatus,
  {
    bg: string;
    border: string;
    text: string;
    pill: string;
    accent: string;
    label: string;
  }
> = {
  DRAFT: {
    bg: "bg-amber-500/10 dark:bg-amber-500/15",
    border: "border-amber-500/30 dark:border-amber-700/50 hover:border-amber-500/60",
    text: "text-foreground",
    pill: "bg-amber-500 text-white",
    accent: "border-l-amber-500 border-border",
    label: "Bản nháp",
  },
  SCHEDULED: {
    bg: "bg-brand-orange-soft dark:bg-brand-orange/15",
    border: "border-brand-orange/30 dark:border-brand-orange/50 hover:border-brand-orange/70",
    text: "text-foreground",
    pill: "bg-brand-orange text-white",
    accent: "border-l-brand-orange border-border",
    label: "Lên lịch",
  },
  PUBLISHED: {
    bg: "bg-emerald-500/10 dark:bg-emerald-500/15",
    border: "border-emerald-500/30 dark:border-emerald-700/50 hover:border-emerald-500/60",
    text: "text-foreground",
    pill: "bg-emerald-600 text-white",
    accent: "border-l-emerald-600 border-border",
    label: "Đã đăng",
  },
  FAILED: {
    bg: "bg-rose-500/10 dark:bg-rose-500/15",
    border: "border-rose-500/30 dark:border-rose-700/50 hover:border-rose-500/60",
    text: "text-foreground",
    pill: "bg-rose-600 text-white",
    accent: "border-l-rose-600 border-border",
    label: "Thất bại",
  },
};

interface SelectedPopoverState {
  event: CalendarPostEvent;
  title: string;
  timeText: string;
  dateStr: string;
  x: number;
  y: number;
}

export const ContentCalendar: React.FC<ContentCalendarProps> = ({
  events,
  onReschedule,
  onDateClick,
  onDatesChange,
}) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { id: paramWorkspaceId } = useParams<{ id: string }>();
  const currentWorkspace = useWorkspaceStore((s) => s.currentWorkspace);
  const workspaceId = paramWorkspaceId || currentWorkspace?.id;
  const isManager = currentWorkspace?.myRole === "MANAGER";

  const calendarRef = useRef<FullCalendar | null>(null);
  const calendarContainerRef = useRef<HTMLDivElement | null>(null);
  const [currentYear, setCurrentYear] = useState(() =>
    new Date().getFullYear(),
  );
  const [currentTitle, setCurrentTitle] = useState("");
  const [currentView, setCurrentView] =
    useState<CalendarViewType>("dayGridMonth");
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  const [selectedEvent, setSelectedEvent] =
    useState<SelectedPopoverState | null>(null);

  // Tự động căn chỉnh vị trí FullCalendar Popover nếu rơi vào các cột sát mép phải
  useEffect(() => {
    const calendarEl = calendarContainerRef.current;
    if (!calendarEl) return;

    const clampPopover = () => {
      const popover = calendarEl.querySelector(".fc-popover") as HTMLElement;
      if (!popover) return;

      const calendarRect = calendarEl.getBoundingClientRect();
      const popoverRect = popover.getBoundingClientRect();

      // Nếu tràn mép phải của khung lịch
      if (popoverRect.right > calendarRect.right - 12) {
        const overflow = popoverRect.right - (calendarRect.right - 12);
        const currentLeft = parseFloat(popover.style.left) || 0;
        popover.style.left = `${Math.max(8, currentLeft - overflow)}px`;
      }
      // Nếu tràn mép trái của khung lịch
      if (popoverRect.left < calendarRect.left + 8) {
        const underflow = calendarRect.left + 8 - popoverRect.left;
        const currentLeft = parseFloat(popover.style.left) || 0;
        popover.style.left = `${currentLeft + underflow}px`;
      }
    };

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          clampPopover();
        }
      }
    });

    observer.observe(calendarEl, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [currentView]);

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

  const handleEventDrop = async (dropInfo: EventDropArg) => {
    const { event, revert } = dropInfo;
    if (!isManager) {
      revert();
      return;
    }
    const newDate = event.start;
    if (!newDate) return;

    const success = await onReschedule(event.id, newDate);
    if (!success) {
      revert();
    }
  };

  const openEventPopover = (
    calEvent: CalendarPostEvent,
    title: string,
    timeText: string,
    dateStr: string,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const popoverWidth = 330;

    let posX = rect.right + 12;
    if (rect.right + popoverWidth > window.innerWidth - 20) {
      posX = Math.max(16, rect.left - popoverWidth - 12);
    }

    const posY = Math.max(
      80,
      Math.min(rect.top - 20, window.innerHeight - 280),
    );

    setSelectedEvent({
      event: calEvent,
      title,
      timeText:
        timeText ||
        (calEvent.start ? new Date(calEvent.start).toLocaleTimeString() : ""),
      dateStr,
      x: posX,
      y: posY,
    });
  };

  const renderEventContent = (eventInfo: EventContentArg) => {
    const calEvent = events.find((e) => e.id === eventInfo.event.id) || {
      id: eventInfo.event.id,
      title: eventInfo.event.title,
      start: eventInfo.event.startStr,
      extendedProps: eventInfo.event.extendedProps as CalendarPostEvent["extendedProps"],
    };

    const extProps = calEvent.extendedProps;
    const platform = (extProps?.platform as PlatformType) || "FACEBOOK";
    const status = (extProps?.status as PostStatus) || "SCHEDULED";
    const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.SCHEDULED;
    const platformConfig = PLATFORM_CONFIG[platform] || PLATFORM_CONFIG.FACEBOOK;
    const timeText = eventInfo.timeText || "";

    if (currentView === "dayGridMonth") {
      return (
        <div
          onClick={(e) =>
            openEventPopover(
              calEvent,
              eventInfo.event.title,
              timeText,
              eventInfo.event.startStr,
              e,
            )
          }
          className={`group relative flex w-full min-w-0 max-w-full cursor-pointer items-center gap-1.5 overflow-hidden rounded-md border px-2 py-0.5 text-xs font-medium shadow-2xs transition-all duration-150 hover:-translate-y-0.5 hover:shadow-xs active:scale-[0.99] ${statusConfig.bg} ${statusConfig.border}`}
          title={`${eventInfo.event.title}\nThời gian: ${timeText}\nNền tảng: ${platformConfig.name}\nTrạng thái: ${statusConfig.label}`}
        >
          <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-background/80 shadow-2xs">
            {platformConfig.icon}
          </span>
          <span className="min-w-0 flex-1 truncate text-xs font-semibold tracking-tight text-foreground">
            {eventInfo.event.title}
          </span>
          {timeText && (
            <span className="text-muted-foreground ml-auto shrink-0 pr-1 font-mono text-[10px] font-medium">
              {timeText}
            </span>
          )}
        </div>
      );
    }

    // TimeGrid Day / Week view with vertical timeline card
    return (
      <div
        onClick={(e) =>
          openEventPopover(
            calEvent,
            eventInfo.event.title,
            timeText,
            eventInfo.event.startStr,
            e,
          )
        }
        className={`flex h-full w-full cursor-grab flex-col justify-between overflow-hidden rounded-md border border-l-4 ${statusConfig.accent} ${statusConfig.bg} ${statusConfig.text} p-2 transition-all hover:scale-[1.01] hover:shadow-xs active:cursor-grabbing`}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="flex size-4 shrink-0 items-center justify-center rounded-md bg-white/80 shadow-2xs dark:bg-black/40">
              {platformConfig.icon}
            </span>
            <span
              className={`rounded-xs px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase ${statusConfig.pill}`}
            >
              {statusConfig.label}
            </span>
          </div>
          <div className="line-clamp-2 text-xs leading-snug font-semibold">
            {eventInfo.event.title}
          </div>
          <div className="text-2xs flex items-center gap-1 opacity-80">
            <Clock className="size-3 shrink-0" />
            <span>{timeText || new Date(calEvent.start).toLocaleTimeString()}</span>
          </div>
        </div>

        {extProps?.captionPreview && (
          <div className="text-2xs mt-1 line-clamp-1 border-t border-black/10 pt-1 italic opacity-75 dark:border-white/10">
            "{extProps.captionPreview}"
          </div>
        )}
      </div>
    );
  };

  const monthNames = [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ];
  const weekDaysShort = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarPostEvent[]>();
    events.forEach((ev) => {
      if (!ev.start) return;
      const dayKey = ev.start.split("T")[0];
      const list = map.get(dayKey) || [];
      list.push(ev);
      map.set(dayKey, list);
    });
    return map;
  }, [events]);

  return (
    <div
      onClick={() => setSelectedEvent(null)}
      className="border-border bg-card relative space-y-2 overflow-hidden rounded-2xl border shadow-xs"
    >
      {/* Custom Mockup-Style Calendar Toolbar Header (Exact match with Task Calendar) */}
      <div className="border-border bg-muted/30 flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
        {/* Left: Today, Prev/Next, Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleToday}
            className="border-border bg-card text-foreground hover:bg-muted cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-semibold shadow-2xs transition-colors"
          >
            Hôm nay
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
              ? `Năm ${currentYear}`
              : currentTitle || "Lịch xuất bản nội dung"}
          </h2>
        </div>

        {/* Right: View Switcher (Day / Week / Month / Year), Date Jump */}
        <div className="flex flex-wrap items-center gap-2.5">
          <SelectMenu
            ariaLabel="Chọn chế độ xem lịch xuất bản"
            value={currentView}
            onChange={(val) => handleViewChange(val as CalendarViewType)}
            options={[
              { value: "dayGridMonth", label: "Month (Tháng)" },
              { value: "timeGridWeek", label: "Week (Tuần)" },
              { value: "timeGridDay", label: "Day (Ngày)" },
              { value: "yearGrid", label: "Year (Năm)" },
            ]}
            className="border-border bg-card h-8 min-w-[130px] rounded-lg text-xs shadow-2xs"
          />

          <div className="border-border bg-card flex items-center rounded-lg border px-2.5 py-1 text-xs shadow-2xs">
            <span className="text-muted-foreground text-2xs mr-1.5">Ngày:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="text-foreground cursor-pointer bg-transparent text-xs font-medium focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Main Calendar View Body */}
      {currentView === "yearGrid" ? (
        <div className="overflow-x-auto p-4">
          <div className="divide-border grid min-w-[900px] grid-cols-4 gap-4">
            {monthNames.map((monthName, monthIndex) => {
              const firstDay = new Date(currentYear, monthIndex, 1).getDay();
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
                      const dateStr = `${currentYear}-${String(monthIndex + 1).padStart(2, "0")}-${String(dayNumber).padStart(2, "0")}`;
                      const isToday =
                        today.getFullYear() === currentYear &&
                        today.getMonth() === monthIndex &&
                        today.getDate() === dayNumber;

                      const dayPosts = eventsByDay.get(dateStr) || [];
                      const hasPosts = dayPosts.length > 0;

                      return (
                        <div
                          key={dayNumber}
                          onClick={() => {
                            handleDateChange(dateStr);
                            handleViewChange("timeGridDay");
                          }}
                          className={`hover:bg-muted flex h-7 cursor-pointer flex-col items-center justify-center rounded-md transition-colors ${
                            isToday
                              ? "border-brand-orange bg-brand-orange/10 font-bold text-brand-orange border"
                              : "text-foreground"
                          }`}
                        >
                          <span>{dayNumber}</span>
                          {hasPosts && (
                            <div className="mt-0.5 flex gap-0.5">
                              <span className="bg-brand-orange size-1 rounded-full" />
                              {dayPosts.length > 1 && (
                                <span className="size-1 rounded-full bg-blue-500" />
                              )}
                              {dayPosts.length > 2 && (
                                <span className="size-1 rounded-full bg-pink-500" />
                              )}
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
        /* FullCalendar Engine with smooth drag-and-drop */
        <div className="w-full overflow-hidden p-3 sm:p-4">
          <div ref={calendarContainerRef} className="fullcalendar-custom w-full min-w-0">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView={currentView}
              headerToolbar={false}
              datesSet={(arg) => {
                setCurrentTitle(arg.view.title);
                onDatesChange(arg.start, arg.end);
              }}
              slotMinTime="00:00:00"
              slotMaxTime="24:00:00"
              scrollTime="08:00:00"
              allDaySlot={false}
              editable={isManager}
              selectable={isManager}
              events={events}
              eventDrop={handleEventDrop}
              eventContent={renderEventContent}
              dateClick={(info) => onDateClick(info.date)}
              nowIndicator={true}
              height={currentView === "dayGridMonth" ? "auto" : 620}
              dayMaxEvents={3}
              moreLinkClick="popover"
              moreLinkText={(num) =>
                t("calendar.moreLink", { count: num, defaultValue: `+${num}` })
              }
            />
          </div>
        </div>
      )}

      {/* Interactive Box View Popover (Tương tự Task Popover với Xem chi tiết bài đăng) */}
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
              <span className="size-3.5 shrink-0 rounded-sm">
                {
                  PLATFORM_CONFIG[
                    selectedEvent.event.extendedProps?.platform || "FACEBOOK"
                  ].icon
                }
              </span>
              <h4 className="text-foreground text-sm leading-tight font-semibold truncate">
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

          {/* Details Body */}
          <div className="scrollbar-none space-y-2.5 overflow-x-auto py-3 text-xs">
            <div className="text-foreground/90 flex items-center gap-2 whitespace-nowrap">
              <Clock className="text-brand-orange size-3.5 shrink-0" />
              <span className="font-medium">
                {formatRelativeScheduleTime(selectedEvent.event.start, {
                  showWeekday: true,
                  locale: i18n.language,
                })}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Phân loại:</span>
              <span className="inline-flex items-center gap-1 rounded bg-blue-500/10 px-1.5 py-0.5 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                <ListTodo className="size-3" />
                Công việc (Task)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Kênh:</span>
              <span className="font-medium text-foreground">
                {
                  PLATFORM_CONFIG[
                    selectedEvent.event.extendedProps?.platform || "FACEBOOK"
                  ].name
                }
              </span>
              <span className="text-muted-foreground ml-auto">Trạng thái:</span>
              <span
                className={`rounded-xs px-1.5 py-0.5 text-[10px] font-bold ${
                  STATUS_CONFIG[
                    selectedEvent.event.extendedProps?.status || "SCHEDULED"
                  ].pill
                }`}
              >
                {
                  STATUS_CONFIG[
                    selectedEvent.event.extendedProps?.status || "SCHEDULED"
                  ].label
                }
              </span>
            </div>

            {selectedEvent.event.extendedProps?.captionPreview && (
              <div className="border-border/60 bg-muted/40 rounded-lg border p-2 text-xs italic text-foreground/80 line-clamp-3">
                "{selectedEvent.event.extendedProps.captionPreview}"
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="border-border flex items-center justify-between gap-2 border-t pt-2.5">
            <button
              type="button"
              onClick={() => {
                navigate(
                  workspaceId
                    ? `/workspaces/${workspaceId}/tasks`
                    : `/tasks`,
                );
              }}
              className="hover:bg-muted text-muted-foreground hover:text-foreground inline-flex cursor-pointer items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all"
            >
              <ListTodo className="size-3.5" />
              <span>Xem Task List</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const taskId = selectedEvent.event.extendedProps?.taskId;
                const targetUrl = workspaceId
                  ? taskId
                    ? `/workspaces/${workspaceId}/editor?taskId=${taskId}`
                    : `/workspaces/${workspaceId}/editor?postId=${selectedEvent.event.id}`
                  : taskId
                    ? `/editor?taskId=${taskId}`
                    : `/editor?postId=${selectedEvent.event.id}`;
                navigate(targetUrl);
              }}
              className="bg-brand-orange hover:bg-brand-orange/90 inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white shadow-2xs transition-all"
            >
              <Eye className="size-3.5" />
              <span>Chỉnh sửa / Xem bài</span>
              <ExternalLink className="size-3" />
            </button>
          </div>
        </div>
      )}

      {/* Footer Helper Note */}
      <div className="border-border bg-muted/20 text-2xs text-muted-foreground flex items-center justify-between border-t px-4 py-2">
        <span className="font-mono tracking-wider uppercase">
          {isManager
            ? "Mẹo: Quản lý có thể kéo thả để dời giờ đăng bài (tự động chặn thời điểm quá khứ) · Click vào bài đăng để xem bài"
            : "Click vào bài đăng để xem chi tiết hoặc mở bài viết trong Editor"}
        </span>
        <span className="text-brand-orange font-medium">
          Auto Publish Engine
        </span>
      </div>
    </div>
  );
};
