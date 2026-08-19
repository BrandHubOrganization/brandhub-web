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
  const getEventIcon = (type: ActivityEvent["type"]) => {
    switch (type) {
      case "POST_PUBLISHED":
        return <Send className="size-3.5 text-emerald-500" />;
      case "POST_APPROVED":
        return <CheckCircle className="size-3.5 text-blue-500" />;
      case "POST_FAILED":
        return <AlertTriangle className="size-3.5 text-rose-500" />;
      case "COMMENT_ADDED":
        return <MessageSquare className="size-3.5 text-amber-500" />;
      case "TASK_ASSIGNED":
        return <UserPlus className="size-3.5 text-purple-500" />;
      default:
        return <Activity className="size-3.5 text-muted-foreground" />;
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="size-4 text-[#f05a28]" />
          <h3 className="text-sm font-bold text-foreground">Hoạt động gần đây</h3>
        </div>
        <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          10 sự kiện mới nhất
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-3 pt-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-start gap-3 border-b border-border/40 pb-3 last:border-0">
              <Skeleton className="size-8 rounded-full shrink-0" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-3.5 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-center space-y-2">
          <p className="text-xs text-destructive flex items-center justify-center gap-1.5">
            <AlertCircle className="size-3.5" /> Lỗi tải nhật ký hoạt động
          </p>
          <Button variant="ghost" size="sm" onClick={onRetry} className="h-7 text-xs gap-1 cursor-pointer">
            <RefreshCw className="size-3" /> Thử lại
          </Button>
        </div>
      ) : events.length === 0 ? (
        <div className="p-6 text-center text-xs text-muted-foreground border border-dashed rounded-lg">
          Chưa có hoạt động nào được ghi nhận gần đây.
        </div>
      ) : (
        <div className="space-y-3 pt-1 divide-y divide-border/40">
          {events.map((event) => (
            <div key={event.id} className="pt-3 first:pt-0 flex items-start gap-3 group">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted border border-border text-xs font-bold text-foreground">
                {event.actorName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-semibold text-foreground">{event.actorName}</span>
                  <span className="text-xs text-muted-foreground">{event.actionText}</span>
                  {getEventIcon(event.type)}
                </div>
                {event.targetTitle && (
                  <p className="text-xs font-medium text-foreground/90 truncate mt-0.5">
                    {event.targetTitle}
                  </p>
                )}
                <span className="text-[10px] text-muted-foreground block mt-1">
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
