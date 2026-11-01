import type { TaskStatus, TaskType } from "@/types/task";

export interface TaskReference {
  label: string;
  url: string;
}

export interface TaskWorkflow {
  id: string;
  workspaceId: string;
  campaignId: string | null;
  campaignName: string | null;
  type: TaskType;
  name: string;
  status: TaskStatus;
  reviewStep?: "QC" | "MANAGER" | "CLIENT" | null;
  sourceType: string | null;
  sourceRefId: string | null;
  description: string | null;
  dueDate: string | null;
  publishDate: string | null;
  inputReferences: TaskReference[];
  assigneeId: string | null;
  assigneeName: string | null;
  requiresClientApproval: boolean;
  workflowRevision: number | null;
  firstStartedAt: string | null;
  legacyReviewRequired: boolean;
  schemaReady: boolean;
  lockReason: string | null;
  meetingUrl?: string | null;
  allowedActions: {
    canEditDetail: boolean;
    canAssign: boolean;
    canStart: boolean;
  };
  dates: {
    timezone: string | null;
    minDate: string | null;
    maxDate: string | null;
    ready: boolean;
  };
  typeMetadata?: {
    targetPlatforms?: string[];
    [key: string]: unknown;
  } | null;
}

export interface TaskDetailFields {
  description: string;
  dueDate: string | null;
  publishDate: string | null;
  inputReferences: TaskReference[];
  expectedRevision: number;
}

export interface TaskAssignmentFields {
  assigneeId: string;
  requiresClientApproval: boolean;
  expectedRevision: number;
}

export interface TaskMemberOption {
  userId: string;
  displayName: string;
}

export interface MeetingLinkResponse {
  meetingUrl: string;
  taskId: string;
  generatedAt: string;
}
