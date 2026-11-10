import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  CheckSquare,
  FileText,
  Video,
  ClipboardList,
  Calendar,
  Megaphone,
  Clock,
  AlertCircle,
  ExternalLink,
  Edit3,
  CheckCircle2,
  FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { TaskListItem, TaskType } from "@/types/task";
import {
  isBefore,
  isSameDay,
  isSameWeek,
  parseISO,
  startOfDay,
  format,
  differenceInDays,
} from "date-fns";

export interface MyTasksSectionProps {
  tasks: TaskListItem[];
  currentUserId?: string;
  workspaceNames?: Record<string, string>;
  onNavigateTask: (task: TaskListItem, action?: string) => void;
  loading?: boolean;
  className?: string;
}

type TimeframeTab = "overdue" | "today" | "thisWeek" | "inReview" | "all";

const parseDueDate = (dateStr?: string | null): Date | null => {
  if (!dateStr) return null;
  try {
    const d = parseISO(dateStr);
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
};

const getTaskTypeIcon = (type: TaskType) => {
  switch (type) {
    case "POST":
      return <FileText className="size-3.5 text-muted-foreground" />;
    case "LIVESTREAM":
    case "SHORT_VIDEO":
      return <Video className="size-3.5 text-muted-foreground" />;
    case "SURVEY":
      return <ClipboardList className="size-3.5 text-muted-foreground" />;
    case "EVENT_PLAN":
    case "WORKSHOP":
      return <Calendar className="size-3.5 text-muted-foreground" />;
    case "PRESS_RECOMMENDATION":
    case "KOL_BOOKING":
      return <Megaphone className="size-3.5 text-muted-foreground" />;
    default:
      return <CheckSquare className="size-3.5 text-muted-foreground" />;
  }
};

export function MyTasksSection({
  tasks = [],
  currentUserId,
  workspaceNames = {},
  onNavigateTask,
  loading = false,
  className,
}: MyTasksSectionProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TimeframeTab>("all");

  const now = useMemo(() => new Date(), []);

  // Filter directly by current user
  const baseTasks = useMemo(() => {
    if (!currentUserId) return tasks;
    return tasks.filter(
      (task) =>
        task.assigneeId === currentUserId || task.reporterId === currentUserId,
    );
  }, [tasks, currentUserId]);

  // Categorize tasks for tabs and counts
  const { overdueTasks, todayTasks, thisWeekTasks, inReviewTasks, allTasks } =
    useMemo(() => {
      const overdue: TaskListItem[] = [];
      const today: TaskListItem[] = [];
      const thisWeek: TaskListItem[] = [];
      const inReview: TaskListItem[] = [];

      baseTasks.forEach((task) => {
        const d = parseDueDate(task.dueDate);
        const isFinished =
          task.status === "FINISHED" || task.status === "CANCELLED";

        if (d && !isFinished && isBefore(d, startOfDay(now))) {
          overdue.push(task);
        }

        if (d && isSameDay(d, now)) {
          today.push(task);
        }

        if (d && isSameWeek(d, now, { weekStartsOn: 1 })) {
          thisWeek.push(task);
        }

        if (task.status === "IN_REVIEW") {
          inReview.push(task);
        }
      });

      return {
        overdueTasks: overdue,
        todayTasks: today,
        thisWeekTasks: thisWeek,
        inReviewTasks: inReview,
        allTasks: baseTasks,
      };
    }, [baseTasks, now]);

  // Visible tasks in selected tab
  const displayedTasks = useMemo(() => {
    switch (activeTab) {
      case "overdue":
        return overdueTasks;
      case "today":
        return todayTasks;
      case "thisWeek":
        return thisWeekTasks;
      case "inReview":
        return inReviewTasks;
      case "all":
      default:
        return allTasks;
    }
  }, [activeTab, overdueTasks, todayTasks, thisWeekTasks, inReviewTasks, allTasks]);

  const tabsConfig = [
    {
      id: "overdue" as TimeframeTab,
      label: t("dashboard.myTasks.tabs.overdue", "Quá hạn"),
      count: overdueTasks.length,
      isDestructive: overdueTasks.length > 0,
    },
    {
      id: "today" as TimeframeTab,
      label: t("dashboard.myTasks.tabs.today", "Hôm nay"),
      count: todayTasks.length,
    },
    {
      id: "thisWeek" as TimeframeTab,
      label: t("dashboard.myTasks.tabs.thisWeek", "Tuần này"),
      count: thisWeekTasks.length,
    },
    {
      id: "inReview" as TimeframeTab,
      label: t("dashboard.myTasks.tabs.inReview", "Chờ duyệt"),
      count: inReviewTasks.length,
    },
    {
      id: "all" as TimeframeTab,
      label: t("dashboard.myTasks.tabs.all", "Tất cả"),
      count: allTasks.length,
    },
  ];

  return (
    <div
      className={cn(
        "border-border/80 bg-card rounded-xl border p-4 sm:p-5 shadow-xs flex flex-col lg:h-[435px]",
        className,
      )}
    >
      {/* Header */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between shrink-0 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="bg-muted text-foreground flex size-7 items-center justify-center rounded-lg border border-border/60">
            <CheckSquare className="size-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-foreground text-sm font-bold tracking-tight">
                {t("dashboard.myTasks.title", "Công việc của tôi")}
              </h3>
              <span className="bg-muted text-muted-foreground border-border/60 rounded-full border px-2 py-0.5 text-2xs font-medium">
                {baseTasks.length}
              </span>
            </div>
            <p className="text-muted-foreground text-3xs mt-0.5">
              {t(
                "dashboard.myTasks.subtitle",
                "Theo dõi tiến độ và xử lý các đầu việc ưu tiên theo mốc thời gian",
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Brand Orange Timeframe Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-border/50 pb-2.5 shrink-0 mb-3">
        {tabsConfig.map((tab) => {
          const isActive = activeTab === tab.id;
          const isOverdue = tab.isDestructive;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all cursor-pointer",
                isActive
                  ? isOverdue
                    ? "bg-destructive text-white border-destructive font-semibold shadow-xs"
                    : "bg-brand-orange text-white border-brand-orange shadow-sm shadow-brand-orange/25 font-semibold"
                  : "border-transparent text-muted-foreground hover:border-brand-orange/40 hover:text-brand-orange hover:bg-brand-orange/5"
              )}
            >
              <span>{tab.label}</span>
              {isOverdue ? (
                <span
                  className={cn(
                    "text-2xs rounded-full px-1.5 py-0.2 font-bold",
                    isActive
                      ? "bg-white/25 text-white"
                      : "bg-destructive/15 text-destructive border border-destructive/25"
                  )}
                >
                  {tab.count}
                </span>
              ) : (
                <span
                  className={cn(
                    "text-2xs rounded-full px-1.5 py-0.2 font-medium",
                    isActive
                      ? "bg-white/25 text-white"
                      : "bg-muted text-muted-foreground group-hover:text-foreground"
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Task List Content */}
      {loading ? (
        <div className="flex-1 min-h-0 space-y-2.5 pt-1 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="border-border/60 flex items-center justify-between rounded-lg border p-3"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="size-4 rounded" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-28" />
                </div>
              </div>
              <Skeleton className="h-7 w-20 rounded-md" />
            </div>
          ))}
        </div>
      ) : displayedTasks.length === 0 ? (
        <div className="flex-1 min-h-0 border-border/60 flex flex-col items-center justify-center rounded-lg border border-dashed py-6 text-center space-y-1.5">
          <CheckCircle2 className="text-muted-foreground/60 mb-1 size-7" />
          <p className="text-foreground text-xs font-semibold">
            {t("dashboard.myTasks.emptyTitle", "Không có công việc nào")}
          </p>
          <p className="text-muted-foreground text-3xs mt-0.5 max-w-sm">
            {activeTab === "overdue"
              ? t(
                  "dashboard.myTasks.emptyOverdue",
                  "Tuyệt vời! Không có công việc nào bị quá hạn.",
                )
              : t(
                  "dashboard.myTasks.emptyGeneric",
                  "Hiện chưa có đầu việc nào trong mục này.",
                )}
          </p>
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto pr-1 custom-scrollbar space-y-2">
          {displayedTasks.map((task) => {
            const d = parseDueDate(task.dueDate);
            const isFinished =
              task.status === "FINISHED" || task.status === "CANCELLED";
            const overdue = d && !isFinished && isBefore(d, startOfDay(now));
            const daysLate = d ? differenceInDays(now, d) : 0;
            const wsName =
              workspaceNames[task.workspaceId] ||
              task.workspaceId.slice(0, 8);

            const isPostType = task.type === "POST";

            return (
              <div
                key={task.id}
                onClick={() => onNavigateTask(task)}
                className="group border-border/70 flex flex-col justify-between gap-3 rounded-lg border p-3 cursor-pointer hover:border-brand-orange/60 hover:shadow-xs transition-all active:scale-[0.99] sm:flex-row sm:items-center"
              >
                {/* Left: Type Icon + Key + Title + Workspace */}
                <div className="flex min-w-0 items-start gap-2.5 sm:items-center">
                  <div className="bg-muted text-foreground mt-0.5 flex size-6 shrink-0 items-center justify-center rounded border border-border/60 sm:mt-0">
                    {getTaskTypeIcon(task.type)}
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {task.key && (
                        <span className="bg-muted text-muted-foreground border-border/50 font-mono text-2xs rounded border px-1.5 py-0.2 font-semibold">
                          {task.key}
                        </span>
                      )}
                      <span
                        className="text-foreground group-hover:text-brand-orange truncate text-xs font-semibold transition-colors"
                        title={task.name}
                      >
                        {task.name}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-muted/70 text-muted-foreground border-border/50 text-3xs inline-flex items-center gap-1 rounded px-1.5 py-0.2 font-medium border">
                        <FolderOpen className="size-2.5" />
                        {wsName}
                      </span>

                      {task.status === "IN_REVIEW" && (
                        <span className="bg-muted text-foreground border-border/60 text-3xs rounded px-1.5 py-0.2 font-medium border">
                          {t("dashboard.myTasks.statusInReview", "Chờ duyệt")}
                        </span>
                      )}

                      {task.assigneeName && (
                        <span className="text-muted-foreground text-3xs">
                          {task.assigneeName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Due Date & Action Button */}
                <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border/40 pt-2 sm:border-0 sm:pt-0">
                  <div className="text-right">
                    {d ? (
                      overdue ? (
                        <span className="text-destructive text-3xs flex items-center gap-1 font-semibold">
                          <AlertCircle className="size-3" />
                          {t("dashboard.myTasks.overdueDays", {
                            days: daysLate || 1,
                            defaultValue: `Quá hạn ${daysLate || 1} ngày`,
                          })}
                        </span>
                      ) : isSameDay(d, now) ? (
                        <span className="text-brand-orange text-3xs flex items-center gap-1 font-semibold">
                          <Clock className="size-3" />
                          {t("dashboard.myTasks.todayDue", {
                            time: format(d, "HH:mm"),
                            defaultValue: `Hôm nay ${format(d, "HH:mm")}`,
                          })}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-3xs flex items-center gap-1 font-medium">
                          <Clock className="size-3" />
                          {format(d, "dd/MM/yyyy")}
                        </span>
                      )
                    ) : (
                      <span className="text-muted-foreground/60 text-3xs italic">
                        {t("dashboard.myTasks.noDueDate", "Không có hạn")}
                      </span>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigateTask(task, isPostType ? "edit" : "view");
                    }}
                    className="hover:border-brand-orange hover:text-brand-orange hover:bg-brand-orange/5 h-7 cursor-pointer gap-1 px-2.5 text-xs font-medium"
                  >
                    {isPostType ? (
                      <>
                        <Edit3 className="size-3" />
                        <span>{t("dashboard.myTasks.openEditor", "Mở Soạn thảo")}</span>
                      </>
                    ) : (
                      <>
                        <ExternalLink className="size-3" />
                        <span>{t("dashboard.myTasks.viewTask", "Xem task")}</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
