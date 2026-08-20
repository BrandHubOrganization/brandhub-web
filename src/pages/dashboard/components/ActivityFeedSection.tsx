import { useTranslation } from "react-i18next";
import type { ActivityEvent } from "@/types/analytics";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Activity,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  UserPlus,
  Send,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

interface ActivityFeedSectionProps {
  events: ActivityEvent[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

export function ActivityFeedSection({
  events,
  isLoading,
  isError,
  onRetry,
}: ActivityFeedSectionProps) {
  const { t } = useTranslation();
  const getEventIcon = (type: ActivityEvent["type"]) => {
    switch (type) {
      case "POST_PUBLISHED":
        return <Send className="size-3.5 text-emerald-500" />;
      case "POST_APPROVED":
        return <CheckCircle className="text-brand-orange size-3.5" />;
      case "POST_FAILED":
        return <AlertTriangle className="size-3.5 text-rose-500" />;
      case "COMMENT_ADDED":
        return <MessageSquare className="size-3.5 text-amber-500" />;
      case "TASK_ASSIGNED":
        return <UserPlus className="size-3.5 text-purple-500" />;
      default:
        return <Activity className="text-muted-foreground size-3.5" />;
    }
  };

  return (
    <div className="border-border bg-card space-y-4 rounded-xl border p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="text-brand-orange size-4" />
          <h3 className="text-foreground text-sm font-bold">
            {t("dashboard.activityFeed.title")}
          </h3>
        </div>
        <span className="text-muted-foreground bg-muted text-2xs rounded-full px-2 py-0.5 font-medium">
          {t("dashboard.activityFeed.latestBadge")}
        </span>
      </div>

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
          <p className="text-destructive flex items-center justify-center gap-1.5 text-xs">
            <AlertCircle className="size-3.5" />{" "}
            {t("dashboard.activityFeed.loadError")}
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRetry}
            className="h-7 cursor-pointer gap-1 text-xs"
          >
            <RefreshCw className="size-3" /> {t("dashboard.activityFeed.retry")}
          </Button>
        </div>
      ) : events.length === 0 ? (
        <div className="text-muted-foreground rounded-lg border border-dashed p-6 text-center text-xs">
          {t("dashboard.activityFeed.empty")}
        </div>
      ) : (
        <div className="divide-border/40 space-y-3 divide-y pt-1">
          {events.map((event) => (
            <div
              key={event.id}
              className="group flex items-start gap-3 pt-3 first:pt-0"
            >
              <div className="bg-muted border-border text-foreground flex size-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold">
                {event.actorName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-foreground text-xs font-semibold">
                    {event.actorName}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {event.actionText}
                  </span>
                  {getEventIcon(event.type)}
                </div>
                {event.targetTitle && (
                  <p className="text-foreground/90 mt-0.5 truncate text-xs font-medium">
                    {event.targetTitle}
                  </p>
                )}
                <span className="text-muted-foreground text-3xs mt-1 block">
                  {event.timestamp}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
