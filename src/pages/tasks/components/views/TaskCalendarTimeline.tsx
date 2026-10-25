import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { taskDeadline } from "@/pages/tasks/utils/taskViewData";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventContentArg } from "@fullcalendar/core";
import type { TaskListItem } from "@/types/task";
import {
  AlertCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  FileText,
  Pencil,
  Share2,
  Sparkles,
  User2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SelectMenu } from "@/components/ui/select-menu";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { taskWorkflowService } from "@/pages/tasks/services/taskWorkflowService";
import { canonicalTaskStatus } from "@/pages/tasks/utils/taskStatus";
import { STATUS_CONFIG } from "@/pages/tasks/constants";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface TaskCalendarTimelineProps {
  tasks: TaskListItem[];
  onTaskClick: (task: TaskListItem) => void;
  workspaceId?: string;
  onUpdated?: () => void;
}

type CalendarViewType =
  "timeGridWeek" | "timeGridDay" | "dayGridMonth" | "yearGrid";

interface ActiveEventDetail {
  task: TaskListItem;
  title: string;
  timeText: string;
  location: string;
  pillColor: string;
  dateStr: string;
  x: number;
  y: number;
  isPinned: boolean;
}

function toDateTimeLocalValue(isoOrDateString?: string | null): string {
  if (!isoOrDateString || !Number.isFinite(Date.parse(isoOrDateString))) {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  }
  const d = new Date(isoOrDateString);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function TaskCalendarTimeline({
  tasks,
  onTaskClick,
  workspaceId,
  onUpdated,
}: TaskCalendarTimelineProps) {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const calendarRef = useRef<FullCalendar | null>(null);
  const calendarContainerRef = useRef<HTMLDivElement | null>(null);
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check Manager/Owner permissions with resilient case-insensitive matching
  const role = useWorkspaceStore(
    (store) =>
      store.workspaceList.find(
        (ws) => ws.id === (workspaceId || tasks[0]?.workspaceId),
      )?.myRole || store.currentMemberRole,
  );
  const roleStr = String(role || "").toUpperCase();
  const isManager =
    roleStr === "MANAGER" ||
    roleStr === "OWNER" ||
    roleStr === "ADMIN" ||
    roleStr === "PROJECT_MANAGER";

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

  // Tự động căn chỉnh vị trí FullCalendar Popover nếu rơi vào các cột sát mép phải
  useEffect(() => {
    const calendarEl = calendarContainerRef.current;
    if (!calendarEl) return;

    const clampPopover = () => {
      const popover = calendarEl.querySelector(".fc-popover") as HTMLElement;
      if (!popover) return;

      const calendarRect = calendarEl.getBoundingClientRect();
      const popoverRect = popover.getBoundingClientRect();

      if (popoverRect.right > calendarRect.right - 12) {
        const overflow = popoverRect.right - (calendarRect.right - 12);
        const currentLeft = parseFloat(popover.style.left) || 0;
        popover.style.left = `${Math.max(8, currentLeft - overflow)}px`;
      }
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

  // Hover & Click Popover modal state
  const [activeEvent, setActiveEvent] = useState<ActiveEventDetail | null>(
    null,
  );
  const [isEditingDeadline, setIsEditingDeadline] = useState(false);
  const [editDueDate, setEditDueDate] = useState("");
  const [isSavingDeadline, setIsSavingDeadline] = useState(false);
  const [deadlineError, setDeadlineError] = useState<string | null>(null);

  // Validate deadline before saving
  const validateDeadline = (
    dateValue: string,
    task: TaskListItem,
  ): { valid: boolean; error: string | null } => {
    if (
      task.status === "FINISHED" ||
      task.status === "COMPLETED" ||
      task.status === "CANCELLED"
    ) {
      return {
        valid: false,
        error:
          "Không thể thay đổi hạn chót cho công việc đã hoàn thành hoặc đã hủy.",
      };
    }

    if (!dateValue || dateValue.trim() === "") {
      if (task.assigneeId) {
        return {
          valid: false,
          error: "Công việc đã được phân công, hạn chót không được để trống.",
        };
      }
      return {
        valid: false,
        error: "Vui lòng chọn thời gian hạn chót.",
      };
    }

    const parsedDate = new Date(dateValue);
    if (!Number.isFinite(parsedDate.getTime())) {
      return {
        valid: false,
        error: "Định dạng ngày giờ không hợp lệ.",
      };
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const targetDayStart = new Date(parsedDate);
    targetDayStart.setHours(0, 0, 0, 0);

    const oldDate = task.dueDate ? new Date(task.dueDate) : null;
    const oldDayStart =
      oldDate && Number.isFinite(oldDate.getTime()) ? new Date(oldDate) : null;
    if (oldDayStart) {
      oldDayStart.setHours(0, 0, 0, 0);
    }

    // Past task logic:
    if (oldDayStart && oldDayStart < todayStart) {
      if (targetDayStart < oldDayStart) {
        return {
          valid: false,
          error: "Không thể dời hạn chót lùi sâu hơn về quá khứ.",
        };
      }
      if (targetDayStart < todayStart) {
        return {
          valid: false,
          error:
            "Công việc quá hạn chỉ có thể dời lên ngày hiện tại hoặc tương lai.",
        };
      }
    } else {
      // Future or present task:
      if (targetDayStart < todayStart) {
        return {
          valid: false,
          error:
            "Công việc đang có lịch ở hiện tại/tương lai, không thể dời về quá khứ.",
        };
      }
    }

    const minAllowed = new Date();
    minAllowed.setMinutes(minAllowed.getMinutes() - 5);
    if (parsedDate < minAllowed) {
      return {
        valid: false,
        error: "Hạn chót không được nằm trong quá khứ.",
      };
    }

    return { valid: true, error: null };
  };

  // Local state for optimistic calendar updates when dragging
  const [localTasks, setLocalTasks] = useState<TaskListItem[]>(tasks);
  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  // Map tasks to events
  const calendarEvents = useMemo(() => {
    return localTasks
      .filter((task) => taskDeadline(task) !== null)
      .map((task, idx) => {
        const start = taskDeadline(task)!;

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

        const scheme = {
          ...schemes[idx % schemes.length],
          type: t(`tasks.types.${task.type}`),
        };

        return {
          id: task.id,
          title: task.name,
          allDay: false,
          start: start.toISOString(),
          extendedProps: {
            task,
            scheme,
            location: t("tasks.missing"),
          },
        };
      });
  }, [localTasks, t]);

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
    setActiveEvent(null);
    setIsEditingDeadline(false);
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

  // Helper to calculate popover placement
  const calculatePopoverPos = (rect: DOMRect) => {
    const popoverWidth = 340;
    let posX = rect.right + 12;
    if (rect.right + popoverWidth > window.innerWidth - 20) {
      posX = Math.max(16, rect.left - popoverWidth - 12);
    }
    const posY = Math.max(
      80,
      Math.min(rect.top - 10, window.innerHeight - 380),
    );
    return { posX, posY };
  };

  // Hover on event element
  const handleEventMouseEnter = (
    task: TaskListItem,
    title: string,
    timeText: string,
    location: string,
    pillColor: string,
    dateStr: string,
    e: React.MouseEvent,
  ) => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    // Don't override if pinned and already interacting with an event
    if (activeEvent?.isPinned) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const { posX, posY } = calculatePopoverPos(rect);

    setActiveEvent({
      task,
      title,
      timeText:
        timeText ||
        (taskDeadline(task)?.toLocaleTimeString() ?? t("tasks.missing")),
      location,
      pillColor,
      dateStr,
      x: posX,
      y: posY,
      isPinned: false,
    });
    setIsEditingDeadline(false);
  };

  const handleEventMouseLeave = () => {
    leaveTimerRef.current = setTimeout(() => {
      if (!isEditingDeadline) {
        setActiveEvent((prev) => (prev?.isPinned ? prev : null));
      }
    }, 280);
  };

  // Click on event element: pins the popover or allows quick inspection
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
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const { posX, posY } = calculatePopoverPos(rect);

    setActiveEvent({
      task,
      title,
      timeText:
        timeText ||
        (taskDeadline(task)?.toLocaleTimeString() ?? t("tasks.missing")),
      location,
      pillColor,
      dateStr,
      x: posX,
      y: posY,
      isPinned: true,
    });
  };

  // Manager updates deadline inside popover modal
  const handleSaveDeadline = async () => {
    if (!activeEvent) return;
    setDeadlineError(null);

    // 1. Client-side input validation
    const validation = validateDeadline(editDueDate, activeEvent.task);
    if (!validation.valid) {
      setDeadlineError(validation.error);
      toast.error(validation.error || "Thời gian hạn chót không hợp lệ");
      return;
    }

    const targetWs = workspaceId || activeEvent.task.workspaceId;
    const taskId = activeEvent.task.id;
    setIsSavingDeadline(true);
    try {
      const parsedDate = new Date(editDueDate);
      const isoString = parsedDate.toISOString();

      // Read current workflow for revision and campaign date bounds
      const workflow = await taskWorkflowService.read(targetWs, taskId);

      // Validate bounds from campaign/workspace if present
      if (workflow.dates?.minDate) {
        const minDate = new Date(`${workflow.dates.minDate}T00:00:00`);
        if (parsedDate < minDate) {
          const err = `Hạn chót không được trước ngày bắt đầu (${workflow.dates.minDate})`;
          setDeadlineError(err);
          toast.error(err);
          setIsSavingDeadline(false);
          return;
        }
      }
      if (workflow.dates?.maxDate) {
        const maxDate = new Date(`${workflow.dates.maxDate}T23:59:59`);
        if (parsedDate > maxDate) {
          const err = `Hạn chót không được vượt quá kết thúc chiến dịch (${workflow.dates.maxDate})`;
          setDeadlineError(err);
          toast.error(err);
          setIsSavingDeadline(false);
          return;
        }
      }

      await taskWorkflowService.field(targetWs, taskId, {
        field: "dueDate",
        value: isoString,
        expectedRevision: workflow.workflowRevision!,
      });
      toast.success("Đã cập nhật thời gian hạn chót!");
      setIsEditingDeadline(false);
      setDeadlineError(null);
      setLocalTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, dueDate: isoString } : t)),
      );
      setActiveEvent((prev) =>
        prev
          ? {
              ...prev,
              task: { ...prev.task, dueDate: isoString },
              timeText: new Intl.DateTimeFormat(i18n.language, {
                hour: "2-digit",
                minute: "2-digit",
              }).format(new Date(isoString)),
              dateStr: new Intl.DateTimeFormat(i18n.language, {
                dateStyle: "medium",
              }).format(new Date(isoString)),
            }
          : null,
      );
      await queryClient.invalidateQueries({
        queryKey: ["task-workflow", targetWs, taskId],
      });
      onUpdated?.();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Lỗi hệ thống";
      setDeadlineError(msg);
      toast.error("Không thể cập nhật hạn chót: " + msg);
    } finally {
      setIsSavingDeadline(false);
    }
  };

  const renderEventContent = (eventInfo: EventContentArg) => {
    const isAllDay = eventInfo.event.allDay;
    const task = eventInfo.event.extendedProps.task as TaskListItem;
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
          onMouseEnter={(e) =>
            handleEventMouseEnter(
              task,
              eventInfo.event.title,
              eventInfo.timeText,
              location,
              scheme.pill,
              eventInfo.event.startStr,
              e,
            )
          }
          onMouseLeave={handleEventMouseLeave}
          onClick={(e) =>
            handleEventClick(
              task,
              eventInfo.event.title,
              eventInfo.timeText,
              location,
              scheme.pill,
              eventInfo.event.startStr,
              e,
            )
          }
          className={`flex w-full min-w-0 max-w-full items-center gap-1.5 rounded-md border ${scheme.border} ${scheme.bg} cursor-pointer px-1.5 py-0.5 text-xs font-semibold shadow-2xs transition-all hover:brightness-95`}
        >
          <span
            className={`text-3xs py-0.2 shrink-0 rounded-xs px-1.5 font-bold tracking-wider uppercase ${scheme.pill}`}
          >
            {scheme.type}
          </span>
          <span className="min-w-0 flex-1 truncate">{eventInfo.event.title}</span>
        </div>
      );
    }

    return (
      <div
        onMouseEnter={(e) =>
          handleEventMouseEnter(
            task,
            eventInfo.event.title,
            eventInfo.timeText,
            location,
            scheme.pill,
            eventInfo.event.startStr,
            e,
          )
        }
        onMouseLeave={handleEventMouseLeave}
        onClick={(e) =>
          handleEventClick(
            task,
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

        <div className="text-2xs mt-1 flex items-center justify-between border-t border-black/10 pt-1 opacity-75 dark:border-white/10">
          <span className="truncate">
            {task.assigneeName || t("tasks.unassigned")}
          </span>
          {isManager && (
            <span className="text-3xs font-mono opacity-80">Kéo để dời</span>
          )}
        </div>
      </div>
    );
  };

  // 12 Months matrix generator for Year View
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

  // Canonical status for active event
  const canonical = activeEvent
    ? canonicalTaskStatus(activeEvent.task.status)
    : "TODO";
  const statusCfg = STATUS_CONFIG[canonical];

  return (
    <div
      onClick={() => {
        if (!isEditingDeadline) {
          setActiveEvent(null);
        }
      }}
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

      {/* Main Calendar Area: Year Grid or FullCalendar */}
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
                      const isToday =
                        today.getFullYear() === currentYear &&
                        today.getMonth() === monthIndex &&
                        today.getDate() === dayNumber;

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
        /* FullCalendar for Day, Week, and Month with drag & drop for managers */
        <div className="w-full overflow-hidden p-3 sm:p-4">
          <div ref={calendarContainerRef} className="fullcalendar-custom w-full min-w-0">
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
              editable={isManager}
              displayEventEnd={false}
              eventResizableFromStart={false}
              selectable={false}
              nowIndicator={true}
              height={currentView === "dayGridMonth" ? "auto" : 640}
              dayMaxEvents={3}
              moreLinkClick="popover"
              moreLinkText={(num) =>
                t("tasks.moreItems", { count: num, defaultValue: `+${num}` })
              }
              eventAllow={(dropInfo) => {
                if (!isManager) return false;
                const targetDate = dropInfo.start;
                if (!targetDate) return false;

                const now = new Date();
                const todayStart = new Date(
                  now.getFullYear(),
                  now.getMonth(),
                  now.getDate(),
                );
                const targetDayStart = new Date(
                  targetDate.getFullYear(),
                  targetDate.getMonth(),
                  targetDate.getDate(),
                );

                const isTimeView =
                  currentView === "timeGridWeek" ||
                  currentView === "timeGridDay";

                // In time grid, block past hour slots (with 5 min grace)
                // In month/day grid, block days before today
                const isTargetInPast = isTimeView
                  ? targetDate.getTime() < now.getTime() - 5 * 60 * 1000
                  : targetDayStart.getTime() < todayStart.getTime();

                if (isTargetInPast) {
                  return false;
                }

                return true;
              }}
              eventDrop={async (dropInfo) => {
                if (!isManager) {
                  dropInfo.revert();
                  toast.error(
                    "Bạn không có quyền quản lý để dời hạn chót công việc!",
                  );
                  return;
                }
                const rawDate = dropInfo.event.start;
                if (!rawDate) return;
                const task = dropInfo.event.extendedProps.task as TaskListItem;
                const taskId = dropInfo.event.id;
                const targetWs = workspaceId || task?.workspaceId;

                // 1. Task status validation
                if (
                  task.status === "FINISHED" ||
                  task.status === "COMPLETED" ||
                  task.status === "CANCELLED"
                ) {
                  dropInfo.revert();
                  toast.error(
                    "Không thể thay đổi hạn chót cho công việc đã hoàn thành hoặc đã hủy!",
                  );
                  return;
                }

                // 2. Adjust time to preserve original hour/minute or default to 18:00
                const now = new Date();
                const todayStart = new Date(
                  now.getFullYear(),
                  now.getMonth(),
                  now.getDate(),
                );
                const newDate = new Date(rawDate);
                const oldDate =
                  dropInfo.oldEvent?.start ||
                  (task.dueDate ? new Date(task.dueDate) : null);

                if (oldDate && !isNaN(oldDate.getTime())) {
                  if (currentView === "dayGridMonth" || dropInfo.event.allDay) {
                    newDate.setHours(
                      oldDate.getHours(),
                      oldDate.getMinutes(),
                      oldDate.getSeconds(),
                    );
                  }
                } else {
                  if (newDate.getHours() === 0 && newDate.getMinutes() === 0) {
                    newDate.setHours(18, 0, 0);
                  }
                }

                const targetDayStart = new Date(
                  newDate.getFullYear(),
                  newDate.getMonth(),
                  newDate.getDate(),
                );

                // If dropping on today in month view and time already passed, adjust to a safe upcoming time
                if (
                  currentView === "dayGridMonth" &&
                  targetDayStart.getTime() === todayStart.getTime() &&
                  newDate.getTime() < now.getTime()
                ) {
                  const safeHour = Math.max(now.getHours() + 1, 18);
                  newDate.setHours(Math.min(safeHour, 23), 59, 0);
                }

                // 3. Past vs Future date validation
                const oldDayStart =
                  oldDate && Number.isFinite(oldDate.getTime())
                    ? new Date(
                        oldDate.getFullYear(),
                        oldDate.getMonth(),
                        oldDate.getDate(),
                      )
                    : null;

                const isTimeView =
                  currentView === "timeGridWeek" ||
                  currentView === "timeGridDay";
                const isTargetInPast = isTimeView
                  ? newDate.getTime() < now.getTime() - 5 * 60 * 1000
                  : targetDayStart.getTime() < todayStart.getTime();

                const isOriginalPast =
                  oldDayStart && oldDayStart.getTime() < todayStart.getTime();

                if (isTargetInPast) {
                  dropInfo.revert();
                  if (isOriginalPast) {
                    toast.error(
                      "Công việc quá hạn chỉ có thể dời lên ngày hiện tại hoặc tương lai!",
                    );
                  } else {
                    toast.error(
                      "Công việc đang có lịch ở hiện tại/tương lai, không thể dời về quá khứ!",
                    );
                  }
                  return;
                }

                const newIsoString = newDate.toISOString();

                // 4. Optimistically update local tasks & active event immediately
                setLocalTasks((prev) =>
                  prev.map((t) =>
                    t.id === taskId ? { ...t, dueDate: newIsoString } : t,
                  ),
                );
                setActiveEvent((prev) =>
                  prev && prev.task.id === taskId
                    ? {
                        ...prev,
                        task: { ...prev.task, dueDate: newIsoString },
                        timeText: new Intl.DateTimeFormat(i18n.language, {
                          hour: "2-digit",
                          minute: "2-digit",
                        }).format(newDate),
                        dateStr: new Intl.DateTimeFormat(i18n.language, {
                          dateStyle: "medium",
                        }).format(newDate),
                      }
                    : prev,
                );
                setEditDueDate(toDateTimeLocalValue(newIsoString));

                try {
                  toast.loading("Đang dời hạn chót công việc...", {
                    id: `drag-${taskId}`,
                  });
                  const workflow = await taskWorkflowService.read(
                    targetWs,
                    taskId,
                  );

                  // 5. Campaign date bounds validation
                  if (workflow.dates?.minDate) {
                    const minDate = new Date(
                      `${workflow.dates.minDate}T00:00:00`,
                    );
                    if (newDate < minDate) {
                      dropInfo.revert();
                      setLocalTasks(tasks);
                      toast.error(
                        `Hạn chót không được trước ngày bắt đầu (${workflow.dates.minDate})!`,
                        { id: `drag-${taskId}` },
                      );
                      return;
                    }
                  }
                  if (workflow.dates?.maxDate) {
                    const maxDate = new Date(
                      `${workflow.dates.maxDate}T23:59:59`,
                    );
                    if (newDate > maxDate) {
                      dropInfo.revert();
                      setLocalTasks(tasks);
                      toast.error(
                        `Hạn chót không được vượt quá kết thúc chiến dịch (${workflow.dates.maxDate})!`,
                        { id: `drag-${taskId}` },
                      );
                      return;
                    }
                  }

                  await taskWorkflowService.field(targetWs, taskId, {
                    field: "dueDate",
                    value: newIsoString,
                    expectedRevision: workflow.workflowRevision!,
                  });

                  const formattedDate = new Intl.DateTimeFormat(i18n.language, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(newDate);

                  toast.success(`Đã dời hạn chót sang ${formattedDate}!`, {
                    id: `drag-${taskId}`,
                  });
                  await queryClient.invalidateQueries({
                    queryKey: ["task-workflow", targetWs, taskId],
                  });
                  onUpdated?.();
                } catch (err) {
                  dropInfo.revert();
                  setLocalTasks(tasks);
                  toast.error(
                    "Không thể thay đổi hạn chót: " +
                      (err instanceof Error ? err.message : "Lỗi hệ thống"),
                    { id: `drag-${taskId}` },
                  );
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Interactive Hover / Pinned Task Preview Modal */}
      {activeEvent && (
        <div
          onClick={(e) => e.stopPropagation()}
          onMouseEnter={() => {
            if (leaveTimerRef.current) {
              clearTimeout(leaveTimerRef.current);
              leaveTimerRef.current = null;
            }
          }}
          onMouseLeave={() => {
            if (!activeEvent.isPinned && !isEditingDeadline) {
              setActiveEvent(null);
            }
          }}
          style={{
            position: "fixed",
            left: `${activeEvent.x}px`,
            top: `${activeEvent.y}px`,
            zIndex: 9999,
          }}
          className="border-border/80 bg-card/95 text-foreground animate-in fade-in zoom-in-95 w-84 space-y-3 rounded-2xl border p-4 shadow-2xl backdrop-blur-md duration-150"
        >
          {/* Header Row: Status, Type and Close/Pin */}
          <div className="border-border/60 flex items-center justify-between gap-2 border-b pb-2.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className={cn(
                  "text-3xs inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-semibold",
                  statusCfg.bg,
                  statusCfg.text,
                  statusCfg.border,
                )}
              >
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    statusCfg.dot,
                    canonical === "IN_REVIEW" && "animate-ping",
                  )}
                />
                {t(`tasks.status.${activeEvent.task.status}`, {
                  defaultValue: statusCfg.defaultLabel,
                })}
              </span>

              <span className="bg-muted text-foreground border-border/70 text-3xs inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-medium">
                {activeEvent.task.type === "POST" ? (
                  <Share2 className="text-brand-orange size-3" />
                ) : (
                  <FileText className="text-muted-foreground size-3" />
                )}
                {t(`tasks.types.${activeEvent.task.type}`)}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                setActiveEvent(null);
                setIsEditingDeadline(false);
                setDeadlineError(null);
              }}
              className="text-muted-foreground hover:text-foreground hover:bg-muted shrink-0 cursor-pointer rounded-md p-1 transition-colors"
            >
              <X className="size-3.5" />
            </button>
          </div>

          {/* Title and Short Description */}
          <div className="space-y-1">
            <h4 className="text-foreground line-clamp-2 text-sm leading-snug font-semibold">
              {activeEvent.title}
            </h4>
            {activeEvent.task.description && (
              <p className="text-2xs text-muted-foreground bg-muted/30 border-border/40 line-clamp-2 rounded-lg border p-2 leading-relaxed">
                {activeEvent.task.description}
              </p>
            )}
          </div>

          {/* Assignee Information */}
          <div className="flex items-center justify-between py-0.5 text-xs">
            <span className="text-muted-foreground text-2xs flex items-center gap-1">
              <User2 className="text-muted-foreground size-3" />
              Người thực hiện:
            </span>
            <div className="flex items-center gap-1.5">
              <div className="bg-brand-orange-soft text-brand-orange text-3xs flex size-5 items-center justify-center rounded-full font-bold">
                {activeEvent.task.assigneeName?.charAt(0).toUpperCase() || "U"}
              </div>
              <span className="text-foreground text-xs font-medium">
                {activeEvent.task.assigneeName || t("tasks.unassigned")}
              </span>
            </div>
          </div>

          {/* Deadline Field & Manager Edit Section */}
          <div className="border-border/60 bg-muted/20 space-y-2 rounded-xl border p-2.5">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-2xs flex items-center gap-1 font-medium">
                <Clock className="text-brand-orange size-3" />
                Hạn chót (Deadline):
              </span>
              {isManager &&
                !isEditingDeadline &&
                activeEvent.task.status !== "FINISHED" &&
                activeEvent.task.status !== "COMPLETED" &&
                activeEvent.task.status !== "CANCELLED" && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingDeadline(true);
                      setDeadlineError(null);
                      setEditDueDate(
                        toDateTimeLocalValue(activeEvent.task.dueDate),
                      );
                    }}
                    className="text-brand-orange hover:text-brand-orange/80 text-2xs inline-flex cursor-pointer items-center gap-1 font-semibold transition-colors"
                  >
                    <Pencil className="size-2.5" />
                    Sửa thời gian
                  </button>
                )}
              {(activeEvent.task.status === "FINISHED" ||
                activeEvent.task.status === "COMPLETED" ||
                activeEvent.task.status === "CANCELLED") && (
                <span className="text-3xs text-muted-foreground font-medium italic">
                  Không thể sửa
                </span>
              )}
            </div>

            {isEditingDeadline ? (
              <div className="space-y-2 pt-1">
                <input
                  type="datetime-local"
                  value={editDueDate}
                  min={
                    toDateTimeLocalValue(new Date().toISOString()).slice(
                      0,
                      10,
                    ) + "T00:00"
                  }
                  onChange={(e) => {
                    const nextVal = e.target.value;
                    setEditDueDate(nextVal);
                    if (activeEvent) {
                      const check = validateDeadline(nextVal, activeEvent.task);
                      setDeadlineError(check.valid ? null : check.error);
                    }
                  }}
                  className={cn(
                    "bg-background text-foreground w-full rounded-lg border px-2.5 py-1.5 text-xs focus:ring-1 focus:outline-hidden",
                    deadlineError
                      ? "border-destructive focus:ring-destructive"
                      : "border-border focus:ring-brand-orange",
                  )}
                />

                {deadlineError && (
                  <div className="text-2xs text-destructive bg-destructive/10 border-destructive/20 animate-in fade-in flex items-center gap-1 rounded-md border p-1.5 font-medium">
                    <AlertCircle className="size-3 shrink-0" />
                    <span>{deadlineError}</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-1.5 pt-0.5">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-2xs h-6 px-2"
                    onClick={() => {
                      setIsEditingDeadline(false);
                      setDeadlineError(null);
                    }}
                    disabled={isSavingDeadline}
                  >
                    Hủy
                  </Button>
                  <Button
                    size="sm"
                    variant="orange"
                    className="text-2xs h-6 px-2.5 font-medium"
                    onClick={handleSaveDeadline}
                    loading={isSavingDeadline}
                    disabled={Boolean(deadlineError) || !editDueDate}
                  >
                    Lưu
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-foreground flex items-center gap-1.5 text-xs font-semibold">
                <Calendar className="text-muted-foreground size-3.5" />
                <span>
                  {activeEvent.task.dueDate &&
                  Number.isFinite(Date.parse(activeEvent.task.dueDate))
                    ? new Intl.DateTimeFormat(i18n.language, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(activeEvent.task.dueDate))
                    : activeEvent.dateStr
                      ? `${activeEvent.dateStr} · ${activeEvent.timeText}`
                      : t("tasks.missing")}
                </span>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="border-border/60 flex items-center justify-between gap-2 border-t pt-2.5">
            <span className="text-3xs text-muted-foreground">
              {isManager ? "Manager có quyền sửa DL" : "Chỉ xem thông tin"}
            </span>
            <Button
              size="sm"
              variant="orange"
              onClick={() => onTaskClick(activeEvent.task)}
              className="h-7 gap-1.5 px-3 text-xs shadow-2xs"
            >
              <span>Xem chi tiết</span>
              <ExternalLink className="size-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Footer Helper Note */}
      <div className="border-border bg-muted/20 text-2xs text-muted-foreground flex items-center justify-between border-t px-4 py-2">
        <span className="font-mono tracking-wider">
          {isManager
            ? "Mẹo: Hover để xem tóm tắt, click hoặc kéo thả trên lịch để đổi hạn chót"
            : "Mẹo: Rà chuột (hover) để xem tóm tắt công việc hoặc nhấp để mở chi tiết"}
        </span>
        <span className="text-brand-orange flex items-center gap-1 font-medium">
          <Sparkles className="size-3" />
          {isManager ? "Manager Quản lý DL" : "Calendar Ready"}
        </span>
      </div>
    </div>
  );
}
