import type { PackageDeliverable } from "@/pages/media-package/types/mediaPackage";

export type TaskType = "POST" | "LIVESTREAM" | "SURVEY" | "EVENT_PLAN" | "PRESS_RECOMMENDATION";
export interface WorkItem { id: string; deliverableId: string; name: string; type: TaskType; dueDate: string }
export interface Timeline { startDate?: string; endDate?: string; milestones?: { name: string; date: string }[] }
export interface CampaignPlan {
  name: string; strategyDetail: string; brandGuideline: string; timeline: string; workItems: WorkItem[];
  expectedVersion?: number;
}
export interface Campaign extends CampaignPlan {
  id: string; contentVersion: number; status: "DRAFT" | "APPROVED" | "IN_PROGRESS" | "COMPLETED";
  deliverablePlan: PackageDeliverable[]; packageTermsVersion: number; allocationPeriod: string | null;
  approvedByAgencyAt: string | null; approvedByClientAt: string | null;
  approvedByAgencyId: string | null; approvedByClientId: string | null;
  approvedByAgencyVersion: number | null; approvedByClientVersion: number | null;
  completedAt: string | null; completedBy: string | null;
  completionReason: string | null; completionTaskSummary: string | null;
}
export interface CampaignDeployment {
  id: string; campaignId: string; contentVersion: number;
  status: "PENDING" | "FAILED" | "SUCCEEDED"; attemptCount: number;
  lastErrorCode: string | null; completedAt: string | null;
}
export interface CampaignTask {
  id: string; campaignWorkItemId: string; name: string; type: TaskType;
  status: string; dueDate: string;
}
export interface CampaignReviewEvent {
  id: string; contentVersion: number; actorId: string; actorSide: "AGENCY" | "CLIENT";
  eventType: "FEEDBACK" | "APPROVE"; comment: string | null; createdAt: string;
}
export interface CampaignVersion {
  id: string; contentVersion: number; snapshot: string; createdBy: string; createdAt: string;
}
