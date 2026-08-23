export interface TeamMemberStat {
  memberId: string;
  memberName: string;
  avatar?: string;
  role: string;
  postCount: number;
  publishedCount: number;
}

export interface AnalyticsOverview {
  totalPosts: number;
  publishedCount: number;
  failedCount: number;
  successRate: number; // e.g. 92.5
  teamStats?: TeamMemberStat[];
}

export interface ActivityEvent {
  id: string;
  actorName: string;
  actorAvatar?: string;
  actionText: string;
  targetTitle?: string;
  timestamp: string;
  type:
    | "POST_PUBLISHED"
    | "TASK_ASSIGNED"
    | "COMMENT_ADDED"
    | "POST_APPROVED"
    | "POST_FAILED";
}

export interface ActivityFeedResponse {
  content: ActivityEvent[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}
