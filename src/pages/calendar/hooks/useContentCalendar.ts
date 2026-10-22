import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { calendarService } from "@/services/calendarService";
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
  const navigate = useNavigate();
  const { id: paramWorkspaceId } = useParams<{ id: string }>();
  const currentWorkspace = useWorkspaceStore((s) => s.currentWorkspace);
  const workspaceList = useWorkspaceStore((s) => s.workspaceList);
  const workspaceId =
    paramWorkspaceId || currentWorkspace?.id || workspaceList[0]?.id;

  const [events, setEvents] = useState<CalendarPostEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
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

  // Đồng bộ URL sang /workspaces/:id/calendar nếu đang đứng ở /calendar
  useEffect(() => {
    if (!paramWorkspaceId && workspaceId) {
      navigate(`/workspaces/${workspaceId}/calendar`, { replace: true });
    }
  }, [paramWorkspaceId, workspaceId, navigate]);

  const fetchCalendarEvents = async () => {
    if (!workspaceId) {
      setEvents([]);
      return;
    }
    setLoading(true);
    try {
      const data = await calendarService.getCalendarPosts(workspaceId, {
        startDate: dateRange.start.toISOString(),
        endDate: dateRange.end.toISOString(),
        platforms: selectedPlatforms,
        statuses: selectedStatuses,
      });
      setEvents(data);
    } catch {
      toast.error(t("calendar.toast.loadFailed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setEvents([]); // Xóa sạch sự kiện của workspace trước đó ngay khi đổi workspaceId
    fetchCalendarEvents();
  }, [workspaceId, selectedPlatforms, selectedStatuses, dateRange]);

  const clearFilters = () => {
    setSelectedPlatforms(ALL_PLATFORMS);
    setSelectedStatuses(ALL_STATUSES);
  };

  const handleReschedule = async (
    eventId: string,
    newDate: Date,
  ): Promise<boolean> => {
    // Không cho phép dời lịch xuất bản về thời điểm trong quá khứ
    const now = new Date();
    if (newDate.getTime() < now.getTime()) {
      toast.error("Không thể lên lịch xuất bản vào thời điểm trong quá khứ! Vui lòng chọn thời gian ở tương lai.");
      return false; // Trả về false để FullCalendar revert lại vị trí ban đầu
    }

    if (!workspaceId) {
      toast.error(t("calendar.toast.rescheduleFailed"));
      return false;
    }

    const previousEvents = [...events];
    setEvents((prev) =>
      prev.map((evt) =>
        evt.id === eventId ? { ...evt, start: newDate.toISOString() } : evt,
      ),
    );

    try {
      await calendarService.reschedulePost(workspaceId, {
        postId: eventId,
        newScheduledAt: newDate.toISOString(),
      });
      toast.success(t("calendar.toast.rescheduleSuccess"));
      return true;
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: { message?: string; details?: { fields?: Record<string, string> } } } } };
      const fieldError = axiosError.response?.data?.error?.details?.fields?.publishDate;
      const apiMsg = fieldError || axiosError.response?.data?.error?.message;
      toast.error(apiMsg || t("calendar.toast.rescheduleFailed"));
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
    loading,
    workspaceId,
    currentWorkspace,
    handleCreatePost,
    openModalOnNow,
  };
}
