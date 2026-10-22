import { X, Building2 } from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import { PlatformFilter } from "@/pages/calendar/components/PlatformFilter";
import { StatusFilter } from "@/pages/calendar/components/StatusFilter";
import { ContentCalendar } from "@/pages/calendar/components/ContentCalendar";
import { useContentCalendar } from "./hooks/useContentCalendar";
import { useTranslation } from "react-i18next";
import { Spinner } from "@/components/ui/spinner";

export function CalendarPage() {
  const { t } = useTranslation();
  const {
    events,
    loading,
    workspaceId,
    currentWorkspace,
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
      actions={
        currentWorkspace ? (
          <div className="border-border bg-card text-foreground inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium shadow-xs">
            <Building2 className="text-brand-orange size-3.5" />
            <span>Workspace: {currentWorkspace.name}</span>
          </div>
        ) : null
      }
    >
      <div key={workspaceId || "global"} className="space-y-6">
        <div className="space-y-2">
          <PlatformFilter
            selectedPlatforms={selectedPlatforms}
            onChange={setSelectedPlatforms}
          />
          <StatusFilter
            selectedStatuses={selectedStatuses}
            onChange={setSelectedStatuses}
          />
          <div className="text-muted-foreground flex items-center justify-between px-2 text-xs">
            <span className="flex items-center gap-2">
              {loading && <Spinner className="size-3.5" />}
              {t("calendar.filterBar.resultCount", { count: events.length })}
            </span>
            <button
              type="button"
              onClick={clearFilters}
              className="hover:text-foreground flex cursor-pointer items-center gap-1 font-medium"
            >
              <X className="size-3.5" />
              {t("calendar.filterBar.clearAll")}
            </button>
          </div>
        </div>

        <ContentCalendar
          events={events}
          onReschedule={handleReschedule}
          onDateClick={handleDateClick}
          onDatesChange={(start, end) => setDateRange({ start, end })}
        />
      </div>
    </PageWrapper>
  );
}

export default CalendarPage;
