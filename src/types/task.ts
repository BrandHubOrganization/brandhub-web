export type TaskType = "POST" | "LIVESTREAM" | "SURVEY";

export type TaskStatus =
  | "BACKLOG"
  | "DETAIL_IDENTIFIED"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "QC_REVIEW"
  | "MANAGER_REVIEW"
  | "CLIENT_REVIEW"
  | "COMPLETED";

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface TaskListItem {
  id: string;
  key?: string; // e.g. "DA-43"
  workspaceId: string;
  campaignId?: string | null;
  type: TaskType;
  name: string;
  status: TaskStatus;
  priority?: TaskPriority;
  resolution?: string;
  dueDate?: string | null;
  assigneeId?: string | null;
  assigneeName?: string | null;
  assigneeAvatar?: string | null;
  reporterId?: string | null;
  reporterName?: string | null;
  reporterAvatar?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskListFilterParams {
  page?: number;
  size?: number;
  sort?: "dueDate" | "createdAt" | "name" | "status";
  direction?: "asc" | "desc";
  status?: string;
  type?: string;
  search?: string;
}
