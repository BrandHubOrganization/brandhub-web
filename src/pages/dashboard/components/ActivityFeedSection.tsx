import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { ActivityEvent } from "@/types/analytics";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Activity,
  AlertTriangle,
  Send,
  RefreshCw,
  AlertCircle,
  FileText,
  FileCheck,
  ChevronDown,
  FolderOpen,
  CheckCircle2,
} from "lucide-react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { vi, enUS } from "date-fns/locale";

export type ActivityTimelineCategory = "ALL" | "TASK" | "REVIEW" | "PUBLISH";

export interface UnifiedTimelineEvent {
  id: string;
  actorName: string | null;
  actorAvatar?: string | null;
  actionText?: string;
  targetTitle?: string;
  targetKey?: string;
  workspaceName?: string;
  timestamp: string;
  category?: "TASK" | "REVIEW" | "PUBLISH";
  type: string;
}

export interface ActivityFeedSectionProps {
  events: (ActivityEvent | UnifiedTimelineEvent)[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  className?: string;
}

const resolveCategory = (event: ActivityEvent | UnifiedTimelineEvent): "TASK" | "REVIEW" | "PUBLISH" => {
  if ("category" in event && event.category) {
    return event.category;
  }
  const type = event.type;
  if (type === "POST_PUBLISHED" || type === "POST_FAILED") {
    return "PUBLISH";
  }
  if (
    type === "TASK_APPROVED" ||
    type === "TASK_CHANGES_REQUESTED" ||
    type === "TASK_SUBMITTED" ||
    type.includes("REVIEW") ||
    type.includes("APPROVAL")
  ) {
    return "REVIEW";
  }
  return "TASK";
};

export function ActivityFeedSection({
  events = [],
  isLoading,
  isError,
  onRetry,
  className,
}: ActivityFeedSectionProps) {
  const { t, i18n } = useTranslation();
  const [selectedCategory, setSelectedCategory] =
    useState<ActivityTimelineCategory>("ALL");
  const [visibleCount, setVisibleCount] = useState<number>(5);

  const dateLocale = useMemo(() => {
    return i18n.language.startsWith("vi") ? vi : enUS;
  }, [i18n.language]);

  const categorizedEvents = useMemo(() => {
    return events.map((event) => ({
      ...event,
      resolvedCategory: resolveCategory(event),
    }));
  }, [events]);

  const counts = useMemo(() => {
    let taskCount = 0;
    let reviewCount = 0;
    let publishCount = 0;

    categorizedEvents.forEach((item) => {
      if (item.resolvedCategory === "TASK") taskCount++;
      else if (item.resolvedCategory === "REVIEW") reviewCount++;
      else if (item.resolvedCategory === "PUBLISH") publishCount++;
    });

    return {
      ALL: categorizedEvents.length,
      TASK: taskCount,
      REVIEW: reviewCount,
      PUBLISH: publishCount,
    };
  }, [categorizedEvents]);

  const filteredEvents = useMemo(() => {
    if (selectedCategory === "ALL") return categorizedEvents;
    return categorizedEvents.filter(
      (item) => item.resolvedCategory === selectedCategory,
    );
  }, [categorizedEvents, selectedCategory]);

  const displayedEvents = useMemo(() => {
    return filteredEvents.slice(0, visibleCount);
  }, [filteredEvents, visibleCount]);

  const hasMore = filteredEvents.length > visibleCount;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 5);
  };

  const getEventIcon = (type: string, category: "TASK" | "REVIEW" | "PUBLISH") => {
    switch (type) {
      case "POST_PUBLISHED":
        return <Send className="size-3.5 text-foreground" />;
      case "POST_FAILED":
        return <AlertTriangle className="size-3.5 text-destructive" />;
      default:
        if (category === "REVIEW") {
          return <FileCheck className="size-3.5 text-muted-foreground" />;
        }
        if (category === "PUBLISH") {
          return <Send className="size-3.5 text-muted-foreground" />;
        }
        return <FileText className="size-3.5 text-muted-foreground" />;
    }
  };

  const formatEventTime = (timestampStr: string) => {
    try {
      const parsed = parseISO(timestampStr);
      if (isNaN(parsed.getTime())) return timestampStr;
      return formatDistanceToNow(parsed, {
        addSuffix: true,
        locale: dateLocale,
      });
    } catch {
      return new Date(timestampStr).toLocaleString(i18n.language);
    }
  };

  const categoriesConfig: {
    id: ActivityTimelineCategory;
    label: string;
    count: number;
  }[] = [
    {
      id: "ALL",
      label: t("dashboard.activityFeed.filterAll", "Tất cả"),
      count: counts.ALL,
    },
    {
      id: "TASK",
      label: t("dashboard.activityFeed.filterTask", "Công việc"),
      count: counts.TASK,
    },
    {
      id: "REVIEW",
      label: t("dashboard.activityFeed.filterReview", "Duyệt bài"),
      count: counts.REVIEW,
    },
    {
      id: "PUBLISH",
      label: t("dashboard.activityFeed.filterPublish", "Xuất bản"),
      count: counts.PUBLISH,
    },
  ];

  return (
    <div
      className={`border-border/80 bg-card space-y-4 rounded-xl border p-5 shadow-xs ${className ?? ""}`}
    >
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-muted text-foreground flex size-7 items-center justify-center rounded-lg border border-border/60">
            <Activity className="size-4" />
          </div>
          <div>
            <h3 className="text-foreground text-sm font-bold tracking-tight">
              {t(
                "dashboard.activityFeed.unifiedTitle",
                "Lịch sử công việc & hoạt động hợp nhất",
              )}
            </h3>
            <p className="text-muted-foreground text-3xs mt-0.5">
              {t(
                "dashboard.activityFeed.unifiedSubtitle",
                "Theo dõi luồng xử lý task, phê duyệt và xuất bản bài viết",
              )}
            </p>
          </div>
        </div>

        <span className="text-muted-foreground bg-muted border-border/50 text-2xs self-start rounded-full border px-2 py-0.5 font-medium sm:self-auto">
          {events.length} {t("dashboard.activityFeed.eventsCount", "sự kiện")}
        </span>
      </div>

      {/* Category Tabs (Monochrome) */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-border/50 pb-2">
        {categoriesConfig.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setSelectedCategory(cat.id);
                setVisibleCount(5);
              }}
              className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? "bg-foreground text-background shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-2xs rounded-full px-1.5 py-0.2 font-medium ${
                  isActive
                    ? "bg-background/20 text-background"
                    : "bg-muted text-muted-foreground group-hover:text-foreground"
                }`}
              >
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3 pt-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="border-border/40 flex items-start gap-3 border-b pb-3 last:border-0"
            >
              <Skeleton className="size-8 shrink-0 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="border-destructive/20 bg-destructive/5 space-y-2 rounded-lg border p-4 text-center">
          <p className="text-destructive flex items-center justify-center gap-1.5 text-xs font-medium">
            <AlertCircle className="size-3.5" />{" "}
            {t("dashboard.activityFeed.loadError", "Không thể tải lịch sử hoạt động")}
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRetry}
            className="h-7 cursor-pointer gap-1 text-xs"
          >
            <RefreshCw className="size-3" /> {t("dashboard.activityFeed.retry", "Thử lại")}
          </Button>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="border-border/60 text-muted-foreground flex flex-col items-center justify-center rounded-lg border border-dashed py-8 text-center text-xs">
          <CheckCircle2 className="text-muted-foreground/50 mb-2 size-6" />
          <span>{t("dashboard.activityFeed.empty", "Chưa có hoạt động nào trong danh mục này")}</span>
        </div>
      ) : (
        <div className="divide-border/40 space-y-3 divide-y pt-1">
          {displayedEvents.map((event) => {
            const actor =
              event.actorName ??
              t("dashboard.activityFeed.unknownActor", "Thành viên");
            const targetTitle =
              event.targetTitle ??
              ("targetKey" in event && event.targetKey
                ? event.targetKey
                : undefined);
            const wsName =
              "workspaceName" in event ? event.workspaceName : undefined;
            const actionText =
              "actionText" in event && event.actionText
                ? event.actionText
                : t(
                    `dashboard.activityFeed.actions.${event.type}`,
                    event.type,
                  );

            return (
              <div
                key={event.id}
                className="group flex items-start gap-3 pt-3 first:pt-0"
              >
                {/* Avatar / Initial */}
                {event.actorAvatar ? (
                  <img
                    src={event.actorAvatar}
                    alt={actor}
                    className="border-border size-8 shrink-0 rounded-full border object-cover"
                  />
                ) : (
                  <div className="bg-muted border-border/80 text-foreground flex size-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold">
                    {actor.charAt(0).toUpperCase()}
                  </div>
                )}

                {/* Event Details */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-foreground text-xs font-semibold">
                      {actor}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {actionText}
                    </span>
                    {getEventIcon(event.type, event.resolvedCategory)}
                  </div>

                  {targetTitle && (
                    <p className="text-foreground/90 mt-0.5 truncate text-xs font-medium">
                      {"targetKey" in event && event.targetKey && (
                        <span className="bg-muted text-muted-foreground border-border/50 font-mono text-3xs mr-1 rounded border px-1 py-0.2">
                          {event.targetKey}
                        </span>
                      )}
                      {targetTitle}
                    </p>
                  )}

                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    {wsName && (
                      <span className="bg-muted/70 text-muted-foreground border-border/50 text-3xs inline-flex items-center gap-1 rounded px-1.5 py-0.2 border">
                        <FolderOpen className="size-2.5" />
                        {wsName}
                      </span>
                    )}
                    <span className="text-muted-foreground text-3xs">
                      {formatEventTime(event.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Show More Button */}
          {hasMore ? (
            <div className="pt-3 text-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLoadMore}
                className="text-muted-foreground hover:text-foreground hover:border-brand-orange text-xs cursor-pointer gap-1.5"
              >
                <ChevronDown className="size-3.5" />
                <span>
                  {t("dashboard.activityFeed.viewMore", "Xem thêm lịch sử")} (
                  {displayedEvents.length}/{filteredEvents.length})
                </span>
              </Button>
            </div>
          ) : (
            filteredEvents.length > 5 && (
              <p className="text-muted-foreground/60 text-3xs pt-2 text-center italic">
                {t(
                  "dashboard.activityFeed.allLoaded",
                  "Đã hiển thị toàn bộ lịch sử",
                )}
              </p>
            )
          )}
        </div>
      )}
    </div>
  );
}
export default ActivityFeedSection;
