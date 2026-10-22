import type { TaskPost } from "@/pages/editor/services/taskPostService";

export type ReviewAction = "submit" | "withdraw" | "approve" | "reject";
export type ReviewStep = "MANAGER" | "CLIENT";
export interface TaskReview {
  taskId: string;
  workspaceId: string;
  status: string;
  reviewStep: ReviewStep | "QC" | null;
  approvalRound: number;
  workflowRevision: number | null;
  postId: string | null;
  postContentVersion: number | null;
  schemaReady: boolean;
  blockedReason: string | null;
  supportedType: boolean;
  lastSubmission?: {
    round: number;
    submittedBy: string;
    submittedAt: string;
    closedAt: string | null;
    closedBy: string | null;
    outcome: string | null;
  } | null;
  allowedActions: {
    canSubmit: boolean;
    canWithdraw: boolean;
    canApprove: boolean;
    canReject: boolean;
  };
}

export interface TaskReviewView {
  review: TaskReview;
  linked: TaskPost | null;
  postError: unknown;
}
export interface TaskApprovalDecision {
  id: string;
  taskId: string;
  approvalRound: number;
  step: string;
  action: "APPROVE" | "REJECT";
  actorId: string;
  actorDisplayName: string;
  comment: string | null;
  createdAt: string;
}
export interface TaskApprovalPage {
  items: TaskApprovalDecision[];
  nextCursor: string | null;
}
export interface ReviewExpected {
  expectedRevision: number;
  expectedApprovalRound: number;
  expectedPostContentVersion?: number;
  expectedStep?: ReviewStep;
  comment?: string;
}
