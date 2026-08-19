import { Plus } from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import { PlatformFilter } from "@/pages/calendar/components/PlatformFilter";
import { ContentCalendar } from "@/pages/calendar/components/ContentCalendar";
import { SchedulePostModal } from "@/pages/calendar/components/SchedulePostModal";
import { useContentCalendar } from "./hooks/useContentCalendar";

export function CalendarPage() {
  const {
    events,
    selectedPlatforms,
    setSelectedPlatforms,
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
      title="Content Calendar"
      description="Manage, filter, and drag-and-drop schedule posts across all connected platforms."
      actions={
        <button
          onClick={openModalOnNow}
          className="bg-brand-orange hover:bg-brand-orange/90 flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white shadow-xs transition-all"
        >
          <Plus className="size-4" />
          <span>Schedule Post</span>
        </button>
      }
    >
      <div className="space-y-6">
        <PlatformFilter
          selectedPlatforms={selectedPlatforms}
          onChange={setSelectedPlatforms}
        />

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
