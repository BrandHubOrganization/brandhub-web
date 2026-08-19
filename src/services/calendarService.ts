import type { CalendarFetchParams, CalendarPostEvent, ReschedulePostPayload } from '../types/calendar';

// Mock initial data if backend is offline/mocking
const MOCK_EVENTS: CalendarPostEvent[] = [
  {
    id: 'post-1',
    title: 'New Product Launch Campaign',
    start: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
    extendedProps: {
      platform: 'FACEBOOK',
      status: 'SCHEDULED',
      captionPreview: '🚀 Exclusive reveal coming tomorrow! Stay tuned for our biggest launch of the year #brandhub #launch',
    },
  },
  {
    id: 'post-2',
    title: 'Behind the Scenes Reel',
    start: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString(),
    extendedProps: {
      platform: 'INSTAGRAM',
      status: 'SCHEDULED',
      captionPreview: 'Take a peek behind the scenes at our creative workshop 🎨✨',
    },
  },
  {
    id: 'post-3',
    title: 'Viral Dance Challenge',
    start: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
    extendedProps: {
      platform: 'TIKTOK',
      status: 'PUBLISHED',
      captionPreview: 'Can you match this energy? Tag us in your videos! 🔥',
    },
  },
  {
    id: 'post-4',
    title: 'Weekly Tech Tips Summary',
    start: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
    extendedProps: {
      platform: 'YOUTUBE',
      status: 'DRAFT',
      captionPreview: '5 productivity hacks every content creator needs to know in 2026.',
    },
  },
];

export const calendarService = {
  async getCalendarPosts(params: CalendarFetchParams): Promise<CalendarPostEvent[]> {
    // Standard mock API delay simulation
    await new Promise((res) => setTimeout(res, 400));
    
    return MOCK_EVENTS.filter((evt) => {
      if (params.platforms && params.platforms.length > 0) {
        return params.platforms.includes(evt.extendedProps.platform);
      }
      return true;
    });
  },

  async reschedulePost(payload: ReschedulePostPayload): Promise<{ id: string; scheduledAt: string }> {
    await new Promise((res) => setTimeout(res, 300));
    
    // Simulate error for specific test IDs if needed or return success
    const target = MOCK_EVENTS.find((e) => e.id === payload.postId);
    if (target) {
      target.start = payload.newScheduledAt;
    }

    return {
      id: payload.postId,
      scheduledAt: payload.newScheduledAt,
    };
  },
};
