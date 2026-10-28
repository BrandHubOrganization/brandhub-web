import type { ChannelMessageRequest } from "@/types/chatCollaboration";

export interface ChatScheduleRequest {
  message: ChannelMessageRequest;
  scheduledAt: string;
  timeZone: string;
}
export interface ScheduledChatMessage extends Omit<
  ChannelMessageRequest,
  "clientMessageId"
> {
  id: string;
  channelId: string;
  scheduledAt: string;
  timeZone: string;
  status: "PENDING" | "SENDING" | "SENT" | "FAILED" | "CANCELLED";
  revision: number;
  attempts: number;
  availableAt: string;
  errorCode: string | null;
  createdAt: string;
  sentAt: string | null;
  sentMessageId: string | null;
}
export interface ScheduledChatPage {
  items: ScheduledChatMessage[];
  nextCursor: string | null;
  hasMore: boolean;
}
export interface ChatRescheduleRequest {
  revision: number;
  scheduledAt: string;
  timeZone: string;
}
export interface UpcomingChatSchedule {
  scheduledAt: string | null;
  timeZone: string | null;
  status: "PENDING" | "SENDING" | null;
}
