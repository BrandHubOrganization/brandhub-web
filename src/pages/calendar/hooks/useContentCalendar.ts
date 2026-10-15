import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { calendarService } from "@/services/mock/mockCalendarService";
import type {
  CalendarPostEvent,
  PlatformType,
  PostStatus,
} from "@/types/calendar";

const ALL_PLATFORMS: PlatformType[] = [
  "FACEBOOK",
  "INSTAGRAM",
  "TIKTOK",
  "THREADS",
];

const ALL_STATUSES: PostStatus[] = [
  "DRAFT",
  "SCHEDULED",
  "PUBLISHED",
  "FAILED",
];

export function useContentCalendar() {
  const { t } = useTranslation();
  const [events, setEvents] = useState<CalendarPostEvent[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] =
    useState<PlatformType[]>(ALL_PLATFORMS);
  const [selectedStatuses, setSelectedStatuses] =
    useState<PostStatus[]>(ALL_STATUSES);
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
        statuses: selectedStatuses,
      });
      setEvents(data);
    } catch {
      toast.error(t("calendar.toast.loadFailed"));
    }
  };

  useEffect(() => {
    fetchCalendarEvents();
  }, [selectedPlatforms, selectedStatuses, dateRange]);

  const clearFilters = () => {
    setSelectedPlatforms(ALL_PLATFORMS);
    setSelectedStatuses(ALL_STATUSES);
  };

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
    } catch {
      toast.error(t("calendar.toast.rescheduleFailed"));
      setEvents(previousEvents);
      return false;
    }
  };

  const handleDateClick = (date: Date) => {
    setSelectedDateForModal(date);
    setIsModalOpen(true);
  };

  const handleCreatePost = (newPostData: {
    title: string;
    caption: string;
    start: string;
    platforms: PlatformType[];
    isRecurring: boolean;
    recurringPattern?: "DAILY" | "WEEKLY" | "MONTHLY";
    weekdays?: number[];
    repeatUntilDate?: string;
  }) => {
    const newEvents: CalendarPostEvent[] = newPostData.platforms.map(
      (platform, index) => ({
        id: `post-${Date.now()}-${index}`,
        title: newPostData.title,
        start: newPostData.start,
        extendedProps: {
          platform,
          status: "SCHEDULED",
          captionPreview: newPostData.caption || newPostData.title,
        },
      }),
    );

    setEvents((prev) => [...newEvents, ...prev]);

    if (newPostData.isRecurring) {
      toast.success(
        "Đã lên lịch chuỗi bài đăng định kỳ thành công! (MSG71 - 12 phiên bản đã được sinh trước)",
      );
    } else {
      toast.success("Đã lên lịch bài đăng tự động thành công! (MSG45)");
    }
  };

  const openModalOnNow = () => {
    setSelectedDateForModal(new Date());
    setIsModalOpen(true);
  };

  return {
    events,
    selectedPlatforms,
    setSelectedPlatforms,
    selectedStatuses,
    setSelectedStatuses,
    clearFilters,
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
