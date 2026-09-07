export type PlatformType =
  "FACEBOOK" | "INSTAGRAM" | "TIKTOK" | "THREADS" | "ZALO_OA" | "YOUTUBE";
export type PostStatus = "DRAFT" | "SCHEDULED" | "PUBLISHED" | "FAILED";

export interface CalendarPostEvent {
  id: string;
  title: string;
  start: string; // ISO String
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  extendedProps: {
    platform: PlatformType;
    status: PostStatus;
    captionPreview: string;
    mediaUrl?: string;
  };
}

export interface CalendarFetchParams {
  startDate: string;
  endDate: string;
  platforms?: PlatformType[];
  statuses?: PostStatus[];
}

export interface ReschedulePostPayload {
  postId: string;
  newScheduledAt: string;
}
