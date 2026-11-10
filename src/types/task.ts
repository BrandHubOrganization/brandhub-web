export type TaskType =
  | "POST"
  | "LIVESTREAM"
  | "SURVEY"
  | "EVENT_PLAN"
  | "PRESS_RECOMMENDATION"
  | "SHORT_VIDEO"
  | "KOL_BOOKING"
  | "WORKSHOP"
  | "EMAIL_NEWSLETTER";

/** Task types whose content lives in the post editor (`/editor`). */
export const POST_EDITOR_TYPES: readonly TaskType[] = ["POST", "SHORT_VIDEO"];

export type TaskStatus =
  | "TODO"
  | "IN_REVIEW"
  | "FINISHED"
  | "IN_PROGRESS"
  | "CANCELLED";

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
  publishDate?: string | null;
  assigneeId?: string | null;
  assigneeName?: string | null;
  assigneeAvatar?: string | null;
  reporterId?: string | null;
  reporterName?: string | null;
  reporterAvatar?: string | null;
  createdAt: string;
  updatedAt: string;
  description?: string | null;
  sourceType?: string | null;
  sourceRefId?: string | null;
  meetingUrl?: string | null;
}

export interface TaskListFilterParams {
  page?: number;
  size?: number;
  sort?: "dueDate" | "createdAt" | "name" | "status";
  direction?: "asc" | "desc";
  status?: string;
  type?: string;
  search?: string;
  campaignId?: string;
}

/** Editor section (`GET /tasks/{taskId}/sections`, spec subtask-role-workspaces §9.2). */
export type SectionStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "INTERNAL_APPROVED"
  | "CLIENT_APPROVED"
  | "RETURNED";

export interface TaskSection {
  /** `TYPE.SECTION`, e.g. `POST.CAPTION`. */
  key: string;
  visibility: "OUTPUT" | "INTERNAL";
  status: SectionStatus;
  revision: number;
  returnNote: string | null;
  ownerSubtaskIds: string[];
  ownerNames: string[];
  /** Own stored fields; `{}` for POST/SURVEY-backed sections (content lives in the post/survey). */
  content: Record<string, unknown>;
  canEdit: boolean;
  canSubmit: boolean;
  canApprove: boolean;
  canReturn: boolean;
  canReopen: boolean;
  canRestore: boolean;
  finalState: boolean;
  clientPendingSince: string | null;
  updatedAt: string | null;
}

export interface TaskSectionVersion {
  id: string;
  sectionKey: string;
  versionNo: number;
  content: Record<string, unknown>;
  submittedBy: string | null;
  submittedAt: string;
}
