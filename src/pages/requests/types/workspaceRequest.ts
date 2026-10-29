export const REQUEST_STATUSES = ["PENDING", "IN_PROGRESS", "ACCEPTED", "DENIED", "CANCELLED"] as const;
export const REQUEST_TYPES = ["POST", "LIVESTREAM", "SURVEY"] as const;
export const SOCIAL_PLATFORMS = ["FACEBOOK", "INSTAGRAM", "TIKTOK", "THREADS"] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];
export type RequestType = (typeof REQUEST_TYPES)[number];
export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];
export interface RequestFields {
  title: string;
  description: string;
  type: RequestType;
  dueDate: string;
  targetPlatforms?: string[];
}
export interface RequestEvent extends RequestFields {
  action: "CREATE" | "UPDATE" | "CANCEL" | "RECEIVE" | "ACCEPT" | "DENY";
  actorId: string;
  at: string;
  version: number;
  note?: string | null;
}
export interface WorkspaceRequest extends RequestFields {
  id: string;
  workspaceId: string;
  requestedBy: string;
  status: RequestStatus;
  version: number;
  generatedTaskId: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  history: RequestEvent[];
  canEdit: boolean;
  canCancel: boolean;
  canReceive: boolean;
  canAccept: boolean;
  canDeny: boolean;
  decisionNote: string | null;
  decidedBy: string | null;
  decidedAt: string | null;
  targetPlatforms?: string[];
}
export type ReviewAction = "receive" | "accept" | "deny";
export interface RequestTask {
  id: string;
  name: string;
  type: RequestType;
  status: string;
  dueDate: string | null;
  canOpenEditor: boolean;
}
export interface RequestPage {
  items: WorkspaceRequest[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
  canCreate: boolean;
  workspaceRole: string;
}
