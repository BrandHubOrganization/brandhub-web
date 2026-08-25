import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { CalendarDays } from "lucide-react";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { calendarService } from "@/services/mock/mockCalendarService";
import type { CalendarPostEvent, PostStatus } from "@/types/calendar";

const STATUS_BADGE_VARIANT: Record<PostStatus, BadgeProps["variant"]> = {
  DRAFT: "PENDING_REVIEW",
  SCHEDULED: "PENDING_REVIEW",
  PUBLISHED: "PUBLISHED",
  FAILED: "FAILED",
};

export function PortalCalendarView() {
  const { t } = useTranslation();
  const [events, setEvents] = useState<CalendarPostEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      try {
        const data = await calendarService.getCalendarPosts({
          startDate: new Date(0).toISOString(),
          endDate: new Date(8640000000000000).toISOString(),
        });
        if (!cancelled) {
          setEvents(
            data.filter((e) => e.extendedProps.status !== "DRAFT"),
          );
        }
      } catch (err) {
        console.error("Failed to load portal calendar:", err);
        if (!cancelled) toast.error(t("dashboard.portal.calendarLoadError"));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [t]);

  if (isLoading) {
    return <Skeleton className="h-64 rounded-xl" />;
  }

  return (
    <div className="border-border bg-card overflow-hidden rounded-xl border">
      <div className="border-border bg-muted/10 flex items-center gap-2 border-b p-4 text-sm font-bold">
        <CalendarDays className="text-brand-orange size-4" />
        {t("dashboard.portal.tabCalendar")}
      </div>
      <div className="divide-border divide-y">
        {events.length === 0 && (
          <p className="text-muted-foreground p-6 text-center text-xs">
            {t("dashboard.portal.calendarEmpty")}
          </p>
        )}
        {events.map((evt) => (
          <div
            key={evt.id}
            className="flex items-center justify-between gap-4 p-4"
          >
            <div className="space-y-1">
              <p className="text-foreground text-sm font-semibold">
                {evt.title}
              </p>
              <p className="text-muted-foreground text-xs">
                {evt.extendedProps.platform} ·{" "}
                {new Date(evt.start).toLocaleDateString()}
              </p>
            </div>
            <Badge
              className="text-3xs rounded-full px-2 py-0.5 font-mono uppercase"
              variant={STATUS_BADGE_VARIANT[evt.extendedProps.status]}
            >
              {evt.extendedProps.status}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PortalCalendarView;
