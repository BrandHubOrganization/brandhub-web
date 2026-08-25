export type ApprovalQueueStatus =
  "AWAITING_APPROVAL" | "APPROVED" | "REVISION_REQUESTED";

export type ApprovalStage = "CREATOR" | "MANAGER" | "CLIENT";

export type ApprovalStageStatus = "PENDING" | "APPROVED" | "REVISION_REQUESTED";

export interface ApprovalStageEntry {
  stage: ApprovalStage;
  status: ApprovalStageStatus;
  actorName?: string;
  actedAt?: string;
  comment?: string;
}

export interface ApprovalQueueItem {
  id: string;
  title: string;
  workspaceName: string;
  status: ApprovalQueueStatus;
  createdAt: string;
  revisionRound: number;
  approvalChain: ApprovalStageEntry[];
}
