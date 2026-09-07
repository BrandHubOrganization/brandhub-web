import { Plus, X } from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import { PlatformFilter } from "@/pages/calendar/components/PlatformFilter";
import { StatusFilter } from "@/pages/calendar/components/StatusFilter";
import { ContentCalendar } from "@/pages/calendar/components/ContentCalendar";
import { SchedulePostModal } from "@/pages/calendar/components/SchedulePostModal";
import { useContentCalendar } from "./hooks/useContentCalendar";
import { useTranslation } from "react-i18next";

export function CalendarPage() {
  const { t } = useTranslation();
  const {
    events,
    selectedPlatforms,
    setSelectedPlatforms,
    selectedStatuses,
    setSelectedStatuses,
    clearFilters,
    setDateRange,
    isModalOpen,
    setIsModalOpen,
    selectedDateForModal,
    handleReschedule,
    handleDateClick,
    handleCreatePost,
    openModalOnNow,
  } = useContentCalendar();

  return (
    <PageWrapper
      title={t("calendar.page.title")}
      description={t("calendar.page.description")}
      actions={
        <button
          onClick={openModalOnNow}
          className="bg-brand-orange hover:bg-brand-orange/90 flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white shadow-xs transition-all"
        >
          <Plus className="size-4" />
          <span>{t("calendar.page.schedulePostButton")}</span>
        </button>
      }
    >
      <div className="space-y-6">
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
            <span>
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

        <SchedulePostModal
          isOpen={isModalOpen}
          selectedDate={selectedDateForModal}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreatePost}
        />
      </div>
    </PageWrapper>
  );
}

export default CalendarPage;
