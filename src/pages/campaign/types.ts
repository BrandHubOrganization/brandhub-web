import type { PackageDeliverable } from "@/pages/media-package/types/mediaPackage";
import type { TaskStatus, TaskType } from "@/types/task";

export type { TaskType };
export interface WorkItem {
  id: string;
  deliverableId: string;
  name: string;
  type: TaskType;
  dueDate: string | null;
}
export type CampaignEventFormat = "OFFLINE" | "ONLINE" | "HYBRID" | "";
export type CampaignCommFormat =
  | "DIGITAL_SOCIAL"
  | "BRAND_LAUNCH"
  | "OFFLINE_ACTIVATION"
  | "INFLUENCER_PR"
  | "PROMOTION_SEASONAL";
export type CampaignConceptType =
  | "EMOTIONAL_STORY"
  | "TEASER_LAUNCH_BOOM"
  | "EXPERIENTIAL_INTERACTIVE"
  | "VIRAL_COMMUNITY_UGC"
  | "EXPERT_TRUST_EDUCATIONAL"
  | "CONVERSION_OFFER_PUSH"
  | "";
export interface CampaignBrief {
  campaignFormats?: CampaignCommFormat[];
  conceptType?: CampaignConceptType;
  conceptIdea?: string;
  objectives?: string[];
  targetAudiences?: string[];
  audienceInsights?: string[];
  audienceNote?: string;
  channels?: string[];
  contentPillars?: string[];
  primaryCta?: string;
  eventFormat?: CampaignEventFormat;
  eventConcept?: string;
  eventLocation?: string;
  expectedScale?: string;
  eventHighlights?: string[];
  launchPhases?: string[];
  uspFocus?: string[];
  digitalFormats?: string[];
  kpiFocus?: string[];
  kolTiers?: string[];
  prAngles?: string[];
  promoMechanics?: string[];
  seasonalHook?: string;
  keyMessage?: string;
  brandTones?: string[];
  notes?: string;
  generatedBrief?: string;
  generatedBriefUpdatedAt?: string;
}
export interface Timeline {
  startDate?: string;
  endDate?: string;
  milestones?: { name: string; date: string }[];
  brief?: CampaignBrief;
}
export interface CampaignPlan {
  name: string;
  strategyDetail: string;
  brandGuideline?: string;
  timeline: string;
  workItems: WorkItem[];
  expectedVersion?: number;
}
export interface Campaign extends CampaignPlan {
  packageDriven?: boolean;
  id: string;
  contentVersion: number;
  status: "DRAFT" | "APPROVED" | "IN_PROGRESS" | "COMPLETED";
  deliverablePlan: PackageDeliverable[];
  packageTermsVersion: number;
  allocationPeriod: string | null;
  approvedByAgencyAt: string | null;
  approvedByClientAt: string | null;
  approvedByAgencyId: string | null;
  approvedByClientId: string | null;
  approvedByAgencyVersion: number | null;
  approvedByClientVersion: number | null;
  completedAt: string | null;
  completedBy: string | null;
  completionReason: string | null;
  completionTaskSummary: string | null;
}
export interface CampaignDeployment {
  id: string;
  campaignId: string;
  contentVersion: number;
  status: "PENDING" | "FAILED" | "SUCCEEDED";
  attemptCount: number;
  lastErrorCode: string | null;
  completedAt: string | null;
}
export interface CampaignTask {
  id: string;
  campaignWorkItemId: string | null;
  name: string;
  type: TaskType;
  status: TaskStatus;
  dueDate: string | null;
  sourceType: string | null;
  sourceRefId: string | null;
  updatedAt: string;
  cancellation: {
    actorId: string;
    at: string;
    reasonCode: string;
    note: string | null;
    previousStatus: TaskStatus;
  } | null;
}
export interface CampaignClosure {
  contentVersion: number;
  unfinishedTasks: CampaignTask[];
  reviewingRequests: {
    id: string;
    title: string;
    status: string;
    version: number;
  }[];
  pendingRequestCount: number;
  deploymentComplete: boolean;
  unlinkedRequestTaskCount: number;
  canComplete: boolean;
}
export const CANCEL_REASONS = [
  "CLIENT_NO_LONGER_NEEDS",
  "MUTUAL_AGREEMENT",
  "DUPLICATE_OR_REPLACED",
  "NO_LONGER_SUITABLE",
  "OTHER",
] as const;
export type CancelReason = (typeof CANCEL_REASONS)[number];
export interface CampaignReviewEvent {
  id: string;
  contentVersion: number;
  actorId: string;
  actorSide: "AGENCY" | "CLIENT";
  eventType: "FEEDBACK" | "APPROVE";
  comment: string | null;
  createdAt: string;
}
export interface CampaignVersion {
  id: string;
  contentVersion: number;
  snapshot: string;
  createdBy: string;
  createdAt: string;
}
