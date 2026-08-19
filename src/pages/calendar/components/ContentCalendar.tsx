import React, { useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { CalendarPostEvent, PlatformType } from "@/types/calendar";
import { Video, AtSign, Share2, Globe, MessageSquare } from "lucide-react";

interface ContentCalendarProps {
  events: CalendarPostEvent[];
  onReschedule: (eventId: string, newDate: Date) => Promise<boolean>;
  onDateClick: (date: Date) => void;
  onDatesChange: (startDate: Date, endDate: Date) => void;
}

const PLATFORM_ICONS: Record<PlatformType, React.ReactNode> = {
  FACEBOOK: <Share2 className="h-3.5 w-3.5 shrink-0 text-blue-500" />,
  INSTAGRAM: <Globe className="h-3.5 w-3.5 shrink-0 text-pink-500" />,
  TIKTOK: (
    <Video className="h-3.5 w-3.5 shrink-0 text-slate-800 dark:text-slate-200" />
  ),
  THREADS: <AtSign className="h-3.5 w-3.5 shrink-0 text-purple-500" />,
  YOUTUBE: <MessageSquare className="h-3.5 w-3.5 shrink-0 text-red-500" />,
};

const STATUS_COLORS: Record<string, string> = {
  DRAFT:
    "bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-300",
  SCHEDULED:
    "bg-indigo-500/15 border-indigo-500/30 text-indigo-700 dark:text-indigo-300",
  PUBLISHED:
    "bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300",
  FAILED: "bg-rose-500/15 border-rose-500/30 text-rose-700 dark:text-rose-300",
};

export const ContentCalendar: React.FC<ContentCalendarProps> = ({
  events,
  onReschedule,
  onDateClick,
  onDatesChange,
}) => {
  const calendarRef = useRef<any>(null);

  const handleEventDrop = async (dropInfo: any) => {
    const { event, revert } = dropInfo;
    const newDate = event.start;
    if (!newDate) return;

    const success = await onReschedule(event.id, newDate);
    if (!success) {
      revert();
    }
  };

  const renderEventContent = (eventInfo: any) => {
    const extProps = eventInfo.event.extendedProps;
    const platform = extProps?.platform as PlatformType;
    const status = extProps?.status || "SCHEDULED";
    const statusColorClass = STATUS_COLORS[status] || STATUS_COLORS.SCHEDULED;

    return (
      <div
        className={`group relative flex w-full cursor-grab items-center gap-1.5 overflow-hidden rounded-xl border px-2 py-1 text-xs font-medium transition-all duration-150 active:cursor-grabbing ${statusColorClass}`}
        title={`${eventInfo.event.title}\n\nCaption: ${extProps?.captionPreview || "No preview"}`}
      >
        {PLATFORM_ICONS[platform]}
        <span className="truncate">{eventInfo.event.title}</span>
      </div>
    );
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek",
        }}
        editable={true}
        selectable={true}
        events={events}
        eventDrop={handleEventDrop}
        eventContent={renderEventContent}
        dateClick={(info) => onDateClick(info.date)}
        datesSet={(dateInfo) => {
          onDatesChange(dateInfo.start, dateInfo.end);
        }}
        height="auto"
        aspectRatio={1.6}
      />
    </div>
  );
};
