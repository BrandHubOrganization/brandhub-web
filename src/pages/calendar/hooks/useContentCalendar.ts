import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { calendarService } from "@/services/calendarService";
import type { CalendarPostEvent, PlatformType } from "@/types/calendar";

const ALL_PLATFORMS: PlatformType[] = [
  "FACEBOOK",
  "INSTAGRAM",
  "TIKTOK",
  "THREADS",
  "YOUTUBE",
];

export function useContentCalendar() {
  const { t } = useTranslation();
  const [events, setEvents] = useState<CalendarPostEvent[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] =
    useState<PlatformType[]>(ALL_PLATFORMS);
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(),
    end: new Date(),
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDateForModal, setSelectedDateForModal] = useState<Date | null>(
    null,
  );

  const fetchCalendarEvents = async () => {
    try {
      const data = await calendarService.getCalendarPosts({
        startDate: dateRange.start.toISOString(),
        endDate: dateRange.end.toISOString(),
        platforms: selectedPlatforms,
      });
      setEvents(data);
    } catch (err) {
      toast.error(t("calendar.toast.loadFailed"));
    }
  };

  useEffect(() => {
    fetchCalendarEvents();
  }, [selectedPlatforms, dateRange]);

  const handleReschedule = async (
    eventId: string,
    newDate: Date,
  ): Promise<boolean> => {
    const previousEvents = [...events];
    setEvents((prev) =>
      prev.map((evt) =>
        evt.id === eventId ? { ...evt, start: newDate.toISOString() } : evt,
      ),
    );

    try {
      await calendarService.reschedulePost({
        postId: eventId,
        newScheduledAt: newDate.toISOString(),
      });
      toast.success(t("calendar.toast.rescheduleSuccess"));
      return true;
    } catch (err) {
      toast.error(t("calendar.toast.rescheduleFailed"));
      setEvents(previousEvents);
      return false;
    }
  };

  const handleDateClick = (date: Date) => {
    setSelectedDateForModal(date);
    setIsModalOpen(true);
  };

  const handleCreatePost = (newPostData: Partial<CalendarPostEvent>) => {
    const newEvent: CalendarPostEvent = {
      id: `post-${Date.now()}`,
      title: newPostData.title || "Untitled Post",
      start: newPostData.start || new Date().toISOString(),
      extendedProps: newPostData.extendedProps || {
        platform: "FACEBOOK",
        status: "SCHEDULED",
        captionPreview: "",
      },
    };

    setEvents((prev) => [...prev, newEvent]);
    toast.success(t("calendar.toast.createSuccess"));
  };

  const openModalOnNow = () => {
    setSelectedDateForModal(new Date());
    setIsModalOpen(true);
  };

  return {
    events,
    selectedPlatforms,
    setSelectedPlatforms,
    dateRange,
    setDateRange,
    isModalOpen,
    setIsModalOpen,
    selectedDateForModal,
    handleReschedule,
    handleDateClick,
    handleCreatePost,
    openModalOnNow,
  };
}
