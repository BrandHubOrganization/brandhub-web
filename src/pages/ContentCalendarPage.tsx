import React, { useEffect, useState } from 'react';
import type { CalendarPostEvent, PlatformType } from '../types/calendar';
import { calendarService } from '../services/calendarService';
import { PlatformFilter } from '../components/calendar/PlatformFilter';
import { ContentCalendar } from '../components/calendar/ContentCalendar';
import { SchedulePostModal } from '../components/calendar/SchedulePostModal';
import { toast } from 'sonner';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';

export const ContentCalendarPage: React.FC = () => {
  const [events, setEvents] = useState<CalendarPostEvent[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformType[]>([
    'FACEBOOK',
    'INSTAGRAM',
    'TIKTOK',
    'THREADS',
    'YOUTUBE',
  ]);
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(),
    end: new Date(),
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDateForModal, setSelectedDateForModal] = useState<Date | null>(null);

  const fetchCalendarEvents = async () => {
    try {
      const data = await calendarService.getCalendarPosts({
        startDate: dateRange.start.toISOString(),
        endDate: dateRange.end.toISOString(),
        platforms: selectedPlatforms,
      });
      setEvents(data);
    } catch (err) {
      toast.error('Failed to load content calendar posts');
    }
  };

  useEffect(() => {
    fetchCalendarEvents();
  }, [selectedPlatforms, dateRange]);

  const handleReschedule = async (eventId: string, newDate: Date): Promise<boolean> => {
    // Optimistic Update
    const previousEvents = [...events];
    setEvents((prev) =>
      prev.map((evt) => (evt.id === eventId ? { ...evt, start: newDate.toISOString() } : evt))
    );

    try {
      await calendarService.reschedulePost({
        postId: eventId,
        newScheduledAt: newDate.toISOString(),
      });
      toast.success('Post rescheduled successfully!');
      return true;
    } catch (err) {
      toast.error('Failed to reschedule post. Rolling back...');
      setEvents(previousEvents); // Rollback state
      return false;
    }
  };

  const handleDateClick = (date: Date) => {
    setSelectedDateForModal(date);
    setIsModalOpen(true);
  };

  const handleCreatePost = (newPostData: Partial<CalendarPostEvent>) => {
    const newEvent: CalendarPostEvent = {
      id: `post-${Date.now()}`,
      title: newPostData.title || 'Untitled Post',
      start: newPostData.start || new Date().toISOString(),
      extendedProps: newPostData.extendedProps || {
        platform: 'FACEBOOK',
        status: 'SCHEDULED',
        captionPreview: '',
      },
    };

    setEvents((prev) => [...prev, newEvent]);
    toast.success('New post scheduled on calendar!');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CalendarIcon className="w-7 h-7 text-indigo-600" />
            Content Calendar
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage, filter, and drag-and-drop schedule posts across all connected platforms.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedDateForModal(new Date());
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Post</span>
        </button>
      </div>

      {/* Filter Bar */}
      <PlatformFilter selectedPlatforms={selectedPlatforms} onChange={setSelectedPlatforms} />

      {/* Main Calendar */}
      <ContentCalendar
        events={events}
        onReschedule={handleReschedule}
        onDateClick={handleDateClick}
        onDatesChange={(start, end) => setDateRange({ start, end })}
      />

      {/* Quick Modal */}
      <SchedulePostModal
        isOpen={isModalOpen}
        selectedDate={selectedDateForModal}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreatePost}
      />
    </div>
  );
};
export default ContentCalendarPage;
