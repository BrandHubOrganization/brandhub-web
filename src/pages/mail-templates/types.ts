export type MailTemplateType = "SYSTEM_DEFAULT" | "CUSTOM";

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
  cloneFromId?: string;
  attachmentIds?: string[];
}
