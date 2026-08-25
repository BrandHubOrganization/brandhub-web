export type ContentRequestStatus =
  | "SUBMITTED"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "PENDING_REVIEW"
  | "SENT_TO_CLIENT"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED";

export type SocialPlatform =
  "FACEBOOK" | "INSTAGRAM" | "TIKTOK" | "THREADS" | "YOUTUBE";

export interface Assignee {
  id: string;
  name: string;
  avatarUrl?: string;
  email: string;
  role: string;
}

export interface StatusHistoryEntry {
  status: ContentRequestStatus;
  changedAt: string;
  changedBy: string;
  note?: string;
}

export interface ContentRequest {
  id: string;
  topic: string;
  platforms: SocialPlatform[];
  clientName: string;
  deadline: string;
  status: ContentRequestStatus;
  assignee?: Assignee;
  createdAt: string;
  briefNote?: string;
  statusHistory?: StatusHistoryEntry[];
}

export interface ContentRequestQueryParams {
  status?: ContentRequestStatus[];
  platform?: SocialPlatform[];
  search?: string;
  startDate?: string;
  endDate?: string;
  page: number;
  limit: number;
  myTasksOnly?: boolean;
}

export interface ContentRequestPaginatedResponse {
  items: ContentRequest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateContentRequestPayload {
  topic: string;
  platforms: SocialPlatform[];
  clientName: string;
  deadline: string;
  briefNote?: string;
}

export interface ReviseContentRequestPayload {
  topic: string;
  platforms: SocialPlatform[];
  deadline: string;
  briefNote?: string;
}
