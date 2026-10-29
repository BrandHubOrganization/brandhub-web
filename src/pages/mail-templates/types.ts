export type MailTemplateType = "SYSTEM_DEFAULT" | "CUSTOM";

export type MailTemplateScope =
  | "CAMPAIGN_BROADCAST"
  | "WORKSPACE_MANAGER"
  | "AGENCY_INTERNAL"
  | "AGENCY_CLIENT"
  | "ADMIN_SYSTEM_BROADCAST"
  | "TRANSACTIONAL_AUTO";

export interface MailAttachment {
  attachmentId: string;
  name: string;
  contentType: string;
  size: number;
  s3Key?: string;
}

export interface MailTemplateSummary {
  id: string;
  name: string;
  subject: string;
  type: MailTemplateType;
  scope: MailTemplateScope | null;
  attachmentCount: number;
  createdBy: string | null;
  createdAt: string;
}

export interface MailTemplate {
  id: string;
  workspaceId: string | null;
  name: string;
  subject: string;
  bodyHtml: string;
  type: MailTemplateType;
  scope: MailTemplateScope | null;
  agencyId: string | null;
  layoutJson: string | null;
  attachments: MailAttachment[];
  clonedFromId: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PageOf<T> {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface Recipient {
  email: string;
  name?: string;
  variables?: Record<string, string>;
}

/** Who a scope-resolved template (agency / system) would reach: the total plus a short sample. */
export interface RecipientPreview {
  total: number;
  sample: string[];
}

export interface SendResult {
  batchId: string;
  status: "QUEUED" | "SCHEDULED";
  total: number;
  accepted: number;
  rejected: { email: string; reason: string }[];
  scheduledAt: string | null;
}

export type BatchStatus =
  | "SCHEDULED"
  | "QUEUED"
  | "SENDING"
  | "COMPLETED"
  | "CANCELLED"
  | "FAILED";

export const BATCH_STATUSES: BatchStatus[] = [
  "SCHEDULED",
  "QUEUED",
  "SENDING",
  "COMPLETED",
  "CANCELLED",
  "FAILED",
];

export interface MailBatch {
  id: string;
  templateId: string;
  templateName: string;
  kind: string;
  status: BatchStatus;
  subject: string;
  total: number;
  accepted: number;
  rejected: number;
  sent: number;
  failed: number;
  suppressed: number;
  scheduledAt: string | null;
  createdAt: string;
  completedAt: string | null;
  sentBy: string;
  senderName: string | null;
  /** Set for batches that belong to no Workspace (Admin console). */
  scope?: string | null;
  agencyId?: string | null;
  agencyName?: string | null;
}

export interface MailDelivery {
  id: string;
  recipient: string;
  recipientName: string | null;
  status: "PENDING" | "SENT" | "FAILED" | "SUPPRESSED";
  attempts: number;
  lastError: string | null;
  nextAttemptAt: string | null;
  sentAt: string | null;
}

export interface MailBatchDetail {
  batch: MailBatch;
  deliveries: PageOf<MailDelivery>;
}

export interface MailQuota {
  day: string;
  workspaceUsed: number;
  workspaceLimit: number;
  systemRemaining: number;
  remainingToday: number;
}

export interface TemplatePayload {
  name?: string;
  subject?: string;
  bodyHtml?: string;
  layoutJson?: string;
  scope?: MailTemplateScope;
  agencyId?: string;
  cloneFromId?: string;
  attachmentIds?: string[];
}

export interface MailSuppression {
  email: string;
  reason: string;
  createdAt: string;
}

export interface RecipientCandidate {
  email: string;
  name: string | null;
  source: "MEMBER" | "CLIENT";
}

export interface RecipientGroup {
  id: string;
  name: string;
  count: number;
  recipients: { email: string; name: string | null }[];
}
