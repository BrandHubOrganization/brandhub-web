import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";
import { dayNumber } from "@/pages/campaign/utils/timelineDates";

export function TimelinePendingRange({
  start,
  end,
  viewStart,
  dayWidth,
}: {
  start: string;
  end: string;
  viewStart: string;
  dayWidth: number;
}) {
  const { t } = useTranslation();
  return (
    <Skeleton
      role="status"
      aria-label={t("campaign.timeline.savingSchedule")}
      className="ct-range ct-range-pending pointer-events-none justify-center overflow-hidden motion-reduce:animate-none"
      style={{
        left: (dayNumber(start) - dayNumber(viewStart)) * dayWidth,
        width: (dayNumber(end) - dayNumber(start) + 1) * dayWidth,
      }}
    >
      <span aria-hidden className="truncate px-1 text-[10px]">
        {t("campaign.timeline.savingSchedule")}
      </span>
    </Skeleton>
  );
}
