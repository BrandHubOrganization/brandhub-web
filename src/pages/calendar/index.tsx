import PageWrapper from "@/components/layout/PageWrapper";
import { ContentCalendar } from "@/pages/calendar/components/ContentCalendar";
import { CalendarFilterPopover } from "@/pages/calendar/components/CalendarFilterPopover";
import { useContentCalendar } from "./hooks/useContentCalendar";
import { useTranslation } from "react-i18next";

export function CalendarPage() {
  const { t } = useTranslation();
  const {
    events,
    workspaceId,
    selectedPlatforms,
    setSelectedPlatforms,
    selectedStatuses,
    setSelectedStatuses,
    clearFilters,
    setDateRange,
    handleReschedule,
    handleDateClick,
  } = useContentCalendar();

  return (
    <PageWrapper
      title={t("calendar.page.title")}
      description={t("calendar.page.description")}
    >
      <div key={workspaceId || "global"} className="space-y-4">
        <ContentCalendar
          events={events}
          onReschedule={handleReschedule}
          onDateClick={handleDateClick}
          onDatesChange={(start, end) => setDateRange({ start, end })}
          headerFilter={
            <CalendarFilterPopover
              selectedPlatforms={selectedPlatforms}
              onChangePlatforms={setSelectedPlatforms}
              selectedStatuses={selectedStatuses}
              onChangeStatuses={setSelectedStatuses}
              onResetFilters={clearFilters}
            />
          }
        />
      </div>
    </PageWrapper>
  );
}

export default CalendarPage;
