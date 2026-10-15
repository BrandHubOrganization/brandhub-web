import React, { useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventDropArg, EventContentArg } from "@fullcalendar/core";
import type { CalendarPostEvent, PlatformType } from "@/types/calendar";
import { Video, AtSign, Share2, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";

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
};

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string; dot: string; label: string }> = {
  DRAFT: {
    bg: "bg-amber-500/10 dark:bg-amber-500/15",
    border: "border-amber-500/30",
    text: "text-amber-700 dark:text-amber-300",
    dot: "bg-amber-500",
    label: "Bản nháp",
  },
  SCHEDULED: {
    bg: "bg-brand-orange/10 dark:bg-brand-orange/15",
    border: "border-brand-orange/30",
    text: "text-brand-orange dark:text-brand-orange",
    dot: "bg-brand-orange",
    label: "Lên lịch",
  },
  PUBLISHED: {
    bg: "bg-emerald-500/10 dark:bg-emerald-500/15",
    border: "border-emerald-500/30",
    text: "text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-500",
    label: "Đã đăng",
  },
  FAILED: {
    bg: "bg-rose-500/10 dark:bg-rose-500/15",
    border: "border-rose-500/30",
    text: "text-rose-700 dark:text-rose-300",
    dot: "bg-rose-500",
    label: "Thất bại",
  },
};

export const ContentCalendar: React.FC<ContentCalendarProps> = ({
  events,
  onReschedule,
  onDateClick,
  onDatesChange,
}) => {
  const { t } = useTranslation();
  const calendarRef = useRef<FullCalendar>(null);

  const handleEventDrop = async (dropInfo: EventDropArg) => {
    const { event, revert } = dropInfo;
    const newDate = event.start;
    if (!newDate) return;

    const success = await onReschedule(event.id, newDate);
    if (!success) {
      revert();
    }
  };

  const renderEventContent = (eventInfo: EventContentArg) => {
    const extProps = eventInfo.event.extendedProps;
    const platform = extProps?.platform as PlatformType;
    const status = (extProps?.status as string) || "SCHEDULED";
    const statusStyle = STATUS_COLORS[status] || STATUS_COLORS.SCHEDULED;

    const timeText = eventInfo.timeText || "";

    return (
      <div
        className={`group relative flex w-full cursor-grab items-center gap-1.5 overflow-hidden rounded-lg border px-2 py-1 text-xs font-medium shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:cursor-grabbing ${statusStyle.bg} ${statusStyle.border} ${statusStyle.text}`}
        title={`${eventInfo.event.title}\n${timeText ? `Thời gian: ${timeText}\n` : ""}Trạng thái: ${statusStyle.label}\n\nCaption: ${extProps?.captionPreview || t("calendar.eventCard.noCaptionPreview")}`}
      >
        <span className="flex size-4 shrink-0 items-center justify-center rounded-md bg-white/70 shadow-2xs dark:bg-black/30">
          {PLATFORM_ICONS[platform]}
        </span>
        <span className="truncate font-semibold tracking-tight">{eventInfo.event.title}</span>
        {timeText && (
          <span className="ml-auto shrink-0 text-[10px] opacity-75">{timeText}</span>
        )}
      </div>
    );
  };

  return (
    <div className="border-border bg-card rounded-2xl border p-5 shadow-sm">
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
        aspectRatio={1.65}
        dayMaxEvents={3}
      />
    </div>
  );
};
