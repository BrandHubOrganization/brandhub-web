export type ApprovalQueueStatus =
  "AWAITING_APPROVAL" | "APPROVED" | "REVISION_REQUESTED";

export interface ApprovalQueueItem {
  id: string;
  title: string;
  workspaceName: string;
  status: ApprovalQueueStatus;
  createdAt: string;
}
